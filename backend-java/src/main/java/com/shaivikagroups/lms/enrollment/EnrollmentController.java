package com.shaivikagroups.lms.enrollment;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/enrollments")
@Tag(name = "Enrollments", description = "Course enrollment and my courses APIs")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    @Operation(summary = "Enroll current student in a course")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(
            @Valid @RequestBody EnrollmentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        EnrollmentResponse response = enrollmentService.enrollInCourse(request.getCourseId(), currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Successfully enrolled in course", response));
    }

    @GetMapping("/my")
    @Operation(summary = "Get enrolled courses for current authenticated student")
    public ResponseEntity<ApiResponse<Page<EnrollmentResponse>>> getMyEnrollments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "lastAccessedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(Math.max(0, page), Math.min(size, 100), sort);

        Page<EnrollmentResponse> enrollments = enrollmentService.getMyEnrollments(currentUser, pageRequest);
        return ResponseEntity.ok(ApiResponse.success("Enrolled courses retrieved", enrollments));
    }

    @GetMapping("/check/{courseId}")
    @Operation(summary = "Check if current student is enrolled in a course")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkEnrollment(
            @PathVariable String courseId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean enrolled = currentUser != null && enrollmentService.isEnrolled(courseId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Enrollment status checked", Map.of(
                "courseId", courseId,
                "isEnrolled", enrolled
        )));
    }
}

