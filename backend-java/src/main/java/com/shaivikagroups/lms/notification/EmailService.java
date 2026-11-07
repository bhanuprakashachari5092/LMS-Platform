package com.shaivikagroups.lms.notification;

public interface EmailService {

    void sendWelcomeEmail(String toEmail, String fullName, String organizationName);

    void sendPasswordResetEmail(String toEmail, String resetToken, String resetUrl);

    void sendVerificationEmail(String toEmail, String verificationToken, String verificationUrl);

    void sendApplicationReceivedEmail(String toEmail, String candidateName, String roleTitle, String referenceNumber);

    void sendAdminApplicationNotification(String adminEmail, String candidateName, String candidateEmail,
                                          String roleTitle, String referenceNumber, String resumeUrl,
                                          String college, String branch, Integer graduationYear, String skills, String phone);
}

