package com.shaivikagroups.lms.internship.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitTaskRequest(
        @NotBlank String enrollmentId,
        String repoUrl,
        String liveDemoUrl,
        String notes
) {}

