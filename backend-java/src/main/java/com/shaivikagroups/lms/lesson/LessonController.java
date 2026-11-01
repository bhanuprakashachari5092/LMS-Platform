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

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Lessons & Modules", description = "Lesson and module CRUD operations")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @PutMapping("/modules/{moduleId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Update module details")
    public ResponseEntity<ApiResponse<ModuleResponse>> updateModule(
            @PathVariable String moduleId,
            @Valid @RequestBody ModuleRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ModuleResponse module = lessonService.updateModule(moduleId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Module updated successfully", module));
    }

    @DeleteMapping("/modules/{moduleId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Delete module and its child lessons")
    public ResponseEntity<ApiResponse<Void>> deleteModule(
            @PathVariable String moduleId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        lessonService.deleteModule(moduleId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Module deleted successfully"));
    }

    @PostMapping("/modules/{moduleId}/lessons")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Create lesson in a module")
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(
            @PathVariable String moduleId,
            @Valid @RequestBody LessonRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        LessonResponse lesson = lessonService.createLesson(moduleId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lesson created successfully", lesson));
    }

    @GetMapping("/lessons/{lessonId}")
    @Operation(summary = "Get lesson content, blocks, and resources")
    public ResponseEntity<ApiResponse<LessonResponse>> getLesson(
            @PathVariable String lessonId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        LessonResponse lesson = lessonService.getLessonById(lessonId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lesson retrieved", lesson));
    }

    @PutMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Update lesson content and blocks")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(
            @PathVariable String lessonId,
            @Valid @RequestBody LessonRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        LessonResponse lesson = lessonService.updateLesson(lessonId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lesson updated successfully", lesson));
    }

    @DeleteMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Delete lesson")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(
            @PathVariable String lessonId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        lessonService.deleteLesson(lessonId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lesson deleted successfully"));
    }
}

