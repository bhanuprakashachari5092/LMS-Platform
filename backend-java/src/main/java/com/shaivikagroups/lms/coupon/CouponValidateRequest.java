package com.shaivikagroups.lms.coupon;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class CouponValidateRequest {

    @NotBlank(message = "Coupon code is required")
    private String couponCode;

    private String courseId;
    private BigDecimal coursePrice;

    public CouponValidateRequest() {}

    public CouponValidateRequest(String couponCode, String courseId, BigDecimal coursePrice) {
        this.couponCode = couponCode;
        this.courseId = courseId;
        this.coursePrice = coursePrice;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public BigDecimal getCoursePrice() {
        return coursePrice;
    }

    public void setCoursePrice(BigDecimal coursePrice) {
        this.coursePrice = coursePrice;
    }
}

