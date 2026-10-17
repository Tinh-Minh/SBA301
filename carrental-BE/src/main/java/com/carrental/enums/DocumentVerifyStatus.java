package com.carrental.enums;

/** Review states for a submitted user document. */
public enum DocumentVerifyStatus {
    /** The document awaits review. */
    PENDING,
    /** The document was approved. */
    APPROVED,
    /** The document was rejected. */
    REJECTED
}
