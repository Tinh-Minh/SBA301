package com.carrental.storage;

public record UploadedDocumentImage(String filename, String mediaType, byte[] bytes) {
    public UploadedDocumentImage {
        bytes = bytes == null ? null : bytes.clone();
    }

    @Override public byte[] bytes() { return bytes == null ? null : bytes.clone(); }
}
