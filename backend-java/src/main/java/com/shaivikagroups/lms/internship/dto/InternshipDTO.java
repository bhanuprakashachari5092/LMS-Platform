package com.shaivikagroups.lms.internship.dto;

import java.time.OffsetDateTime;

public record InternshipDTO(
        String id,
        String title,
        String slug,
        String domain,
        String department,
        String employmentType,
        String experienceLevel,
        String internshipType,
        String duration,
        String location,
        Integer openings,
        OffsetDateTime deadline,
        String stipendType,
        String stipendAmount,
        String eligibility,
        String requiredSkills,
        String preferredSkills,
        String description,
        String mentorName,
        String mentorTitle,
        String status,
        Boolean isFeatured,
        OffsetDateTime createdAt
) {}
