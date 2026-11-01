package com.shaivikagroups.lms.assignment;

import java.time.Instant;

public class AssignmentResponse {
    private String id;
    private String courseId;
    private String lessonId;
    private String title;
    private String instructions;
    private int maxScore;
    private Instant dueDate;
    private boolean allowFileUpload;
    private boolean allowGithubLink;
    private Instant createdAt;

    public AssignmentResponse() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getLessonId() {
        return lessonId;
    }

    public void setLessonId(String lessonId) {
        this.lessonId = lessonId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public int getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(int maxScore) {
        this.maxScore = maxScore;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public boolean isAllowFileUpload() {
        return allowFileUpload;
    }

    public void setAllowFileUpload(boolean allowFileUpload) {
        this.allowFileUpload = allowFileUpload;
    }

    public boolean isAllowGithubLink() {
        return allowGithubLink;
    }

    public void setAllowGithubLink(boolean allowGithubLink) {
        this.allowGithubLink = allowGithubLink;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

