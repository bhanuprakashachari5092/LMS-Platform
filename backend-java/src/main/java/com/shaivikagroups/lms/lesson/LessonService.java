package com.shaivikagroups.lms.lesson;

import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ForbiddenException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.course.CourseEntity;
import com.shaivikagroups.lms.course.CourseRepository;
import com.shaivikagroups.lms.resource.LessonResourceEntity;
import com.shaivikagroups.lms.resource.LessonResourceRepository;
import com.shaivikagroups.lms.resource.ResourceResponse;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.user.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class LessonService {

    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonBlockRepository lessonBlockRepository;
    private final LessonResourceRepository lessonResourceRepository;
    private final CourseRepository courseRepository;

    public LessonService(
            ModuleRepository moduleRepository,
            LessonRepository lessonRepository,
            LessonBlockRepository lessonBlockRepository,
            LessonResourceRepository lessonResourceRepository,
            CourseRepository courseRepository) {
        this.moduleRepository = moduleRepository;
        this.lessonRepository = lessonRepository;
        this.lessonBlockRepository = lessonBlockRepository;
        this.lessonResourceRepository = lessonResourceRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional(readOnly = true)
    public List<ModuleResponse> getModulesByCourse(String courseId) {
        String currentTenant = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(currentTenant, courseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(currentTenant, courseId))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id/slug", courseId));

        List<ModuleEntity> modules = moduleRepository.findByCourseIdOrderByOrderIndexAsc(course.getId());
        List<LessonEntity> allLessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(course.getId());

        Map<String, List<LessonEntity>> lessonsByModule = allLessons.stream()
                .collect(Collectors.groupingBy(LessonEntity::getModuleId));

        return modules.stream().map(mod -> {
            List<LessonEntity> modLessons = lessonsByModule.getOrDefault(mod.getId(), Collections.emptyList());
            List<LessonResponse> lessonResponses = modLessons.stream()
                    .map(l -> LessonResponse.fromEntity(l, Collections.emptyList(), Collections.emptyList()))
                    .collect(Collectors.toList());
            return ModuleResponse.fromEntity(mod, lessonResponses);
        }).collect(Collectors.toList());
    }

    public ModuleResponse createModule(String courseId, ModuleRequest request, UserPrincipal currentUser) {
        String currentTenant = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(currentTenant, courseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(currentTenant, courseId))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id/slug", courseId));

        verifyCourseEditPermission(course, currentUser);

        int currentCount = moduleRepository.countByCourseId(course.getId());

        ModuleEntity module = new ModuleEntity();
        module.setId("mod_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        module.setCourseId(course.getId());
        module.setTitle(request.getTitle().trim());
        module.setDescription(request.getDescription());
        module.setDurationMinutes(request.getDurationMinutes() > 0 ? request.getDurationMinutes() : 60);
        module.setOrderIndex(request.getOrderIndex() > 0 ? request.getOrderIndex() : currentCount + 1);

        ModuleEntity saved = moduleRepository.save(module);
        return ModuleResponse.fromEntity(saved, Collections.emptyList());
    }

    public ModuleResponse updateModule(String moduleId, ModuleRequest request, UserPrincipal currentUser) {
        ModuleEntity module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));

        String currentTenant = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(currentTenant, module.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", module.getCourseId()));

        verifyCourseEditPermission(course, currentUser);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            module.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            module.setDescription(request.getDescription());
        }
        if (request.getDurationMinutes() > 0) {
            module.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getOrderIndex() > 0) {
            module.setOrderIndex(request.getOrderIndex());
        }

        ModuleEntity saved = moduleRepository.save(module);
        List<LessonEntity> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(saved.getId());
        List<LessonResponse> lessonResponses = lessons.stream()
                .map(l -> LessonResponse.fromEntity(l, Collections.emptyList(), Collections.emptyList()))
                .collect(Collectors.toList());

        return ModuleResponse.fromEntity(saved, lessonResponses);
    }

    public void deleteModule(String moduleId, UserPrincipal currentUser) {
        ModuleEntity module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));

        String currentTenant = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(currentTenant, module.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", module.getCourseId()));

        verifyCourseEditPermission(course, currentUser);

        List<LessonEntity> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(moduleId);
        for (LessonEntity lesson : lessons) {
            lessonBlockRepository.deleteByLessonId(lesson.getId());
            lessonResourceRepository.deleteByLessonId(lesson.getId());
        }
        lessonRepository.deleteByModuleId(moduleId);
        moduleRepository.delete(module);
    }

    @Transactional(readOnly = true)
    public LessonResponse getLessonById(String lessonId, UserPrincipal currentUser) {
        LessonEntity lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        String currentTenant = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(currentTenant, lesson.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", lesson.getCourseId()));

        // If not a free preview, user must be authenticated
        if (!lesson.isFreePreview() && currentUser == null) {
            throw new ForbiddenException("Enrollment required to access this lesson");
        }

        List<LessonBlockEntity> blocks = lessonBlockRepository.findByLessonIdOrderByOrderIndexAsc(lessonId);
        List<LessonBlockDTO> blockDTOs = blocks.stream()
                .map(LessonBlockDTO::fromEntity)
                .collect(Collectors.toList());

        List<LessonResourceEntity> resources = lessonResourceRepository.findByLessonIdOrderByOrderIndexAsc(lessonId);
        List<ResourceResponse> resourceResponses = resources.stream()
                .map(ResourceResponse::fromEntity)
                .collect(Collectors.toList());

        return LessonResponse.fromEntity(lesson, blockDTOs, resourceResponses);
    }

    public LessonResponse createLesson(String moduleId, LessonRequest request, UserPrincipal currentUser) {
        ModuleEntity module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));

        String currentTenant = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(currentTenant, module.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", module.getCourseId()));

        verifyCourseEditPermission(course, currentUser);

        int currentCount = lessonRepository.countByModuleId(moduleId);

        LessonEntity lesson = new LessonEntity();
        lesson.setId("les_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        lesson.setModuleId(module.getId());
        lesson.setCourseId(module.getCourseId());
        lesson.setTitle(request.getTitle().trim());
        lesson.setType(request.getType() != null ? request.getType() : "reading");
        lesson.setDurationMinutes(request.getDurationMinutes() > 0 ? request.getDurationMinutes() : 15);
        lesson.setFreePreview(request.isFreePreview());
        lesson.setContent(request.getContent());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setVideoProvider(request.getVideoProvider() != null ? request.getVideoProvider() : "youtube");
        lesson.setVideoDurationSeconds(request.getVideoDurationSeconds());
        lesson.setOrderIndex(request.getOrderIndex() > 0 ? request.getOrderIndex() : currentCount + 1);

        LessonEntity saved = lessonRepository.save(lesson);

        List<LessonBlockDTO> blockDTOs = new ArrayList<>();
        if (request.getBlocks() != null && !request.getBlocks().isEmpty()) {
            for (int i = 0; i < request.getBlocks().size(); i++) {
                LessonBlockDTO b = request.getBlocks().get(i);
                LessonBlockEntity block = new LessonBlockEntity();
                block.setId("blk_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
                block.setLessonId(saved.getId());
                block.setOrderIndex(b.getOrderIndex() > 0 ? b.getOrderIndex() : i + 1);
                block.setBlockType(b.getBlockType() != null ? b.getBlockType() : "markdown");
                block.setTitle(b.getTitle());
                block.setContentPayload(b.getContentPayload() != null ? b.getContentPayload() : "{}");
                LessonBlockEntity savedBlock = lessonBlockRepository.save(block);
                blockDTOs.add(LessonBlockDTO.fromEntity(savedBlock));
            }
        }

        return LessonResponse.fromEntity(saved, blockDTOs, Collections.emptyList());
    }

    public LessonResponse updateLesson(String lessonId, LessonRequest request, UserPrincipal currentUser) {
        LessonEntity lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        String currentTenant = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(currentTenant, lesson.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", lesson.getCourseId()));

        verifyCourseEditPermission(course, currentUser);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            lesson.setTitle(request.getTitle().trim());
        }
        if (request.getType() != null) {
            lesson.setType(request.getType());
        }
        if (request.getDurationMinutes() > 0) {
            lesson.setDurationMinutes(request.getDurationMinutes());
        }
        lesson.setFreePreview(request.isFreePreview());
        if (request.getContent() != null) {
            lesson.setContent(request.getContent());
        }
        if (request.getVideoUrl() != null) {
            lesson.setVideoUrl(request.getVideoUrl());
        }
        if (request.getVideoProvider() != null) {
            lesson.setVideoProvider(request.getVideoProvider());
        }
        lesson.setVideoDurationSeconds(request.getVideoDurationSeconds());
        if (request.getOrderIndex() > 0) {
            lesson.setOrderIndex(request.getOrderIndex());
        }

        LessonEntity saved = lessonRepository.save(lesson);

        // Update blocks if provided
        List<LessonBlockDTO> blockDTOs = new ArrayList<>();
        if (request.getBlocks() != null) {
            lessonBlockRepository.deleteByLessonId(lessonId);
            for (int i = 0; i < request.getBlocks().size(); i++) {
                LessonBlockDTO b = request.getBlocks().get(i);
                LessonBlockEntity block = new LessonBlockEntity();
                block.setId("blk_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
                block.setLessonId(saved.getId());
                block.setOrderIndex(b.getOrderIndex() > 0 ? b.getOrderIndex() : i + 1);
                block.setBlockType(b.getBlockType() != null ? b.getBlockType() : "markdown");
                block.setTitle(b.getTitle());
                block.setContentPayload(b.getContentPayload() != null ? b.getContentPayload() : "{}");
                LessonBlockEntity savedBlock = lessonBlockRepository.save(block);
                blockDTOs.add(LessonBlockDTO.fromEntity(savedBlock));
            }
        } else {
            blockDTOs = lessonBlockRepository.findByLessonIdOrderByOrderIndexAsc(lessonId).stream()
                    .map(LessonBlockDTO::fromEntity)
                    .collect(Collectors.toList());
        }

        List<ResourceResponse> resources = lessonResourceRepository.findByLessonIdOrderByOrderIndexAsc(lessonId).stream()
                .map(ResourceResponse::fromEntity)
                .collect(Collectors.toList());

        return LessonResponse.fromEntity(saved, blockDTOs, resources);
    }

    public void deleteLesson(String lessonId, UserPrincipal currentUser) {
        LessonEntity lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        String currentTenant = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(currentTenant, lesson.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", lesson.getCourseId()));

        verifyCourseEditPermission(course, currentUser);

        lessonBlockRepository.deleteByLessonId(lessonId);
        lessonResourceRepository.deleteByLessonId(lessonId);
        lessonRepository.delete(lesson);
    }

    public void reorderLessons(String courseId, LessonReorderRequest request, UserPrincipal currentUser) {
        String currentTenant = TenantContext.getTenantId();
        CourseEntity course = courseRepository.findByTenantIdAndId(currentTenant, courseId)
                .or(() -> courseRepository.findByTenantIdAndSlug(currentTenant, courseId))
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id/slug", courseId));

        verifyCourseEditPermission(course, currentUser);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Reorder list cannot be empty");
        }

        for (LessonReorderRequest.ReorderItem item : request.getItems()) {
            LessonEntity lesson = lessonRepository.findById(item.getLessonId()).orElse(null);
            if (lesson != null && lesson.getCourseId().equals(course.getId())) {
                if (item.getModuleId() != null && !item.getModuleId().isBlank()) {
                    lesson.setModuleId(item.getModuleId());
                }
                lesson.setOrderIndex(item.getOrderIndex());
                lessonRepository.save(lesson);
            }
        }
    }

    private void verifyCourseEditPermission(CourseEntity course, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to manage course content");
        }
        if (currentUser.getRole() == Role.SUPER_ADMIN || currentUser.getRole() == Role.ORGANIZATION_ADMIN) {
            return;
        }
        if (currentUser.getRole() == Role.LECTURER) {
            if (course.getAuthorId() != null && course.getAuthorId().equals(currentUser.getId())) {
                return;
            }
        }
        throw new ForbiddenException("You do not have permission to modify this course content");
    }
}

