package com.shaivikagroups.lms.subscription;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlanEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", length = 32, nullable = false)
    private PlanTier tier = PlanTier.FREE;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", length = 32, nullable = false)
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    @Column(name = "price_inr", precision = 10, scale = 2, nullable = false)
    private BigDecimal priceInr = BigDecimal.ZERO;

    @Column(name = "max_students", nullable = false)
    private int maxStudents = 500;

    @Column(name = "max_courses", nullable = false)
    private int maxCourses = 20;

    @Column(name = "max_storage_gb", precision = 10, scale = 2, nullable = false)
    private BigDecimal maxStorageGb = BigDecimal.valueOf(5.00);

    @Column(name = "features", columnDefinition = "text")
    private String features = "[]";

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public SubscriptionPlanEntity() {}

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

    public PlanTier getTier() {
        return tier;
    }

    public void setTier(PlanTier tier) {
        this.tier = tier;
    }

    public BillingCycle getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(BillingCycle billingCycle) {
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

