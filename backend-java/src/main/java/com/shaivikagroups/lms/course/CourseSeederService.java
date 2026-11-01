package com.shaivikagroups.lms.course;

import com.shaivikagroups.lms.lesson.LessonEntity;
import com.shaivikagroups.lms.lesson.LessonRepository;
import com.shaivikagroups.lms.lesson.ModuleEntity;
import com.shaivikagroups.lms.lesson.ModuleRepository;
import com.shaivikagroups.lms.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Component
@Order(10)
public class CourseSeederService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CourseSeederService.class);
    private static final String DEFAULT_TENANT = TenantContext.DEFAULT_TENANT_ID;

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;

    public CourseSeederService(
            CourseRepository courseRepository,
            ModuleRepository moduleRepository,
            LessonRepository lessonRepository) {
        this.courseRepository = courseRepository;
        this.moduleRepository = moduleRepository;
        this.lessonRepository = lessonRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (courseRepository.countByTenantId(DEFAULT_TENANT) > 0) {
            log.info("Courses already seeded for tenant: {}", DEFAULT_TENANT);
            return;
        }

        log.info("Seeding initial LMS courses for default tenant: {}", DEFAULT_TENANT);

        // 1. Linux Systems & Administration Mastery
        seedLinuxCourse();

        // 2. Git & GitHub Version Control Mastery
        seedGitCourse();

        // 3. Kubernetes & Cloud Native DevOps
        seedKubernetesCourse();

        log.info("LMS course seeding completed successfully.");
    }

    private void seedLinuxCourse() {
        CourseEntity linux = new CourseEntity();
        linux.setId("course_linux_101");
        linux.setTenantId(DEFAULT_TENANT);
        linux.setSlug("linux-systems-administration-mastery");
        linux.setTitle("Linux Systems & Administration Mastery");
        linux.setSubtitle("Enterprise Production Systems Engineering");
        linux.setDescription("Comprehensive enterprise curriculum covering Linux Architecture, Kernel Mechanics, Permissions, Systemd Daemons, Bash Scripting, and SSH Security.");
        linux.setCategory("Linux & Systems");
        linux.setLevel(CourseLevel.ALL_LEVELS);
        linux.setStatus(CourseStatus.PUBLISHED);
        linux.setVisibility("public");
        linux.setThumbnailUrl("/assets/images/linux_course_thumbnail.webp");
        linux.setBannerUrl("/assets/images/linux_os_architecture.webp");
        linux.setPriceInr(BigDecimal.ZERO);
        linux.setDiscountPriceInr(BigDecimal.ZERO);
        linux.setFree(true);
        linux.setEstimatedDurationHours(BigDecimal.valueOf(25.0));
        linux.setRating(BigDecimal.valueOf(4.95));
        linux.setReviewCount(420);
        linux.setTotalEnrolled(1250);
        linux.setCertificateEnabled(true);
        linux.setCreatedAt(Instant.now());
        linux.setUpdatedAt(Instant.now());
        CourseEntity savedCourse = courseRepository.save(linux);

        // Module 1
        ModuleEntity mod1 = new ModuleEntity();
        mod1.setId("mod_linux_1");
        mod1.setCourseId(savedCourse.getId());
        mod1.setOrderIndex(1);
        mod1.setTitle("Module 1: Fundamental Concepts & Architecture");
        mod1.setDescription("Deep dive into Linux Kernel space, user space, and File Hierarchy Standard.");
        mod1.setDurationMinutes(90);
        ModuleEntity savedMod1 = moduleRepository.save(mod1);

        LessonEntity l1 = new LessonEntity();
        l1.setId("les_linux_1_1");
        l1.setModuleId(savedMod1.getId());
        l1.setCourseId(savedCourse.getId());
        l1.setOrderIndex(1);
        l1.setTitle("1.1 Linux OS Architecture & Kernel vs User Space");
        l1.setType("reading");
        l1.setDurationMinutes(20);
        l1.setFreePreview(true);
        l1.setContent("# Linux OS Architecture\n\nLinux is divided into **Kernel Space** and **User Space**...");
        lessonRepository.save(l1);

        LessonEntity l2 = new LessonEntity();
        l2.setId("les_linux_1_2");
        l2.setModuleId(savedMod1.getId());
        l2.setCourseId(savedCourse.getId());
        l2.setOrderIndex(2);
        l2.setTitle("1.2 Filesystem Hierarchy Standard (FHS)");
        l2.setType("reading");
        l2.setDurationMinutes(25);
        l2.setFreePreview(true);
        l2.setContent("# Filesystem Hierarchy Standard (FHS)\n\nIn Linux, everything is a file...");
        lessonRepository.save(l2);

        // Module 2
        ModuleEntity mod2 = new ModuleEntity();
        mod2.setId("mod_linux_2");
        mod2.setCourseId(savedCourse.getId());
        mod2.setOrderIndex(2);
        mod2.setTitle("Module 2: User Management & Permissions");
        mod2.setDescription("POSIX file permissions, chmod, chown, sudoers, and ACLs.");
        mod2.setDurationMinutes(110);
        ModuleEntity savedMod2 = moduleRepository.save(mod2);

        LessonEntity l3 = new LessonEntity();
        l3.setId("les_linux_2_1");
        l3.setModuleId(savedMod2.getId());
        l3.setCourseId(savedCourse.getId());
        l3.setOrderIndex(1);
        l3.setTitle("2.1 File & Directory Permissions (chmod, chown, umask)");
        l3.setType("reading");
        l3.setDurationMinutes(30);
        l3.setFreePreview(false);
        l3.setContent("# File Permissions\n\nRead (4), Write (2), and Execute (1)...");
        lessonRepository.save(l3);
    }

    private void seedGitCourse() {
        CourseEntity git = new CourseEntity();
        git.setId("git-github-mastery-course-id");
        git.setTenantId(DEFAULT_TENANT);
        git.setSlug("git-github-mastery");
        git.setTitle("Git & GitHub Enterprise Mastery");
        git.setSubtitle("Distributed Version Control & Production CI/CD");
        git.setDescription("Master distributed version control, branching strategies, rebase workflows, merge conflict resolution, and GitHub Actions.");
        git.setCategory("DevOps & Cloud");
        git.setLevel(CourseLevel.ALL_LEVELS);
        git.setStatus(CourseStatus.PUBLISHED);
        git.setVisibility("public");
        git.setThumbnailUrl("/assets/images/git_github_thumbnail.webp");
        git.setBannerUrl("/assets/images/git_github_banner.webp");
        git.setPriceInr(BigDecimal.ZERO);
        git.setDiscountPriceInr(BigDecimal.ZERO);
        git.setFree(true);
        git.setEstimatedDurationHours(BigDecimal.valueOf(18.0));
        git.setRating(BigDecimal.valueOf(4.92));
        git.setReviewCount(310);
        git.setTotalEnrolled(980);
        git.setCertificateEnabled(true);
        git.setCreatedAt(Instant.now());
        git.setUpdatedAt(Instant.now());
        CourseEntity savedCourse = courseRepository.save(git);

        ModuleEntity mod1 = new ModuleEntity();
        mod1.setId("mod_git_1");
        mod1.setCourseId(savedCourse.getId());
        mod1.setOrderIndex(1);
        mod1.setTitle("Module 1: Git Internals & Core Objects");
        mod1.setDescription("Blobs, Trees, Commits, and Annotated Tags under the .git directory.");
        mod1.setDurationMinutes(75);
        ModuleEntity savedMod1 = moduleRepository.save(mod1);

        LessonEntity l1 = new LessonEntity();
        l1.setId("les_git_1_1");
        l1.setModuleId(savedMod1.getId());
        l1.setCourseId(savedCourse.getId());
        l1.setOrderIndex(1);
        l1.setTitle("1.1 How Git Stores Data: Blobs, Trees, and Commits");
        l1.setType("reading");
        l1.setDurationMinutes(20);
        l1.setFreePreview(true);
        l1.setContent("# Git Internals\n\nGit is a content-addressable storage system...");
        lessonRepository.save(l1);
    }

    private void seedKubernetesCourse() {
        CourseEntity k8s = new CourseEntity();
        k8s.setId("kubernetes-complete-course");
        k8s.setTenantId(DEFAULT_TENANT);
        k8s.setSlug("kubernetes-complete-course");
        k8s.setTitle("Kubernetes & Cloud Native Architecture");
        k8s.setSubtitle("Enterprise Container Orchestration & Microservices");
        k8s.setDescription("Production cluster architecture, Pod lifecycle, Deployments, StatefulSets, Services, Ingress Controllers, and Helm charts.");
        k8s.setCategory("DevOps & Cloud");
        k8s.setLevel(CourseLevel.INTERMEDIATE);
        k8s.setStatus(CourseStatus.PUBLISHED);
        k8s.setVisibility("public");
        k8s.setThumbnailUrl("/assets/images/kubernetes_thumbnail.webp");
        k8s.setBannerUrl("/assets/images/kubernetes_banner.webp");
        k8s.setPriceInr(BigDecimal.ZERO);
        k8s.setDiscountPriceInr(BigDecimal.ZERO);
        k8s.setFree(true);
        k8s.setEstimatedDurationHours(BigDecimal.valueOf(30.0));
        k8s.setRating(BigDecimal.valueOf(4.97));
        k8s.setReviewCount(580);
        k8s.setTotalEnrolled(1420);
        k8s.setCertificateEnabled(true);
        k8s.setCreatedAt(Instant.now());
        k8s.setUpdatedAt(Instant.now());
        CourseEntity savedCourse = courseRepository.save(k8s);

        ModuleEntity mod1 = new ModuleEntity();
        mod1.setId("mod_k8s_1");
        mod1.setCourseId(savedCourse.getId());
        mod1.setOrderIndex(1);
        mod1.setTitle("Module 1: Control Plane & Node Components");
        mod1.setDescription("API Server, etcd, Kube-Scheduler, Kube-Controller-Manager, Kubelet, and Kube-Proxy.");
        mod1.setDurationMinutes(80);
        ModuleEntity savedMod1 = moduleRepository.save(mod1);

        LessonEntity l1 = new LessonEntity();
        l1.setId("les_k8s_1_1");
        l1.setModuleId(savedMod1.getId());
        l1.setCourseId(savedCourse.getId());
        l1.setOrderIndex(1);
        l1.setTitle("1.1 Kubernetes Architecture Overview");
        l1.setType("reading");
        l1.setDurationMinutes(25);
        l1.setFreePreview(true);
        l1.setContent("# Kubernetes Architecture\n\nA Kubernetes cluster consists of Control Plane and Worker Nodes...");
        lessonRepository.save(l1);
    }
}
