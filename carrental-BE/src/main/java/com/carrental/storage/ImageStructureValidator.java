package com.carrental.storage;

import java.util.zip.CRC32;

/** Checks image container completeness before relying on a decoder that may recover partial pixels. */
final class ImageStructureValidator {

    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10};

    private ImageStructureValidator() { }

    static boolean isComplete(byte[] bytes, DocumentImageFormat format) {
        return format == DocumentImageFormat.PNG ? completePng(bytes) : completeJpeg(bytes);
    }

    private static boolean completePng(byte[] bytes) {
        if (bytes.length < PNG_SIGNATURE.length) return false;
        for (int i = 0; i < PNG_SIGNATURE.length; i++) if (bytes[i] != PNG_SIGNATURE[i]) return false;

        int offset = PNG_SIGNATURE.length;
        boolean firstChunk = true;
        boolean sawImageData = false;
        while (offset <= bytes.length - 12) {
            long dataLength = unsignedInt(bytes, offset);
            if (dataLength > Integer.MAX_VALUE || dataLength > bytes.length - (long) offset - 12) return false;
            int length = (int) dataLength;
            int typeOffset = offset + 4;
            String type = new String(bytes, typeOffset, 4, java.nio.charset.StandardCharsets.US_ASCII);
            int dataOffset = offset + 8;
            int crcOffset = dataOffset + length;

            if (firstChunk && (!"IHDR".equals(type) || length != 13)) return false;
            firstChunk = false;
            if ("IDAT".equals(type)) sawImageData = true;

            CRC32 crc = new CRC32();
            crc.update(bytes, typeOffset, length + 4);
            if (crc.getValue() != unsignedInt(bytes, crcOffset)) return false;

            offset = crcOffset + 4;
            if ("IEND".equals(type)) return length == 0 && sawImageData;
        }
        return false;
    }

    private static boolean completeJpeg(byte[] bytes) {
        if (bytes.length < 4 || (bytes[0] & 0xff) != 0xff || (bytes[1] & 0xff) != 0xd8) return false;
        int offset = 2;
        boolean inScan = false;
        boolean sawFrame = false;
        boolean sawScan = false;

        while (offset < bytes.length) {
            int marker = -1;
            if (inScan) {
                boolean foundMarker = false;
                while (offset < bytes.length) {
                    if ((bytes[offset] & 0xff) != 0xff) {
                        offset++;
                        continue;
                    }
                    offset++;
                    while (offset < bytes.length && (bytes[offset] & 0xff) == 0xff) offset++;
                    if (offset >= bytes.length) return false;
                    marker = bytes[offset++] & 0xff;
                    if (marker == 0x00 || (marker >= 0xd0 && marker <= 0xd7)) continue;
                    foundMarker = true;
                    inScan = false;
                    break;
                }
                if (!foundMarker) return false;
            } else {
                if ((bytes[offset++] & 0xff) != 0xff) return false;
                while (offset < bytes.length && (bytes[offset] & 0xff) == 0xff) offset++;
                if (offset >= bytes.length) return false;
                marker = bytes[offset++] & 0xff;
                if (marker == 0x00) return false;
            }

            if (marker == 0xd9) return sawFrame && sawScan;
            if (marker == 0xd8) return false;
            if (marker == 0x01) {
                inScan = true;
                continue;
            }
            if (marker >= 0xd0 && marker <= 0xd7) return false;
            if (offset > bytes.length - 2) return false;
            int segmentLength = ((bytes[offset] & 0xff) << 8) | (bytes[offset + 1] & 0xff);
            if (segmentLength < 2 || segmentLength > bytes.length - offset) return false;
            if (isStartOfFrame(marker)) {
                if (segmentLength < 8) return false;
                sawFrame = true;
            }
            offset += segmentLength;
            if (marker == 0xda) {
                if (!sawFrame) return false;
                sawScan = true;
                inScan = true;
            }
        }
        return false;
    }

    private static boolean isStartOfFrame(int marker) {
        return (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7)
                || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
    }

    private static long unsignedInt(byte[] bytes, int offset) {
        return ((bytes[offset] & 0xffL) << 24) | ((bytes[offset + 1] & 0xffL) << 16)
                | ((bytes[offset + 2] & 0xffL) << 8) | (bytes[offset + 3] & 0xffL);
    }
}
