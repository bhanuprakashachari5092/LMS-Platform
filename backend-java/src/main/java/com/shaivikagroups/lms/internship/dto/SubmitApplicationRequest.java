package com.shaivikagroups.lms.internship.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmitApplicationRequest(
        @NotBlank String internshipId,
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank String phone,
        @NotBlank String college,
        @NotBlank String degree,
        @NotBlank String branch,
        @NotBlank String currentYear,
        @NotNull Integer graduationYear,
        @NotBlank String skills,
        String resumeUrl,
        String githubUrl,
        String linkedinUrl,
        String portfolioUrl,
        String statementOfPurpose
) {}

