package com.carrental.storage;

public interface PrivateDocumentStorage {
    boolean isEnabled();
    PrivateDocumentReceipt store(CanonicalDocumentImage image);
    PrivateDocumentFile open(String locator);
    void delete(PrivateDocumentReceipt receipt);
}
