package com.shaivikagroups.lms.practice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "practice_test_cases")
public class PracticeTestCaseEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    @JsonIgnore
    private PracticeProblemEntity problem;

    @Column(name = "input_data", columnDefinition = "text")
    private String inputData;

    @Column(name = "expected_output", columnDefinition = "text", nullable = false)
    private String expectedOutput;

    @Column(name = "explanation", columnDefinition = "text")
    private String explanation;

    @Column(name = "is_hidden", nullable = false)
    private boolean isHidden = false;

    @Column(name = "weight_points", nullable = false)
    private int weightPoints = 10;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public PracticeTestCaseEntity() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public PracticeProblemEntity getProblem() {
        return problem;
    }

    public void setProblem(PracticeProblemEntity problem) {
        this.problem = problem;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
