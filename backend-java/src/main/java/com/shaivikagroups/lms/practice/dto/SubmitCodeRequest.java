package com.shaivikagroups.lms.practice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SubmitCodeRequest {

    @NotBlank(message = "Problem ID or slug is required")
    private String problemId;

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Code cannot be empty")
    @Size(max = 65536, message = "Code exceeds maximum size of 64KB")
    private String code;

    public SubmitCodeRequest() {}

    public SubmitCodeRequest(String problemId, String language, String code) {
        this.problemId = problemId;
        this.language = language;
        this.code = code;
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
}
