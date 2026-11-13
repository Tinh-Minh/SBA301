package com.carrental.service;

public interface EmailService {

    boolean isConfigured();

    void sendHtmlEmail(String recipient, String subject, String plainTextBody, String htmlBody);
}
