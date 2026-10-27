package com.carrental.enums;

/** Các thao tác trên đơn thuê được ghi vào cột action của bảng action_logs. */
public enum OrderAction {
    CREATE,
    CONFIRM,
    REJECT,
    CANCEL,
    EXPIRE,
    HANDOVER_CREATE,
    HANDOVER_CONFIRM,
    PICKUP,
    RETURN
}
