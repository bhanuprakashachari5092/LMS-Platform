package com.shaivikagroups.lms.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.auth.RegisterRequest;
import com.shaivikagroups.lms.portfolio.PortfolioUpdateRequest;
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

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AiAndIntegrationsIntegrationTests {

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

        JsonNode regNode = objectMapper.readTree(regResult.getResponse().getContentAsString());
        return regNode.get("data").get("accessToken").asText();
    }

    @Test
    public void testAiChatInTeluguAndHindi() throws Exception {
        // 1. Chat in Telugu
        AiChatRequest teluguReq = new AiChatRequest();
        teluguReq.setMessage("నాకు ఈ పాఠం తెలుగులో వివరించండి");
        teluguReq.setLanguage("te");
        teluguReq.setLessonTitle("Linux Process Architecture");

        mockMvc.perform(post("/api/v1/ai/chat")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(teluguReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.language").value("te"))
                .andExpect(jsonPath("$.data.reply").isNotEmpty());

        // 2. Chat in Hindi
        AiChatRequest hindiReq = new AiChatRequest();
        hindiReq.setMessage("कृपया मुझे इस पाठ के मुख्य बिंदु बताएं");
        hindiReq.setLanguage("hi");
        hindiReq.setLessonTitle("Git Branching Strategy");

        mockMvc.perform(post("/api/v1/ai/chat")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hindiReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.language").value("hi"))
                .andExpect(jsonPath("$.data.reply").isNotEmpty());
    }

    @Test
    public void testAiConceptExplanation() throws Exception {
        AiExplanationRequest req = new AiExplanationRequest();
        req.setConcept("Virtual Memory Paging");
        req.setLanguage("en");
        req.setLevel("intermediate");

        mockMvc.perform(post("/api/v1/ai/explain")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.concept").value("Virtual Memory Paging"))
                .andExpect(jsonPath("$.data.level").value("intermediate"))
                .andExpect(jsonPath("$.data.keyPoints").isArray())
                .andExpect(jsonPath("$.data.examples").isArray());
    }

    @Test
    public void testAiRecommendations() throws Exception {
        AiRecommendationRequest req = new AiRecommendationRequest();
        req.setCareerGoal("DevOps Cloud Engineer");
        req.setInterests(List.of("Linux", "Docker", "Kubernetes"));

        mockMvc.perform(post("/api/v1/ai/recommendations")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.careerGoal").value("DevOps Cloud Engineer"))
                .andExpect(jsonPath("$.data.nextSteps").isArray())
                .andExpect(jsonPath("$.data.recommendations").isArray());
    }

    @Test
    public void testGitHubIntegrationMetrics() throws Exception {
        mockMvc.perform(get("/api/v1/integrations/github/metrics/octocat")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("octocat"))
                .andExpect(jsonPath("$.data.qualityScore").isNumber())
                .andExpect(jsonPath("$.data.portfolioScore").isNumber());

        mockMvc.perform(get("/api/v1/integrations/github/repos/octocat")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    public void testStudentPortfolioFullLifecycle() throws Exception {
        String studentToken = getAuthToken("portfolio_student_" + System.currentTimeMillis() + "@shaivika.test", Role.STUDENT);

        // 1. Initial portfolio retrieval (auto-provisions draft if none exists)
        MvcResult myPortResult = mockMvc.perform(get("/api/v1/portfolio/my")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.customHandle").isNotEmpty())
                .andExpect(jsonPath("$.data.skills").isArray())
                .andReturn();

        JsonNode myPortNode = objectMapper.readTree(myPortResult.getResponse().getContentAsString());
        assertNotNull(myPortNode.path("data").path("customHandle").asText());

        // 2. Update student portfolio
        String newHandle = "shaivika-dev-" + System.currentTimeMillis() % 10000;
        PortfolioUpdateRequest updateReq = new PortfolioUpdateRequest();
        updateReq.setCustomHandle(newHandle);
        updateReq.setHeadline("Full Stack Cloud Architect");
        updateReq.setBio("Building scalable LMS platforms with Java 21, Spring Boot, and React.");
        updateReq.setSkills(List.of("Java", "Spring Boot", "React", "PostgreSQL", "Docker"));
        updateReq.setSocialLinks(Map.of("linkedin", "https://linkedin.com/in/shaivika"));
        updateReq.setAccentColor("#4f46e5");
        updateReq.setTemplate("cyberpunk_terminal");

        mockMvc.perform(put("/api/v1/portfolio/my")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.customHandle").value(newHandle))
                .andExpect(jsonPath("$.data.headline").value("Full Stack Cloud Architect"))
                .andExpect(jsonPath("$.data.template").value("cyberpunk_terminal"));

        // 3. Unauthenticated Public Portfolio Access
        mockMvc.perform(get("/api/v1/portfolio/public/" + newHandle)
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.customHandle").value(newHandle))
                .andExpect(jsonPath("$.data.headline").value("Full Stack Cloud Architect"))
                .andExpect(jsonPath("$.data.bio").isNotEmpty());

        // 4. Import GitHub Projects
        mockMvc.perform(post("/api/v1/portfolio/my/import-github?username=octocat")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.projects").isArray());
    }
}
