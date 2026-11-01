package com.shaivikagroups.lms.payment;

import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.coupon.CouponService;
import com.shaivikagroups.lms.coupon.CouponValidateRequest;
import com.shaivikagroups.lms.coupon.CouponValidateResponse;
import com.shaivikagroups.lms.course.CourseEntity;
import com.shaivikagroups.lms.course.CourseRepository;
import com.shaivikagroups.lms.enrollment.EnrollmentEntity;
import com.shaivikagroups.lms.enrollment.EnrollmentRepository;
import com.shaivikagroups.lms.enrollment.EnrollmentStatus;
import com.shaivikagroups.lms.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CouponService couponService;

    @Value("${razorpay.key-id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:rzp_test_secret_placeholder}")
    private String razorpayKeySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            CouponService couponService) {
        this.paymentRepository = paymentRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.couponService = couponService;
    }

    @Transactional
    public Map<String, Object> enrollFree(String currentUserId, FreeEnrollmentRequest req) {
        String tenantId = TenantContext.getTenantId();
        String studentId = (req.getStudentId() != null && !req.getStudentId().isBlank())
                ? req.getStudentId()
                : currentUserId;

        List<String> targetCourseIds = req.getCourseIds() != null && !req.getCourseIds().isEmpty()
                ? req.getCourseIds()
                : Collections.emptyList();

        List<String> enrolledIds = new ArrayList<>();

        for (String cId : targetCourseIds) {
            CourseEntity course = courseRepository.findById(cId)
                    .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, cId))
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + cId));

            // Enroll student if not already enrolled
            if (!enrollmentRepository.existsByTenantIdAndUserIdAndCourseId(tenantId, studentId, course.getId())) {
                EnrollmentEntity enrollment = new EnrollmentEntity();
                enrollment.setId("enr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
                enrollment.setTenantId(tenantId);
                enrollment.setUserId(studentId);
                enrollment.setCourseId(course.getId());
                enrollment.setStatus(EnrollmentStatus.ACTIVE);
                enrollment.setProgressPercentage(0);
                enrollment.setEnrolledAt(Instant.now());
                enrollment.setLastAccessedAt(Instant.now());
                enrollmentRepository.save(enrollment);

                // Increment enrolled count
                course.setTotalEnrolled(course.getTotalEnrolled() + 1);
                courseRepository.save(course);
            }

            // Record free payment transaction
            PaymentEntity payment = new PaymentEntity();
            payment.setId("pay_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
            payment.setTenantId(tenantId);
            payment.setUserId(studentId);
            payment.setCourseId(course.getId());
            payment.setOrderId("free_order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
            payment.setPaymentId("free_pay_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
            payment.setAmountInr(BigDecimal.ZERO);
            payment.setCurrency("INR");
            payment.setProvider(PaymentProvider.RAZORPAY);
            payment.setStatus(PaymentStatus.CAPTURED);
            paymentRepository.save(payment);

            enrolledIds.add(course.getId());
        }

        if (req.getCouponCode() != null && !req.getCouponCode().isBlank()) {
            CouponValidateResponse val = couponService.validateCoupon(
                    new CouponValidateRequest(req.getCouponCode(), null, BigDecimal.ZERO));
            if (val.isValid() && val.getCouponId() != null) {
                couponService.incrementUsage(val.getCouponId());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("enrolledCourseIds", enrolledIds);
        result.put("message", "Successfully enrolled in free courses.");
        return result;
    }

    @Transactional
    public CreateOrderResponse createOrder(String currentUserId, CreateOrderRequest req) {
        String tenantId = TenantContext.getTenantId();
        String studentId = (req.getStudentId() != null && !req.getStudentId().isBlank())
                ? req.getStudentId()
                : currentUserId;

        String resolvedCourseId = req.getCourseId();
        if (resolvedCourseId == null && req.getCourseIds() != null && !req.getCourseIds().isEmpty()) {
            resolvedCourseId = req.getCourseIds().get(0);
        }

        if (resolvedCourseId == null) {
            throw new BadRequestException("At least one course ID is required to create a payment order.");
        }

        final String primaryCourseId = resolvedCourseId;
        CourseEntity course = courseRepository.findById(primaryCourseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, primaryCourseId))
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + primaryCourseId));

        // Check if already enrolled
        if (enrollmentRepository.existsByTenantIdAndUserIdAndCourseId(tenantId, studentId, course.getId())) {
            CreateOrderResponse resp = new CreateOrderResponse();
            resp.setAlreadyEnrolled(true);
            resp.setMessage("You are already enrolled in this course.");
            return resp;
        }

        BigDecimal originalPrice = course.getPriceInr() != null ? course.getPriceInr() : BigDecimal.ZERO;

        // Apply coupon if provided
        String couponId = null;
        BigDecimal finalPrice = originalPrice;
        if (req.getCouponCode() != null && !req.getCouponCode().isBlank()) {
            CouponValidateResponse val = couponService.validateCoupon(
                    new CouponValidateRequest(req.getCouponCode(), course.getId(), originalPrice));
            if (val.isValid()) {
                finalPrice = val.getFinalPrice();
                couponId = val.getCouponId();
            }
        }

        if (finalPrice.compareTo(BigDecimal.ZERO) <= 0 || course.isFree()) {
            CreateOrderResponse resp = new CreateOrderResponse();
            resp.setFreeCourse(true);
            resp.setAmount(BigDecimal.ZERO);
            resp.setAmountInPaise(0);
            resp.setMessage("Course is free or 100% discounted.");
            return resp;
        }

        String orderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String razorpayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        long amountInPaise = finalPrice.multiply(BigDecimal.valueOf(100)).longValue();

        PaymentEntity payment = new PaymentEntity();
        payment.setId("pay_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        payment.setTenantId(tenantId);
        payment.setUserId(studentId);
        payment.setCourseId(course.getId());
        payment.setOrderId(orderId);
        payment.setAmountInr(finalPrice);
        payment.setCurrency("INR");
        payment.setCouponId(couponId);
        payment.setProvider(PaymentProvider.RAZORPAY);
        payment.setStatus(PaymentStatus.CREATED);
        paymentRepository.save(payment);

        CreateOrderResponse resp = new CreateOrderResponse();
        resp.setSuccess(true);
        resp.setOrderId(orderId);
        resp.setRazorpayOrderId(razorpayOrderId);
        resp.setAmount(finalPrice);
        resp.setAmountInPaise(amountInPaise);
        resp.setCurrency("INR");
        resp.setKeyId(razorpayKeyId);

        return resp;
    }

    @Transactional
    public VerifyPaymentResponse verifyPayment(String currentUserId, VerifyPaymentRequest req) {
        String tenantId = TenantContext.getTenantId();
        String studentId = (req.getStudentId() != null && !req.getStudentId().isBlank())
                ? req.getStudentId()
                : currentUserId;

        String orderLookup = req.getOrderId() != null ? req.getOrderId() : req.getRazorpayOrderId();
        PaymentEntity payment = paymentRepository.findByOrderId(orderLookup)
                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found: " + orderLookup));

        // Signature validation if secret is active
        if (req.getRazorpaySignature() != null && !req.getRazorpaySignature().isBlank()) {
            boolean validSignature = verifyRazorpaySignature(
                    req.getRazorpayOrderId() != null ? req.getRazorpayOrderId() : payment.getOrderId(),
                    req.getRazorpayPaymentId(),
                    req.getRazorpaySignature()
            );
            if (!validSignature) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                throw new BadRequestException("Invalid payment signature verification failed.");
            }
        }

        payment.setPaymentId(req.getRazorpayPaymentId());
        payment.setSignature(req.getRazorpaySignature());
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        // Enroll student in the course
        CourseEntity course = courseRepository.findById(payment.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + payment.getCourseId()));

        if (!enrollmentRepository.existsByTenantIdAndUserIdAndCourseId(tenantId, studentId, course.getId())) {
            EnrollmentEntity enrollment = new EnrollmentEntity();
            enrollment.setId("enr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
            enrollment.setTenantId(tenantId);
            enrollment.setUserId(studentId);
            enrollment.setCourseId(course.getId());
            enrollment.setStatus(EnrollmentStatus.ACTIVE);
            enrollment.setProgressPercentage(0);
            enrollment.setEnrolledAt(Instant.now());
            enrollment.setLastAccessedAt(Instant.now());
            enrollmentRepository.save(enrollment);

            course.setTotalEnrolled(course.getTotalEnrolled() + 1);
            courseRepository.save(course);
        }

        // Increment coupon count if one was applied
        if (payment.getCouponId() != null) {
            couponService.incrementUsage(payment.getCouponId());
        }

        return new VerifyPaymentResponse(
                true,
                payment.getPaymentId(),
                payment.getOrderId(),
                "CAPTURED",
                "Payment successfully verified and course unlocked.",
                List.of(course.getId())
        );
    }

    @Transactional(readOnly = true)
    public List<PaymentHistoryDTO> getPaymentHistory(String userId) {
        String tenantId = TenantContext.getTenantId();
        return paymentRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(tenantId, userId).stream()
                .map(this::mapToHistoryDTO)
                .collect(Collectors.toList());
    }

    private PaymentHistoryDTO mapToHistoryDTO(PaymentEntity entity) {
        PaymentHistoryDTO dto = new PaymentHistoryDTO();
        dto.setId(entity.getId());
        dto.setOrderId(entity.getOrderId());
        dto.setPaymentId(entity.getPaymentId());
        dto.setCourseId(entity.getCourseId());
        courseRepository.findById(entity.getCourseId()).ifPresent(c -> dto.setCourseTitle(c.getTitle()));
        dto.setAmount(entity.getAmountInr());
        dto.setCurrency(entity.getCurrency());
        dto.setStatus(entity.getStatus().name());
        dto.setProvider(entity.getProvider().name());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        if (razorpayKeySecret == null || razorpayKeySecret.isBlank() || razorpayKeySecret.contains("placeholder")) {
            // In dev / test environments with mock credentials, allow non-empty signatures
            return signature != null && !signature.isBlank();
        }
        try {
            String payload = orderId + "|" + paymentId;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.warn("HMAC verification error: {}", e.getMessage());
            return false;
        }
    }
}
