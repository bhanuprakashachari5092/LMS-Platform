package com.shaivikagroups.lms.practice;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.auth.LoginRequest;
import com.shaivikagroups.lms.auth.RegisterRequest;
import com.shaivikagroups.lms.practice.dto.CreateProblemRequest;
import com.shaivikagroups.lms.practice.dto.PracticeTestCaseDTO;
import com.shaivikagroups.lms.practice.dto.RunCodeRequest;
import com.shaivikagroups.lms.practice.dto.SaveDraftRequest;
import com.shaivikagroups.lms.practice.dto.SubmitCodeRequest;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.user.Role;
import com.shaivikagroups.lms.user.UserEntity;
import com.shaivikagroups.lms.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PracticeIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PracticeProblemRepository problemRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getAuthToken(String email, Role role) throws Exception {
        Optional<UserEntity> existing = userRepository.findByEmail(email);
        if (existing.isEmpty()) {
            RegisterRequest registerReq = new RegisterRequest();
            registerReq.setFullName("User " + role);
            registerReq.setEmail(email);
            registerReq.setPassword("Password123!");

            mockMvc.perform(post("/api/v1/auth/register")
                            .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerReq)))
                    .andExpect(status().isCreated());

            if (role != Role.STUDENT) {
                UserEntity u = userRepository.findByEmail(email).orElseThrow();
                u.setRole(role);
                userRepository.save(u);
            }
        }

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(email);
        loginReq.setPassword("Password123!");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return root.path("data").path("accessToken").asText();
    }

    @Test
    void testGetSupportedLanguages() throws Exception {
        mockMvc.perform(get("/api/v1/practice/languages")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[?(@.id == 'python')]").exists())
                .andExpect(jsonPath("$.data[?(@.id == 'javascript')]").exists())
                .andExpect(jsonPath("$.data[?(@.id == 'java')]").exists())
                .andExpect(jsonPath("$.data[?(@.id == 'cpp')]").exists())
                .andExpect(jsonPath("$.data[?(@.id == 'sql')]").exists());
    }

    @Test
    void testGetProblemsList() throws Exception {
        mockMvc.perform(get("/api/v1/practice/problems")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].slug").exists());
    }

    @Test
    void testGetProblemDetail_ProtectsHiddenTestCasesForStudents() throws Exception {
        String studentToken = getAuthToken("student.practice@test.com", Role.STUDENT);

        MvcResult res = mockMvc.perform(get("/api/v1/practice/problems/two-sum")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Two Sum"))
                .andExpect(jsonPath("$.data.templates.python").exists())
                .andExpect(jsonPath("$.data.sampleTestCases").isArray())
                .andReturn();

        JsonNode root = objectMapper.readTree(res.getResponse().getContentAsString());
        JsonNode sampleCases = root.path("data").path("sampleTestCases");
        int hiddenCount = root.path("data").path("hiddenTestCaseCount").asInt();

        assertTrue(hiddenCount > 0, "Should have hidden test cases");
        // Verify all returned test cases have isHidden == false
        for (JsonNode tc : sampleCases) {
            assertFalse(tc.path("hidden").asBoolean(), "Hidden test case must not be exposed in sample test cases");
        }
    }

    @Test
    void testRunCode_WithSampleInput() throws Exception {
        String studentToken = getAuthToken("runner.student@test.com", Role.STUDENT);

        RunCodeRequest req = new RunCodeRequest(
                "two-sum",
                "python",
                "class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]\n",
                "2,7,11,15\n9"
        );

        mockMvc.perform(post("/api/v1/practice/run")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.data.stdout").value("[0, 1]"))
                .andExpect(jsonPath("$.data.samplePassed").value(true));
    }

    @Test
    void testSubmitCode_EvaluatesTestCasesAndHidesSecretInputs() throws Exception {
        String studentToken = getAuthToken("submitter.student@test.com", Role.STUDENT);

        SubmitCodeRequest req = new SubmitCodeRequest(
                "two-sum",
                "python",
                "class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]\n"
        );

        MvcResult result = mockMvc.perform(post("/api/v1/practice/submit")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.problemTitle").value("Two Sum"))
                .andExpect(jsonPath("$.data.totalCount").value(3))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode results = root.path("data").path("results");

        boolean foundHidden = false;
        for (JsonNode r : results) {
            if (r.path("hidden").asBoolean()) {
                foundHidden = true;
                assertEquals("[Hidden Test Case]", r.path("actualOutput").asText());
                assertEquals("[Hidden Test Case]", r.path("inputData").asText());
                assertEquals("[Hidden Test Case]", r.path("expectedOutput").asText());
            }
        }
        assertTrue(foundHidden, "Hidden test case result must be present but with masked data");
    }

    @Test
    void testDraftAutosaveAndRetrieval() throws Exception {
        String studentToken = getAuthToken("draft.student@test.com", Role.STUDENT);

        SaveDraftRequest draftReq = new SaveDraftRequest("python", "print('draft autosave test')");

        mockMvc.perform(put("/api/v1/practice/drafts/two-sum")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(draftReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("print('draft autosave test')"));

        mockMvc.perform(get("/api/v1/practice/drafts/two-sum?language=python")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("print('draft autosave test')"));
    }

    @Test
    void testAdminCreateProblem() throws Exception {
        String adminToken = getAuthToken("admin.practice@test.com", Role.SUPER_ADMIN);

        CreateProblemRequest req = new CreateProblemRequest();
        req.setTitle("Binary Search Test");
        req.setDescription("Given an array of integers nums which is sorted in ascending order, write a function to search target.");
        req.setDifficulty("EASY");
        req.setCategory("Algorithms");

        PracticeTestCaseDTO tc1 = new PracticeTestCaseDTO();
        tc1.setInputData("-1,0,3,5,9,12\n9");
        tc1.setExpectedOutput("4");
        tc1.setHidden(false);

        PracticeTestCaseDTO tc2 = new PracticeTestCaseDTO();
        tc2.setInputData("-1,0,3,5,9,12\n2");
        tc2.setExpectedOutput("-1");
        tc2.setHidden(true);

        req.setTestCases(List.of(tc1, tc2));

        mockMvc.perform(post("/api/v1/practice/admin/problems")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Binary Search Test"));
    }
}
