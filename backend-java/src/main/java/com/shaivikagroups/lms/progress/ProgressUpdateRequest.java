package com.shaivikagroups.lms.progress;

import jakarta.validation.constraints.NotBlank;

public class ProgressUpdateRequest {

    @NotBlank(message = "Lesson ID is required")
    private String lessonId;

    private String status = "COMPLETED"; // NOT_STARTED, IN_PROGRESS, COMPLETED
    private int timeSpentSeconds = 0;

    public ProgressUpdateRequest() {}

    public ProgressUpdateRequest(String lessonId, String status, int timeSpentSeconds) {
        this.lessonId = lessonId;
        this.status = status;
        this.timeSpentSeconds = timeSpentSeconds;
    }

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTimeSpentSeconds() { return timeSpentSeconds; }
    public void setTimeSpentSeconds(int timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; }
}

