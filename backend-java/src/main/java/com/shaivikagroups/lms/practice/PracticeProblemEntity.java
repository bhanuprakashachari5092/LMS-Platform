package com.shaivikagroups.lms.practice;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "practice_problems")
public class PracticeProblemEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "tenant_id", length = 64, nullable = false)
    private String tenantId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "slug", length = 255, nullable = false)
    private String slug;

    @Column(name = "description", columnDefinition = "text", nullable = false)
    private String description;

    @Column(name = "difficulty", length = 32, nullable = false)
    private String difficulty = "EASY";

    @Column(name = "category", length = 100, nullable = false)
    private String category = "Algorithms";

    @Column(name = "topic_tags", columnDefinition = "text")
    private String topicTags;

    @Column(name = "constraints", columnDefinition = "text")
    private String constraints;

    @Column(name = "hints", columnDefinition = "text")
    private String hints;

    @Column(name = "time_limit_ms", nullable = false)
    private int timeLimitMs = 2000;

    @Column(name = "memory_limit_kb", nullable = false)
    private int memoryLimitKb = 128000;

    @Column(name = "is_published", nullable = false)
    private boolean isPublished = true;

    @Column(name = "author_id", length = 64)
    private String authorId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PracticeProblemTemplateEntity> templates = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PracticeTestCaseEntity> testCases = new ArrayList<>();

    public PracticeProblemEntity() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTopicTags() {
        return topicTags;
    }

    public void setTopicTags(String topicTags) {
        this.topicTags = topicTags;
    }

    public String getConstraints() {
        return constraints;
    }

    public void setConstraints(String constraints) {
        this.constraints = constraints;
    }

    public String getHints() {
        return hints;
    }

    public void setHints(String hints) {
        this.hints = hints;
    }

    public int getTimeLimitMs() {
        return timeLimitMs;
    }

    public void setTimeLimitMs(int timeLimitMs) {
        this.timeLimitMs = timeLimitMs;
    }

    public int getMemoryLimitKb() {
        return memoryLimitKb;
    }

    public void setMemoryLimitKb(int memoryLimitKb) {
        this.memoryLimitKb = memoryLimitKb;
    }

    public boolean isPublished() {
        return isPublished;
    }

    public void setPublished(boolean published) {
        isPublished = published;
    }

    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
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

    public List<PracticeProblemTemplateEntity> getTemplates() {
        return templates;
    }

    public void setTemplates(List<PracticeProblemTemplateEntity> templates) {
        this.templates = templates;
    }

    public List<PracticeTestCaseEntity> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<PracticeTestCaseEntity> testCases) {
        this.testCases = testCases;
    }
}

