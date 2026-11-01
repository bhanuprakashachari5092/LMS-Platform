package com.shaivikagroups.lms.course;

import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ConflictException;
import com.shaivikagroups.lms.common.ForbiddenException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.lesson.LessonRepository;
import com.shaivikagroups.lms.lesson.ModuleRepository;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.user.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;

    public CourseService(
            CourseRepository courseRepository,
            ModuleRepository moduleRepository,
            LessonRepository lessonRepository) {
        this.courseRepository = courseRepository;
        this.moduleRepository = moduleRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional(readOnly = true)
    public Page<CourseSummaryResponse> getPublishedCourses(
            String category, String level, String search, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        CourseLevel courseLevel = level != null && !level.isBlank() ? CourseLevel.fromString(level) : null;

        return courseRepository.searchCourses(
                tenantId,
                CourseStatus.PUBLISHED,
                category != null && !category.isBlank() ? category : null,
                courseLevel,
                search != null && !search.isBlank() ? search : null,
                pageable
        ).map(CourseSummaryResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<CourseSummaryResponse> getAllCoursesForAdmin(
            String category, String level, String status, String search, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        CourseStatus courseStatus = status != null && !status.isBlank() ? CourseStatus.fromString(status) : null;
        CourseLevel courseLevel = level != null && !level.isBlank() ? CourseLevel.fromString(level) : null;

        return courseRepository.searchCourses(
                tenantId,
                courseStatus,
                category != null && !category.isBlank() ? category : null,
                courseLevel,
                search != null && !search.isBlank() ? search : null,
                pageable
        ).map(CourseSummaryResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseBySlug(String slug) {
        String tenantId = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndSlug(tenantId, slug)
                .or(() -> courseRepository.findByTenantIdAndId(tenantId, slug))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "slug", slug));

        int totalModules = moduleRepository.countByCourseId(course.getId());
        int totalLessons = lessonRepository.countByCourseId(course.getId());

        return CourseResponse.fromEntity(course, totalModules, totalLessons);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(String id) {
        String tenantId = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        int totalModules = moduleRepository.countByCourseId(course.getId());
        int totalLessons = lessonRepository.countByCourseId(course.getId());

        return CourseResponse.fromEntity(course, totalModules, totalLessons);
    }

    public CourseResponse createCourse(CourseRequest request, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to create course");
        }
        String tenantId = TenantContext.getTenantId();

        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = generateSlug(request.getTitle());
        } else {
            slug = slug.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]", "-");
        }

        if (courseRepository.existsByTenantIdAndSlug(tenantId, slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        CourseEntity course = new CourseEntity();
        course.setId("crs_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        course.setTenantId(tenantId);
        course.setAuthorId(currentUser.getId());
        course.setSlug(slug);
        course.setTitle(request.getTitle().trim());
        course.setSubtitle(request.getSubtitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory() != null ? request.getCategory() : "Computer Science");
        course.setLevel(request.getLevel() != null ? CourseLevel.fromString(request.getLevel()) : CourseLevel.ALL_LEVELS);
        course.setVisibility(request.getVisibility() != null ? request.getVisibility() : "public");
        course.setStatus(request.getStatus() != null ? CourseStatus.fromString(request.getStatus()) : CourseStatus.PUBLISHED);
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setBannerUrl(request.getBannerUrl());
        course.setPriceInr(request.getPriceInr() != null ? request.getPriceInr() : BigDecimal.ZERO);
        course.setDiscountPriceInr(request.getDiscountPriceInr() != null ? request.getDiscountPriceInr() : BigDecimal.ZERO);
        course.setFree(Boolean.TRUE.equals(request.getIsFree()) || (course.getPriceInr().compareTo(BigDecimal.ZERO) == 0));
        course.setEstimatedDurationHours(request.getEstimatedDurationHours() != null ? request.getEstimatedDurationHours() : BigDecimal.valueOf(10.0));
        course.setCertificateEnabled(request.getCertificateEnabled() == null || request.getCertificateEnabled());
        course.setSyllabusMeta(request.getSyllabusMeta() != null ? request.getSyllabusMeta() : "[]");

        CourseEntity saved = courseRepository.save(course);
        return CourseResponse.fromEntity(saved, 0, 0);
    }

    public CourseResponse updateCourse(String id, CourseRequest request, UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, id)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, id))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        verifyCourseEditPermission(course, currentUser);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            course.setTitle(request.getTitle().trim());
        }
        if (request.getSubtitle() != null) {
            course.setSubtitle(request.getSubtitle());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            course.setCategory(request.getCategory());
        }
        if (request.getLevel() != null) {
            course.setLevel(CourseLevel.fromString(request.getLevel()));
        }
        if (request.getVisibility() != null) {
            course.setVisibility(request.getVisibility());
        }
        if (request.getStatus() != null) {
            course.setStatus(CourseStatus.fromString(request.getStatus()));
        }
        if (request.getThumbnailUrl() != null) {
            course.setThumbnailUrl(request.getThumbnailUrl());
        }
        if (request.getBannerUrl() != null) {
            course.setBannerUrl(request.getBannerUrl());
        }
        if (request.getPriceInr() != null) {
            course.setPriceInr(request.getPriceInr());
            course.setFree(course.getPriceInr().compareTo(BigDecimal.ZERO) == 0);
        }
        if (request.getDiscountPriceInr() != null) {
            course.setDiscountPriceInr(request.getDiscountPriceInr());
        }
        if (request.getIsFree() != null) {
            course.setFree(request.getIsFree());
        }
        if (request.getEstimatedDurationHours() != null) {
            course.setEstimatedDurationHours(request.getEstimatedDurationHours());
        }
        if (request.getCertificateEnabled() != null) {
            course.setCertificateEnabled(request.getCertificateEnabled());
        }
        if (request.getSyllabusMeta() != null) {
            course.setSyllabusMeta(request.getSyllabusMeta());
        }

        CourseEntity saved = courseRepository.save(course);
        int totalModules = moduleRepository.countByCourseId(saved.getId());
        int totalLessons = lessonRepository.countByCourseId(saved.getId());

        return CourseResponse.fromEntity(saved, totalModules, totalLessons);
    }

    public CourseResponse publishCourse(String id, UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, id)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, id))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        verifyCourseEditPermission(course, currentUser);

        course.setStatus(CourseStatus.PUBLISHED);
        CourseEntity saved = courseRepository.save(course);

        int totalModules = moduleRepository.countByCourseId(saved.getId());
        int totalLessons = lessonRepository.countByCourseId(saved.getId());

        return CourseResponse.fromEntity(saved, totalModules, totalLessons);
    }

    public void deleteCourse(String id, UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, id)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, id))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        verifyCourseDeletePermission(course, currentUser);

        lessonRepository.deleteByCourseId(course.getId());
        moduleRepository.deleteByCourseId(course.getId());
        courseRepository.delete(course);
    }

    private void verifyCourseEditPermission(CourseEntity course, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to modify course");
        }
        if (currentUser.getRole() == Role.SUPER_ADMIN || currentUser.getRole() == Role.ORGANIZATION_ADMIN) {
            return;
        }
        if (currentUser.getRole() == Role.LECTURER) {
            if (course.getAuthorId() != null && course.getAuthorId().equals(currentUser.getId())) {
                return;
            }
        }
        throw new ForbiddenException("You do not have permission to edit this course");
    }

    private void verifyCourseDeletePermission(CourseEntity course, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to delete course");
        }
        if (currentUser.getRole() == Role.SUPER_ADMIN || currentUser.getRole() == Role.ORGANIZATION_ADMIN) {
            return;
        }
        throw new ForbiddenException("Only administrators can delete courses");
    }

    private String generateSlug(String title) {
        if (title == null || title.isBlank()) {
            return "course-" + UUID.randomUUID().toString().substring(0, 8);
        }
        return title.trim().toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}

