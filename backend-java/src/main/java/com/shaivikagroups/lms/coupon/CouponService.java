package com.shaivikagroups.lms.coupon;

import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ConflictException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Transactional(readOnly = true)
    public CouponValidateResponse validateCoupon(CouponValidateRequest req) {
        String tenantId = TenantContext.getTenantId();
        String code = req.getCouponCode() != null ? req.getCouponCode().trim().toUpperCase() : "";

        Optional<CouponEntity> couponOpt = couponRepository.findByTenantIdAndCode(tenantId, code);
        if (couponOpt.isEmpty()) {
            return CouponValidateResponse.invalid("Invalid coupon code.");
        }

        CouponEntity coupon = couponOpt.get();

        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            return CouponValidateResponse.invalid("This coupon is no longer active.");
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(Instant.now())) {
            return CouponValidateResponse.invalid("This coupon has expired.");
        }

        if (coupon.getMaxUses() > 0 && coupon.getUsedCount() >= coupon.getMaxUses()) {
            return CouponValidateResponse.invalid("This coupon has reached its maximum usage limit.");
        }

        if (coupon.getCourseId() != null && !coupon.getCourseId().isBlank()) {
            if (req.getCourseId() == null || !coupon.getCourseId().equalsIgnoreCase(req.getCourseId())) {
                return CouponValidateResponse.invalid("This coupon is not valid for the selected course.");
            }
        }

        BigDecimal originalPrice = req.getCoursePrice() != null ? req.getCoursePrice() : BigDecimal.ZERO;

        if (coupon.getMinPurchaseInr() != null && originalPrice.compareTo(coupon.getMinPurchaseInr()) < 0) {
            return CouponValidateResponse.invalid(
                    String.format("Minimum purchase amount of ₹%s is required to apply this coupon.", coupon.getMinPurchaseInr()));
        }

        BigDecimal discountAmount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = originalPrice.multiply(coupon.getDiscountAmount())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discountAmount = coupon.getDiscountAmount().min(originalPrice);
        }

        BigDecimal finalPrice = originalPrice.subtract(discountAmount).max(BigDecimal.ZERO);

        CouponValidateResponse resp = new CouponValidateResponse();
        resp.setValid(true);
        resp.setCode(coupon.getCode());
        resp.setCouponId(coupon.getId());
        resp.setDiscountType(coupon.getDiscountType().name().toLowerCase());
        resp.setDiscountValue(coupon.getDiscountAmount());
        resp.setOriginalPrice(originalPrice);
        resp.setDiscountAmount(discountAmount);
        resp.setFinalPrice(finalPrice);
        resp.setMessage(String.format("Coupon %s applied! Saved ₹%s.", coupon.getCode(), discountAmount));

        return resp;
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest req) {
        String tenantId = TenantContext.getTenantId();
        String code = req.getCode().trim().toUpperCase();

        if (couponRepository.existsByTenantIdAndCode(tenantId, code)) {
            throw new ConflictException("Coupon code already exists in this organization: " + code);
        }

        CouponEntity entity = new CouponEntity();
        entity.setId("cpn_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        entity.setTenantId(tenantId);
        entity.setCode(code);

        try {
            entity.setDiscountType(DiscountType.valueOf(req.getDiscountType().toUpperCase()));
        } catch (Exception e) {
            entity.setDiscountType(DiscountType.PERCENTAGE);
        }

        entity.setDiscountAmount(req.getDiscountAmount());
        entity.setMaxUses(req.getMaxUses() > 0 ? req.getMaxUses() : 100);
        entity.setUsedCount(0);
        entity.setCourseId(req.getCourseId());
        entity.setMinPurchaseInr(req.getMinPurchaseInr() != null ? req.getMinPurchaseInr() : BigDecimal.ZERO);
        entity.setStatus(CouponStatus.ACTIVE);
        entity.setExpiresAt(req.getExpiresAt());
        entity.setUpdatedAt(Instant.now());

        CouponEntity saved = couponRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public CouponResponse updateCoupon(String id, CouponRequest req) {
        CouponEntity entity = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));

        if (req.getCode() != null && !req.getCode().isBlank()) {
            entity.setCode(req.getCode().trim().toUpperCase());
        }
        if (req.getDiscountType() != null) {
            try {
                entity.setDiscountType(DiscountType.valueOf(req.getDiscountType().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (req.getDiscountAmount() != null) {
            entity.setDiscountAmount(req.getDiscountAmount());
        }
        if (req.getMaxUses() > 0) {
            entity.setMaxUses(req.getMaxUses());
        }
        entity.setCourseId(req.getCourseId());
        if (req.getMinPurchaseInr() != null) {
            entity.setMinPurchaseInr(req.getMinPurchaseInr());
        }
        entity.setExpiresAt(req.getExpiresAt());
        entity.setUpdatedAt(Instant.now());

        CouponEntity saved = couponRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteCoupon(String id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon not found: " + id);
        }
        couponRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> listCoupons() {
        String tenantId = TenantContext.getTenantId();
        return couponRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void incrementUsage(String couponId) {
        if (couponId != null && !couponId.isBlank()) {
            couponRepository.findById(couponId).ifPresent(c -> {
                c.setUsedCount(c.getUsedCount() + 1);
                couponRepository.save(c);
            });
        }
    }

    private CouponResponse mapToResponse(CouponEntity entity) {
        CouponResponse resp = new CouponResponse();
        resp.setId(entity.getId());
        resp.setTenantId(entity.getTenantId());
        resp.setCode(entity.getCode());
        resp.setDiscountType(entity.getDiscountType().name());
        resp.setDiscountAmount(entity.getDiscountAmount());
        resp.setMaxUses(entity.getMaxUses());
        resp.setUsedCount(entity.getUsedCount());
        resp.setCourseId(entity.getCourseId());
        resp.setMinPurchaseInr(entity.getMinPurchaseInr());
        resp.setStatus(entity.getStatus().name());
        resp.setExpiresAt(entity.getExpiresAt());
        resp.setCreatedAt(entity.getCreatedAt());
        return resp;
    }
}

