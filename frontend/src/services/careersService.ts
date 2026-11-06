import { apiClient } from './apiClient';
import type { Internship } from './internshipService';

export interface CareerApplicationPayload {
  name?: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeBase64?: string;
  linkedin?: string;
  linkedinUrl?: string;
  github?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  coverLetter?: string;
  statementOfPurpose?: string;
  college?: string;
  degree?: string;
  branch?: string;
  currentYear?: string;
  graduationYear?: number;
  skills?: string;
  internshipId?: string;
  department?: string;
  workMode?: string;
}

export interface CareerApplicationResponse {
  success: boolean;
  message: string;
  applicationId: string;
  duplicate?: boolean;
  applicantEmailSent?: boolean;
  hrEmailSent?: boolean;
}

/**
 * Curated standard openings for KaizenQ Careers & Virtual Internship programs.
 * Used as reliable fallback if the remote backend database is sleeping or unreachable.
 */
export const DEFAULT_CAREER_OPENINGS: Internship[] = [
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
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'B.Tech / B.E / BCA / MCA / B.Sc CS (2024 - 2028 Batches). Strong curiosity for building production-grade web apps.',
    requiredSkills: 'React, TypeScript, Node.js, Express, PostgreSQL, REST APIs, Git & GitHub',
    description: 'Build modular reactive frontends, resilient microservices, and database migrations on production repositories with code reviews and mentor guidance.',
    status: 'OPEN',
    isFeatured: true,
    createdAt: '2026-01-01T00:00:00Z',
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
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'All Engineering and CS graduates/undergraduates. Passionate about modern UI, typography, and component architecture.',
    requiredSkills: 'React 19, TypeScript, Tailwind CSS, Framer Motion, HTML5, CSS Grid, Figma to Code',
    description: 'Design and implement accessible, high-performance web interfaces and reusable UI component libraries for next-generation learning platforms.',
    status: 'OPEN',
    isFeatured: true,
    createdAt: '2026-01-01T00:00:00Z',
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
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Curious builders with solid Python fundamentals, linear algebra, and basic neural network concepts.',
    requiredSkills: 'Python, PyTorch, LangChain, Gemini API, RAG Pipelines, Vector DBs, Scikit-learn',
    description: 'Develop intelligent LLM agent pipelines, semantic embeddings, document retrieval, and structured evaluation benchmarks.',
    status: 'OPEN',
    isFeatured: true,
    createdAt: '2026-01-01T00:00:00Z',
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
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Students with passion for statistical modeling, exploratory data analysis, and dashboarding.',
    requiredSkills: 'Python, Pandas, NumPy, SQL, Seaborn, Statistical Hypothesis Testing, Jupyter',
    description: 'Transform raw behavioral datasets into actionable analytical insights, predictive models, and interactive visualizations.',
    status: 'OPEN',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
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
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Passionate about Linux servers, containers, infrastructure automation, and automated deployment pipelines.',
    requiredSkills: 'Linux, Docker, Kubernetes, GitHub Actions, Bash Scripting, Nginx, Cloudflare',
    description: 'Configure automated CI/CD pipelines, containerize microservices, monitor server clusters, and manage container orchestrations.',
    status: 'OPEN',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
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
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Design enthusiasts with a keen eye for visual hierarchy, typography, interaction design, and user psychology.',
    requiredSkills: 'Figma, Design Systems, Wireframing, Rapid Prototyping, Usability Testing',
    description: 'Create intuitive user experiences, conduct usability research, design interactive high-fidelity prototypes, and build cohesive design tokens.',
    status: 'OPEN',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
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
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Basic networking and operating system knowledge. Familiarity with web vulnerability models.',
    requiredSkills: 'OWASP Top 10, Network Security, Wireshark, Burp Suite, Cryptography, Security Auditing',
    description: 'Perform static code vulnerability scans, secure API endpoints, verify cryptographic proofs, and write audit reports.',
    status: 'OPEN',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
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
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Verified Credential',
    eligibility: 'Detail-oriented developers interested in software reliability, test coverage, and test automation frameworks.',
    requiredSkills: 'JavaScript / TypeScript, Playwright, Jest, API Testing with Postman, CI Integration',
    description: 'Write end-to-end integration and smoke tests, automate regression suites, and verify production release readiness.',
    status: 'OPEN',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

/**
 * Returns configured Google Apps Script Web App Endpoint URL from environment variables.
 */
export const getAppsScriptCareersUrl = (): string => {
  const env =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env
      : typeof process !== 'undefined' && process.env
      ? (process.env as any)
      : {};

  const url =
    env.VITE_GOOGLE_APPS_SCRIPT_CAREERS_URL ||
    env.VITE_CAREERS_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbx5SCDb_L-2x213DFJkufRDW_e_JQr9NP-ASUmRrk1MW0pVCyTIG6rtTBJsTdFfYmQnEQ/exec';

  return url.trim();
};

export const careersService = {
  /**
   * Submits candidate application to Google Apps Script Web App.
   * Maps existing form fields to: name, email, phone, position, resumeUrl, linkedin, github, coverLetter.
   */
  async submitApplication(payload: CareerApplicationPayload): Promise<CareerApplicationResponse> {
    const candidateName = (payload.name || payload.fullName || '').trim();
    const candidateEmail = (payload.email || '').trim().toLowerCase();
    const candidatePhone = (payload.phone || '').trim();
    const candidatePosition = (payload.position || '').trim();
    let candidateResumeUrl = (payload.resumeUrl || '').trim();
    const candidateLinkedin = (payload.linkedin || payload.linkedinUrl || '').trim();
    const candidateGithub = (payload.github || payload.githubUrl || '').trim();
    const candidateCoverLetter = (payload.coverLetter || payload.statementOfPurpose || '').trim();

    // Ensure resumeUrl is not blank if an attachment or placeholder exists
    if (!candidateResumeUrl && payload.resumeFileName) {
      candidateResumeUrl = `Attached: ${payload.resumeFileName}`;
    }
    if (!candidateResumeUrl) {
      candidateResumeUrl = 'Not Provided';
    }

    // 1. Client-Side Input Validation
    if (!candidateName || candidateName.length < 2) {
      throw new Error('Please enter your full legal name (minimum 2 characters).');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!candidateEmail || !emailRegex.test(candidateEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!candidatePhone || candidatePhone.length < 7) {
      throw new Error('Please enter a valid mobile / contact number.');
    }

    if (!candidatePosition || candidatePosition.length < 2) {
      throw new Error('Please select or specify the applied position.');
    }

    // 2. Map form fields strictly to required 15 columns:
    // Application ID, Timestamp, Name, Email, Phone, Position, Resume URL, LinkedIn, GitHub, Cover Letter, Status, Opportunity ID, Portfolio URL, Department, Work Mode
    const appsScriptPayload = {
      action: 'submitApplication',
      name: candidateName,
      fullName: candidateName,
      email: candidateEmail,
      phone: candidatePhone,
      position: candidatePosition,
      resumeUrl: candidateResumeUrl,
      resumeFileName: payload.resumeFileName || '',
      resumeBase64: payload.resumeBase64 || '',
      linkedin: candidateLinkedin,
      github: candidateGithub,
      portfolioUrl: payload.portfolioUrl?.trim() || '',
      coverLetter: candidateCoverLetter,
      status: 'New',
      opportunityId: payload.internshipId || '',
      department: payload.department || 'Engineering',
      workMode: payload.workMode || 'REMOTE',

      // Additional backward-compatible aliases for extended script functions
      linkedinUrl: candidateLinkedin,
      githubUrl: candidateGithub,
      statementOfPurpose: candidateCoverLetter,
      college: payload.college?.trim() || '',
      degree: payload.degree?.trim() || '',
      branch: payload.branch?.trim() || '',
      currentYear: payload.currentYear?.trim() || '',
      graduationYear: payload.graduationYear,
      skills: payload.skills?.trim() || '',
      internshipId: payload.internshipId || '',
    };

    if (import.meta.env.DEV) {
      console.groupCollapsed('🚀 [KaizenQ Careers API] Submitting Application');
      console.log('Payload Summary:', {
        name: appsScriptPayload.name,
        email: appsScriptPayload.email,
        phone: appsScriptPayload.phone,
        position: appsScriptPayload.position,
        resumeUrl: appsScriptPayload.resumeUrl,
        portfolioUrl: appsScriptPayload.portfolioUrl,
        opportunityId: appsScriptPayload.opportunityId,
      });
      console.groupEnd();
    }

    // Tier 1: Try submission via backend API endpoint (which syncs to Google Sheets & Firestore)
    try {
      const backendRes = await apiClient.post<any>('/careers/apply', appsScriptPayload);
      if (backendRes.data && (backendRes.data.success || backendRes.data.status === 'success')) {
        const resData = backendRes.data.data || backendRes.data;
        const appId = resData.applicationId || resData.id || resData.referenceNumber;
        return {
          success: true,
          message: resData.message || 'Application submitted successfully.',
          applicationId: appId,
          duplicate: Boolean(resData.duplicate),
          applicantEmailSent: resData.applicantEmailSent,
          hrEmailSent: resData.hrEmailSent,
        };
      }
    } catch (backendErr: any) {
      console.warn('Backend /careers/apply offline or returned error, attempting direct Google Apps Script delivery:', backendErr);
    }

    // Tier 2: Direct Google Apps Script Web App submission
    const appsScriptUrl = getAppsScriptCareersUrl();
    if (!appsScriptUrl) {
      throw new Error('Google Apps Script endpoint URL is not configured.');
    }

    let response: Response;
    try {
      response = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(appsScriptPayload),
        redirect: 'follow',
      });
    } catch (networkErr: any) {
      console.error('Network failure connecting to Apps Script API:', networkErr);
      throw new Error('Unable to reach the application server. Please check your internet connection and try again.');
    }

    if (!response.ok) {
      throw new Error(`Google Apps Script service returned HTTP ${response.status}. Please try again later.`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error('Failed to parse JSON response from Apps Script:', parseErr);
      throw new Error('Unexpected response format received from application API.');
    }

    if (import.meta.env.DEV) {
      console.log('📬 [KaizenQ Careers API] Response received:', data);
    }

    // Strict validation: Only show success when API returns success: true
    if (data.success !== true) {
      const detailedMsg = data.errorDetails
        ? `${data.message} (${data.errorDetails})`
        : (data.message || 'Unable to submit application. Please try again later.');
      console.warn('❌ [KaizenQ Careers API] Submission rejected:', data);
      throw new Error(detailedMsg);
    }

    const applicationId =
      data.applicationId ||
      data.id ||
      data.referenceNumber ||
      data.data?.applicationId ||
      data.data?.id ||
      'KQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    return {
      success: true,
      message: data.message || 'Application submitted successfully.',
      applicationId,
      duplicate: Boolean(data.duplicate),
      applicantEmailSent: data.applicantEmailSent,
      hrEmailSent: data.hrEmailSent,
    };
  },
};
