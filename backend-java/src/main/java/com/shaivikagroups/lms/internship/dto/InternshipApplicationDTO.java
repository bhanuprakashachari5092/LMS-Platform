package com.shaivikagroups.lms.internship.dto;

import java.time.OffsetDateTime;

public record InternshipApplicationDTO(
        String id,
        String referenceNumber,
        String internshipId,
        String internshipTitle,
        String domain,
        String userId,
        String fullName,
        String email,
        String phone,
        String college,
        String degree,
        String branch,
        String currentYear,
        Integer graduationYear,
        String skills,
        String resumeUrl,
        String githubUrl,
        String linkedinUrl,
        String portfolioUrl,
        String statementOfPurpose,
        String status,
        String adminNotes,
        String withdrawalReason,
        OffsetDateTime withdrawnAt,
        InterviewDTO interview,
        OffsetDateTime appliedAt
) {}
