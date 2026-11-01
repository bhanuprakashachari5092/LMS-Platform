package com.shaivikagroups.lms.internship.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record InternshipDetailDTO(
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
        String responsibilities,
        String learningOutcomes,
        String mentorName,
        String mentorTitle,
        String status,
        Boolean isFeatured,
        OffsetDateTime createdAt,
        List<InternshipTaskDTO> tasks
) {
    public record InternshipTaskDTO(
            String id,
            Integer weekNumber,
            String title,
            String description,
            String deliverables,
            Integer maxScore,
            Integer displayOrder
    ) {}
}
