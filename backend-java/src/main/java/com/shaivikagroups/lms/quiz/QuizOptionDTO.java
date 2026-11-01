package com.shaivikagroups.lms.quiz;

public class QuizOptionDTO {
    private String id;
    private int orderIndex;
    private String optionText;
    private Boolean isCorrect;

    public QuizOptionDTO() {}

    public QuizOptionDTO(String id, int orderIndex, String optionText, Boolean isCorrect) {
        this.id = id;
        this.orderIndex = orderIndex;
        this.optionText = optionText;
        this.isCorrect = isCorrect;
    }

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

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean correct) {
        isCorrect = correct;
    }
}

