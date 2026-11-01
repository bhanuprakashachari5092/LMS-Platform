package com.shaivikagroups.lms.subscription;

import java.math.BigDecimal;

public class SubscriptionPlanDTO {
    private String id;
    private String name;
    private String tier;
    private String billingCycle;
    private BigDecimal priceInr;
    private int maxStudents;
    private int maxCourses;
    private BigDecimal maxStorageGb;
    private String features;
    private boolean isActive;

    public SubscriptionPlanDTO() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public BigDecimal getPriceInr() {
        return priceInr;
    }

    public void setPriceInr(BigDecimal priceInr) {
        this.priceInr = priceInr;
    }

    public int getMaxStudents() {
        return maxStudents;
    }

    public void setMaxStudents(int maxStudents) {
        this.maxStudents = maxStudents;
    }

    public int getMaxCourses() {
        return maxCourses;
    }

    public void setMaxCourses(int maxCourses) {
        this.maxCourses = maxCourses;
    }

    public BigDecimal getMaxStorageGb() {
        return maxStorageGb;
    }

    public void setMaxStorageGb(BigDecimal maxStorageGb) {
        this.maxStorageGb = maxStorageGb;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}

