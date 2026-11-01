package com.shaivikagroups.lms.internship;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.internship.dto.CreateInternshipRequest;
import com.shaivikagroups.lms.internship.dto.SubmitApplicationRequest;
import com.shaivikagroups.lms.internship.dto.WithdrawApplicationRequest;
import com.shaivikagroups.lms.security.JwtTokenProvider;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.user.Role;
import com.shaivikagroups.lms.user.UserEntity;
import com.shaivikagroups.lms.user.UserRepository;
import com.shaivikagroups.lms.user.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class InternshipIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InternshipRepository internshipRepository;

    @Autowired
    private com.shaivikagroups.lms.tenant.TenantService tenantService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getAuthToken(String email, Role role) {
        UserEntity user = userRepository.findByEmail(email).orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setId("user-" + UUID.randomUUID().toString().substring(0, 8));
            u.setTenantId(TenantContext.DEFAULT_TENANT_ID);
            u.setEmail(email);
            u.setPasswordHash(passwordEncoder.encode("Password123!"));
            u.setFullName("Test User " + role);
            u.setRole(role);
            u.setStatus(UserStatus.ACTIVE);
            return userRepository.save(u);
        });
        return jwtTokenProvider.generateAccessToken(UserPrincipal.create(user));
    }

    @BeforeEach
    void setUp() {
        tenantService.resolveTenant(null);
        TenantContext.setTenantId(TenantContext.DEFAULT_TENANT_ID);
        if (internshipRepository.count() == 0) {
            InternshipEntity entity = new InternshipEntity();
            entity.setId("test-internship-01");
            entity.setTenantId(TenantContext.DEFAULT_TENANT_ID);
            entity.setTitle("Full Stack Web Development Virtual Internship");
            entity.setSlug("test-fullstack-internship");
            entity.setDomain("Full Stack Web Development");
            entity.setDepartment("Engineering");
            entity.setEmploymentType("INTERNSHIP");
            entity.setExperienceLevel("ENTRY_LEVEL");
            entity.setInternshipType("REMOTE");
            entity.setDuration("12 Weeks");
            entity.setLocation("Remote, India");
            entity.setOpenings(10);
            entity.setEligibility("B.Tech / MCA");
            entity.setRequiredSkills("React, TypeScript, Java");
            entity.setPreferredSkills("Docker, PostgreSQL");
            entity.setDescription("Hands-on full stack internship building production web features.");
            entity.setStatus("OPEN");
            entity.setIsFeatured(true);
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setUpdatedAt(OffsetDateTime.now());
            internshipRepository.save(entity);
        }
    }

    @Test
    void testPublicGetOpenInternships() throws Exception {
        mockMvc.perform(get("/api/v1/careers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void testSubmitApplicationReferenceNumberAndPreventDuplicates() throws Exception {
        InternshipEntity intern = internshipRepository.findAll().get(0);
        String candidateEmail = "intern.candidate." + System.currentTimeMillis() + "@gmail.com";

        SubmitApplicationRequest appReq = new SubmitApplicationRequest(
                intern.getId(),
                "Candidate Student",
                candidateEmail,
                "+91 9876543210",
                "IIT Hyderabad",
                "B.Tech",
                "Computer Science",
                "3rd Year",
                2026,
                "React, Node.js, Spring Boot",
                "https://storage.kaizenq.in/resumes/candidate.pdf",
                "https://github.com/candidate",
                "https://linkedin.com/in/candidate",
                "https://candidate.dev",
                "Passionate about scalable distributed systems and contributing to KaizenQ."
        );

        // 1. Submit application first time -> Expect 201 CREATED & reference number generated
        MvcResult result = mockMvc.perform(post("/api/v1/careers/apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.referenceNumber").isString())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        String appId = root.get("data").get("id").asText();
        assertNotNull(appId);

        // 2. Submit application second time with same email -> Expect 409 CONFLICT
        mockMvc.perform(post("/api/v1/careers/apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testAdminManagementAndCsvExport() throws Exception {
        String adminToken = getAuthToken("admin.internships@kaizenq.in", Role.SUPER_ADMIN);

        // 1. Admin gets all applications
        MvcResult res = mockMvc.perform(get("/api/v1/admin/careers/applications")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        JsonNode root = objectMapper.readTree(res.getResponse().getContentAsString());
        assertNotNull(root.get("data").get("content"));

        // 2. Export applications to CSV
        mockMvc.perform(get("/api/v1/admin/careers/applications/export")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", org.hamcrest.Matchers.containsString("text/csv")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Reference Number,Candidate Name,Email")));

        // 3. Create new career opening via Admin
        CreateInternshipRequest createReq = new CreateInternshipRequest(
                "AI/ML Research Internship",
                "ai-ml-research-" + System.currentTimeMillis(),
                "Artificial Intelligence & Machine Learning",
                "AI & Machine Learning",
                "INTERNSHIP",
                "ENTRY_LEVEL",
                "REMOTE",
                "8 Weeks",
                "Remote",
                5,
                null,
                "PERFORMANCE_BASED",
                "Performance Stipend",
                "CS/IT Students",
                "Python, PyTorch",
                "LLM Fine-tuning",
                "Conduct real LLM evaluations and fine-tuning.",
                "Build RAG systems",
                "Research publication",
                "Dr. AI",
                "Head of AI",
                "OPEN",
                true
        );

        mockMvc.perform(post("/api/v1/admin/careers/openings")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("AI/ML Research Internship"));
    }
}
