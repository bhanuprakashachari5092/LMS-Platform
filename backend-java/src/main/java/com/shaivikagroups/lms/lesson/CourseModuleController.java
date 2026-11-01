package com.shaivikagroups.lms.lesson;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/modules")
@Tag(name = "Course Modules", description = "Course modules management and outline APIs")
public class CourseModuleController {

    private final LessonService lessonService;

    public CourseModuleController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping
    @Operation(summary = "Get course module outline with lessons")
    public ResponseEntity<ApiResponse<List<ModuleResponse>>> getModules(@PathVariable String courseId) {
        List<ModuleResponse> modules = lessonService.getModulesByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course modules retrieved", modules));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Create module under a course")
    public ResponseEntity<ApiResponse<ModuleResponse>> createModule(
            @PathVariable String courseId,
            @Valid @RequestBody ModuleRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ModuleResponse module = lessonService.createModule(courseId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Module created successfully", module));
    }

    @PostMapping("/lessons/reorder")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Batch reorder lessons across modules in a course")
    public ResponseEntity<ApiResponse<Void>> reorderLessons(
            @PathVariable String courseId,
            @Valid @RequestBody LessonReorderRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        lessonService.reorderLessons(courseId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lessons reordered successfully"));
    }
}

