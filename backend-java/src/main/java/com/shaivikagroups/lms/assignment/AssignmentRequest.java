package com.shaivikagroups.lms.assignment;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class AssignmentRequest {

    @NotBlank(message = "Course ID is required")
    private String courseId;

    private String lessonId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Instructions are required")
    private String instructions;

    private int maxScore = 100;
    private Instant dueDate;
    private boolean allowFileUpload = true;
    private boolean allowGithubLink = true;

    public AssignmentRequest() {}

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
}

