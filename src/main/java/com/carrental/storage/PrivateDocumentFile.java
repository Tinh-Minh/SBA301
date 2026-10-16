package com.carrental.storage;

public record PrivateDocumentFile(byte[] bytes, DocumentImageFormat format) {
    public PrivateDocumentFile {
        if (bytes == null || bytes.length == 0 || format == null) {
            throw new IllegalArgumentException("Private file is invalid");
        }
        bytes = bytes.clone();
    }

    @Override public byte[] bytes() { return bytes.clone(); }
}
