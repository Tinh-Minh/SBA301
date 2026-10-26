package com.carrental.storage;

import com.carrental.enums.DocumentImageFormat;
import java.util.UUID;

public interface PrivateDocumentStorage {
    boolean isEnabled();
    PrivateDocumentReceipt store(UploadedDocumentImage image);
    PrivateDocumentFile open(String locator);
    void delete(PrivateDocumentReceipt receipt);

    record UploadedDocumentImage(String filename, String mediaType, byte[] bytes) { }
    record PrivateDocumentReceipt(String locator, UUID receiptId) { }
    record PrivateDocumentFile(byte[] bytes, DocumentImageFormat format) { }
}
