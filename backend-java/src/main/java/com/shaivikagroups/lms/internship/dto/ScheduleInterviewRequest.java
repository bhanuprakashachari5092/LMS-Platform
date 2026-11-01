package com.shaivikagroups.lms.internship.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record ScheduleInterviewRequest(
        @NotNull OffsetDateTime scheduledAt,
        String meetingLink,
        String interviewerName,
        String roundName
) {}

