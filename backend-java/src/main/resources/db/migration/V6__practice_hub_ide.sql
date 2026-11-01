-- ==============================================================================
-- KAIZENQ AI LMS SAAS - V6 PRACTICEHUB PROFESSIONAL IDE
-- Problems, Test Cases, Code Submissions, and Drafts
-- ==============================================================================

-- 1. PRACTICE PROBLEMS
CREATE TABLE practice_problems (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(32) NOT NULL DEFAULT 'EASY', -- EASY, MEDIUM, HARD
    category VARCHAR(100) NOT NULL DEFAULT 'Algorithms',
    topic_tags TEXT, -- Comma-separated: "Arrays, Hash Table, Two Pointers"
    constraints TEXT,
    hints TEXT,
    time_limit_ms INT NOT NULL DEFAULT 2000,
    memory_limit_kb INT NOT NULL DEFAULT 128000,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    author_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_practice_problems_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_practice_problems_tenant ON practice_problems(tenant_id, is_published);
CREATE INDEX idx_practice_problems_slug ON practice_problems(tenant_id, slug);

-- 2. PROBLEM CODE TEMPLATES (Language Starter & Reference Solutions)
CREATE TABLE practice_problem_templates (
    id VARCHAR(64) PRIMARY KEY,
    problem_id VARCHAR(64) NOT NULL REFERENCES practice_problems(id) ON DELETE CASCADE,
    language VARCHAR(32) NOT NULL, -- java, python, cpp, c, javascript, sql
    starter_code TEXT NOT NULL,
    solution_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_practice_templates_problem_lang UNIQUE (problem_id, language)
);

CREATE INDEX idx_practice_templates_problem ON practice_problem_templates(problem_id);

-- 3. TEST CASES (Sample Public vs Hidden Evaluation Cases)
CREATE TABLE practice_test_cases (
    id VARCHAR(64) PRIMARY KEY,
    problem_id VARCHAR(64) NOT NULL REFERENCES practice_problems(id) ON DELETE CASCADE,
    input_data TEXT,
    expected_output TEXT NOT NULL,
    explanation TEXT,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    weight_points INT NOT NULL DEFAULT 10,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_practice_test_cases_problem ON practice_test_cases(problem_id, is_hidden);

-- 4. SUBMISSIONS
CREATE TABLE practice_submissions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id VARCHAR(64) NOT NULL REFERENCES practice_problems(id) ON DELETE CASCADE,
    language VARCHAR(32) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED', -- QUEUED, RUNNING, COMPLETED, FAILED
    verdict VARCHAR(64) NOT NULL, -- ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, COMPILATION_ERROR, RUNTIME_ERROR, INTERNAL_JUDGE_ERROR
    score INT NOT NULL DEFAULT 0,
    passed_count INT NOT NULL DEFAULT 0,
    total_count INT NOT NULL DEFAULT 0,
    execution_time_ms INT,
    memory_used_kb INT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_practice_submissions_user ON practice_submissions(tenant_id, user_id, problem_id);
CREATE INDEX idx_practice_submissions_tenant ON practice_submissions(tenant_id, problem_id);

-- 5. SUBMISSION TEST CASE RESULTS
CREATE TABLE practice_submission_results (
    id VARCHAR(64) PRIMARY KEY,
    submission_id VARCHAR(64) NOT NULL REFERENCES practice_submissions(id) ON DELETE CASCADE,
    test_case_id VARCHAR(64) REFERENCES practice_test_cases(id) ON DELETE CASCADE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL, -- PASSED, FAILED, TIMEOUT, ERROR
    actual_output TEXT,
    error_message TEXT,
    execution_time_ms INT,
    memory_used_kb INT
);

CREATE INDEX idx_practice_sub_results_sub ON practice_submission_results(submission_id);

-- 6. AUTOSAVED DRAFTS
CREATE TABLE practice_drafts (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id VARCHAR(64) NOT NULL REFERENCES practice_problems(id) ON DELETE CASCADE,
    language VARCHAR(32) NOT NULL,
    code TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_practice_drafts_user_problem_lang UNIQUE (tenant_id, user_id, problem_id, language)
);

CREATE INDEX idx_practice_drafts_lookup ON practice_drafts(tenant_id, user_id, problem_id);
