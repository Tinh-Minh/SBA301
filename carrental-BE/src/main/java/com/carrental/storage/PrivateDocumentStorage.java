package com.carrental.storage;

import java.util.UUID;

public interface PrivateDocumentStorage {
    boolean isEnabled();
    PrivateDocumentReceipt store(UploadedDocumentImage image);
    PrivateDocumentFile open(String locator);
    void delete(PrivateDocumentReceipt receipt);

    record UploadedDocumentImage(String filename, String mediaType, byte[] bytes) { }
    record PrivateDocumentReceipt(String locator, UUID receiptId) { }
    record PrivateDocumentFile(byte[] bytes, DocumentImageFormat format) { }

    enum DocumentImageFormat {
        JPEG("jpg", "image/jpeg"), PNG("png", "image/png");
        private final String extension;
        private final String mediaType;
        DocumentImageFormat(String extension, String mediaType) {
            this.extension = extension;
            this.mediaType = mediaType;
        }
        public String extension() { return extension; }
        public String mediaType() { return mediaType; }
    }
}
