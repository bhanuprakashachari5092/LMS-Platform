package com.shaivikagroups.lms.course;

public enum CourseLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED,
    ALL_LEVELS;

    public static CourseLevel fromString(String level) {
        if (level == null || level.isBlank()) {
            return ALL_LEVELS;
        }
        try {
            return CourseLevel.valueOf(level.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ALL_LEVELS;
        }
    }
}

