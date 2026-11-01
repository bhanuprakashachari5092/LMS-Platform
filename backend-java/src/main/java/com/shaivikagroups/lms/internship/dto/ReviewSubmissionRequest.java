package com.shaivikagroups.lms.internship.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReviewSubmissionRequest(
        @NotNull Integer score,
        String feedback,
        @NotBlank String status // APPROVED, REVISION_REQUESTED
) {}

