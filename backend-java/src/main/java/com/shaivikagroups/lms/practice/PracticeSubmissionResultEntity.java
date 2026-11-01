package com.shaivikagroups.lms.practice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "practice_submission_results")
public class PracticeSubmissionResultEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @JsonIgnore
    private PracticeSubmissionEntity submission;

    @Column(name = "test_case_id", length = 64)
    private String testCaseId;

    @Column(name = "is_hidden", nullable = false)
    private boolean isHidden = false;

    @Column(name = "status", length = 32, nullable = false)
    private String status; // PASSED, FAILED, TIMEOUT, ERROR

    @Column(name = "actual_output", columnDefinition = "text")
    private String actualOutput;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;

    @Column(name = "memory_used_kb")
    private Integer memoryUsedKb;

    public PracticeSubmissionResultEntity() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public PracticeSubmissionEntity getSubmission() {
        return submission;
    }

    public void setSubmission(PracticeSubmissionEntity submission) {
        this.submission = submission;
    }

    public String getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(String testCaseId) {
        this.testCaseId = testCaseId;
    }

    public boolean isHidden() {
        return isHidden;
    }

    public void setHidden(boolean hidden) {
        isHidden = hidden;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getActualOutput() {
        return actualOutput;
    }

    public void setActualOutput(String actualOutput) {
        this.actualOutput = actualOutput;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Integer getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(Integer executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public Integer getMemoryUsedKb() {
        return memoryUsedKb;
    }

    public void setMemoryUsedKb(Integer memoryUsedKb) {
        this.memoryUsedKb = memoryUsedKb;
    }
}

