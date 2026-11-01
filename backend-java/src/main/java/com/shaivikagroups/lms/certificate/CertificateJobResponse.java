package com.shaivikagroups.lms.certificate;

public class CertificateJobResponse {
    private String jobId;
    private String status; // queued, processing, completed, failed
    private String certificateId;
    private String pdfUrl;
    private String errorMessage;

    public CertificateJobResponse() {}

    public CertificateJobResponse(String jobId, String status, String certificateId, String pdfUrl) {
        this.jobId = jobId;
        this.status = status;
        this.certificateId = certificateId;
        this.pdfUrl = pdfUrl;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(String certificateId) {
        this.certificateId = certificateId;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}

