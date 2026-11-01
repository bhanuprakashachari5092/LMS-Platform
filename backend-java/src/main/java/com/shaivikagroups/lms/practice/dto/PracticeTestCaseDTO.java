package com.shaivikagroups.lms.practice.dto;

public class PracticeTestCaseDTO {

    private String id;
    private String inputData;
    private String expectedOutput;
    private String explanation;
    private boolean isHidden;
    private int weightPoints;
    private int displayOrder;

    public PracticeTestCaseDTO() {}

    public PracticeTestCaseDTO(String id, String inputData, String expectedOutput, String explanation, boolean isHidden, int weightPoints, int displayOrder) {
        this.id = id;
        this.inputData = inputData;
        this.expectedOutput = expectedOutput;
        this.explanation = explanation;
        this.isHidden = isHidden;
        this.weightPoints = weightPoints;
        this.displayOrder = displayOrder;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInputData() {
        return inputData;
    }

    public void setInputData(String inputData) {
        this.inputData = inputData;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public boolean isHidden() {
        return isHidden;
    }

    public void setHidden(boolean hidden) {
        isHidden = hidden;
    }

    public int getWeightPoints() {
        return weightPoints;
    }

    public void setWeightPoints(int weightPoints) {
        this.weightPoints = weightPoints;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }
}
