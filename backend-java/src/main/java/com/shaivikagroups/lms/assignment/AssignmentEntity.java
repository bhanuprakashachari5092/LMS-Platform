package com.shaivikagroups.lms.assignment;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "assignments")
public class AssignmentEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "lesson_id", length = 64)
    private String lessonId;

    @Column(name = "course_id", length = 64, nullable = false)
    private String courseId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "instructions", columnDefinition = "text", nullable = false)
    private String instructions;

    @Column(name = "max_score", nullable = false)
    private int maxScore = 100;

    @Column(name = "due_date")
    private Instant dueDate;

    @Column(name = "allow_file_upload", nullable = false)
    private boolean allowFileUpload = true;

    @Column(name = "allow_github_link", nullable = false)
    private boolean allowGithubLink = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public AssignmentEntity() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLessonId() {
        return lessonId;
    }

    public void setLessonId(String lessonId) {
        this.lessonId = lessonId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

