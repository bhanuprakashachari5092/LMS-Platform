package com.shaivikagroups.lms.practice.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PracticeProblemDetailDTO {

    private String id;
    private String title;
    private String slug;
    private String description;
    private String difficulty;
    private String category;
    private String topicTags;
    private String constraints;
    private String hints;
    private int timeLimitMs;
    private int memoryLimitKb;
    private boolean isPublished;
    private Instant createdAt;

    // Map of language key -> starter code
    private Map<String, String> templates = new HashMap<>();

    // Sample test cases visible to students
    private List<PracticeTestCaseDTO> sampleTestCases = new ArrayList<>();

    // Hidden test case count (to show e.g. "2 sample cases, 8 hidden evaluation cases")
    private int hiddenTestCaseCount = 0;

    public PracticeProblemDetailDTO() {}

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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Map<String, String> getTemplates() {
        return templates;
    }

    public void setTemplates(Map<String, String> templates) {
        this.templates = templates;
    }

    public List<PracticeTestCaseDTO> getSampleTestCases() {
        return sampleTestCases;
    }

    public void setSampleTestCases(List<PracticeTestCaseDTO> sampleTestCases) {
        this.sampleTestCases = sampleTestCases;
    }

    public int getHiddenTestCaseCount() {
        return hiddenTestCaseCount;
    }

    public void setHiddenTestCaseCount(int hiddenTestCaseCount) {
        this.hiddenTestCaseCount = hiddenTestCaseCount;
    }
}
