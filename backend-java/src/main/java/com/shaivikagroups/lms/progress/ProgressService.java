package com.shaivikagroups.lms.progress;

import com.shaivikagroups.lms.common.ForbiddenException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.course.CourseEntity;
import com.shaivikagroups.lms.course.CourseRepository;
import com.shaivikagroups.lms.enrollment.EnrollmentEntity;
import com.shaivikagroups.lms.enrollment.EnrollmentRepository;
import com.shaivikagroups.lms.enrollment.EnrollmentStatus;
import com.shaivikagroups.lms.lesson.LessonEntity;
import com.shaivikagroups.lms.lesson.LessonRepository;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.user.UserEntity;
import com.shaivikagroups.lms.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProgressService {

    private final StudentProgressRepository progressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    public ProgressService(
            StudentProgressRepository progressRepository,
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            UserRepository userRepository) {
        this.progressRepository = progressRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
    }

    public CourseProgressResponse updateLessonProgress(
            String courseId, ProgressUpdateRequest request, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to update learning progress");
        }
        String tenantId = TenantContext.getTenantId();

        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, courseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, courseId))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id/slug", courseId));

        EnrollmentEntity enrollment = enrollmentRepository.findByTenantIdAndUserIdAndCourseId(
                tenantId, currentUser.getId(), course.getId())
                .orElseThrow(() -> new ForbiddenException("Student must be enrolled in the course to track progress"));

        LessonEntity lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", request.getLessonId()));

        ProgressStatus newStatus = ProgressStatus.fromString(request.getStatus());

        Optional<StudentProgressEntity> existingOpt = progressRepository.findByEnrollmentIdAndLessonId(
                enrollment.getId(), lesson.getId());

        StudentProgressEntity progress;
        boolean wasAlreadyCompleted = false;
        if (existingOpt.isPresent()) {
            progress = existingOpt.get();
            wasAlreadyCompleted = progress.getStatus() == ProgressStatus.COMPLETED;
            progress.setStatus(newStatus);
            progress.setTimeSpentSeconds(progress.getTimeSpentSeconds() + Math.max(0, request.getTimeSpentSeconds()));
            if (newStatus == ProgressStatus.COMPLETED && progress.getCompletedAt() == null) {
                progress.setCompletedAt(Instant.now());
            }
        } else {
            progress = new StudentProgressEntity();
            progress.setId("prg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
            progress.setTenantId(tenantId);
            progress.setEnrollmentId(enrollment.getId());
            progress.setLessonId(lesson.getId());
            progress.setStatus(newStatus);
            progress.setTimeSpentSeconds(Math.max(0, request.getTimeSpentSeconds()));
            if (newStatus == ProgressStatus.COMPLETED) {
                progress.setCompletedAt(Instant.now());
            }
        }
        progressRepository.save(progress);

        // Award +50 XP points if freshly completed
        if (newStatus == ProgressStatus.COMPLETED && !wasAlreadyCompleted) {
            userRepository.findById(currentUser.getId()).ifPresent(user -> {
                user.setXpPoints(user.getXpPoints() + 50);
                user.setLastActiveAt(Instant.now());
                userRepository.save(user);
            });
        }

        // Update enrollment checkpoint and calculate percentage
        enrollment.setLastAccessedLessonId(lesson.getId());
        enrollment.setLastAccessedAt(Instant.now());

        int totalLessons = lessonRepository.countByCourseId(course.getId());
        long completedLessons = progressRepository.countByEnrollmentIdAndStatus(enrollment.getId(), ProgressStatus.COMPLETED);

        int percentage = totalLessons > 0 ? (int) Math.min(100, Math.round(((double) completedLessons / totalLessons) * 100)) : 0;
        enrollment.setProgressPercentage(percentage);

        if (percentage >= 100 && enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(Instant.now());
        }

        enrollmentRepository.save(enrollment);

        return getCourseProgress(course.getId(), currentUser);
    }

    public CourseProgressResponse updateLessonProgress(
            String userId, String courseId, ProgressUpdateRequest request) {
        String tenantId = TenantContext.getTenantId();

        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, courseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, courseId))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id/slug", courseId));

        EnrollmentEntity enrollment = enrollmentRepository.findByTenantIdAndUserIdAndCourseId(
                tenantId, userId, course.getId())
                .orElseThrow(() -> new ForbiddenException("Student must be enrolled in the course to track progress"));

        LessonEntity lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", request.getLessonId()));

        ProgressStatus newStatus = ProgressStatus.fromString(request.getStatus());

        Optional<StudentProgressEntity> existingOpt = progressRepository.findByEnrollmentIdAndLessonId(
                enrollment.getId(), lesson.getId());

        StudentProgressEntity progress;
        boolean wasAlreadyCompleted = false;
        if (existingOpt.isPresent()) {
            progress = existingOpt.get();
            wasAlreadyCompleted = progress.getStatus() == ProgressStatus.COMPLETED;
            progress.setStatus(newStatus);
            progress.setTimeSpentSeconds(progress.getTimeSpentSeconds() + Math.max(0, request.getTimeSpentSeconds()));
            if (newStatus == ProgressStatus.COMPLETED && progress.getCompletedAt() == null) {
                progress.setCompletedAt(Instant.now());
            }
        } else {
            progress = new StudentProgressEntity();
            progress.setId("prg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
            progress.setTenantId(tenantId);
            progress.setEnrollmentId(enrollment.getId());
            progress.setLessonId(lesson.getId());
            progress.setStatus(newStatus);
            progress.setTimeSpentSeconds(Math.max(0, request.getTimeSpentSeconds()));
            if (newStatus == ProgressStatus.COMPLETED) {
                progress.setCompletedAt(Instant.now());
            }
        }
        progressRepository.save(progress);

        if (newStatus == ProgressStatus.COMPLETED && !wasAlreadyCompleted) {
            userRepository.findById(userId).ifPresent(user -> {
                user.setXpPoints(user.getXpPoints() + 50);
                user.setLastActiveAt(Instant.now());
                userRepository.save(user);
            });
        }

        enrollment.setLastAccessedLessonId(lesson.getId());
        enrollment.setLastAccessedAt(Instant.now());

        int totalLessons = lessonRepository.countByCourseId(course.getId());
        long completedLessons = progressRepository.countByEnrollmentIdAndStatus(enrollment.getId(), ProgressStatus.COMPLETED);

        int percentage = totalLessons > 0 ? (int) Math.min(100, Math.round(((double) completedLessons / totalLessons) * 100)) : 0;
        enrollment.setProgressPercentage(percentage);

        if (percentage >= 100 && enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(Instant.now());
        }

        enrollmentRepository.save(enrollment);

        List<StudentProgressEntity> allProgress = progressRepository.findByEnrollmentId(enrollment.getId());
        List<String> completedIds = new ArrayList<>();
        List<String> inProgressIds = new ArrayList<>();

        for (StudentProgressEntity p : allProgress) {
            if (p.getStatus() == ProgressStatus.COMPLETED) {
                completedIds.add(p.getLessonId());
            } else if (p.getStatus() == ProgressStatus.IN_PROGRESS) {
                inProgressIds.add(p.getLessonId());
            }
        }

        CourseProgressResponse response = new CourseProgressResponse();
        response.setEnrollmentId(enrollment.getId());
        response.setCourseId(course.getId());
        response.setProgressPercentage(enrollment.getProgressPercentage());
        response.setTotalLessons(totalLessons);
        response.setCompletedLessonsCount(completedIds.size());
        response.setLastAccessedLessonId(enrollment.getLastAccessedLessonId());
        response.setCompletedLessonIds(completedIds);
        response.setInProgressLessonIds(inProgressIds);

        return response;
    }

    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(String courseId, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to view course progress");
        }
        String tenantId = TenantContext.getTenantId();

        CourseEntity course = courseRepository.findByTenantIdAndId(tenantId, courseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(tenantId, courseId))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id/slug", courseId));

        EnrollmentEntity enrollment = enrollmentRepository.findByTenantIdAndUserIdAndCourseId(
                tenantId, currentUser.getId(), course.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "courseId", course.getId()));

        List<StudentProgressEntity> allProgress = progressRepository.findByEnrollmentId(enrollment.getId());

        List<String> completedIds = new ArrayList<>();
        List<String> inProgressIds = new ArrayList<>();

        for (StudentProgressEntity p : allProgress) {
            if (p.getStatus() == ProgressStatus.COMPLETED) {
                completedIds.add(p.getLessonId());
            } else if (p.getStatus() == ProgressStatus.IN_PROGRESS) {
                inProgressIds.add(p.getLessonId());
            }
        }

        int totalLessons = lessonRepository.countByCourseId(course.getId());

        CourseProgressResponse response = new CourseProgressResponse();
        response.setEnrollmentId(enrollment.getId());
        response.setCourseId(course.getId());
        response.setProgressPercentage(enrollment.getProgressPercentage());
        response.setTotalLessons(totalLessons);
        response.setCompletedLessonsCount(completedIds.size());
        response.setLastAccessedLessonId(enrollment.getLastAccessedLessonId());
        response.setCompletedLessonIds(completedIds);
        response.setInProgressLessonIds(inProgressIds);

        return response;
    }
}

