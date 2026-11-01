package com.shaivikagroups.lms.subscription;

import jakarta.validation.constraints.NotBlank;

public class UpgradeSubscriptionRequest {

    @NotBlank(message = "Plan ID is required")
    private String planId;

    private String billingCycle = "MONTHLY"; // MONTHLY or ANNUAL
    private String paymentMethod = "RAZORPAY";

    public UpgradeSubscriptionRequest() {}

    public UpgradeSubscriptionRequest(String planId, String billingCycle) {
        this.planId = planId;
        this.billingCycle = billingCycle;
    }

    public String getPlanId() {
        return planId;
    }

    public void setPlanId(String planId) {
        this.planId = planId;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}

