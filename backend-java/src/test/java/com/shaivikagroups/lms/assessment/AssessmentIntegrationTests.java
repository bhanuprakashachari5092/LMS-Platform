package com.shaivikagroups.lms.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.assignment.AssignmentRequest;
import com.shaivikagroups.lms.assignment.GradeSubmissionRequest;
import com.shaivikagroups.lms.assignment.SubmissionRequest;
import com.shaivikagroups.lms.auth.LoginRequest;
import com.shaivikagroups.lms.auth.RegisterRequest;
import com.shaivikagroups.lms.certificate.CertificateRequest;
import com.shaivikagroups.lms.enrollment.EnrollmentRequest;
import com.shaivikagroups.lms.quiz.QuizOptionDTO;
import com.shaivikagroups.lms.quiz.QuizQuestionDTO;
import com.shaivikagroups.lms.quiz.QuizRequest;
import com.shaivikagroups.lms.quiz.QuizSubmitRequest;
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

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AssessmentIntegrationTests {

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
    void testQuizCreationAndStudentAutoGrading() throws Exception {
        String lecturerToken = getAuthToken("lecturer.quiz." + System.currentTimeMillis() + "@example.com", Role.LECTURER);
        String studentToken = getAuthToken("student.quiz." + System.currentTimeMillis() + "@example.com", Role.STUDENT);

        // 1. Lecturer creates a quiz
        QuizRequest quizReq = new QuizRequest();
        quizReq.setCourseId("course_linux_101");
        quizReq.setLessonId("les_linux_1_1");
        quizReq.setTitle("Linux Architecture & Syscall Quiz");
        quizReq.setDescription("Assess your understanding of the Linux kernel vs user space.");
        quizReq.setTimeLimitMinutes(15);
        quizReq.setPassingScore(70);
        quizReq.setMaxAttempts(2);

        QuizQuestionDTO q1 = new QuizQuestionDTO();
        q1.setOrderIndex(1);
        q1.setQuestionText("Which layer interacts directly with hardware in a Linux system?");
        q1.setQuestionType("MULTIPLE_CHOICE");
        q1.setPoints(5);
        q1.setExplanation("The Kernel interacts directly with hardware components.");
        q1.setOptions(List.of(
                new QuizOptionDTO(null, 1, "Shell", false),
                new QuizOptionDTO(null, 2, "Kernel", true),
                new QuizOptionDTO(null, 3, "User Application", false),
                new QuizOptionDTO(null, 4, "GUI Desktop", false)
        ));

        QuizQuestionDTO q2 = new QuizQuestionDTO();
        q2.setOrderIndex(2);
        q2.setQuestionText("Syscalls transition CPU execution from User mode to Kernel mode.");
        q2.setQuestionType("TRUE_FALSE");
        q2.setPoints(5);
        q2.setExplanation("True, system calls trigger a switch to ring 0 kernel mode.");
        q2.setOptions(List.of(
                new QuizOptionDTO(null, 1, "True", true),
                new QuizOptionDTO(null, 2, "False", false)
        ));

        quizReq.setQuestions(List.of(q1, q2));

        MvcResult createResult = mockMvc.perform(post("/api/v1/quizzes")
                        .header("Authorization", "Bearer " + lecturerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(quizReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Linux Architecture & Syscall Quiz"))
                .andExpect(jsonPath("$.data.totalQuestions").value(2))
                .andExpect(jsonPath("$.data.totalPoints").value(10))
                .andReturn();

        JsonNode quizJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        String quizId = quizJson.get("data").get("id").asText();
        String q1Id = quizJson.get("data").get("questions").get(0).get("id").asText();
        String q2Id = quizJson.get("data").get("questions").get(1).get("id").asText();

        // Find the correct option id for Q1 and Q2 from the lecturer response
        String q1CorrectOptId = null;
        for (JsonNode opt : quizJson.get("data").get("questions").get(0).get("options")) {
            if (opt.get("isCorrect").asBoolean()) {
                q1CorrectOptId = opt.get("id").asText();
                break;
            }
        }
        String q2CorrectOptId = null;
        for (JsonNode opt : quizJson.get("data").get("questions").get(1).get("options")) {
            if (opt.get("isCorrect").asBoolean()) {
                q2CorrectOptId = opt.get("id").asText();
                break;
            }
        }

        // 2. Student enrolls in the course
        EnrollmentRequest enrollReq = new EnrollmentRequest("course_linux_101");
        mockMvc.perform(post("/api/v1/enrollments")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(enrollReq)))
                .andExpect(status().isCreated());

        // 3. Student starts quiz attempt (verifies student response masks isCorrect flags)
        MvcResult startResult = mockMvc.perform(post("/api/v1/quizzes/" + quizId + "/start")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.timeLimitSec").value(900))
                .andExpect(jsonPath("$.data.quiz.questions[0].options[0].isCorrect").doesNotExist())
                .andReturn();

        JsonNode startJson = objectMapper.readTree(startResult.getResponse().getContentAsString());
        String attemptId = startJson.get("data").get("attemptId").asText();

        // 3. Student submits correct answers
        Map<String, Object> answers = new HashMap<>();
        answers.put(q1Id, q1CorrectOptId);
        answers.put(q2Id, q2CorrectOptId);

        QuizSubmitRequest submitReq = new QuizSubmitRequest(attemptId, 180, answers);

        mockMvc.perform(post("/api/v1/quizzes/" + quizId + "/submit")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.score").value(10))
                .andExpect(jsonPath("$.data.totalPoints").value(10))
                .andExpect(jsonPath("$.data.percentage").value(100))
                .andExpect(jsonPath("$.data.passed").value(true))
                .andExpect(jsonPath("$.data.attemptNumber").value(1));

        // 4. Verify attempt history
        mockMvc.perform(get("/api/v1/quizzes/" + quizId + "/attempts")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].score").value(10));
    }

    @Test
    void testAssignmentSubmissionAndGrading() throws Exception {
        String lecturerToken = getAuthToken("lecturer.asg." + System.currentTimeMillis() + "@example.com", Role.LECTURER);
        String studentToken = getAuthToken("student.asg." + System.currentTimeMillis() + "@example.com", Role.STUDENT);

        // 1. Lecturer creates an assignment
        AssignmentRequest asgReq = new AssignmentRequest();
        asgReq.setCourseId("course_linux_101");
        asgReq.setTitle("1.3 Practical Core Assignment: concentric Linux layers");
        asgReq.setInstructions("Build a layered diagram illustrating user space, glibc, system calls, and kernel space.");
        asgReq.setMaxScore(100);

        MvcResult asgResult = mockMvc.perform(post("/api/v1/assignments")
                        .header("Authorization", "Bearer " + lecturerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(asgReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value(asgReq.getTitle()))
                .andReturn();

        JsonNode asgJson = objectMapper.readTree(asgResult.getResponse().getContentAsString());
        String assignmentId = asgJson.get("data").get("id").asText();

        // 2. Student submits assignment
        SubmissionRequest subReq = new SubmissionRequest(
                "https://github.com/shaivika-student/linux-concentric-layers.git",
                "Completed the diagram and verified against Linux 6.x kernel sources."
        );

        MvcResult subResult = mockMvc.perform(post("/api/v1/assignments/" + assignmentId + "/submit")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(subReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.submissionUrl").value(subReq.getSubmissionUrl()))
                .andReturn();

        JsonNode subJson = objectMapper.readTree(subResult.getResponse().getContentAsString());
        String submissionId = subJson.get("data").get("id").asText();

        // 3. Lecturer grades the submission
        GradeSubmissionRequest gradeReq = new GradeSubmissionRequest(95, "Outstanding architectural breakdown!", "GRADED");

        mockMvc.perform(post("/api/v1/assignments/submissions/" + submissionId + "/grade")
                        .header("Authorization", "Bearer " + lecturerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(gradeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.score").value(95))
                .andExpect(jsonPath("$.data.status").value("GRADED"))
                .andExpect(jsonPath("$.data.feedback").value("Outstanding architectural breakdown!"));

        // 4. Student views their graded submission
        mockMvc.perform(get("/api/v1/assignments/" + assignmentId + "/my-submission")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.score").value(95))
                .andExpect(jsonPath("$.data.status").value("GRADED"));
    }

    @Test
    void testCertificateGenerationAndPublicVerification() throws Exception {
        String studentEmail = "student.cert." + System.currentTimeMillis() + "@example.com";
        String studentToken = getAuthToken(studentEmail, Role.STUDENT);

        // 1. Enroll student in course_linux_101
        EnrollmentRequest enrollReq = new EnrollmentRequest("course_linux_101");
        mockMvc.perform(post("/api/v1/enrollments")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(enrollReq)))
                .andExpect(status().isCreated());

        // 2. Student requests certificate generation
        CertificateRequest certReq = new CertificateRequest();
        certReq.setCourseId("course_linux_101");
        certReq.setStudentName("Banu Prakash");

        MvcResult certResult = mockMvc.perform(post("/api/v1/certificates/generate")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(certReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.certificate.studentName").value("Banu Prakash"))
                .andExpect(jsonPath("$.data.certificate.courseTitle").value("Linux Systems & Administration Mastery"))
                .andExpect(jsonPath("$.data.certificate.certificateNumber").isString())
                .andExpect(jsonPath("$.data.job.status").value("completed"))
                .andReturn();

        JsonNode certJson = objectMapper.readTree(certResult.getResponse().getContentAsString());
        String certNumber = certJson.get("data").get("certificate").get("certificateNumber").asText();
        assertNotNull(certNumber);
        assertTrue(certNumber.startsWith("KQ-"));

        // 3. Public Verification WITHOUT Authentication Header
        mockMvc.perform(get("/api/v1/certificates/verify/" + certNumber))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.authentic").value(true))
                .andExpect(jsonPath("$.data.verificationId").value(certNumber))
                .andExpect(jsonPath("$.data.studentName").value("Banu Prakash"))
                .andExpect(jsonPath("$.data.courseTitle").value("Linux Systems & Administration Mastery"))
                .andExpect(jsonPath("$.data.status").value("VALID"));

        // 4. Verify invalid certificate returns authentic = false
        mockMvc.perform(get("/api/v1/certificates/verify/KQ-INVALID-CODE-999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.authentic").value(false));
    }
}

