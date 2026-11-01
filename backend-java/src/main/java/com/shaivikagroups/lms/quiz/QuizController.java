package com.shaivikagroups.lms.quiz;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.user.Role;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isStaff = principal != null && (principal.getRole() == Role.LECTURER ||
                principal.getRole() == Role.ORGANIZATION_ADMIN ||
                principal.getRole() == Role.SUPER_ADMIN);
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizById(id, isStaff)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getQuizzesByCourse(
            @PathVariable String courseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isStaff = principal != null && (principal.getRole() == Role.LECTURER ||
                principal.getRole() == Role.ORGANIZATION_ADMIN ||
                principal.getRole() == Role.SUPER_ADMIN);
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizzesByCourse(courseId, isStaff)));
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizByLesson(
            @PathVariable String lessonId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isStaff = principal != null && (principal.getRole() == Role.LECTURER ||
                principal.getRole() == Role.ORGANIZATION_ADMIN ||
                principal.getRole() == Role.SUPER_ADMIN);
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizByLesson(lessonId, isStaff)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @Valid @RequestBody QuizRequest request) {
        QuizResponse response = quizService.saveQuiz(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(
            @PathVariable String id,
            @Valid @RequestBody QuizRequest request) {
        QuizResponse response = quizService.saveQuiz(request, id);
        return ResponseEntity.ok(ApiResponse.success("Quiz updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable String id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz deleted successfully"));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<QuizStartResponse>> startAttempt(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        QuizStartResponse response = quizService.startAttempt(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Quiz attempt started", response));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<QuizAttemptResponse>> submitAttempt(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody QuizSubmitRequest request) {
        QuizAttemptResponse response = quizService.submitAttempt(id, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Quiz submitted successfully", response));
    }

    @GetMapping("/{id}/attempts")
    public ResponseEntity<ApiResponse<List<QuizAttemptResponse>>> getAttemptHistory(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getAttemptHistory(id, principal.getId())));
    }

    @GetMapping("/{id}/analytics")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<QuizAnalyticsResponse>> getQuizAnalytics(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizAnalytics(id)));
    }
}

