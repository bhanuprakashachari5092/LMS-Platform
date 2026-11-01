package com.shaivikagroups.lms.internship.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record CreateInternshipRequest(
        @NotBlank String title,
        @NotBlank String slug,
        @NotBlank String domain,
        String internshipType,
        String duration,
        String location,
        @NotNull Integer openings,
        OffsetDateTime deadline,
        String stipendType,
        String stipendAmount,
        @NotBlank String eligibility,
        @NotBlank String requiredSkills,
        @NotBlank String description,
        String responsibilities,
        String learningOutcomes,
        String mentorName,
        String mentorTitle,
        String status,
        Boolean isFeatured
) {}

