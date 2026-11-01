package com.shaivikagroups.lms.progress;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/progress")
@Tag(name = "Progress", description = "Student lesson progress tracking and checkpoint APIs")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/{courseId}")
    @Operation(summary = "Get student course progress, completed lessons and percentage")
    public ResponseEntity<ApiResponse<CourseProgressResponse>> getCourseProgress(
            @PathVariable String courseId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CourseProgressResponse response = progressService.getCourseProgress(courseId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Course progress retrieved", response));
    }

    @PostMapping("/{courseId}")
    @Operation(summary = "Mark lesson complete or update reading/video time checkpoint")
    public ResponseEntity<ApiResponse<CourseProgressResponse>> updateLessonProgress(
            @PathVariable String courseId,
            @Valid @RequestBody ProgressUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CourseProgressResponse response = progressService.updateLessonProgress(courseId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Learning progress updated successfully", response));
    }
}

