-- ==============================================================================
-- KAIZENQ AI LMS SAAS - V8 CAREERS & INTERNSHIP PORTAL ENHANCEMENTS
-- Enhanced Career Openings, Departments, Reference Numbers, CSV Export & Withdrawals
-- ==============================================================================

-- 1. ADD NEW COLUMNS TO INTERNSHIPS (CAREER OPENINGS)
ALTER TABLE internships ADD COLUMN IF NOT EXISTS employment_type VARCHAR(32) DEFAULT 'INTERNSHIP';
ALTER TABLE internships ADD COLUMN IF NOT EXISTS experience_level VARCHAR(32) DEFAULT 'ENTRY_LEVEL';
ALTER TABLE internships ADD COLUMN IF NOT EXISTS preferred_skills TEXT;
ALTER TABLE internships ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Engineering';

-- 2. ADD COLUMNS TO APPLICATIONS (REFERENCE NUMBERS & WITHDRAWAL AUDIT)
ALTER TABLE internship_applications ADD COLUMN IF NOT EXISTS reference_number VARCHAR(64);
ALTER TABLE internship_applications ADD COLUMN IF NOT EXISTS withdrawal_reason TEXT;
ALTER TABLE internship_applications ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMP WITH TIME ZONE;

-- 3. CREATE INDEX FOR FAST REFERENCE NUMBER LOOKUPS
CREATE UNIQUE INDEX IF NOT EXISTS idx_internship_apps_ref_no ON internship_applications(reference_number);

-- 4. BACKFILL REFERENCE NUMBERS FOR ANY EXISTING APPLICATIONS
UPDATE internship_applications
SET reference_number = 'KZQ-APP-2026-' || UPPER(SUBSTRING(id, 1, 8))
WHERE reference_number IS NULL;

-- 5. UPDATE DEPARTMENTS FOR SEEDED INTERNSHIPS
UPDATE internships SET department = 'Engineering', employment_type = 'INTERNSHIP', experience_level = 'ENTRY_LEVEL'
WHERE domain IN ('Full Stack Web Development', 'Frontend Development', 'Backend Java Development');

UPDATE internships SET department = 'AI & Machine Learning', employment_type = 'INTERNSHIP', experience_level = 'ENTRY_LEVEL'
WHERE domain = 'Artificial Intelligence & Machine Learning';

UPDATE internships SET department = 'Data Science', employment_type = 'INTERNSHIP', experience_level = 'ENTRY_LEVEL'
WHERE domain = 'Data Science & Analytics';

UPDATE internships SET department = 'Cloud & Infrastructure', employment_type = 'INTERNSHIP', experience_level = 'ENTRY_LEVEL'
WHERE domain = 'Cloud Computing & DevOps';

UPDATE internships SET department = 'Product & Design', employment_type = 'INTERNSHIP', experience_level = 'ENTRY_LEVEL'
WHERE domain = 'UI/UX Design';

UPDATE internships SET department = 'Information Security', employment_type = 'INTERNSHIP', experience_level = 'ENTRY_LEVEL'
WHERE domain = 'Cybersecurity';

-- 6. SEED QA & TEST AUTOMATION INTERNSHIP OPENING
INSERT INTO internships (
    id, tenant_id, title, slug, domain, department, employment_type, experience_level, internship_type, duration, location, openings, deadline,
    stipend_type, stipend_amount, eligibility, required_skills, preferred_skills, description, responsibilities, learning_outcomes,
    mentor_name, mentor_title, status, is_featured, created_at, updated_at
) VALUES (
    'internship-qa-automation-09',
    'tenant-kaizenq-default',
    'QA & Automated Software Testing Internship',
    'qa-software-testing-internship',
    'QA / Testing',
    'Quality Engineering',
    'INTERNSHIP',
    'ENTRY_LEVEL',
    'REMOTE',
    '8 Weeks',
    'Remote, India',
    10,
    CURRENT_TIMESTAMP + INTERVAL '45 days',
    'PERFORMANCE_BASED',
    'Incentive on Test Coverage + Verified Certificate',
    'Students pursuing B.Tech/B.E/BCA/MCA/B.Sc Computer Science. Strong grasp of software engineering fundamentals and bug lifecycles.',
    'Manual Testing, Test Case Design, Selenium, Postman, API Testing, Java/Python, Git',
    'Cypress, Playwright, CI/CD Test Pipeline integration, JMeter performance testing',
    'Gain hands-on software quality assurance and automation experience by building robust regression test suites, executing API integration tests, and discovering edge cases across the KaizenQ ecosystem.',
    'Write test plans and test case specifications for core features. Build automated browser tests using Selenium and Playwright. Perform API automated testing using Postman/Newman. Document bug reports with reproduction steps.',
    'Master functional, integration, regression, and performance testing methodologies. Write production-ready automated UI and API test suites. Understand CI/CD automated test reporting.',
    'Pooja Sharma',
    'Principal QA Automation Engineer',
    'OPEN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Tasks for QA Internship
INSERT INTO internship_tasks (
    id, internship_id, week_number, title, description, deliverables, max_score, display_order, created_at
) VALUES
(
    'task-qa-01',
    'internship-qa-automation-09',
    1,
    'Week 1: Test Planning, Bug Life Cycle & Manual Test Case Design',
    'Understand software testing fundamentals, requirement analysis, and test case documentation.',
    'Test Plan document and Excel/Notion Test Cases for Authentication & Course Enrollment workflows.',
    100,
    1,
    CURRENT_TIMESTAMP
),
(
    'task-qa-02',
    'internship-qa-automation-09',
    2,
    'Week 2: REST API Testing & Automation with Postman',
    'Perform end-to-end API testing of JSON endpoints, status codes, headers, and payload validation.',
    'Exported Postman Collection with automated test scripts (assert status 200, schema validations, JWT auth chaining).',
    100,
    2,
    CURRENT_TIMESTAMP
),
(
    'task-qa-03',
    'internship-qa-automation-09',
    3,
    'Week 3: Browser UI Automation with Selenium WebDriver',
    'Build Page Object Model (POM) automated tests in Java or Python for web forms and user interactions.',
    'GitHub repository with Selenium suite running headless Chrome tests for login, search, and form submissions.',
    100,
    3,
    CURRENT_TIMESTAMP
),
(
    'task-qa-04',
    'internship-qa-automation-09',
    4,
    'Week 4: Performance Testing & CI/CD Pipeline Integration',
    'Execute load tests using JMeter and integrate the automated test suite into GitHub Actions CI pipeline.',
    'GitHub Actions workflow YAML file and JMeter performance report analyzing response times under 100 concurrent requests.',
    100,
    4,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
