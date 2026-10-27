package com.carrental.event;

import com.carrental.entity.Transaction;

public record PaymentCompletedEvent(Transaction transaction) {
}
