package com.shaivikagroups.lms.payment;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/enroll-free")
    public ResponseEntity<ApiResponse<Map<String, Object>>> enrollFree(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody FreeEnrollmentRequest request) {
        String userId = principal != null ? principal.getId() : request.getStudentId();
        Map<String, Object> result = paymentService.enrollFree(userId, request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<CreateOrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreateOrderRequest request) {
        String userId = principal != null ? principal.getId() : request.getStudentId();
        CreateOrderResponse response = paymentService.createOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<VerifyPaymentResponse>> verifyPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VerifyPaymentRequest request) {
        String userId = principal != null ? principal.getId() : request.getStudentId();
        VerifyPaymentResponse response = paymentService.verifyPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PaymentHistoryDTO>>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentHistory(principal.getId())));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PaymentHistoryDTO>>> getHistory(
            @RequestParam(required = false) String studentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        String targetUserId = studentId != null && !studentId.isBlank()
                ? studentId
                : (principal != null ? principal.getId() : "default_student");
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentHistory(targetUserId)));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestBody(required = false) String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        return ResponseEntity.ok(ApiResponse.success("Webhook received"));
    }
}

