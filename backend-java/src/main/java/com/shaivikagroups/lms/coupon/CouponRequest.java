package com.shaivikagroups.lms.coupon;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;

public class CouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    private String discountType = "PERCENTAGE"; // PERCENTAGE or FLAT

    @NotNull(message = "Discount amount is required")
    @DecimalMin(value = "0.01", message = "Discount amount must be positive")
    private BigDecimal discountAmount;

    private int maxUses = 100;
    private String courseId;
    private BigDecimal minPurchaseInr = BigDecimal.ZERO;
    private Instant expiresAt;

    public CouponRequest() {}

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public int getMaxUses() {
        return maxUses;
    }

    public void setMaxUses(int maxUses) {
        this.maxUses = maxUses;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public BigDecimal getMinPurchaseInr() {
        return minPurchaseInr;
    }

    public void setMinPurchaseInr(BigDecimal minPurchaseInr) {
        this.minPurchaseInr = minPurchaseInr;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}

