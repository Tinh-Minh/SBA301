package com.carrental.dto.request.bankaccount;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.JsonNode;

/** Strict allowlist for the immutable payee fields accepted at bank-account creation. */
public final class CreateBankAccountRequest {
    private boolean bankNamePresent;
    private boolean accountNumberPresent;
    private boolean accountHolderPresent;
    private boolean makeDefaultPresent;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private boolean makeDefault;

    @JsonProperty("bankName")
    public void setBankName(JsonNode value) {
        rejectDuplicate(bankNamePresent);
        bankNamePresent = true;
        bankName = string(value, "bankName");
    }

    @JsonProperty("accountNumber")
    public void setAccountNumber(JsonNode value) {
        rejectDuplicate(accountNumberPresent);
        accountNumberPresent = true;
        accountNumber = string(value, "accountNumber");
    }

    @JsonProperty("accountHolder")
    public void setAccountHolder(JsonNode value) {
        rejectDuplicate(accountHolderPresent);
        accountHolderPresent = true;
        accountHolder = string(value, "accountHolder");
    }

    @JsonProperty("makeDefault")
    public void setMakeDefault(JsonNode value) {
        rejectDuplicate(makeDefaultPresent);
        makeDefaultPresent = true;
        if (value == null || !value.isBoolean()) {
            throw new IllegalArgumentException("makeDefault must be a boolean");
        }
        makeDefault = value.booleanValue();
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown bank account field");
    }

    public boolean bankNameWasProvided() { return bankNamePresent; }
    public boolean accountNumberWasProvided() { return accountNumberPresent; }
    public boolean accountHolderWasProvided() { return accountHolderPresent; }
    public String getBankName() { return bankName; }
    public String getAccountNumber() { return accountNumber; }
    public String getAccountHolder() { return accountHolder; }
    public boolean isMakeDefault() { return makeDefault; }

    private static String string(JsonNode value, String field) {
        if (value == null || !value.isTextual()) {
            throw new IllegalArgumentException(field + " must be a string");
        }
        return value.stringValue();
    }

    private static void rejectDuplicate(boolean present) {
        if (present) throw new IllegalArgumentException("Repeated bank account field");
    }
}
