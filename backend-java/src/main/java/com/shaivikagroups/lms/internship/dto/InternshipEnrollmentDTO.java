package com.shaivikagroups.lms.internship.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record InternshipEnrollmentDTO(
        String id,
        String internshipId,
        String internshipTitle,
        String domain,
        String userId,
        String status,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate completionDate,
        Integer progressPercentage,
        String mentorNotes,
        List<EnrollmentTaskSubmissionDTO> taskSubmissions,
        OffsetDateTime createdAt
) {
    public record EnrollmentTaskSubmissionDTO(
            String taskId,
            Integer weekNumber,
            String title,
            String description,
            String deliverables,
            Integer maxScore,
            String submissionId,
            String repoUrl,
            String liveDemoUrl,
            String notes,
            Integer score,
            String feedback,
            String submissionStatus,
            OffsetDateTime submittedAt
    ) {}
}
