package com.shaivikagroups.lms.quiz;

import java.util.ArrayList;
import java.util.List;

public class QuizQuestionDTO {
    private String id;
    private int orderIndex;
    private String questionText;
    private String questionType; // MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
    private String explanation;
    private int points = 1;
    private List<QuizOptionDTO> options = new ArrayList<>();

    public QuizQuestionDTO() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public List<QuizOptionDTO> getOptions() {
        return options;
    }

    public void setOptions(List<QuizOptionDTO> options) {
        this.options = options;
    }
}

