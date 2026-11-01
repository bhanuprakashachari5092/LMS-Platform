-- ==============================================================================
-- KAIZENQ AI LMS SAAS - V7 CAREERS & INTERNSHIP PORTAL
-- Internships, Applications, Interviews, Enrollments, Tasks, Submissions & Certificates
-- ==============================================================================

-- 1. INTERNSHIPS (Program Listings)
CREATE TABLE internships (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL, -- Full Stack, Frontend, Backend Java, AI & ML, Data Science, UI/UX, Cloud & DevOps, Cybersecurity
    internship_type VARCHAR(32) NOT NULL DEFAULT 'REMOTE', -- REMOTE, HYBRID, ONSITE
    duration VARCHAR(64) NOT NULL DEFAULT '12 Weeks',
    location VARCHAR(100) DEFAULT 'Remote, India',
    openings INT NOT NULL DEFAULT 10,
    deadline TIMESTAMP WITH TIME ZONE,
    stipend_type VARCHAR(32) NOT NULL DEFAULT 'PERFORMANCE_BASED', -- UNPAID, PERFORMANCE_BASED, FIXED
    stipend_amount VARCHAR(100) DEFAULT 'Performance Incentive + Certification',
    eligibility TEXT NOT NULL,
    required_skills TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    learning_outcomes TEXT,
    mentor_name VARCHAR(100) DEFAULT 'KaizenQ Senior Industry Mentor',
    mentor_title VARCHAR(100) DEFAULT 'Staff Software Architect',
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED, ARCHIVED
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_internships_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_internships_tenant_status ON internships(tenant_id, status);
CREATE INDEX idx_internships_domain ON internships(tenant_id, domain);
CREATE INDEX idx_internships_slug ON internships(tenant_id, slug);

-- 2. INTERNSHIP APPLICATIONS
CREATE TABLE internship_applications (
    id VARCHAR(64) PRIMARY KEY,
    internship_id VARCHAR(64) NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    college VARCHAR(255) NOT NULL,
    degree VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    current_year VARCHAR(32) NOT NULL, -- 1st Year, 2nd Year, 3rd Year, 4th Year, Graduate
    graduation_year INT NOT NULL,
    skills TEXT NOT NULL,
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    statement_of_purpose TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, SELECTED, REJECTED
    admin_notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_internship_app_internship_email UNIQUE (internship_id, email)
);

CREATE INDEX idx_internship_apps_internship ON internship_applications(internship_id, status);
CREATE INDEX idx_internship_apps_tenant_user ON internship_applications(tenant_id, user_id);
CREATE INDEX idx_internship_apps_email ON internship_applications(email);

-- 3. INTERNSHIP INTERVIEWS
CREATE TABLE internship_interviews (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL REFERENCES internship_applications(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_link TEXT,
    interviewer_name VARCHAR(100) DEFAULT 'Technical Evaluation Team',
    round_name VARCHAR(100) DEFAULT 'Technical & Culture Fit',
    feedback TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internship_interviews_app ON internship_interviews(application_id);

-- 4. INTERNSHIP ENROLLMENTS (Active Student Cohort)
CREATE TABLE internship_enrollments (
    id VARCHAR(64) PRIMARY KEY,
    internship_id VARCHAR(64) NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    application_id VARCHAR(64) REFERENCES internship_applications(id) ON DELETE SET NULL,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, DROPPED
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    completion_date DATE,
    progress_percentage INT NOT NULL DEFAULT 0,
    mentor_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_internship_enrollment_user UNIQUE (internship_id, user_id)
);

CREATE INDEX idx_internship_enrollments_user ON internship_enrollments(user_id);
CREATE INDEX idx_internship_enrollments_internship ON internship_enrollments(internship_id);

-- 5. INTERNSHIP TASKS & MILESTONES
CREATE TABLE internship_tasks (
    id VARCHAR(64) PRIMARY KEY,
    internship_id VARCHAR(64) NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    week_number INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    deliverables TEXT,
    max_score INT NOT NULL DEFAULT 100,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internship_tasks_internship ON internship_tasks(internship_id, week_number);

-- 6. INTERNSHIP SUBMISSIONS
CREATE TABLE internship_submissions (
    id VARCHAR(64) PRIMARY KEY,
    enrollment_id VARCHAR(64) NOT NULL REFERENCES internship_enrollments(id) ON DELETE CASCADE,
    task_id VARCHAR(64) NOT NULL REFERENCES internship_tasks(id) ON DELETE CASCADE,
    repo_url TEXT,
    live_demo_url TEXT,
    notes TEXT,
    score INT,
    feedback TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, REVIEWED, REVISION_REQUESTED, APPROVED
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_internship_sub_enrollment_task UNIQUE (enrollment_id, task_id)
);

CREATE INDEX idx_internship_subs_enrollment ON internship_submissions(enrollment_id);

-- 7. INTERNSHIP CERTIFICATES
CREATE TABLE internship_certificates (
    id VARCHAR(64) PRIMARY KEY,
    enrollment_id VARCHAR(64) NOT NULL REFERENCES internship_enrollments(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    certificate_number VARCHAR(64) NOT NULL UNIQUE,
    student_name VARCHAR(255) NOT NULL,
    internship_title VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    duration VARCHAR(64) NOT NULL,
    issue_date DATE NOT NULL,
    verification_hash VARCHAR(128) NOT NULL,
    pdf_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'VALID',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internship_certs_number ON internship_certificates(certificate_number);
CREATE INDEX idx_internship_certs_user ON internship_certificates(user_id);

-- ==============================================================================
-- SEED INITIAL PROFESSIONAL INTERNSHIP PROGRAMS
-- ==============================================================================

INSERT INTO internships (
    id, tenant_id, title, slug, domain, internship_type, duration, location, openings,
    deadline, stipend_type, stipend_amount, eligibility, required_skills, description,
    responsibilities, learning_outcomes, mentor_name, mentor_title, status, is_featured
) VALUES
(
    'int-fullstack-web-01',
    'tenant-kaizenq-default',
    'Full Stack Web Development Virtual Internship',
    'full-stack-web-development-internship',
    'Full Stack Web Development',
    'REMOTE',
    '12 Weeks',
    'Remote, India',
    15,
    CURRENT_TIMESTAMP + INTERVAL '45 days',
    'PERFORMANCE_BASED',
    'Performance Stipend + Industry Verified Certificate',
    'B.Tech / B.E / BCA / MCA / B.Sc CS (2024 - 2027 Batches). Strong curiosity for building production-grade web applications.',
    'React, TypeScript, Node.js, Express, PostgreSQL, REST APIs, Git & GitHub',
    'Join KaizenQ as a Full Stack Web Development Intern to architect and ship scalable web applications. Work directly on production workflows, building modern reactive frontends, resilient micro-services, and relational schema migrations.',
    '- Build modular UI components with React 19, TypeScript, and Tailwind CSS\n- Design and implement RESTful endpoints with Node.js and PostgreSQL\n- Integrate authentication, JWT session handling, and database indexing\n- Write unit tests and participate in automated CI/CD pipeline deployments\n- Present your capstone full-stack architecture to engineering mentors',
    '- End-to-end full stack architecture competence\n- Production database schema design and Flyway migrations\n- State management and API integration best practices\n- Verified Industry Experience Certificate and Letter of Recommendation',
    'Dr. Aris Thorne',
    'Principal Software Architect, KaizenQ',
    'OPEN',
    TRUE
),
(
    'int-frontend-react-02',
    'tenant-kaizenq-default',
    'Frontend & Design Systems Engineering Internship',
    'frontend-react-engineering-internship',
    'Frontend Development',
    'REMOTE',
    '8 Weeks',
    'Remote, India',
    12,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'PERFORMANCE_BASED',
    'Project Completion Stipend + Certificate',
    'Undergraduates or Recent Graduates in Computer Science, IT, or related fields with hands-on JavaScript/React project experience.',
    'React, Modern JavaScript (ES2024), TypeScript, Tailwind CSS, Monaco Editor, Responsive Design',
    'Focus on frontend excellence, interactive web editors, design systems, and micro-animations. You will engineer fluid, accessible student interfaces that power millions of code executions and learning interactions.',
    '- Implement accessible UI components compliant with WCAG standards\n- Build high-performance code editor tooling using Monaco Editor and web workers\n- Optimize bundle sizes, lazy-loading chunks, and core web vitals\n- Work with Tailwind CSS, Framer Motion, and dark mode theming',
    '- Deep mastery of React 19 component lifecycle and hooks\n- Experience building complex editor tooling and interactive canvas components\n- Portfolio-ready capstone web project',
    'Elena Vance',
    'Head of Frontend Engineering',
    'OPEN',
    TRUE
),
(
    'int-backend-java-03',
    'tenant-kaizenq-default',
    'Backend Engineering (Java 21 & Spring Boot 3) Internship',
    'backend-java-spring-boot-internship',
    'Backend Development',
    'HYBRID',
    '12 Weeks',
    'Hyderabad / Remote, India',
    10,
    CURRENT_TIMESTAMP + INTERVAL '40 days',
    'FIXED',
    '₹12,000 / month + Official Internship Certificate',
    '3rd & 4th Year engineering students or MCA graduates with solid foundation in Object-Oriented Programming and Data Structures.',
    'Java 21, Spring Boot 3, Spring Security, JPA/Hibernate, PostgreSQL, Docker, Redis',
    'Engineer resilient, multi-tenant cloud backends capable of serving enterprise learning systems. You will construct high-throughput REST APIs, multi-tenant database isolation strategies, and secure OAuth/JWT security filters.',
    '- Develop enterprise REST APIs using Spring Boot 3 and Java 21\n- Implement database migrations, connection pooling with HikariCP, and PostgreSQL indexing\n- Secure endpoints with Spring Security 6 and stateless JWT tokens\n- Profile API latencies, write automated JUnit 5 and Mockito test suites',
    '- Enterprise Java and modern cloud architecture capabilities\n- Hands-on experience with multi-tenant SaaS data isolation\n- Official Internship Experience Certificate with verification QR',
    'Vikramaditya Roy',
    'Staff Backend Architect',
    'OPEN',
    TRUE
),
(
    'int-ai-ml-gemini-04',
    'tenant-kaizenq-default',
    'AI & Machine Learning (Generative AI) Internship',
    'ai-ml-generative-ai-internship',
    'Artificial Intelligence & Machine Learning',
    'REMOTE',
    '12 Weeks',
    'Remote, India',
    8,
    CURRENT_TIMESTAMP + INTERVAL '35 days',
    'PERFORMANCE_BASED',
    'Performance Stipend + AI Research Certificate',
    'Students or aspiring AI engineers with proficiency in Python, prompt engineering, and foundational understanding of deep learning and LLMs.',
    'Python, Google Gemini API, PyTorch, LangChain, Vector Databases, FastEmbed, Retrieval-Augmented Generation (RAG)',
    'Build intelligent educational agents, multimodal code debuggers, and knowledge retrieval systems. You will work on real Generative AI pipelines that help students learn concepts faster through dynamic explanation and code synthesis.',
    '- Design RAG workflows indexing thousands of technical documentation pages\n- Fine-tune and evaluate LLM prompt chains using Google Gemini 2.5\n- Build real-time streaming AI chat and voice assistant integrations\n- Benchmark hallucination rates and safety guardrails',
    '- Production Generative AI and vector database expertise\n- Hands-on experience deploying LLM endpoints at scale\n- Co-authorship credit on internal AI technical whitepapers',
    'Siddharth Menon',
    'Lead AI Research Engineer',
    'OPEN',
    TRUE
),
(
    'int-cloud-devops-05',
    'tenant-kaizenq-default',
    'Cloud Computing & DevOps Engineering Internship',
    'cloud-computing-devops-internship',
    'Cloud Computing & DevOps',
    'REMOTE',
    '10 Weeks',
    'Remote, India',
    6,
    CURRENT_TIMESTAMP + INTERVAL '25 days',
    'PERFORMANCE_BASED',
    'Performance Stipend + Cloud Certificate',
    'Students enthusiastic about Linux systems administration, containers, and automated cloud infrastructure.',
    'Docker, Kubernetes, Linux/Bash, GitHub Actions CI/CD, AWS / GCP, Terraform, Prometheus',
    'Automate the software delivery lifecycle. You will containerize microservices, build robust GitHub Actions workflows, set up telemetry dashboards, and maintain Kubernetes cluster deployments.',
    '- Write production Dockerfiles and multi-stage container builds\n- Build CI/CD pipelines automating linting, testing, and cloud deployments\n- Monitor server metrics, error logs, and cluster health using Prometheus\n- Implement Infrastructure as Code (IaC) with Terraform',
    '- Practical container orchestration and CI/CD mastery\n- Real cloud infrastructure operational experience\n- Verified DevOps Internship Credential',
    'Kavita Sharma',
    'Senior Cloud Infrastructure Engineer',
    'OPEN',
    FALSE
),
(
    'int-data-science-06',
    'tenant-kaizenq-default',
    'Data Science & Learning Analytics Internship',
    'data-science-learning-analytics-internship',
    'Data Science',
    'REMOTE',
    '8 Weeks',
    'Remote, India',
    8,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'PERFORMANCE_BASED',
    'Certificate + Analytics Portfolio Projects',
    'Students in CS, Data Science, Statistics, or Math with strong analytical intuition and Python skills.',
    'Python, Pandas, NumPy, SQL, Seaborn/Plotly, Scikit-Learn, Statistical Modeling',
    'Analyze student learning progression, quiz score distributions, and drop-off factors to optimize educational outcomes across all KaizenQ learning modules.',
    '- Clean, normalize, and query high-volume student interaction telemetry\n- Develop predictive models for student course completion likelihood\n- Build automated analytical dashboards and visual reports\n- Conduct A/B testing on gamification and quiz completion rates',
    '- Applied data science and statistical analysis portfolio\n- SQL query optimization and exploratory data analysis mastery\n- Recognized Data Science Internship Certificate',
    'Ananya Rao',
    'Staff Data Scientist',
    'OPEN',
    FALSE
),
(
    'int-ui-ux-design-07',
    'tenant-kaizenq-default',
    'UI/UX Design & Product Strategy Internship',
    'ui-ux-design-product-internship',
    'UI/UX Design',
    'REMOTE',
    '8 Weeks',
    'Remote, India',
    5,
    CURRENT_TIMESTAMP + INTERVAL '20 days',
    'PERFORMANCE_BASED',
    'Stipend + Design Portfolio Showcase',
    'Design enthusiasts, HCI students, or self-taught UI/UX creators with a public Figma or Behance portfolio.',
    'Figma, Wireframing, High-Fidelity Prototyping, Design Systems, User Research, WCAG Accessibility',
    'Craft the visual and interactive future of KaizenQ. From student dashboards and code execution sandboxes to mobile responsive learning views, you will shape intuitive, delightful digital interfaces.',
    '- Create interactive prototypes and design system component libraries in Figma\n- Conduct user interviews and usability tests with engineering students\n- Collaborate with frontend engineers to ensure pixel-perfect implementation\n- Audit interface accessibility and color contrast compliance',
    '- High-impact design portfolio with real shipped features\n- Design systems and design tokens workflow experience\n- Verified Design Internship Certificate',
    'Rohan Kulkarni',
    'Lead Product Designer',
    'OPEN',
    FALSE
),
(
    'int-cybersecurity-08',
    'tenant-kaizenq-default',
    'Cybersecurity & Application Security Internship',
    'cybersecurity-appsec-internship',
    'Cybersecurity',
    'REMOTE',
    '10 Weeks',
    'Remote, India',
    5,
    CURRENT_TIMESTAMP + INTERVAL '35 days',
    'PERFORMANCE_BASED',
    'Security Research Stipend + Certificate',
    'Passionate students exploring ethical hacking, web application penetration testing, and security auditing.',
    'OWASP Top 10, Burp Suite, Network Security, Cryptography, Secure Code Review, Linux Auditing',
    'Audit codebases for vulnerabilities, test authentication bypass vectors, evaluate multi-tenant data leak points, and ensure compliance with strict privacy and security standards.',
    '- Perform vulnerability assessments across web application endpoints\n- Analyze JWT token handling, CSRF protections, and SQL injection risks\n- Review cryptographic hash implementations for certificate verification\n- Write actionable security mitigation reports for development teams',
    '- Hands-on application security auditing experience\n- Industry-standard vulnerability remediation reporting\n- Official Cybersecurity Internship Credential',
    'Devendra Patel',
    'Chief Information Security Officer',
    'OPEN',
    FALSE
);

-- Seed Initial Tasks for Full Stack Web Development
INSERT INTO internship_tasks (id, internship_id, week_number, title, description, deliverables, max_score, display_order)
VALUES
('task-fs-w1', 'int-fullstack-web-01', 1, 'Development Environment Setup & Git Workflow', 'Initialize project repositories, configure ESLint, Prettier, TypeScript, and establish branch protection rules.', 'GitHub repository link with initial commit and PR template.', 100, 1),
('task-fs-w2', 'int-fullstack-web-01', 2, 'Responsive UI Architecture & Design System', 'Construct atomic UI component library adhering to KaizenQ design tokens using Tailwind CSS.', 'Vite + React application link hosted on Vercel/Netlify.', 100, 2),
('task-fs-w3', 'int-fullstack-web-01', 3, 'Relational Database Modeling & Flyway Migrations', 'Draft comprehensive PostgreSQL schema with indexes, foreign keys, and write migration scripts.', 'Database ER diagram and Flyway migration SQL scripts.', 100, 3),
('task-fs-w4', 'int-fullstack-web-01', 4, 'Secure JWT Authentication & Role-Based Access Control', 'Build backend authentication endpoints with bcrypt password hashing, refresh tokens, and RBAC.', 'Working Postman collection and backend pull request.', 100, 4),
('task-fs-w5', 'int-fullstack-web-01', 5, 'Final Capstone Project Deployment & Presentation', 'Deploy full-stack web application to production with automated CI/CD and present architecture.', 'Live production URL, GitHub repository, and 5-minute video walkthrough.', 100, 5);

