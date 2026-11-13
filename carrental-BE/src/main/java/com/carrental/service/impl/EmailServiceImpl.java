package com.carrental.service.impl;

import com.carrental.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final String mailFrom;
    private final String mailUsername;
    private final String mailPassword;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${app.mail.from:}") String mailFrom,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${spring.mail.password:}") String mailPassword) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom == null ? "" : mailFrom;
        this.mailUsername = mailUsername == null ? "" : mailUsername;
        this.mailPassword = mailPassword == null ? "" : mailPassword;
    }

    @Override
    public boolean isConfigured() {
        return !mailFrom.isBlank() && !mailUsername.isBlank() && !mailPassword.isBlank();
    }

    @Override
    public void sendHtmlEmail(String recipient, String subject, String plainTextBody, String htmlBody) {
        if (!isConfigured()) {
            throw new MailSendException("SMTP email is not configured");
        }

        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
            helper.setFrom(mailFrom);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(plainTextBody, htmlBody);
            mailSender.send(message);
        } catch (MessagingException exception) {
            throw new MailSendException("Could not compose email message", exception);
        }
    }
}
