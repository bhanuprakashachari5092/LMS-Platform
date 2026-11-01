package com.shaivikagroups.lms.internship.dto;

import java.util.Map;

public record InternshipAnalyticsDTO(
        long totalInternships,
        long openInternships,
        long totalApplications,
        long underReviewApplications,
        long shortlistedApplications,
        long selectedApplications,
        long activeEnrollments,
        long completedEnrollments,
        Map<String, Long> applicationsByDomain
) {}

