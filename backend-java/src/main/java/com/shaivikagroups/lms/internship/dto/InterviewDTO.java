package com.shaivikagroups.lms.internship.dto;

import java.time.OffsetDateTime;

public record InterviewDTO(
        String id,
        String applicationId,
        OffsetDateTime scheduledAt,
        String meetingLink,
        String interviewerName,
        String roundName,
        String feedback,
        String status
) {}

