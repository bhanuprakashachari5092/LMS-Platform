package com.shaivikagroups.lms.internship.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateApplicationStatusRequest(
        @NotBlank String status, // SUBMITTED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, SELECTED, REJECTED
        String adminNotes
) {}

