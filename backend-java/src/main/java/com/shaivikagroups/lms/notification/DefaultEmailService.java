package com.shaivikagroups.lms.notification;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class DefaultEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(DefaultEmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.hr-notification-email:kaizenqlms@gmail.com}")
    private String hrNotificationEmail;

    @Value("${app.mail.from-email:kaizenqlms@gmail.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:KaizenQ LMS}")
    private String fromName;

    @Value("${integrations.brevo.api-key:}")
    private String brevoApiKey;

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

    @Override
    public void sendApplicationReceivedEmail(String toEmail, String candidateName, String roleTitle, String referenceNumber) {
        if (mailSender == null || mailUsername == null || mailUsername.isBlank()) {
            log.info("[EMAIL MOCK/DEV] Application Received Email sent to {} for role '{}' (Ref: {})",
                    toEmail, roleTitle, referenceNumber);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : mailUsername;
            helper.setFrom(sender, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Application Received – " + roleTitle + " – KaizenQ");

            String html = """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <h2 style="color: #38bdf8; margin: 0; font-size: 24px;">KaizenQ Talent Recruitment</h2>
                      <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Engineering & Internship Portal</p>
                    </div>
                    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #38bdf8;">
                      <p style="margin: 0; font-size: 16px; color: #e2e8f0;">Dear <strong>%s</strong>,</p>
                      <p style="color: #cbd5e1; line-height: 1.6; margin-top: 8px;">
                        Thank you for applying for the <strong>%s</strong> opportunity at KaizenQ. We have successfully received your application.
                      </p>
                      <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 14px;">
                        Application Reference: <strong style="color: #38bdf8;">%s</strong>
                      </p>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                      Our technical hiring team is currently reviewing your profile, portfolio, and skills. You will receive updates as your application progresses through our evaluation pipeline.
                    </p>
                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; text-align: center; font-size: 12px; color: #64748b;">
                      &copy; 2026 KaizenQ LMS &bull; Shaivika Groups &bull; All rights reserved.
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(candidateName, roleTitle, referenceNumber);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("[EMAIL SUCCESS] Sent confirmation email to candidate {} for ref {}", toEmail, referenceNumber);
        } catch (Exception e) {
            log.warn("[EMAIL WARN] Failed to send candidate confirmation email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    public void sendAdminApplicationNotification(String adminEmail, String candidateName, String candidateEmail,
                                                  String roleTitle, String referenceNumber, String resumeUrl,
                                                  String college, String branch, Integer graduationYear, String skills, String phone) {
        String targetAdmin = (adminEmail != null && !adminEmail.isBlank()) ? adminEmail : hrNotificationEmail;

        if (mailSender == null || mailUsername == null || mailUsername.isBlank()) {
            log.info("[EMAIL MOCK/DEV] HR Notification for role '{}' - Applicant: {} <{}> (Ref: {}, Resume: {})",
                    roleTitle, candidateName, candidateEmail, referenceNumber, resumeUrl);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : mailUsername;
            helper.setFrom(sender, fromName);
            helper.setTo(targetAdmin);
            helper.setSubject("New Internship Application – " + roleTitle + " – " + candidateName);

            String gradYearStr = graduationYear != null ? graduationYear.toString() : "N/A";
            String resumeLinkHtml = (resumeUrl != null && !resumeUrl.isBlank())
                    ? "<a href=\"" + resumeUrl + "\" style=\"color: #38bdf8; text-decoration: underline;\">View Uploaded Resume</a>"
                    : "<span style=\"color: #94a3b8;\">No link provided</span>";

            String html = """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px;">
                  <div style="max-width: 650px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
                    <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px;">
                      <h2 style="color: #38bdf8; margin: 0; font-size: 22px;">New Internship Application Submitted</h2>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0 0;">Position: <strong style="color: #f8fafc;">%s</strong></p>
                    </div>

                    <table style="width: 100%%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
                      <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 10px 0; color: #94a3b8; width: 140px;">Applicant Name:</td>
                        <td style="padding: 10px 0; color: #f8fafc; font-weight: bold;">%s</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 10px 0; color: #94a3b8;">Email Address:</td>
                        <td style="padding: 10px 0; color: #f8fafc;">%s</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 10px 0; color: #94a3b8;">Phone Number:</td>
                        <td style="padding: 10px 0; color: #f8fafc;">%s</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 10px 0; color: #94a3b8;">College/University:</td>
                        <td style="padding: 10px 0; color: #f8fafc;">%s</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 10px 0; color: #94a3b8;">Branch / Degree:</td>
                        <td style="padding: 10px 0; color: #f8fafc;">%s</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 10px 0; color: #94a3b8;">Graduation Year:</td>
                        <td style="padding: 10px 0; color: #f8fafc;">%s</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 10px 0; color: #94a3b8;">Skills:</td>
                        <td style="padding: 10px 0; color: #f8fafc;">%s</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #334155;">
                        <td style="padding: 10px 0; color: #94a3b8;">Reference Number:</td>
                        <td style="padding: 10px 0; color: #38bdf8; font-weight: bold;">%s</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #94a3b8;">Resume Document:</td>
                        <td style="padding: 10px 0;">%s</td>
                      </tr>
                    </table>

                    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; text-align: center;">
                      <p style="margin: 0; color: #94a3b8; font-size: 13px;">This application has been recorded in the KaizenQ database and synced with candidate tracking records.</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(roleTitle, candidateName, candidateEmail, (phone != null ? phone : "N/A"),
                    (college != null ? college : "N/A"), (branch != null ? branch : "N/A"), gradYearStr,
                    (skills != null ? skills : "N/A"), referenceNumber, resumeLinkHtml);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("[EMAIL SUCCESS] Sent HR notification email to {} for applicant {}", targetAdmin, candidateEmail);
        } catch (Exception e) {
            log.warn("[EMAIL WARN] Failed to send HR notification email to {}: {}", targetAdmin, e.getMessage());
        }
    }
}
