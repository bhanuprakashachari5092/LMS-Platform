package com.shaivikagroups.lms.assignment;

import jakarta.validation.constraints.NotBlank;

public class SubmissionRequest {

    @NotBlank(message = "Submission URL or file link is required")
    private String submissionUrl;

    private String notes;

    public SubmissionRequest() {}

    public SubmissionRequest(String submissionUrl, String notes) {
        this.submissionUrl = submissionUrl;
        this.notes = notes;
    }

    public String getSubmissionUrl() {
        return submissionUrl;
    }

    public void setSubmissionUrl(String submissionUrl) {
        this.submissionUrl = submissionUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

