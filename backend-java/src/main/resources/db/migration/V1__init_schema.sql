-- ==============================================================================
-- KAIZENQ AI LMS SAAS - V1 INITIAL DATABASE SCHEMA (PostgreSQL 16+)
-- Multi-Tenant SaaS Architecture with Data Isolation
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TENANTS & ORGANIZATIONS (Multi-Tenant Core)
-- ------------------------------------------------------------------------------
CREATE TABLE tenants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255) UNIQUE,
    custom_domain VARCHAR(255) UNIQUE,
    logo_url TEXT,
    favicon_url TEXT,
    brand_color VARCHAR(32) DEFAULT '#0284c7',
    secondary_color VARCHAR(32) DEFAULT '#2563eb',
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'FREE', -- FREE, PRO, ENTERPRISE
    max_students INT NOT NULL DEFAULT 500,
    max_courses INT NOT NULL DEFAULT 20,
    max_storage_gb NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, TRIAL
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ------------------------------------------------------------------------------
-- 2. USERS & IDENTITY
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY, -- Firebase UID or UUID
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(32) NOT NULL DEFAULT 'STUDENT', -- SUPER_ADMIN, ORGANIZATION_ADMIN, LECTURER, STUDENT
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    phone VARCHAR(32),
    avatar_url TEXT,
    github_username VARCHAR(100),
    github_url TEXT,
    bio TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    xp_points INT NOT NULL DEFAULT 0,
    streak_count INT NOT NULL DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(tenant_id, role);
CREATE INDEX idx_users_xp ON users(tenant_id, xp_points DESC);

-- ------------------------------------------------------------------------------
-- 3. REFRESH TOKENS (JWT Token Rotation & Revocation)
-- ------------------------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    replaced_by_token_hash VARCHAR(255),
    client_ip VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ------------------------------------------------------------------------------
-- 4. COURSES
-- ------------------------------------------------------------------------------
CREATE TABLE courses (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    author_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    slug VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    category VARCHAR(64) NOT NULL DEFAULT 'Computer Science',
    level VARCHAR(32) NOT NULL DEFAULT 'all_levels', -- beginner, intermediate, advanced, all_levels
    visibility VARCHAR(32) NOT NULL DEFAULT 'public', -- public, private, unlisted
    status VARCHAR(32) NOT NULL DEFAULT 'published', -- draft, review, published, archived
    thumbnail_url TEXT,
    banner_url TEXT,
    price_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_price_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_duration_hours NUMERIC(6, 1) DEFAULT 10.0,
    total_enrolled INT NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.90,
    review_count INT NOT NULL DEFAULT 0,
    certificate_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    syllabus_meta JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_courses_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_courses_tenant_id ON courses(tenant_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_status ON courses(tenant_id, status);
CREATE INDEX idx_courses_category ON courses(tenant_id, category);

-- ------------------------------------------------------------------------------
-- 5. COURSE ROADMAPS
-- ------------------------------------------------------------------------------
CREATE TABLE course_roadmaps (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_course_roadmaps_course ON course_roadmaps(course_id, order_index);

-- ------------------------------------------------------------------------------
-- 6. MODULES
-- ------------------------------------------------------------------------------
CREATE TABLE modules (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_course ON modules(course_id, order_index);

-- ------------------------------------------------------------------------------
-- 7. LESSONS
-- ------------------------------------------------------------------------------
CREATE TABLE lessons (
    id VARCHAR(64) PRIMARY KEY,
    module_id VARCHAR(64) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'reading', -- video, reading, lab, quiz, assignment, project
    duration_minutes INT NOT NULL DEFAULT 15,
    is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
    content TEXT, -- Primary markdown or HTML content
    video_url TEXT,
    video_provider VARCHAR(32) DEFAULT 'youtube', -- youtube, cloudinary, vimeo, firebase-storage, direct
    video_duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_module ON lessons(module_id, order_index);
CREATE INDEX idx_lessons_course ON lessons(course_id);

-- ------------------------------------------------------------------------------
-- 8. LESSON BLOCKS (Multiformat Rich Content: Code, Markdown, Steps, Diagrams)
-- ------------------------------------------------------------------------------
CREATE TABLE lesson_blocks (
    id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    block_type VARCHAR(32) NOT NULL, -- markdown, code, callout, lab_step, quiz_inline, diagram
    title VARCHAR(255),
    content_payload JSONB NOT NULL, -- Flexible structured payload
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lesson_blocks_lesson ON lesson_blocks(lesson_id, order_index);

-- ------------------------------------------------------------------------------
-- 9. LESSON RESOURCES (PDFs, Source Code, Lab Workbooks, Cheat Sheets)
-- ------------------------------------------------------------------------------
CREATE TABLE lesson_resources (
    id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(32) NOT NULL DEFAULT 'pdf', -- pdf, ppt, zip, doc, image, github, url
    url TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    downloadable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lesson_resources_lesson ON lesson_resources(lesson_id, order_index);

-- ------------------------------------------------------------------------------
-- 10. QUIZZES
-- ------------------------------------------------------------------------------
CREATE TABLE quizzes (
    id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) REFERENCES lessons(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit_minutes INT NOT NULL DEFAULT 15,
    passing_score INT NOT NULL DEFAULT 70, -- Percentage
    max_attempts INT NOT NULL DEFAULT 3,
    shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX idx_quizzes_course ON quizzes(course_id);

-- ------------------------------------------------------------------------------
-- 11. QUIZ QUESTIONS & OPTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE quiz_questions (
    id VARCHAR(64) PRIMARY KEY,
    quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    question_text TEXT NOT NULL,
    question_type VARCHAR(32) NOT NULL DEFAULT 'MULTIPLE_CHOICE', -- MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
    explanation TEXT,
    points INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id, order_index);

CREATE TABLE quiz_question_options (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(64) NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quiz_options_question ON quiz_question_options(question_id, order_index);

-- ------------------------------------------------------------------------------
-- 12. QUIZ ATTEMPTS
-- ------------------------------------------------------------------------------
CREATE TABLE quiz_attempts (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    answers_payload JSONB NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(tenant_id, user_id, quiz_id);

-- ------------------------------------------------------------------------------
-- 13. ASSIGNMENTS & SUBMISSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE assignments (
    id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) REFERENCES lessons(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    max_score INT NOT NULL DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE,
    allow_file_upload BOOLEAN NOT NULL DEFAULT TRUE,
    allow_github_link BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_lesson ON assignments(lesson_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);

CREATE TABLE assignment_submissions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assignment_id VARCHAR(64) NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_url TEXT,
    notes TEXT,
    score INT,
    feedback TEXT,
    graded_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, GRADED, REJECTED
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignment_submissions_user ON assignment_submissions(tenant_id, user_id, assignment_id);

-- ------------------------------------------------------------------------------
-- 14. ENROLLMENTS & STUDENT PROGRESS
-- ------------------------------------------------------------------------------
CREATE TABLE enrollments (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, SUSPENDED, REFUNDED
    progress_percentage INT NOT NULL DEFAULT 0,
    last_accessed_lesson_id VARCHAR(64),
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_enrollments_user_course UNIQUE (tenant_id, user_id, course_id)
);

CREATE INDEX idx_enrollments_tenant_user ON enrollments(tenant_id, user_id);
CREATE INDEX idx_enrollments_course ON enrollments(tenant_id, course_id);

CREATE TABLE student_progress (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    enrollment_id VARCHAR(64) NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id VARCHAR(64) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED
    time_spent_seconds INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_progress_enrollment_lesson UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX idx_student_progress_enrollment ON student_progress(enrollment_id);
CREATE INDEX idx_student_progress_lesson ON student_progress(lesson_id);

-- ------------------------------------------------------------------------------
-- 15. CERTIFICATES & VERIFICATION
-- ------------------------------------------------------------------------------
CREATE TABLE certificates (
    id VARCHAR(64) PRIMARY KEY,
    certificate_number VARCHAR(64) NOT NULL UNIQUE, -- e.g. KQ-LINUX-2026-762133
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    pdf_url TEXT,
    drive_file_id VARCHAR(128),
    qr_payload TEXT NOT NULL,
    verification_hash VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'VALID', -- VALID, REVOKED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_certificates_user_course UNIQUE (tenant_id, user_id, course_id)
);

CREATE INDEX idx_certificates_cert_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_tenant_user ON certificates(tenant_id, user_id);

-- ------------------------------------------------------------------------------
-- 16. COUPONS & DISCOUNTS
-- ------------------------------------------------------------------------------
CREATE TABLE coupons (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    discount_type VARCHAR(32) NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE, FLAT
    discount_amount NUMERIC(10, 2) NOT NULL,
    max_uses INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE, -- NULL means applicable to all courses
    min_purchase_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, DISABLED
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_coupons_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX idx_coupons_tenant_code ON coupons(tenant_id, code);

-- ------------------------------------------------------------------------------
-- 17. PAYMENTS & TRANSACTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_id VARCHAR(128) NOT NULL,
    payment_id VARCHAR(128),
    signature VARCHAR(255),
    amount_inr NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'INR',
    coupon_id VARCHAR(64) REFERENCES coupons(id) ON DELETE SET NULL,
    provider VARCHAR(32) NOT NULL DEFAULT 'RAZORPAY', -- RAZORPAY, STRIPE
    status VARCHAR(32) NOT NULL DEFAULT 'CREATED', -- CREATED, CAPTURED, FAILED, REFUNDED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_tenant_user ON payments(tenant_id, user_id);

-- ------------------------------------------------------------------------------
-- 18. STUDENT PORTFOLIOS
-- ------------------------------------------------------------------------------
CREATE TABLE portfolios (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    custom_handle VARCHAR(64) UNIQUE,
    bio TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    resume_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolios_handle ON portfolios(custom_handle);

-- ------------------------------------------------------------------------------
-- 19. NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'SYSTEM', -- SYSTEM, ENROLLMENT, CERTIFICATE, ASSIGNMENT, QUIZ
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_read ON notifications(tenant_id, user_id, is_read);

-- ------------------------------------------------------------------------------
-- 20. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    details JSONB,
    client_ip VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);

