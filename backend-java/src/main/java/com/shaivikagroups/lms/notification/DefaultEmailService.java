package com.shaivikagroups.lms.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class DefaultEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(DefaultEmailService.class);

    @Value("${integrations.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${integrations.brevo.from-email:no-reply@kaizenq.in}")
    private String fromEmail;

    @Value("${integrations.brevo.from-name:KaizenQ LMS}")
    private String fromName;

    @Override
    public void sendWelcomeEmail(String toEmail, String fullName, String organizationName) {
        log.info("[EMAIL DISPATCH] To: {}, Subject: Welcome to {}, Name: {}", toEmail, organizationName, fullName);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken, String resetUrl) {
        log.info("[EMAIL DISPATCH] To: {}, Subject: Reset your LMS Password, ResetURL: {}", toEmail, resetUrl);
    }

    @Override
    public void sendVerificationEmail(String toEmail, String verificationToken, String verificationUrl) {
        log.info("[EMAIL DISPATCH] To: {}, Subject: Verify your LMS Account, VerificationURL: {}", toEmail, verificationUrl);
    }
}

