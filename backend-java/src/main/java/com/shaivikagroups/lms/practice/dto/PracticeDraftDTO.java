package com.shaivikagroups.lms.practice.dto;

import java.time.Instant;

public class PracticeDraftDTO {

    private String id;
    private String problemId;
    private String language;
    private String code;
    private Instant updatedAt;

    public PracticeDraftDTO() {}

    public PracticeDraftDTO(String id, String problemId, String language, String code, Instant updatedAt) {
        this.id = id;
        this.problemId = problemId;
        this.language = language;
        this.code = code;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProblemId() {
        return problemId;
    }

    public void setProblemId(String problemId) {
        this.problemId = problemId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

