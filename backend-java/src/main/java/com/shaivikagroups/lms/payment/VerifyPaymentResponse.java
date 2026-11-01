package com.shaivikagroups.lms.payment;

import java.util.List;

public class VerifyPaymentResponse {
    private boolean success;
    private String paymentId;
    private String orderId;
    private String status;
    private String message;
    private List<String> enrolledCourseIds;

    public VerifyPaymentResponse() {}

    public VerifyPaymentResponse(boolean success, String paymentId, String orderId, String status, String message, List<String> enrolledCourseIds) {
        this.success = success;
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.status = status;
        this.message = message;
        this.enrolledCourseIds = enrolledCourseIds;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getEnrolledCourseIds() {
        return enrolledCourseIds;
    }

    public void setEnrolledCourseIds(List<String> enrolledCourseIds) {
        this.enrolledCourseIds = enrolledCourseIds;
    }
}

