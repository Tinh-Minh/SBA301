package com.carrental.storage;

import java.util.UUID;

/** Opaque handle for cleanup; its locator is only persisted inside user_documents. */
public record PrivateDocumentReceipt(String locator, UUID receiptId) {
}
