package com.shaivikagroups.lms.enrollment;

public enum EnrollmentStatus {
    ACTIVE,
    COMPLETED,
    SUSPENDED,
    REFUNDED;

    public static EnrollmentStatus fromString(String status) {
        if (status == null || status.isBlank()) {
            return ACTIVE;
        }
        try {
            return EnrollmentStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ACTIVE;
        }
    }
}

