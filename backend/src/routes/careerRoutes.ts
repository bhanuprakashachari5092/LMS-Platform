import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../firebase';
import {
  parseApplicationRequest,
  validateResumeFile,
  storeResumeBuffer,
  getResumeBuffer,
} from '../utils/internshipApplicationUtils';
import { sendInternshipApplicationEmails } from '../services/email/internshipEmailService';

const router = Router();

// In-memory rate limiting map for basic spam protection
const submissionRateMap = new Map<string, number>();

/**
 * Formula injection sanitizer
 */
function sanitizeInput(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/**
 * Opportunity Record Interface supporting all 19 standard fields
 */
export interface OpportunityRecord {
  id: string;
  title: string;
  slug: string;
  domain: string;
  department: string;
  employmentType: 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | string;
  internshipType: 'REMOTE' | 'HYBRID' | 'ONSITE' | string;
  duration: string;
  location: string;
  openings: number;
  deadline?: string;
  stipendType: 'PERFORMANCE_BASED' | 'PAID' | 'UNPAID' | 'NOT_DISCLOSED' | string;
  stipendAmount: string;
  eligibility: string;
  requiredSkills: string;
  preferredSkills?: string;
  description: string;
  curriculum?: string;
  learningOutcomes?: string;
  responsibilities?: string;
  status: 'DRAFT' | 'OPEN' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED' | 'DELETED' | string;
  isDeleted?: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const MEMORY_OPPORTUNITIES: OpportunityRecord[] = [
  {
    id: 'int-fullstack-web-01',
    title: 'Full Stack Web Development Virtual Internship',
    slug: 'full-stack-web-development-internship',
    domain: 'Full Stack Web Development',
    department: 'Engineering',
    employmentType: 'INTERNSHIP',
    internshipType: 'REMOTE',
    duration: '12 Weeks',
    location: 'Remote, India',
    openings: 15,
    deadline: '2027-01-01T00:00:00Z',
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'B.Tech / B.E / BCA / MCA / B.Sc CS (2024 - 2028 Batches). Strong curiosity for building production-grade web apps.',
    requiredSkills: 'React, TypeScript, Node.js, Express, PostgreSQL, REST APIs, Git & GitHub',
    preferredSkills: 'Docker, AWS, Tailwind CSS',
    description: 'Build modular reactive frontends, resilient microservices, and database migrations on production repositories with code reviews and mentor guidance.',
    curriculum: 'Week 1-3: Modern React 19, TypeScript & Design Systems\nWeek 4-6: Node.js, Express, REST APIs & PostgreSQL\nWeek 7-9: Authentication, JWT, Redis & CI/CD Pipelines\nWeek 10-12: Full Stack Capstone Deployment & Mentor Reviews',
    responsibilities: '• Build modular UI components with React 19 and Tailwind CSS\n• Design RESTful endpoints and PostgreSQL schemas\n• Integrate authentication, JWT session handling, and database indexing\n• Participate in CI/CD pipeline deployments and code reviews',
    learningOutcomes: 'End-to-end full stack architecture competence, database schema design, and verified production portfolio.',
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'int-frontend-react-02',
    title: 'Frontend & Design Systems Engineering Internship',
    slug: 'frontend-react-engineering-internship',
    domain: 'Frontend Development',
    department: 'Engineering',
    employmentType: 'INTERNSHIP',
    internshipType: 'REMOTE',
    duration: '8 Weeks',
    location: 'Remote, India',
    openings: 12,
    deadline: '2027-01-01T00:00:00Z',
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'All Engineering and CS graduates/undergraduates. Passionate about modern UI, typography, and component architecture.',
    requiredSkills: 'React 19, TypeScript, Tailwind CSS, Framer Motion, HTML5, CSS Grid, Figma to Code',
    preferredSkills: 'Next.js, Storybook, Vite',
    description: 'Design and implement accessible, high-performance web interfaces and reusable UI component libraries for next-generation learning platforms.',
    curriculum: 'Week 1-2: Atomic Component Architecture & Accessibility Standards\nWeek 3-4: Design Tokens, Framer Motion & Responsive Layouts\nWeek 5-6: State Management, Form Validation & Performance Profiling\nWeek 7-8: Production Design System Package & Documentation',
    responsibilities: '• Architect atomic UI components and tokens\n• Optimize client bundle sizes and web vitals\n• Translate Figma mockups into reactive, accessible layouts',
    learningOutcomes: 'Mastery of design tokens, accessible DOM landmarks, and reactive state performance.',
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'int-ai-ml-03',
    title: 'Artificial Intelligence & Machine Learning Internship',
    slug: 'ai-ml-engineering-internship',
    domain: 'Artificial Intelligence & Machine Learning',
    department: 'AI & Machine Learning',
    employmentType: 'INTERNSHIP',
    internshipType: 'REMOTE',
    duration: '12 Weeks',
    location: 'Remote, India',
    openings: 10,
    deadline: '2027-01-01T00:00:00Z',
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Curious builders with solid Python fundamentals, linear algebra, and basic neural network concepts.',
    requiredSkills: 'Python, PyTorch, LangChain, Gemini API, RAG Pipelines, Vector DBs, Scikit-learn',
    preferredSkills: 'Hugging Face, FastEmbed, ChromaDB',
    description: 'Develop intelligent LLM agent pipelines, semantic embeddings, document retrieval, and structured evaluation benchmarks.',
    curriculum: 'Week 1-3: Embeddings, Vector Databases & Semantic Search\nWeek 4-6: RAG Retrieval Architectures & Chunking Strategies\nWeek 7-9: Multi-Agent Workflows & Gemini Function Calling\nWeek 10-12: End-to-End LLM Application Benchmarking & Deployment',
    responsibilities: '• Construct semantic chunking and RAG retrieval pipelines\n• Benchmark prompt strategies and structured function calling\n• Build multi-agent orchestration workflows',
    learningOutcomes: 'Production knowledge of LLM embeddings, RAG optimization, and agentic workflows.',
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'int-data-science-04',
    title: 'Data Science & Predictive Analytics Internship',
    slug: 'data-science-analytics-internship',
    domain: 'Data Science',
    department: 'Data Science',
    employmentType: 'INTERNSHIP',
    internshipType: 'REMOTE',
    duration: '8 Weeks',
    location: 'Remote, India',
    openings: 8,
    deadline: '2027-01-01T00:00:00Z',
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Students with passion for statistical modeling, exploratory data analysis, and dashboarding.',
    requiredSkills: 'Python, Pandas, NumPy, SQL, Seaborn, Statistical Hypothesis Testing, Jupyter',
    preferredSkills: 'Tableau, Scikit-learn, BigQuery',
    description: 'Transform raw behavioral datasets into actionable analytical insights, predictive models, and interactive visualizations.',
    curriculum: 'Week 1-2: Exploratory Data Analysis & Statistical Wrangling\nWeek 3-4: Hypothesis Testing & Feature Engineering\nWeek 5-6: Predictive Regression & Classification Models\nWeek 7-8: Interactive Analytics Dashboard & Business Insights Report',
    responsibilities: '• Perform data wrangling, cleaning, and exploratory data analysis\n• Train regression and classification models\n• Generate automated statistical reports',
    learningOutcomes: 'Data engineering pipelines, statistical analysis, and interactive data visualization.',
    status: 'PUBLISHED',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'int-devops-cloud-05',
    title: 'Cloud Computing & DevOps Virtual Internship',
    slug: 'cloud-devops-internship',
    domain: 'Cloud Computing & DevOps',
    department: 'Cloud & Infrastructure',
    employmentType: 'INTERNSHIP',
    internshipType: 'REMOTE',
    duration: '10 Weeks',
    location: 'Remote, India',
    openings: 6,
    deadline: '2027-01-01T00:00:00Z',
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Passionate about Linux servers, containers, infrastructure automation, and automated deployment pipelines.',
    requiredSkills: 'Linux, Docker, Kubernetes, GitHub Actions, Bash Scripting, Nginx, Cloudflare',
    preferredSkills: 'Terraform, Helm, Prometheus',
    description: 'Configure automated CI/CD pipelines, containerize microservices, monitor server clusters, and manage container orchestrations.',
    curriculum: 'Week 1-3: Linux Server Hardening & Multi-Stage Docker Builds\nWeek 4-6: Kubernetes Cluster Orchestration, Ingress & Deployments\nWeek 7-8: Automated CI/CD Pipelines with GitHub Actions\nWeek 9-10: Cluster Observability, Prometheus Monitoring & Cloudflare CDN',
    responsibilities: '• Maintain multi-stage Docker builds and minimal runtime images\n• Author GitHub Actions CI/CD workflows\n• Manage Kubernetes pods, services, and ingress rules',
    learningOutcomes: 'Production DevOps practices, automated deployments, and container orchestration.',
    status: 'PUBLISHED',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'int-uiux-design-06',
    title: 'UI/UX Design & Product Strategy Internship',
    slug: 'ui-ux-design-product-internship',
    domain: 'UI/UX Design',
    department: 'Product & Design',
    employmentType: 'INTERNSHIP',
    internshipType: 'REMOTE',
    duration: '8 Weeks',
    location: 'Remote, India',
    openings: 8,
    deadline: '2027-01-01T00:00:00Z',
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Design enthusiasts with a keen eye for visual hierarchy, typography, interaction design, and user psychology.',
    requiredSkills: 'Figma, Design Systems, Wireframing, Rapid Prototyping, Usability Testing',
    preferredSkills: 'Motion Design, Protopie, User Journey Mapping',
    description: 'Create intuitive user experiences, conduct usability research, design interactive high-fidelity prototypes, and build cohesive design tokens.',
    curriculum: 'Week 1-2: User Psychology, Information Architecture & Wireframing\nWeek 3-4: Design Tokens, Typography & Figma Component Variants\nWeek 5-6: High-Fidelity Interactive Prototyping & Micro-Interactions\nWeek 7-8: Usability Testing, Heuristic Evaluation & Design System Specs',
    responsibilities: '• Create user flows and wireframes for new product features\n• Build interactive prototypes in Figma\n• Conduct user testing sessions and document findings',
    learningOutcomes: 'Comprehensive product design lifecycle, UX research, and design system creation.',
    status: 'PUBLISHED',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'int-cybersecurity-07',
    title: 'Cybersecurity & Secure Code Architecture Internship',
    slug: 'cybersecurity-secure-code-internship',
    domain: 'Cybersecurity',
    department: 'Information Security',
    employmentType: 'INTERNSHIP',
    internshipType: 'REMOTE',
    duration: '10 Weeks',
    location: 'Remote, India',
    openings: 5,
    deadline: '2027-01-01T00:00:00Z',
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Basic networking and operating system knowledge. Familiarity with web vulnerability models.',
    requiredSkills: 'OWASP Top 10, Network Security, Wireshark, Burp Suite, Cryptography, Security Auditing',
    preferredSkills: 'Linux Forensics, Metasploit, Secure Code Review',
    description: 'Perform static code vulnerability scans, secure API endpoints, verify cryptographic proofs, and write audit reports.',
    curriculum: 'Week 1-3: Network Fundamentals, Packet Analysis & Threat Models\nWeek 4-6: OWASP Top 10 Vulnerability Assessment & Web Penetration Testing\nWeek 7-8: Cryptographic Protocols, Token Security & Secure Code Reviews\nWeek 9-10: Vulnerability Disclosure Reports & Remediation Verification',
    responsibilities: '• Perform vulnerability scans and penetration tests on staging builds\n• Audit authentication flows and token security\n• Author security compliance reports and remediation guides',
    learningOutcomes: 'Industry penetration testing, vulnerability remediation, and security compliance.',
    status: 'PUBLISHED',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'int-qa-testing-08',
    title: 'QA & Automated Testing Engineering Internship',
    slug: 'qa-automated-testing-internship',
    domain: 'QA / Testing',
    department: 'Quality Engineering',
    employmentType: 'INTERNSHIP',
    internshipType: 'REMOTE',
    duration: '8 Weeks',
    location: 'Remote, India',
    openings: 6,
    deadline: '2027-01-01T00:00:00Z',
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Detail-oriented developers interested in software reliability, test coverage, and test automation frameworks.',
    requiredSkills: 'JavaScript / TypeScript, Playwright, Jest, API Testing with Postman, CI Integration',
    preferredSkills: 'Cypress, k6 Load Testing, Docker',
    description: 'Write end-to-end integration and smoke tests, automate regression suites, and verify production release readiness.',
    curriculum: 'Week 1-2: Test Strategy, Boundary Value Analysis & Unit Testing with Jest\nWeek 3-4: REST API Integration Testing & Postman Collections\nWeek 5-6: End-to-End Browser Automation with Playwright\nWeek 7-8: CI Regression Suites in GitHub Actions & Defect Reporting',
    responsibilities: '• Develop Playwright end-to-end test suites\n• Automate smoke test pipelines in GitHub Actions\n• Log and track defects in issue trackers',
    learningOutcomes: 'Modern automated testing practices, regression pipelines, and test coverage optimization.',
    status: 'PUBLISHED',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

// In-memory tracking of deleted opportunities
const DELETED_OPPORTUNITY_IDS = new Set<string>();

// Fallback memory applications store
const MEMORY_APPLICATIONS: any[] = [];

/**
 * Helper to get opportunities from Firestore or Memory fallback.
 * Automatically seeds Firestore once on first run if collection is uninitialized.
 */
async function getOpportunities(): Promise<OpportunityRecord[]> {
  if (db) {
    try {
      // Sync known deletions from Firestore metadata
      try {
        const delSnap = await db.collection('careers_meta').doc('deletions').get();
        if (delSnap.exists && Array.isArray(delSnap.data()?.ids)) {
          delSnap.data()!.ids.forEach((id: string) => DELETED_OPPORTUNITY_IDS.add(id));
        }
      } catch {}

      const snap = await db.collection('careers').get();
      if (!snap.empty) {
        return snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as OpportunityRecord))
          .filter((op) => !DELETED_OPPORTUNITY_IDS.has(op.id) && op.status !== 'DELETED' && !(op as any).isDeleted);
      } else {
        // Only seed initial opportunities if NOT already initialized and NO deletions occurred
        let alreadyInit = false;
        try {
          const initSnap = await db.collection('careers_meta').doc('init').get();
          alreadyInit = initSnap.exists;
        } catch {}

        if (!alreadyInit && DELETED_OPPORTUNITY_IDS.size === 0) {
          for (const op of MEMORY_OPPORTUNITIES) {
            await db.collection('careers').doc(op.id).set(op);
          }
          await db.collection('careers_meta').doc('init').set({ initialized: true, at: new Date().toISOString() });
          return [...MEMORY_OPPORTUNITIES];
        }
        return [];
      }
    } catch (e) {
      console.warn('Firestore careers read warning, using memory fallback:', e);
    }
  }
  return MEMORY_OPPORTUNITIES.filter((op) => !DELETED_OPPORTUNITY_IDS.has(op.id) && op.status !== 'DELETED' && !(op as any).isDeleted);
}

/**
 * Helper to save or update opportunity
 */
async function saveOpportunity(op: OpportunityRecord): Promise<void> {
  DELETED_OPPORTUNITY_IDS.delete(op.id);
  const idx = MEMORY_OPPORTUNITIES.findIndex((o) => o.id === op.id);
  if (idx >= 0) {
    MEMORY_OPPORTUNITIES[idx] = op;
  } else {
    MEMORY_OPPORTUNITIES.unshift(op);
  }

  if (db) {
    try {
      await db.collection('careers').doc(op.id).set(op, { merge: true });
    } catch (e) {
      console.warn('Firestore careers write warning:', e);
    }
  }
}

/**
 * Helper to delete opportunity
 */
async function removeOpportunity(id: string): Promise<void> {
  DELETED_OPPORTUNITY_IDS.add(id);
  const idx = MEMORY_OPPORTUNITIES.findIndex((o) => o.id === id);
  if (idx >= 0) {
    MEMORY_OPPORTUNITIES.splice(idx, 1);
  }

  if (db) {
    try {
      await db.collection('careers').doc(id).set({ status: 'DELETED', isDeleted: true, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => null);
      await db.collection('careers').doc(id).delete().catch(() => null);
      await db.collection('careers_meta').doc('deletions').set({
        ids: Array.from(DELETED_OPPORTUNITY_IDS),
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => null);
    } catch (e) {
      console.warn('Firestore careers delete warning:', e);
    }
  }
}

/**
 * SYNCHRONIZATION: Pull applications from Google Sheets and synchronize with Firestore
 */
async function syncApplicationsFromGoogleSheets(): Promise<any[]> {
  const scriptUrl =
    process.env.GOOGLE_APPS_SCRIPT_CAREERS_URL ||
    'https://script.google.com/macros/s/AKfycbx5SCDb_L-2x213DFJkufRDW_e_JQr9NP-ASUmRrk1MW0pVCyTIG6rtTBJsTdFfYmQnEQ/exec';
  const adminSecret = process.env.APPS_SCRIPT_ADMIN_SECRET || 'kz_careers_admin_sync_secret_2026';

  let sheetApps: any[] = [];

  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'getApplications',
        adminSecret: adminSecret,
      }),
      redirect: 'follow',
    });

    if (res.ok) {
      const data: any = await res.json();
      if (data.success && Array.isArray(data.applications)) {
        sheetApps = data.applications;
      }
    }
  } catch (syncErr) {
    console.warn('Google Sheets background sync notice:', syncErr);
  }

  // Read local Firestore records
  let firestoreMap = new Map<string, any>();
  if (db) {
    try {
      const snap = await db.collection('career_applications').get();
      snap.forEach((doc) => {
        const item: any = { id: doc.id, ...doc.data() };
        const key = item.applicationId || item.referenceNumber || doc.id;
        firestoreMap.set(key, item);
      });
    } catch (err) {
      console.warn('Firestore career_applications read error:', err);
    }
  }

  // Merge Google Sheets data into Firestore
  const merged: any[] = [];
  const processedKeys = new Set<string>();

  for (const sApp of sheetApps) {
    const key = sApp.applicationId || sApp.id;
    if (!key) continue;
    processedKeys.add(key);

    const existingLocal = firestoreMap.get(key);
    const mergedRecord = {
      ...sApp,
      ...(existingLocal || {}),
      applicationId: key,
      referenceNumber: key,
      // Source of truth for core submission details is the Sheet
      name: sApp.name || existingLocal?.name || '',
      fullName: sApp.fullName || existingLocal?.fullName || sApp.name || '',
      email: sApp.email || existingLocal?.email || '',
      phone: sApp.phone || existingLocal?.phone || '',
      position: sApp.position || existingLocal?.position || '',
      internshipTitle: sApp.position || existingLocal?.internshipTitle || '',
      resumeUrl: sApp.resumeUrl || existingLocal?.resumeUrl || '',
      linkedinUrl: sApp.linkedinUrl || sApp.linkedin || existingLocal?.linkedinUrl || '',
      githubUrl: sApp.githubUrl || sApp.github || existingLocal?.githubUrl || '',
      portfolioUrl: sApp.portfolioUrl || existingLocal?.portfolioUrl || '',
      statementOfPurpose: sApp.statementOfPurpose || sApp.coverLetter || existingLocal?.statementOfPurpose || '',
      status: sApp.status || existingLocal?.status || 'New',
      appliedAt: sApp.appliedAt || existingLocal?.appliedAt || new Date().toISOString(),
      opportunityId: sApp.opportunityId || existingLocal?.opportunityId || '',
      department: sApp.department || existingLocal?.department || '',
      workMode: sApp.workMode || existingLocal?.workMode || 'REMOTE',
      // Preserve internal recruitment notes & interview details from Firestore
      adminNotes: existingLocal?.adminNotes || '',
      interview: existingLocal?.interview || null,
      updatedAt: new Date().toISOString(),
    };

    merged.push(mergedRecord);

    // Save/update in Firestore
    if (db) {
      try {
        await db.collection('career_applications').doc(key).set(mergedRecord, { merge: true });
      } catch (e) {
        // Ignored
      }
    }
  }

  // Include any Firestore records not yet in Google Sheets
  firestoreMap.forEach((val, key) => {
    if (!processedKeys.has(key)) {
      merged.push(val);
    }
  });

  // Sort by appliedAt desc
  merged.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());

  // Update memory cache
  MEMORY_APPLICATIONS.length = 0;
  MEMORY_APPLICATIONS.push(...merged);

  return merged;
}

/**
 * Status normalizer
 */
function normalizeStatus(st: string): string {
  if (!st) return 'New';
  const upper = st.toUpperCase().replace(/\s+/g, '_');
  if (upper === 'NEW' || upper === 'SUBMITTED') return 'New';
  if (upper === 'UNDER_REVIEW') return 'Under Review';
  if (upper === 'SHORTLISTED') return 'Shortlisted';
  if (upper === 'INTERVIEW_SCHEDULED' || upper === 'INTERVIEW') return 'Interview Scheduled';
  if (upper === 'SELECTED') return 'Selected';
  if (upper === 'REJECTED') return 'Rejected';
  return st;
}

// ==============================================================================
// PUBLIC ENDPOINTS
// ==============================================================================

/**
 * GET /api/careers/health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'KaizenQ Careers Integration Service',
    spreadsheetId: process.env.CAREERS_SPREADSHEET_ID || '1og9L7aU0R4_30uavzj17PZGAlGFt70VxVEwJ1WKKy_w',
    appsScriptConnected: Boolean(process.env.GOOGLE_APPS_SCRIPT_CAREERS_URL),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/careers
 * Returns ONLY Published opportunities for public view
 */
router.get(['/', '/openings'], async (req: Request, res: Response) => {
  try {
    const list = await getOpportunities();
    const isAdmin =
      req.baseUrl.includes('admin') ||
      req.path.includes('admin') ||
      req.query.admin === 'true' ||
      req.headers['x-admin-request'] === 'true';

    // Public only sees published / open opportunities
    let filtered = isAdmin
      ? list
      : list.filter((o) => o.status === 'PUBLISHED' || o.status === 'OPEN');

    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const status = ((req.query.status as string) || 'ALL').toUpperCase().trim();
    const domain = (req.query.domain as string) || 'ALL';
    const department = (req.query.department as string) || 'ALL';
    const employmentType = (req.query.employmentType as string) || 'ALL';
    const internshipType = ((req.query.internshipType || req.query.type) as string) || 'ALL';

    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.title.toLowerCase().includes(search) ||
          o.domain.toLowerCase().includes(search) ||
          o.requiredSkills.toLowerCase().includes(search) ||
          (o.department && o.department.toLowerCase().includes(search))
      );
    }
    if (status !== 'ALL') {
      filtered = filtered.filter((o) => (o.status || '').toUpperCase() === status);
    }
    if (domain !== 'ALL') {
      filtered = filtered.filter((o) => o.domain === domain);
    }
    if (department !== 'ALL') {
      filtered = filtered.filter((o) => o.department === department);
    }
    if (employmentType !== 'ALL') {
      filtered = filtered.filter((o) => o.employmentType === employmentType);
    }
    if (internshipType !== 'ALL') {
      filtered = filtered.filter((o) => o.internshipType === internshipType);
    }

    return res.json({
      success: true,
      data: {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/careers/:slugOrId
 * Public detail for single opportunity
 */
router.get('/:slugOrId', async (req: Request, res: Response, next: NextFunction) => {
  const slugParam = String(req.params.slugOrId || '');
  const reservedWords = ['health', 'apply', 'analytics', 'applications', 'sync', 'opportunities', 'openings', 'admin'];
  if (reservedWords.includes(slugParam)) {
    return next();
  }
  try {
    const slugOrId = slugParam;
    const list = await getOpportunities();
    const found = list.find((o) => o.id === slugOrId || o.slug === slugOrId);

    if (!found) {
      return next();
    }

    return res.json({
      success: true,
      data: {
        ...found,
        curriculum: found.curriculum || found.learningOutcomes,
        tasks: [
          {
            id: 'task-1',
            weekNumber: 1,
            title: 'Repository Architecture & Foundation Setup',
            description: 'Initialize clean development environment, git branch workflows, and architectural primitives.',
            deliverables: 'Functional starter repository with passing unit tests.',
            maxScore: 100,
            displayOrder: 1,
          },
          {
            id: 'task-2',
            weekNumber: 2,
            title: 'Feature Construction & Schema Implementation',
            description: 'Implement core endpoints, state management tokens, and accessible user interfaces.',
            deliverables: 'Interactive prototype with verified test coverage.',
            maxScore: 100,
            displayOrder: 2,
          },
        ],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Check if candidate has already submitted an active application for this opportunity or position
 */
async function checkDuplicateApplication(
  email: string,
  opportunityId?: string,
  position?: string
): Promise<{ isDuplicate: boolean; existingApplication?: any }> {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return { isDuplicate: false };

  // 1. In-memory check
  const inMemoryMatch = MEMORY_APPLICATIONS.find((a) => {
    if ((a.email || '').toLowerCase() !== normalizedEmail) return false;
    if (opportunityId && (a.opportunityId === opportunityId || a.internshipId === opportunityId)) return true;
    if (position && a.position && a.position.toLowerCase() === position.toLowerCase()) return true;
    return false;
  });

  if (inMemoryMatch) {
    return { isDuplicate: true, existingApplication: inMemoryMatch };
  }

  // 2. Firestore check
  if (db) {
    try {
      const snap = await db.collection('career_applications').where('email', '==', normalizedEmail).get();
      for (const doc of snap.docs) {
        const data = doc.data();
        if (opportunityId && (data.opportunityId === opportunityId || data.internshipId === opportunityId)) {
          return { isDuplicate: true, existingApplication: { id: doc.id, ...data } };
        }
        if (position && data.position && data.position.toLowerCase() === position.toLowerCase()) {
          return { isDuplicate: true, existingApplication: { id: doc.id, ...data } };
        }
      }
    } catch (e) {
      console.warn('Firestore duplicate check notice:', e);
    }
  }

  return { isDuplicate: false };
}

/**
 * Primary Application Submission Handler:
 * - Accepts multipart/form-data & JSON with base64/URL
 * - Validates required fields & file signature (PDF, DOC, DOCX up to 5MB)
 * - Prevents duplicate applications
 * - Generates unique Application ID
 * - Stores resume and creates direct preview URL
 * - Dispatches Nodemailer email with resume attached to kaizenqlms@gmail.com
 * - Dispatches applicant confirmation email
 * - Syncs to Google Sheets & Firestore
 */
async function handleApplicationSubmission(req: Request, res: Response) {
  try {
    // 1. Universal Request Parsing (multipart/form-data or application/json)
    const { fields, file } = await parseApplicationRequest(req);

    const {
      fullName,
      name,
      email,
      phone,
      position,
      resumeUrl: clientResumeUrl,
      resumeFileName,
      linkedinUrl,
      linkedin,
      githubUrl,
      github,
      portfolioUrl,
      statementOfPurpose,
      coverLetter,
      college,
      degree,
      branch,
      currentYear,
      graduationYear,
      skills,
      internshipId,
      department,
      workMode,
    } = fields;

    // 2. IP / Email Rate Limiting
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateKey = `${clientIp}_${String(email).toLowerCase()}`;
    const now = Date.now();
    const lastAttempt = submissionRateMap.get(rateKey);

    if (lastAttempt && now - lastAttempt < 3000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait a moment before submitting another application.',
      });
    }
    submissionRateMap.set(rateKey, now);

    // 3. Candidate Profile Validation
    const candidateName = String(name || fullName || '').trim();
    if (!candidateName || candidateName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full legal name is required (minimum 2 characters).',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const candidateEmail = String(email || '').trim().toLowerCase();
    if (!candidateEmail || !emailRegex.test(candidateEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
    }

    const candidatePhone = String(phone || '').trim();
    if (!candidatePhone || candidatePhone.length < 7) {
      return res.status(400).json({
        success: false,
        message: 'A valid mobile / WhatsApp number is required.',
      });
    }

    // 4. Prevent applications to Archived or Draft opportunities
    if (internshipId) {
      const list = await getOpportunities();
      const op = list.find((o) => o.id === internshipId);
      if (op && (op.status === 'ARCHIVED' || op.status === 'DRAFT' || op.status === 'CLOSED')) {
        return res.status(400).json({
          success: false,
          message: `The opportunity "${op.title}" is currently closed or not accepting new applications.`,
        });
      }
    }

    const appliedPosition = position || 'General Career Application';

    // 5. Prevent Duplicate Applications for the same opportunity
    const dupCheck = await checkDuplicateApplication(candidateEmail, internshipId, appliedPosition);
    if (dupCheck.isDuplicate && dupCheck.existingApplication) {
      const existingApp = dupCheck.existingApplication;
      const existingId = existingApp.applicationId || existingApp.referenceNumber || existingApp.id;
      return res.status(200).json({
        success: true,
        duplicate: true,
        applicationId: existingId,
        message: `You have already applied for "${appliedPosition}". Your previous application (ID: ${existingId}) is currently under active evaluation.`,
      });
    }

    // 6. Resume Validation (Mandatory PDF, DOC, DOCX up to 5MB)
    let resumeBuffer: Buffer | null = null;
    let resumeFilename = resumeFileName || file?.originalname || 'Candidate_Resume.pdf';
    let resumeMimeType = file?.mimetype || 'application/pdf';

    if (file && file.buffer && file.buffer.length > 0) {
      const valResult = validateResumeFile(file.buffer, file.originalname, file.mimetype);
      if (!valResult.valid) {
        return res.status(400).json({
          success: false,
          message: valResult.error || 'Invalid resume file.',
        });
      }
      resumeBuffer = file.buffer;
      resumeFilename = file.originalname;
      resumeMimeType = valResult.detectedMime;
    } else if (clientResumeUrl && clientResumeUrl.trim().length > 5 && !clientResumeUrl.startsWith('Attached:')) {
      // Valid remote URL provided (e.g. Google Drive link)
    } else {
      return res.status(400).json({
        success: false,
        message: 'Resume upload is required. Please upload your resume in PDF, DOC, or DOCX format (maximum 5MB).',
      });
    }

    // 7. Generate Unique Application ID (Format: KQ-YYYY-XXXX)
    const currentYearStr = new Date().getFullYear();
    const generatedId = `KQ-${currentYearStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 8. Secure Resume Storage & Direct Preview Endpoint
    let storedResumeUrl = clientResumeUrl?.trim() || '';
    if (resumeBuffer) {
      storedResumeUrl = storeResumeBuffer(generatedId, resumeBuffer, resumeFilename, resumeMimeType);
    } else if (!storedResumeUrl) {
      storedResumeUrl = `Attached: ${resumeFilename}`;
    }

    // 9. Prepare 15-column payload for Google Sheets Integration
    const resumeBase64 = resumeBuffer ? resumeBuffer.toString('base64') : (fields.resumeBase64 || '');
    const preparedPayload = {
      action: 'submitApplication',
      applicationId: generatedId,
      name: sanitizeInput(candidateName),
      fullName: sanitizeInput(candidateName),
      email: candidateEmail,
      phone: sanitizeInput(candidatePhone),
      position: sanitizeInput(appliedPosition),
      resumeUrl: sanitizeInput(storedResumeUrl),
      resumeFileName: sanitizeInput(resumeFilename),
      resumeBase64,
      linkedin: sanitizeInput(linkedin || linkedinUrl),
      github: sanitizeInput(github || githubUrl),
      portfolioUrl: sanitizeInput(portfolioUrl),
      coverLetter: sanitizeInput(coverLetter || statementOfPurpose),
      status: 'New',
      opportunityId: sanitizeInput(internshipId),
      department: sanitizeInput(department || 'Engineering'),
      workMode: sanitizeInput(workMode || 'REMOTE'),
      college: sanitizeInput(college),
      degree: sanitizeInput(degree),
      branch: sanitizeInput(branch),
      currentYear: sanitizeInput(currentYear),
      graduationYear: Number(graduationYear) || undefined,
      skills: sanitizeInput(skills),
    };

    let assignedId = generatedId;

    // 10. Forward to Google Apps Script Web App / Google Sheets
    const appsScriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_CAREERS_URL ||
      'https://script.google.com/macros/s/AKfycbx5SCDb_L-2x213DFJkufRDW_e_JQr9NP-ASUmRrk1MW0pVCyTIG6rtTBJsTdFfYmQnEQ/exec';

    if (appsScriptUrl) {
      try {
        const scriptResponse = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(preparedPayload),
          redirect: 'follow',
        });

        if (scriptResponse.ok) {
          const scriptData: any = await scriptResponse.json();
          if (scriptData.success) {
            assignedId = scriptData.applicationId || generatedId;
            if (scriptData.resumeUrl && scriptData.resumeUrl.startsWith('http')) {
              storedResumeUrl = scriptData.resumeUrl;
            }
          }
        }
      } catch (proxyErr: any) {
        console.warn('Google Apps Script forwarding warning (local record preserved):', proxyErr?.message);
      }
    }

    // 11. Automated Email Dispatch (HR at kaizenqlms@gmail.com with Resume + Applicant Acknowledgement)
    let emailResult = { hrEmailSent: false, applicantEmailSent: false };
    try {
      const emailData = {
        applicationId: assignedId,
        fullName: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        college: college?.trim(),
        degree: degree?.trim(),
        branch: branch?.trim(),
        currentYear: currentYear?.trim(),
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        skills: skills?.trim(),
        position: appliedPosition,
        department: department?.trim() || 'Engineering',
        workMode: workMode?.trim() || 'REMOTE',
        linkedin: (linkedin || linkedinUrl)?.trim(),
        github: (github || githubUrl)?.trim(),
        portfolioUrl: portfolioUrl?.trim(),
        coverLetter: (coverLetter || statementOfPurpose)?.trim(),
        appliedAt: new Date().toISOString(),
        resumeFileName: resumeFilename,
        resumeUrl: storedResumeUrl,
      };

      const resumeAttachment = resumeBuffer
        ? {
            filename: resumeFilename,
            buffer: resumeBuffer,
            mimetype: resumeMimeType,
          }
        : null;

      emailResult = await sendInternshipApplicationEmails(emailData, resumeAttachment);
    } catch (emailErr: any) {
      console.error('[INTERNSHIP_EMAIL] Dispatch notification error:', emailErr?.message);
    }

    // 12. Save Record in Firestore
    const finalRecord = {
      ...preparedPayload,
      id: assignedId,
      applicationId: assignedId,
      referenceNumber: assignedId,
      resumeUrl: storedResumeUrl,
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'New',
      hrEmailSent: emailResult.hrEmailSent,
      applicantEmailSent: emailResult.applicantEmailSent,
    };

    if (db) {
      try {
        await db.collection('career_applications').doc(assignedId).set(finalRecord);
      } catch (e) {
        console.warn('Firestore application save error:', e);
      }
    }

    // Update memory cache
    MEMORY_APPLICATIONS.unshift(finalRecord);

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully! Application details and resume delivered to HR.',
      applicationId: assignedId,
      hrEmailSent: emailResult.hrEmailSent,
      applicantEmailSent: emailResult.applicantEmailSent,
      resumeUrl: storedResumeUrl,
    });
  } catch (err: any) {
    console.error('Careers apply route failure:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit your application. Please try again.',
    });
  }
}

/**
 * POST /api/careers/apply
 * POST /api/internship-applications
 * Unified endpoints accepting multipart/form-data & JSON with resume attachment
 */
router.post('/apply', handleApplicationSubmission);
router.post('/', handleApplicationSubmission);
router.post('/internship-applications', handleApplicationSubmission);

/**
 * GET /api/careers/resumes/:applicationId
 * GET /api/careers/applications/:applicationId/resume
 * Serves stored resume directly with preview and download capability for admin
 */
router.get(['/resumes/:applicationId', '/applications/:applicationId/resume'], async (req: Request, res: Response) => {
  try {
    const appId = String(req.params.applicationId || '').trim();
    const stored = getResumeBuffer(appId);

    if (stored) {
      res.setHeader('Content-Type', stored.mimetype || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${stored.filename}"`);
      return res.send(stored.buffer);
    }

    // Check Firestore for remote resumeUrl fallback
    if (db) {
      try {
        const doc = await db.collection('career_applications').doc(appId).get();
        if (doc.exists) {
          const data = doc.data();
          if (data?.resumeUrl && data.resumeUrl.startsWith('http')) {
            return res.redirect(data.resumeUrl);
          }
        }
      } catch (e) {
        // Ignored
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Resume document not found for the specified application.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================================
// ADMIN PROTECTED ENDPOINTS
// ==============================================================================

/**
 * GET /api/admin/careers/analytics
 * Real-time analytics computed from actual records
 */
router.get(['/analytics', '/admin/analytics', '/admin/careers/analytics'], async (_req: Request, res: Response) => {
  try {
    const list = await getOpportunities();
    const total = list.length;
    const published = list.filter((o) => o.status === 'PUBLISHED' || o.status === 'OPEN').length;
    const drafts = list.filter((o) => o.status === 'DRAFT').length;
    const archived = list.filter((o) => o.status === 'ARCHIVED' || o.status === 'CLOSED').length;

    const apps = await syncApplicationsFromGoogleSheets();
    const appCount = apps.length;

    const newApps = apps.filter((a) => normalizeStatus(a.status) === 'New').length;
    const underReview = apps.filter((a) => normalizeStatus(a.status) === 'Under Review').length;
    const shortlisted = apps.filter((a) => normalizeStatus(a.status) === 'Shortlisted').length;
    const interviewScheduled = apps.filter((a) => normalizeStatus(a.status) === 'Interview Scheduled').length;
    const selected = apps.filter((a) => normalizeStatus(a.status) === 'Selected').length;
    const rejected = apps.filter((a) => normalizeStatus(a.status) === 'Rejected').length;

    const applicationsByDomain: Record<string, number> = {};
    const applicationsByDepartment: Record<string, number> = {};
    const applicationsByOpportunity: Record<string, number> = {};

    apps.forEach((a) => {
      const dom = a.domain || 'Engineering';
      applicationsByDomain[dom] = (applicationsByDomain[dom] || 0) + 1;

      const dept = a.department || 'Engineering';
      applicationsByDepartment[dept] = (applicationsByDepartment[dept] || 0) + 1;

      const role = a.position || a.internshipTitle || 'General';
      applicationsByOpportunity[role] = (applicationsByOpportunity[role] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        totalInternships: total,
        totalOpportunities: total,
        openInternships: published,
        publishedOpportunities: published,
        draftInternships: drafts,
        archivedInternships: archived,
        totalApplications: appCount,
        newApplications: newApps,
        underReview,
        shortlisted,
        interviewScheduled,
        selected,
        rejected,
        activeEnrollments: selected,
        completedEnrollments: 0,
        applicationsByDomain,
        applicationsByDepartment,
        applicationsByOpportunity,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/careers/applications
 * Returns applications synchronized from Google Sheets with filters
 */
router.get(['/applications', '/admin/applications', '/admin/careers/applications'], async (req: Request, res: Response) => {
  try {
    const apps = await syncApplicationsFromGoogleSheets();
    const status = (req.query.status as string) || 'ALL';
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const internshipId = (req.query.internshipId as string) || undefined;

    let filtered = apps;

    if (status && status !== 'ALL') {
      filtered = filtered.filter((a) => normalizeStatus(a.status).toUpperCase() === status.toUpperCase().replace(/_/g, ' '));
    }
    if (internshipId && internshipId !== 'ALL') {
      filtered = filtered.filter((a) => a.internshipId === internshipId || a.opportunityId === internshipId);
    }
    if (search) {
      filtered = filtered.filter(
        (a) =>
          (a.fullName && a.fullName.toLowerCase().includes(search)) ||
          (a.name && a.name.toLowerCase().includes(search)) ||
          (a.email && a.email.toLowerCase().includes(search)) ||
          (a.phone && a.phone.includes(search)) ||
          (a.referenceNumber && a.referenceNumber.toLowerCase().includes(search)) ||
          (a.applicationId && a.applicationId.toLowerCase().includes(search)) ||
          (a.internshipTitle && a.internshipTitle.toLowerCase().includes(search)) ||
          (a.position && a.position.toLowerCase().includes(search)) ||
          (a.skills && a.skills.toLowerCase().includes(search))
      );
    }

    // Summary counts
    const summary = {
      total: apps.length,
      newCount: apps.filter((a) => normalizeStatus(a.status) === 'New').length,
      underReviewCount: apps.filter((a) => normalizeStatus(a.status) === 'Under Review').length,
      shortlistedCount: apps.filter((a) => normalizeStatus(a.status) === 'Shortlisted').length,
      interviewScheduledCount: apps.filter((a) => normalizeStatus(a.status) === 'Interview Scheduled').length,
      selectedCount: apps.filter((a) => normalizeStatus(a.status) === 'Selected').length,
      rejectedCount: apps.filter((a) => normalizeStatus(a.status) === 'Rejected').length,
    };

    return res.json({
      success: true,
      data: {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        summary,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/careers/sync
 * Manually forces immediate sync with Google Sheets
 */
router.post(['/sync', '/admin/sync', '/admin/careers/sync'], async (_req: Request, res: Response) => {
  try {
    const apps = await syncApplicationsFromGoogleSheets();
    return res.json({
      success: true,
      message: 'Google Sheets applications synchronized successfully.',
      totalCount: apps.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/careers/applications/:id/status
 * Updates application status in Firestore and synchronizes to Google Sheet row
 */
router.patch(['/applications/:id/status', '/admin/applications/:id/status', '/admin/careers/applications/:id/status'], async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, adminNotes, sendStatusEmail } = req.body || {};

    const normalized = normalizeStatus(status);
    const apps = await syncApplicationsFromGoogleSheets();
    const targetApp = apps.find((a) => a.id === id || a.applicationId === id || a.referenceNumber === id);

    const appIdToUpdate = targetApp?.applicationId || targetApp?.id || id;

    // 1. Update Firestore
    const updatedRecord = {
      ...(targetApp || {}),
      id: appIdToUpdate,
      applicationId: appIdToUpdate,
      status: normalized,
      adminNotes: adminNotes !== undefined ? adminNotes : targetApp?.adminNotes || '',
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await db.collection('career_applications').doc(appIdToUpdate).set(updatedRecord, { merge: true });
      } catch (e) {
        console.warn('Firestore application update warning:', e);
      }
    }

    // 2. Synchronize to Google Sheets
    const scriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_CAREERS_URL ||
      'https://script.google.com/macros/s/AKfycbx5SCDb_L-2x213DFJkufRDW_e_JQr9NP-ASUmRrk1MW0pVCyTIG6rtTBJsTdFfYmQnEQ/exec';
    const adminSecret = process.env.APPS_SCRIPT_ADMIN_SECRET || 'kz_careers_admin_sync_secret_2026';

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateApplicationStatus',
          adminSecret: adminSecret,
          applicationId: appIdToUpdate,
          status: normalized,
          adminNotes: adminNotes || '',
          sendStatusEmail: Boolean(sendStatusEmail),
        }),
        redirect: 'follow',
      });
    } catch (sheetUpdateErr) {
      console.warn('Google Sheet status sync notice:', sheetUpdateErr);
    }

    return res.json({
      success: true,
      message: 'Candidate status updated and synchronized with Google Sheets.',
      data: updatedRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/careers/applications/:id/schedule-interview
 */
router.post(['/applications/:id/schedule-interview', '/admin/applications/:id/schedule-interview', '/admin/careers/applications/:id/schedule-interview'], async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { scheduledAt, meetingLink, interviewerName, roundName } = req.body || {};

    const interviewData = {
      id: `intv-${Date.now()}`,
      applicationId: id,
      scheduledAt: scheduledAt || new Date().toISOString(),
      meetingLink: meetingLink || 'https://meet.google.com/kq-interview',
      interviewerName: interviewerName || 'Technical Interviewer',
      roundName: roundName || 'Technical & System Design',
      status: 'SCHEDULED',
    };

    if (db) {
      try {
        await db.collection('career_applications').doc(id).set(
          {
            interview: interviewData,
            status: 'Interview Scheduled',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Firestore schedule interview warning:', e);
      }
    }

    // Synchronize to Google Sheets
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_CAREERS_URL;
    const adminSecret = process.env.APPS_SCRIPT_ADMIN_SECRET || 'kz_careers_admin_sync_secret_2026';
    if (scriptUrl) {
      fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateApplicationStatus',
          adminSecret,
          applicationId: id,
          status: 'Interview Scheduled',
          adminNotes: `Interview with ${interviewerName} on ${scheduledAt}`,
          sendStatusEmail: true,
        }),
        redirect: 'follow',
      }).catch(() => {});
    }

    return res.json({
      success: true,
      message: 'Interview scheduled successfully.',
      data: interviewData,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/careers/openings (or /api/admin/careers/opportunities)
 * Admin gets all opportunities (DRAFT, PUBLISHED, ARCHIVED)
 */
router.get(['/admin/openings', '/admin/careers/openings', '/admin/opportunities', '/admin/careers/opportunities', '/openings/admin'], async (_req: Request, res: Response) => {
  try {
    const list = await getOpportunities();
    return res.json({
      success: true,
      data: {
        content: list,
        totalElements: list.length,
        totalPages: 1,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/careers/opportunities/:id
 * Admin fetches single opportunity by ID for editing/inspecting
 */
router.get(['/admin/openings/:id', '/admin/careers/openings/:id', '/admin/opportunities/:id', '/admin/careers/opportunities/:id'], async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const list = await getOpportunities();
    const found = list.find((o) => o.id === id || o.slug === id);

    if (!found) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    return res.json({
      success: true,
      data: found,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/careers/opportunities (or /openings)
 * Admin creates opportunity
 */
router.post(['/admin/openings', '/admin/careers/openings', '/admin/opportunities', '/admin/careers/opportunities'], async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.title || !String(body.title).trim()) {
      return res.status(400).json({ success: false, message: 'Role title is required.' });
    }

    const title = String(body.title).trim();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug =
      body.slug && String(body.slug).trim()
        ? String(body.slug).trim().toLowerCase()
        : title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-') + `-${randomSuffix}`;

    const newOp: OpportunityRecord = {
      id: body.id || `op-${Date.now()}-${randomSuffix}`,
      title,
      slug,
      domain: body.domain || 'Engineering',
      department: body.department || 'Engineering',
      employmentType: body.employmentType || 'INTERNSHIP',
      internshipType: body.internshipType || body.workMode || 'REMOTE',
      duration: body.duration || '12 Weeks',
      location: body.location || 'Remote, India',
      openings: Number(body.openings) || 1,
      deadline: body.deadline || undefined,
      stipendType: body.stipendType || 'PERFORMANCE_BASED',
      stipendAmount: body.stipendAmount || 'Performance Stipend + Certificate',
      eligibility: body.eligibility || 'Graduates / Undergraduates in CS/IT or relevant fields',
      requiredSkills: body.requiredSkills || 'Problem Solving, Communication',
      preferredSkills: body.preferredSkills || '',
      description: body.description || '',
      curriculum: body.curriculum || body.learningOutcomes || '',
      responsibilities: body.responsibilities || '',
      learningOutcomes: body.learningOutcomes || '',
      status: body.status || 'PUBLISHED',
      isFeatured: Boolean(body.isFeatured),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveOpportunity(newOp);
    return res.status(201).json({ success: true, message: 'Opportunity created successfully.', data: newOp });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/admin/careers/opportunities/:id
 * Admin updates opportunity
 */
router.put(['/admin/openings/:id', '/admin/careers/openings/:id', '/admin/opportunities/:id', '/admin/careers/opportunities/:id'], async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const body = req.body || {};
    const list = await getOpportunities();
    const existing = list.find((o) => o.id === id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const updated: OpportunityRecord = {
      ...existing,
      ...body,
      id: existing.id,
      title: body.title !== undefined ? String(body.title).trim() : existing.title,
      slug: body.slug !== undefined ? String(body.slug).trim() : existing.slug,
      openings: body.openings !== undefined ? Number(body.openings) : existing.openings,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
      updatedAt: new Date().toISOString(),
    };

    await saveOpportunity(updated);
    return res.json({ success: true, message: 'Opportunity updated successfully.', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/careers/openings/:id/status
 * Admin patches status (DRAFT, PUBLISHED, ARCHIVED, OPEN, CLOSED)
 */
router.patch(['/admin/openings/:id/status', '/admin/careers/openings/:id/status', '/admin/opportunities/:id/status', '/admin/careers/opportunities/:id/status'], async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const newStatus = (req.query.status as string) || req.body?.status;

    if (!newStatus) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const list = await getOpportunities();
    const existing = list.find((o) => o.id === id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    existing.status = newStatus.toUpperCase() as any;
    existing.updatedAt = new Date().toISOString();

    await saveOpportunity(existing);
    return res.json({ success: true, message: 'Status updated successfully.', data: existing });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/careers/opportunities/:id
 * Admin permanently deletes opportunity
 */
router.delete(['/admin/openings/:id', '/admin/careers/openings/:id', '/admin/opportunities/:id', '/admin/careers/opportunities/:id'], async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await removeOpportunity(id);
    return res.json({ success: true, message: 'Opportunity removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/careers/opportunities/bulk
 * Admin bulk actions: delete, publish, unpublish, archive, feature, unfeature
 * Application records are preserved and never deleted.
 */
router.post(['/admin/opportunities/bulk', '/admin/careers/opportunities/bulk', '/admin/openings/bulk', '/admin/careers/openings/bulk'], async (req: Request, res: Response) => {
  try {
    const { action, ids } = req.body || {};
    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid action and non-empty list of IDs are required.' });
    }

    const list = await getOpportunities();
    const processed: string[] = [];
    const failed: string[] = [];

    for (const id of ids) {
      try {
        if (action === 'delete') {
          await removeOpportunity(id);
          processed.push(id);
        } else {
          const existing = list.find((o) => o.id === id);
          if (!existing) {
            failed.push(id);
            continue;
          }

          if (action === 'publish') existing.status = 'PUBLISHED';
          else if (action === 'unpublish') existing.status = 'DRAFT';
          else if (action === 'archive') existing.status = 'ARCHIVED';
          else if (action === 'feature') existing.isFeatured = true;
          else if (action === 'unfeature') existing.isFeatured = false;

          existing.updatedAt = new Date().toISOString();
          await saveOpportunity(existing);
          processed.push(id);
        }
      } catch (opErr) {
        console.error(`Bulk operation error for id ${id}:`, opErr);
        failed.push(id);
      }
    }

    return res.json({
      success: true,
      message: `Successfully executed ${action} on ${processed.length} opportunity(ies).`,
      data: {
        action,
        processedCount: processed.length,
        processedIds: processed,
        failedIds: failed,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/careers/applications/export
 * CSV export of applications
 */
router.get(['/applications/export', '/admin/applications/export', '/admin/careers/applications/export'], async (req: Request, res: Response) => {
  try {
    const apps = await syncApplicationsFromGoogleSheets();
    const status = (req.query.status as string) || 'ALL';
    const internshipId = (req.query.internshipId as string) || undefined;

    let filtered = apps;
    if (status && status !== 'ALL') {
      filtered = filtered.filter((a) => normalizeStatus(a.status).toUpperCase() === status.toUpperCase().replace(/_/g, ' '));
    }
    if (internshipId && internshipId !== 'ALL') {
      filtered = filtered.filter((a) => a.internshipId === internshipId || a.opportunityId === internshipId);
    }

    const headers = [
      'Application ID',
      'Applied Date',
      'Full Name',
      'Email',
      'Phone',
      'Position',
      'Department',
      'Work Mode',
      'Status',
      'Resume URL',
      'LinkedIn',
      'GitHub',
      'Portfolio',
      'Admin Notes',
    ];

    const rows = filtered.map((a) => [
      `"${a.applicationId || a.referenceNumber || a.id || ''}"`,
      `"${a.appliedAt || ''}"`,
      `"${(a.fullName || a.name || '').replace(/"/g, '""')}"`,
      `"${a.email || ''}"`,
      `"${a.phone || ''}"`,
      `"${(a.internshipTitle || a.position || '').replace(/"/g, '""')}"`,
      `"${(a.department || '').replace(/"/g, '""')}"`,
      `"${(a.workMode || 'REMOTE').replace(/"/g, '""')}"`,
      `"${normalizeStatus(a.status)}"`,
      `"${a.resumeUrl || ''}"`,
      `"${a.linkedinUrl || a.linkedin || ''}"`,
      `"${a.githubUrl || a.github || ''}"`,
      `"${a.portfolioUrl || ''}"`,
      `"${(a.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="kaizenq_applicants_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
