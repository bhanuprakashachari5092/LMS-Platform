package com.shaivikagroups.lms.internship.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record InternshipCertificateDTO(
        String id,
        String enrollmentId,
        String userId,
        String certificateNumber,
        String studentName,
        String internshipTitle,
        String domain,
        String duration,
        LocalDate issueDate,
        String verificationHash,
        String verificationUrl,
        String pdfUrl,
        String status,
        OffsetDateTime createdAt
) {}

