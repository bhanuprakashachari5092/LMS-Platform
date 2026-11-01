package com.shaivikagroups.lms.resource;

import com.shaivikagroups.lms.common.ForbiddenException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.lesson.LessonEntity;
import com.shaivikagroups.lms.lesson.LessonRepository;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.user.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResourceService {

    private final LessonResourceRepository resourceRepository;
    private final LessonRepository lessonRepository;

    public ResourceService(LessonResourceRepository resourceRepository, LessonRepository lessonRepository) {
        this.resourceRepository = resourceRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getResourcesByLesson(String lessonId) {
        return resourceRepository.findByLessonIdOrderByOrderIndexAsc(lessonId).stream()
                .map(ResourceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ResourceResponse addResource(String lessonId, ResourceRequest request, UserPrincipal currentUser) {
        verifyEditPermission(currentUser);

        LessonEntity lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        int count = resourceRepository.findByLessonIdOrderByOrderIndexAsc(lessonId).size();

        LessonResourceEntity resource = new LessonResourceEntity();
        resource.setId("res_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        resource.setLessonId(lesson.getId());
        resource.setTitle(request.getTitle().trim());
        resource.setDescription(request.getDescription());
        resource.setType(request.getType() != null ? request.getType() : "pdf");
        resource.setUrl(request.getUrl().trim());
        resource.setOrderIndex(request.getOrderIndex() > 0 ? request.getOrderIndex() : count + 1);
        resource.setDownloadable(request.isDownloadable());

        LessonResourceEntity saved = resourceRepository.save(resource);
        return ResourceResponse.fromEntity(saved);
    }

    public void deleteResource(String resourceId, UserPrincipal currentUser) {
        verifyEditPermission(currentUser);

        LessonResourceEntity resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", resourceId));

        resourceRepository.delete(resource);
    }

    private void verifyEditPermission(UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to manage lesson resources");
        }
        if (currentUser.getRole() != Role.SUPER_ADMIN &&
            currentUser.getRole() != Role.ORGANIZATION_ADMIN &&
            currentUser.getRole() != Role.LECTURER) {
            throw new ForbiddenException("You do not have permission to modify resources");
        }
    }
}

