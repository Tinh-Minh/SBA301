package com.carrental.storage;

import com.carrental.config.DocumentProperties;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Iterator;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.event.IIOReadWarningListener;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import org.springframework.stereotype.Component;

/** Verifies content and bounds before decoding, then writes a metadata-free canonical image. */
@Component
public final class DocumentImageInspector {

    private final DocumentProperties properties;

    public DocumentImageInspector(DocumentProperties properties) { this.properties = properties; }

    public CanonicalDocumentImage inspect(UploadedDocumentImage upload) {
        return inspect(upload, "frontImage");
    }

    public CanonicalDocumentImage inspect(UploadedDocumentImage upload, String field) {
        if (upload == null || upload.bytes() == null || upload.bytes().length == 0) throw invalid(field);
        byte[] source = upload.bytes();
        long maximum = properties.getUpload().getMaxFileSize().toBytes();
        if (source.length > maximum) throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE);
        DocumentImageFormat signature = signature(source);
        DocumentImageFormat filename = filenameFormat(upload.filename());
        DocumentImageFormat mime = mediaTypeFormat(upload.mediaType());
        if (signature == null || signature != filename || signature != mime) throw unsupported();
        if (!ImageStructureValidator.isComplete(source, signature)) throw invalid(field);

        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(source))) {
            if (input == null) throw invalid(field);
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw invalid(field);
            ImageReader reader = readers.next();
            try {
                AtomicBoolean decoderWarning = new AtomicBoolean();
                IIOReadWarningListener warningListener = (sourceReader, warning) -> decoderWarning.set(true);
                reader.addIIOReadWarningListener(warningListener);
                reader.setInput(input, true, true);
                String formatName = reader.getFormatName().toLowerCase(Locale.ROOT);
                if ((signature == DocumentImageFormat.JPEG && !formatName.equals("jpeg") && !formatName.equals("jpg"))
                        || (signature == DocumentImageFormat.PNG && !formatName.equals("png"))) throw invalid(field);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width <= 0 || height <= 0 || width > properties.getUpload().getMaxImageDimension()
                        || height > properties.getUpload().getMaxImageDimension()
                        || (long) width * (long) height > properties.getUpload().getMaxImagePixels()) {
                    throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE, "Ảnh vượt quá giới hạn kích thước cho phép");
                }
                BufferedImage decoded = reader.read(0);
                if (decoderWarning.get() || decoded == null || decoded.getWidth() != width || decoded.getHeight() != height) {
                    throw invalid(field);
                }
                byte[] canonical = encode(decoded, signature, maximum, field);
                return new CanonicalDocumentImage(canonical, signature);
            } finally {
                reader.dispose();
            }
        } catch (AppException exception) {
            throw exception;
        } catch (OutputLimitException exception) {
            throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE);
        } catch (IOException | RuntimeException exception) {
            if (causedByOutputLimit(exception)) throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE);
            throw invalid(field);
        }
    }

    /** Validates stored bytes without changing them so authenticated downloads preserve exact bytes. */
    public void validateStored(byte[] bytes, DocumentImageFormat expectedFormat) {
        if (bytes == null || bytes.length == 0 || bytes.length > properties.getUpload().getMaxFileSize().toBytes()
                || signature(bytes) != expectedFormat || !ImageStructureValidator.isComplete(bytes, expectedFormat)) {
            throw new IllegalArgumentException("Stored image is corrupt");
        }
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (input == null) throw new IllegalArgumentException("Stored image is corrupt");
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new IllegalArgumentException("Stored image is corrupt");
            ImageReader reader = readers.next();
            try {
                AtomicBoolean decoderWarning = new AtomicBoolean();
                IIOReadWarningListener warningListener = (sourceReader, warning) -> decoderWarning.set(true);
                reader.addIIOReadWarningListener(warningListener);
                reader.setInput(input, true, true);
                String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                if ((expectedFormat == DocumentImageFormat.JPEG && !format.equals("jpeg") && !format.equals("jpg"))
                        || (expectedFormat == DocumentImageFormat.PNG && !format.equals("png"))) {
                    throw new IllegalArgumentException("Stored image is corrupt");
                }
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width <= 0 || height <= 0 || width > properties.getUpload().getMaxImageDimension()
                        || height > properties.getUpload().getMaxImageDimension()
                        || (long) width * height > properties.getUpload().getMaxImagePixels()
                        || reader.read(0) == null || decoderWarning.get()) {
                    throw new IllegalArgumentException("Stored image is corrupt");
                }
            } finally {
                reader.dispose();
            }
        } catch (IOException | RuntimeException exception) {
            if (exception instanceof IllegalArgumentException illegal) throw illegal;
            throw new IllegalArgumentException("Stored image is corrupt", exception);
        }
    }

    private byte[] encode(BufferedImage image, DocumentImageFormat format, long maximum, String field) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName(format == DocumentImageFormat.JPEG ? "jpeg" : "png");
        if (!writers.hasNext()) throw new IOException("No canonical image writer");
        ImageWriter writer = writers.next();
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (MemoryCacheImageOutputStream output = new MemoryCacheImageOutputStream(new BoundedOutputStream(bytes, maximum))) {
            writer.setOutput(output);
            ImageWriteParam parameters = writer.getDefaultWriteParam();
            if (format == DocumentImageFormat.JPEG && parameters.canWriteCompressed()) {
                parameters.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                parameters.setCompressionQuality(0.92f);
            }
            writer.write(null, new IIOImage(image, null, null), parameters);
            output.flush();
        } finally {
            writer.dispose();
        }
        byte[] result = bytes.toByteArray();
        if (result.length == 0 || result.length > maximum) throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE);
        return result;
    }

    private DocumentImageFormat signature(byte[] bytes) {
        if (bytes.length >= 3 && (bytes[0] & 0xff) == 0xff && (bytes[1] & 0xff) == 0xd8 && (bytes[2] & 0xff) == 0xff)
            return DocumentImageFormat.JPEG;
        byte[] png = {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10};
        if (bytes.length >= png.length) {
            for (int index = 0; index < png.length; index++) if (bytes[index] != png[index]) return null;
            return DocumentImageFormat.PNG;
        }
        return null;
    }

    private DocumentImageFormat filenameFormat(String name) {
        if (name == null || !name.matches("[A-Za-z0-9][A-Za-z0-9 _-]{0,99}\\.(?i:jpg|jpeg|png)")) throw invalid("filename");
        String extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        return extension.equals("png") ? DocumentImageFormat.PNG : DocumentImageFormat.JPEG;
    }

    private DocumentImageFormat mediaTypeFormat(String type) {
        if ("image/jpeg".equalsIgnoreCase(type)) return DocumentImageFormat.JPEG;
        if ("image/png".equalsIgnoreCase(type)) return DocumentImageFormat.PNG;
        throw unsupported();
    }

    private AppException invalid(String field) {
        return new AppException(ErrorCode.VALIDATION_ERROR,
                java.util.List.of(new com.carrental.dto.response.FieldErrorResponse(field, "Ảnh giấy tờ không hợp lệ")));
    }

    private AppException unsupported() { return new AppException(ErrorCode.UNSUPPORTED_MEDIA_TYPE); }

    private boolean causedByOutputLimit(Throwable exception) {
        for (Throwable current = exception; current != null; current = current.getCause()) {
            if (current instanceof OutputLimitException) return true;
        }
        return false;
    }

    private static final class BoundedOutputStream extends FilterOutputStream {
        private final long maximum;
        private long count;
        private BoundedOutputStream(OutputStream delegate, long maximum) { super(delegate); this.maximum = maximum; }
        @Override public void write(int value) throws IOException {
            if (++count > maximum) throw new OutputLimitException();
            out.write(value);
        }
        @Override public void write(byte[] bytes, int offset, int length) throws IOException {
            if (length < 0 || count + length > maximum) throw new OutputLimitException();
            count += length;
            out.write(bytes, offset, length);
        }
    }

    private static final class OutputLimitException extends IOException { }
}
