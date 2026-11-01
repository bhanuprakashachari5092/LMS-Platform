package com.shaivikagroups.lms.progress;

public enum ProgressStatus {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED;

    public static ProgressStatus fromString(String status) {
        if (status == null || status.isBlank()) {
            return NOT_STARTED;
        }
        try {
            return ProgressStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return NOT_STARTED;
        }
    }
}

