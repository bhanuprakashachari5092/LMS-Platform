package com.shaivikagroups.lms.course;

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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses")
@Tag(name = "Courses", description = "Course catalog and management APIs")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    @Operation(summary = "Browse published courses with category/level filters and search")
    public ResponseEntity<ApiResponse<Page<CourseSummaryResponse>>> getCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(Math.max(0, page), Math.min(size, 100), sort);

        Page<CourseSummaryResponse> courses = courseService.getPublishedCourses(category, level, search, pageRequest);
        return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", courses));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Get all courses (including draft, review, archived) for administration")
    public ResponseEntity<ApiResponse<Page<CourseSummaryResponse>>> getAllCoursesForAdmin(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(Math.max(0, page), Math.min(size, 100), sort);

        Page<CourseSummaryResponse> courses = courseService.getAllCoursesForAdmin(category, level, status, search, pageRequest);
        return ResponseEntity.ok(ApiResponse.success("Admin courses retrieved successfully", courses));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get full course details by slug or id")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourse(@PathVariable String slug) {
        CourseResponse course = courseService.getCourseBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Course details retrieved", course));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Create a new course")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CourseResponse course = courseService.createCourse(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Course created successfully", course));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Update an existing course")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable String id,
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CourseResponse course = courseService.updateCourse(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", course));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Publish a course")
    public ResponseEntity<ApiResponse<CourseResponse>> publishCourse(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CourseResponse course = courseService.publishCourse(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Course published successfully", course));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Delete course and its modules/lessons")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        courseService.deleteCourse(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully"));
    }
}

