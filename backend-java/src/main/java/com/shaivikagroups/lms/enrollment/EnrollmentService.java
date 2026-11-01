package com.shaivikagroups.lms.enrollment;

import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ForbiddenException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.course.CourseEntity;
import com.shaivikagroups.lms.course.CourseRepository;
import com.shaivikagroups.lms.course.CourseStatus;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
    }

    public EnrollmentResponse enrollInCourse(String courseId, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to enroll in courses");
        }
        String tenantId = TenantContext.getTenantId();

        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, courseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, courseId))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id/slug", courseId));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new BadRequestException("Cannot enroll in an unpublished course");
        }

        Optional<EnrollmentEntity> existing = enrollmentRepository.findByTenantIdAndUserIdAndCourseId(
                tenantId, currentUser.getId(), course.getId());
        if (existing.isPresent()) {
            return EnrollmentResponse.fromEntity(existing.get(), course);
        }

        EnrollmentEntity enrollment = new EnrollmentEntity();
        enrollment.setId("enr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        enrollment.setTenantId(tenantId);
        enrollment.setUserId(currentUser.getId());
        enrollment.setCourseId(course.getId());
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setProgressPercentage(0);
        enrollment.setEnrolledAt(Instant.now());
        enrollment.setLastAccessedAt(Instant.now());

        EnrollmentEntity saved = enrollmentRepository.save(enrollment);

        // Update total enrolled count on course
        course.setTotalEnrolled(course.getTotalEnrolled() + 1);
        courseRepository.save(course);

        return EnrollmentResponse.fromEntity(saved, course);
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentResponse> getMyEnrollments(UserPrincipal currentUser, Pageable pageable) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to view enrollments");
        }
        String tenantId = TenantContext.getTenantId();

        return enrollmentRepository.findByTenantIdAndUserId(tenantId, currentUser.getId(), pageable)
                .map(enr -> {
                    CourseEntity course = courseRepository.findById(enr.getCourseId()).orElse(null);
                    return EnrollmentResponse.fromEntity(enr, course);
                });
    }

    @Transactional(readOnly = true)
    public EnrollmentResponse getEnrollment(String courseId, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to view enrollment details");
        }
        String tenantId = TenantContext.getTenantId();

        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, courseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, courseId))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id/slug", courseId));

        EnrollmentEntity enrollment = enrollmentRepository.findByTenantIdAndUserIdAndCourseId(
                tenantId, currentUser.getId(), course.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "courseId", course.getId()));

        return EnrollmentResponse.fromEntity(enrollment, course);
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(String courseId, String userId) {
        String tenantId = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, courseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, courseId))
                .orElse(null);

        if (course == null) return false;

        return enrollmentRepository.existsByTenantIdAndUserIdAndCourseId(
                tenantId, userId, course.getId());
    }
}

