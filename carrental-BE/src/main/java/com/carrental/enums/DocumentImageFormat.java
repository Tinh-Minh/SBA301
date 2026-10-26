package com.carrental.enums;

public enum DocumentImageFormat {
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
