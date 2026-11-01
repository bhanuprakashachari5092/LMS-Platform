package com.shaivikagroups.lms.ai;

import jakarta.validation.constraints.NotBlank;

public class AiExplanationRequest {

    @NotBlank(message = "Concept or topic is required")
    private String concept;

    private String lessonTitle;
    private String content;
    private String language = "en"; // en, te, hi
    private String level = "beginner"; // beginner, intermediate, advanced

    public AiExplanationRequest() {}

    public String getConcept() {
        return concept;
    }

    public void setConcept(String concept) {
        this.concept = concept;
    }

    public String getLessonTitle() {
        return lessonTitle;
    }

    public void setLessonTitle(String lessonTitle) {
        this.lessonTitle = lessonTitle;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }
}

