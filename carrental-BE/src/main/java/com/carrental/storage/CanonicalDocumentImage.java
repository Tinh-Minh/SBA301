package com.carrental.storage;

public record CanonicalDocumentImage(byte[] bytes, DocumentImageFormat format) {
    public CanonicalDocumentImage {
        if (bytes == null || bytes.length == 0 || format == null) {
            throw new IllegalArgumentException("Canonical image is invalid");
        }
        bytes = bytes.clone();
    }

    @Override public byte[] bytes() { return bytes.clone(); }
}
