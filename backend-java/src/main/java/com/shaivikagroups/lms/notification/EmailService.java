package com.shaivikagroups.lms.notification;

public interface EmailService {

    void sendWelcomeEmail(String toEmail, String fullName, String organizationName);

    void sendPasswordResetEmail(String toEmail, String resetToken, String resetUrl);

    void sendVerificationEmail(String toEmail, String verificationToken, String verificationUrl);
}

