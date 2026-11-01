package com.shaivikagroups.lms.practice.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CreateProblemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String slug;

    @NotBlank(message = "Description is required")
    private String description;

    private String difficulty = "EASY";
    private String category = "Algorithms";
    private String topicTags;
    private String constraints;
    private String hints;
    private int timeLimitMs = 2000;
    private int memoryLimitKb = 128000;
    private boolean isPublished = true;

    private Map<String, String> templates = new HashMap<>();
    private List<PracticeTestCaseDTO> testCases = new ArrayList<>();

    public CreateProblemRequest() {}

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

    public Map<String, String> getTemplates() {
        return templates;
    }

    public void setTemplates(Map<String, String> templates) {
        this.templates = templates;
    }

    public List<PracticeTestCaseDTO> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<PracticeTestCaseDTO> testCases) {
        this.testCases = testCases;
    }
}

