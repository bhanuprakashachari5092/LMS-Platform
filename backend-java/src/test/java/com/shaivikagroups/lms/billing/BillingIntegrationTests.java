package com.shaivikagroups.lms.billing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.auth.LoginRequest;
import com.shaivikagroups.lms.auth.RegisterRequest;
import com.shaivikagroups.lms.coupon.CouponRequest;
import com.shaivikagroups.lms.coupon.CouponValidateRequest;
import com.shaivikagroups.lms.course.CourseRequest;
import com.shaivikagroups.lms.payment.CreateOrderRequest;
import com.shaivikagroups.lms.payment.FreeEnrollmentRequest;
import com.shaivikagroups.lms.payment.VerifyPaymentRequest;
import com.shaivikagroups.lms.subscription.UpgradeSubscriptionRequest;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.user.Role;
import com.shaivikagroups.lms.user.UserEntity;
import com.shaivikagroups.lms.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class BillingIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getAuthToken(String email, Role role) throws Exception {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("User " + role);
        registerReq.setEmail(email);
        registerReq.setPassword("Password123!");

        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(regResult.getResponse().getContentAsString());
        String userId = json.get("data").get("user").get("id").asText();
        String token = json.get("data").get("accessToken").asText();

        if (role != Role.STUDENT) {
            UserEntity user = userRepository.findById(userId).orElseThrow();
            user.setRole(role);
            userRepository.save(user);

            LoginRequest loginReq = new LoginRequest();
            loginReq.setEmail(email);
            loginReq.setPassword("Password123!");

            MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                            .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginReq)))
                    .andExpect(status().isOk())
                    .andReturn();

            JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
            token = loginJson.get("data").get("accessToken").asText();
        }

        return token;
    }

    @Test
    void testCouponCreationAndValidation() throws Exception {
        String adminToken = getAuthToken("admin.coupon." + System.currentTimeMillis() + "@example.com", Role.ORGANIZATION_ADMIN);

        // 1. Admin creates 20% discount coupon with min purchase 500
        CouponRequest couponReq = new CouponRequest();
        couponReq.setCode("KAIZEN20");
        couponReq.setDiscountType("PERCENTAGE");
        couponReq.setDiscountAmount(BigDecimal.valueOf(20.00));
        couponReq.setMaxUses(50);
        couponReq.setMinPurchaseInr(BigDecimal.valueOf(500.00));

        mockMvc.perform(post("/api/v1/coupons")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(couponReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("KAIZEN20"))
                .andExpect(jsonPath("$.data.discountType").value("PERCENTAGE"));

        // 2. Validate coupon on eligible purchase (₹1000) -> 20% discount = ₹200, final = ₹800
        CouponValidateRequest valReq = new CouponValidateRequest("KAIZEN20", "course_k8s_202", BigDecimal.valueOf(1000.00));
        mockMvc.perform(post("/api/v1/coupons/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(valReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid").value(true))
                .andExpect(jsonPath("$.data.discountAmount").value(200.0))
                .andExpect(jsonPath("$.data.finalPrice").value(800.0));

        // 3. Validate coupon on ineligible purchase (< ₹500)
        CouponValidateRequest belowMinReq = new CouponValidateRequest("KAIZEN20", "course_k8s_202", BigDecimal.valueOf(200.00));
        mockMvc.perform(post("/api/v1/coupons/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(belowMinReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid").value(false));

        // 4. Validate non-existent coupon
        CouponValidateRequest badReq = new CouponValidateRequest("NONEXISTENT", null, BigDecimal.valueOf(1000.00));
        mockMvc.perform(post("/api/v1/coupons/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid").value(false));
    }

    @Test
    void testPaidCourseOrderAndPaymentVerification() throws Exception {
        String lecturerToken = getAuthToken("lecturer.pay." + System.currentTimeMillis() + "@example.com", Role.LECTURER);
        String studentToken = getAuthToken("student.pay." + System.currentTimeMillis() + "@example.com", Role.STUDENT);

        // 1. Create a paid course
        CourseRequest courseReq = new CourseRequest();
        courseReq.setTitle("Enterprise Cloud DevOps Mastery");
        courseReq.setSlug("enterprise-cloud-devops-mastery-" + System.currentTimeMillis());
        courseReq.setCategory("DevOps");
        courseReq.setPriceInr(BigDecimal.valueOf(999.00));
        courseReq.setIsFree(false);

        MvcResult courseResult = mockMvc.perform(post("/api/v1/courses")
                        .header("Authorization", "Bearer " + lecturerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(courseReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode courseJson = objectMapper.readTree(courseResult.getResponse().getContentAsString());
        String courseId = courseJson.get("data").get("id").asText();

        // 2. Student creates a checkout order
        CreateOrderRequest orderReq = new CreateOrderRequest();
        orderReq.setCourseId(courseId);

        MvcResult orderResult = mockMvc.perform(post("/api/v1/payments/create-order")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.amount").value(999.0))
                .andExpect(jsonPath("$.data.amountInPaise").value(99900))
                .andReturn();

        JsonNode orderJson = objectMapper.readTree(orderResult.getResponse().getContentAsString());
        String orderId = orderJson.get("data").get("orderId").asText();

        // 3. Student verifies payment
        VerifyPaymentRequest verifyReq = new VerifyPaymentRequest();
        verifyReq.setOrderId(orderId);
        verifyReq.setRazorpayOrderId(orderId);
        verifyReq.setRazorpayPaymentId("pay_rzp_mock_" + System.currentTimeMillis());
        verifyReq.setRazorpaySignature("mock_valid_signature");
        verifyReq.setCourseId(courseId);

        mockMvc.perform(post("/api/v1/payments/verify")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CAPTURED"));

        // 4. Verify transaction history
        mockMvc.perform(get("/api/v1/payments/my")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].orderId").value(orderId))
                .andExpect(jsonPath("$.data[0].status").value("CAPTURED"));
    }

    @Test
    void testFreeEnrollmentFlow() throws Exception {
        String studentToken = getAuthToken("student.free." + System.currentTimeMillis() + "@example.com", Role.STUDENT);

        FreeEnrollmentRequest freeReq = new FreeEnrollmentRequest();
        freeReq.setCourseIds(List.of("course_linux_101"));

        mockMvc.perform(post("/api/v1/payments/enroll-free")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(freeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.enrolledCourseIds[0]").value("course_linux_101"));
    }

    @Test
    void testSubscriptionPlansAndTenantUpgrade() throws Exception {
        String adminToken = getAuthToken("admin.sub." + System.currentTimeMillis() + "@example.com", Role.ORGANIZATION_ADMIN);

        // 1. Browse public subscription plans
        mockMvc.perform(get("/api/v1/subscriptions/plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].tier").isString());

        // 2. View current subscription
        mockMvc.perform(get("/api/v1/subscriptions/current")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        // 3. Upgrade to Growth Pro
        UpgradeSubscriptionRequest upgradeReq = new UpgradeSubscriptionRequest("plan_pro_monthly", "MONTHLY");

        mockMvc.perform(post("/api/v1/subscriptions/upgrade")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(upgradeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tier").value("PRO"))
                .andExpect(jsonPath("$.data.maxStudents").value(1000));

        // 4. Cancel renewal
        mockMvc.perform(post("/api/v1/subscriptions/cancel")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cancelAtPeriodEnd").value(true));
    }
}

