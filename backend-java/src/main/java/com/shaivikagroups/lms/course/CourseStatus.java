package com.shaivikagroups.lms.course;

public enum CourseStatus {
    DRAFT,
    REVIEW,
    PUBLISHED,
    ARCHIVED;

    public static CourseStatus fromString(String status) {
        if (status == null || status.isBlank()) {
            return PUBLISHED;
        }
        try {
            return CourseStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PUBLISHED;
        }
    }
}

