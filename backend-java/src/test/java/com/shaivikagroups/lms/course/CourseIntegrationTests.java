package com.shaivikagroups.lms.course;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.auth.RegisterRequest;
import com.shaivikagroups.lms.enrollment.EnrollmentRequest;
import com.shaivikagroups.lms.lesson.LessonReorderRequest;
import com.shaivikagroups.lms.lesson.LessonRequest;
import com.shaivikagroups.lms.lesson.ModuleRequest;
import com.shaivikagroups.lms.progress.ProgressUpdateRequest;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.tenant.TenantEntity;
import com.shaivikagroups.lms.tenant.TenantRepository;
import com.shaivikagroups.lms.tenant.TenantService;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CourseIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantService tenantService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        tenantService.resolveTenant(null);
    }

    private String getAuthTokenForUser(String email, Role role, String tenantId) throws Exception {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Test User " + role);
        registerReq.setEmail(email);
        registerReq.setPassword("SecurePass123!");

        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                        .header("X-Tenant-ID", tenantId)
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

            // Re-login to get updated JWT claims with elevated role
            com.shaivikagroups.lms.auth.LoginRequest loginReq = new com.shaivikagroups.lms.auth.LoginRequest();
            loginReq.setEmail(email);
            loginReq.setPassword("SecurePass123!");

            MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                            .header("X-Tenant-ID", tenantId)
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
    void testBrowsePublishedCoursesPublic() throws Exception {
        mockMvc.perform(get("/api/v1/courses")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.page.totalElements").isNumber());
    }

    @Test
    void testGetCourseBySlug() throws Exception {
        mockMvc.perform(get("/api/v1/courses/linux-systems-administration-mastery"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("linux-systems-administration-mastery"))
                .andExpect(jsonPath("$.data.title").value("Linux Systems & Administration Mastery"))
                .andExpect(jsonPath("$.data.totalModules").isNumber())
                .andExpect(jsonPath("$.data.totalLessons").isNumber());
    }

    @Test
    void testGetCourseModulesOutline() throws Exception {
        mockMvc.perform(get("/api/v1/courses/course_linux_101/modules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].lessons").isArray());
    }

    @Test
    void testCreateCourseAndModuleAsLecturer() throws Exception {
        String email = "lecturer." + System.currentTimeMillis() + "@example.com";
        String token = getAuthTokenForUser(email, Role.LECTURER, TenantContext.DEFAULT_TENANT_ID);

        // 1. Create Course
        CourseRequest courseReq = new CourseRequest();
        courseReq.setTitle("Modern Java Microservices with Spring Boot");
        courseReq.setSlug("java-microservices-spring-boot");
        courseReq.setCategory("Backend Development");
        courseReq.setLevel("advanced");
        courseReq.setDescription("Master reactive microservices and event-driven architectures.");
        courseReq.setPriceInr(BigDecimal.valueOf(999.00));
        courseReq.setIsFree(false);

        MvcResult courseResult = mockMvc.perform(post("/api/v1/courses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(courseReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.slug").value("java-microservices-spring-boot"))
                .andReturn();

        JsonNode courseJson = objectMapper.readTree(courseResult.getResponse().getContentAsString());
        String courseId = courseJson.get("data").get("id").asText();

        // 2. Create Module
        ModuleRequest modReq = new ModuleRequest();
        modReq.setTitle("Module 1: Domain-Driven Design & Hexagonal Architecture");
        modReq.setDescription("Structuring production microservices clean architectures.");
        modReq.setDurationMinutes(120);

        MvcResult modResult = mockMvc.perform(post("/api/v1/courses/" + courseId + "/modules")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(modReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value(modReq.getTitle()))
                .andReturn();

        JsonNode modJson = objectMapper.readTree(modResult.getResponse().getContentAsString());
        String moduleId = modJson.get("data").get("id").asText();

        // 3. Create Lesson in Module
        LessonRequest lessonReq = new LessonRequest();
        lessonReq.setTitle("1.1 Aggregate Roots and Entities");
        lessonReq.setType("reading");
        lessonReq.setDurationMinutes(30);
        lessonReq.setFreePreview(true);
        lessonReq.setContent("# Aggregate Roots\n\nAggregates encapsulate domain invariants...");

        mockMvc.perform(post("/api/v1/modules/" + moduleId + "/lessons")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lessonReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value(lessonReq.getTitle()));
    }

    @Test
    void testStudentEnrollmentAndProgressTracking() throws Exception {
        String studentEmail = "student.progress." + System.currentTimeMillis() + "@example.com";
        String token = getAuthTokenForUser(studentEmail, Role.STUDENT, TenantContext.DEFAULT_TENANT_ID);

        // 1. Enroll in course_linux_101
        EnrollmentRequest enrollReq = new EnrollmentRequest("course_linux_101");
        mockMvc.perform(post("/api/v1/enrollments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(enrollReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.courseId").value("course_linux_101"))
                .andExpect(jsonPath("$.data.progressPercentage").value(0));

        // 2. Verify enrolled courses list
        mockMvc.perform(get("/api/v1/enrollments/my")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].courseId").value("course_linux_101"));

        // 3. Update lesson progress
        ProgressUpdateRequest progressReq = new ProgressUpdateRequest("les_linux_1_1", "COMPLETED", 120);
        mockMvc.perform(post("/api/v1/progress/course_linux_101")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(progressReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedLessonsCount").value(1))
                .andExpect(jsonPath("$.data.completedLessonIds[0]").value("les_linux_1_1"));

        // 4. Verify progress fetch
        mockMvc.perform(get("/api/v1/progress/course_linux_101")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedLessonIds[0]").value("les_linux_1_1"));
    }

    @Test
    void testBatchReorderLessons() throws Exception {
        String adminEmail = "admin.reorder." + System.currentTimeMillis() + "@example.com";
        String token = getAuthTokenForUser(adminEmail, Role.ORGANIZATION_ADMIN, TenantContext.DEFAULT_TENANT_ID);

        LessonReorderRequest reorderReq = new LessonReorderRequest(List.of(
                new LessonReorderRequest.ReorderItem("les_linux_1_2", "mod_linux_1", 1),
                new LessonReorderRequest.ReorderItem("les_linux_1_1", "mod_linux_1", 2)
        ));

        mockMvc.perform(post("/api/v1/courses/course_linux_101/modules/lessons/reorder")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testTenantIsolationOnCourses() throws Exception {
        // Create Tenant B
        String tenantBId = "tenant-org-b-" + UUID.randomUUID().toString().substring(0, 6);
        TenantEntity tenantB = new TenantEntity();
        tenantB.setId(tenantBId);
        tenantB.setName("Organization B");
        tenantB.setSlug("org-b-" + UUID.randomUUID().toString().substring(0, 6));
        tenantB.setDomain("orgb-" + UUID.randomUUID().toString().substring(0, 6) + ".kaizenq.in");
        tenantRepository.save(tenantB);

        // Course in Tenant B
        String adminBToken = getAuthTokenForUser("admin.b." + System.currentTimeMillis() + "@example.com",
                Role.ORGANIZATION_ADMIN, tenantBId);

        CourseRequest courseBReq = new CourseRequest();
        courseBReq.setTitle("Confidential Internal Training Org B");
        courseBReq.setSlug("confidential-org-b");
        courseBReq.setCategory("Internal");

        mockMvc.perform(post("/api/v1/courses")
                        .header("X-Tenant-ID", tenantBId)
                        .header("Authorization", "Bearer " + adminBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(courseBReq)))
                .andExpect(status().isCreated());

        // Organization A (default tenant) cannot see Org B's private course
        mockMvc.perform(get("/api/v1/courses/confidential-org-b")
                        .header("X-Tenant-ID", TenantContext.DEFAULT_TENANT_ID))
                .andExpect(status().isNotFound());
    }
}
