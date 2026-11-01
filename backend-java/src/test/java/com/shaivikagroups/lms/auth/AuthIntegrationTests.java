package com.shaivikagroups.lms.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.tenant.CreateTenantRequest;
import com.shaivikagroups.lms.tenant.TenantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantService tenantService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        // Ensure default tenant exists
        tenantService.resolveTenant(null);
    }

    @Test
    void testRegisterStudentSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("John Doe");
        request.setEmail("john.doe." + System.currentTimeMillis() + "@example.com");
        request.setPassword("SecurePass123!");
        request.setPhone("+919876543210");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value(request.getEmail()))
                .andExpect(jsonPath("$.data.user.role").value("STUDENT"));
    }

    @Test
    void testDuplicateRegistrationRejected() throws Exception {
        String email = "duplicate." + System.currentTimeMillis() + "@example.com";

        RegisterRequest request = new RegisterRequest();
        request.setFullName("First Registration");
        request.setEmail(email);
        request.setPassword("SecurePass123!");

        // First registration
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate registration attempt
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testLoginSuccessAndBadCredentials() throws Exception {
        String email = "login.test." + System.currentTimeMillis() + "@example.com";

        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Login Tester");
        registerReq.setEmail(email);
        registerReq.setPassword("CorrectPassword123!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // Valid Login
        LoginRequest validLogin = new LoginRequest();
        validLogin.setEmail(email);
        validLogin.setPassword("CorrectPassword123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value(email));

        // Invalid Password Login
        LoginRequest badLogin = new LoginRequest();
        badLogin.setEmail(email);
        badLogin.setPassword("WrongPassword!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testGetCurrentUserWithTokenAndWithoutToken() throws Exception {
        String email = "me.test." + System.currentTimeMillis() + "@example.com";

        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Me Tester");
        registerReq.setEmail(email);
        registerReq.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode rootNode = objectMapper.readTree(result.getResponse().getContentAsString());
        String accessToken = rootNode.path("data").path("accessToken").asText();

        // 1. Authorized call
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(email))
                .andExpect(jsonPath("$.data.fullName").value("Me Tester"));

        // 2. Unauthorized call (no token)
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRefreshTokenRotationAndRevocation() throws Exception {
        String email = "refresh.test." + System.currentTimeMillis() + "@example.com";

        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Refresh Tester");
        registerReq.setEmail(email);
        registerReq.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode rootNode = objectMapper.readTree(result.getResponse().getContentAsString());
        String refreshToken1 = rootNode.path("data").path("refreshToken").asText();

        // 1. Refresh with valid token
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(refreshToken1);
        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn();

        JsonNode refreshedNode = objectMapper.readTree(refreshResult.getResponse().getContentAsString());
        String refreshToken2 = refreshedNode.path("data").path("refreshToken").asText();
        assertNotEquals(refreshToken1, refreshToken2);

        // 2. Reusing old refreshToken1 should fail due to token reuse detection
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testTenantResolutionAndOnboarding() throws Exception {
        // Resolve default tenant
        mockMvc.perform(get("/api/v1/tenants/public/resolve?slug=kaizenq"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("kaizenq"));

        // Onboard a new organization
        CreateTenantRequest newOrg = new CreateTenantRequest();
        newOrg.setName("Acme University");
        newOrg.setSlug("acme-univ-" + System.currentTimeMillis());
        newOrg.setBrandColor("#10b981");

        mockMvc.perform(post("/api/v1/tenants/onboard")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newOrg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value(newOrg.getSlug()))
                .andExpect(jsonPath("$.data.brandColor").value("#10b981"));
    }
}

