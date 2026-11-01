package com.shaivikagroups.lms.practice.dto;

import java.time.Instant;

public class PracticeProblemSummaryDTO {

    private String id;
    private String title;
    private String slug;
    private String difficulty;
    private String category;
    private String topicTags;
    private int timeLimitMs;
    private int memoryLimitKb;
    private boolean isPublished;
    private Instant createdAt;

    public PracticeProblemSummaryDTO() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
