package com.shaivikagroups.lms.practice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SaveDraftRequest {

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Code cannot be empty")
    @Size(max = 65536, message = "Code exceeds maximum size of 64KB")
    private String code;

    public SaveDraftRequest() {}

    public SaveDraftRequest(String language, String code) {
        this.language = language;
        this.code = code;
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
