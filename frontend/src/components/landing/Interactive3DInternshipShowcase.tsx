import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  Code2,
  Cloud,
  CheckCircle2,
  ExternalLink,
  Award,
  Layers,
  Clock,
  MapPin,
  Users,
  Calendar,
  Check,
  ChevronRight,
  ShieldCheck,
  Building,
  GraduationCap,
} from 'lucide-react';

interface CareerTrack {
  id: string;
  slug: string;
  title: string;
  domain: string;
  badge: string;
  stipend: string;
  duration: string;
  mode: string;
  openings: number;
  skills: string[];
  imagePng: string;
  mentor: { name: string; title: string };
  summary: string;
  phases: { week: string; title: string; deliverables: string }[];
}

const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'track-fullstack',
    slug: 'fullstack-web-developer-intern',
    title: 'Full Stack Web & Cloud Applications',
    domain: 'Full Stack Development',
    badge: '2026 COHORT',
    stipend: '₹10,000 / month + Verified Certificate',
    duration: '12 Weeks',
    mode: 'Remote / Hybrid',
    openings: 10,
    skills: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js', 'REST APIs', 'PostgreSQL'],
    imagePng: '/assets/careers/track_fullstack.png',
    mentor: { name: 'Siddharth Menon', title: 'Staff Frontend Architect' },
    summary: 'Build production-ready, accessible web applications with modern state management, API integration, and test automation.',
    phases: [
      { week: 'Weeks 1-3', title: 'Component Architecture & State', deliverables: 'Design systems, TypeScript contracts & responsive layouts.' },
      { week: 'Weeks 4-6', title: 'Backend APIs & Data Flow', deliverables: 'Secure REST endpoints, PostgreSQL migrations & auth middleware.' },
      { week: 'Weeks 7-9', title: 'Real-time Features & Performance', deliverables: 'WebSocket updates, client-side caching & bundle optimization.' },
      { week: 'Weeks 10-12', title: 'Testing & Cloud Deployment', deliverables: 'Vitest unit suites, CI/CD pipelines & production release.' },
    ],
  },
  {
    id: 'track-java',
    slug: 'backend-java-spring-boot-internship',
    title: 'Enterprise Java 21 & Spring Boot 3',
    domain: 'Backend Engineering',
    badge: 'HIGH DEMAND',
    stipend: '₹12,000 / month + Official Certificate',
    duration: '12 Weeks',
    mode: 'Hybrid / Remote',
    openings: 10,
    skills: ['Java 21', 'Spring Boot 3', 'Spring Security', 'PostgreSQL', 'Docker', 'Flyway'],
    imagePng: '/assets/careers/track_java_backend.png',
    mentor: { name: 'Vikramaditya Roy', title: 'Principal Backend Engineer' },
    summary: 'Architect scalable backend microservices, resilient database connection pooling, and multi-tenant authorization.',
    phases: [
      { week: 'Weeks 1-3', title: 'OOP & Modern Java 21', deliverables: 'Virtual threads, records, pattern matching & clean architecture.' },
      { week: 'Weeks 4-6', title: 'Spring Boot 3 REST Services', deliverables: 'Hibernate 6 JSONB mapping, validation & global exception handlers.' },
      { week: 'Weeks 7-9', title: 'Security & Connection Pooling', deliverables: 'JWT stateless auth, HikariCP pool tuning & Flyway migrations.' },
      { week: 'Weeks 10-12', title: 'Containerization & Observability', deliverables: 'Docker multi-stage builds, Prometheus metrics & integration tests.' },
    ],
  },
  {
    id: 'track-cloud-devops',
    slug: 'cloud-devops-engineer-intern',
    title: 'Cloud DevOps, Docker & Kubernetes',
    domain: 'Cloud Computing & DevOps',
    badge: 'PRODUCTION CLUSTER',
    stipend: 'Performance Stipend + Cloud Certificate',
    duration: '12 Weeks',
    mode: 'Remote, India',
    openings: 8,
    skills: ['Kubernetes', 'Docker', 'GitHub Actions', 'AWS Cloud', 'Linux CLI', 'Terraform'],
    imagePng: '/assets/careers/track_cloud_architecture.png',
    mentor: { name: 'Ananya Deshmukh', title: 'Senior Cloud & DevOps Architect' },
    summary: 'Master containerization, infrastructure-as-code, zero-downtime rolling updates, and production deployment automation.',
    phases: [
      { week: 'Weeks 1-3', title: 'Linux Administration & Shell', deliverables: 'Kernel mechanics, systemd services & SSH hardening.' },
      { week: 'Weeks 4-6', title: 'Docker Container Engineering', deliverables: 'Multi-stage Dockerfiles, image minimization & security scanning.' },
      { week: 'Weeks 7-9', title: 'Kubernetes Cluster Orchestration', deliverables: 'Pods, deployments, services, ingress & Helm chart packaging.' },
      { week: 'Weeks 10-12', title: 'Automated CI/CD & Observability', deliverables: 'GitHub Actions runners, Grafana dashboards & automated rollbacks.' },
    ],
  },
  {
    id: 'track-ai-ml',
    slug: 'ai-ml-generative-ai-internship',
    title: 'AI Systems & Machine Learning Engineering',
    domain: 'Artificial Intelligence & ML',
    badge: 'ADVANCED TRACK',
    stipend: 'Performance Stipend + AI Certificate',
    duration: '12 Weeks',
    mode: 'Remote, India',
    openings: 8,
    skills: ['Python', 'PyTorch', 'Gemini API', 'LangChain', 'Vector DB', 'RAG Pipelines'],
    imagePng: '/assets/careers/track_ai_ml.png',
    mentor: { name: 'Kavita Sundaram', title: 'Lead AI Research Engineer' },
    summary: 'Design intelligent applications powered by multimodal LLMs, vector database retrieval, and structured evaluation benchmarks.',
    phases: [
      { week: 'Weeks 1-3', title: 'Python & Data Engineering', deliverables: 'NumPy, Pandas, data cleaning & feature vector pipelines.' },
      { week: 'Weeks 4-6', title: 'Embeddings & Vector Databases', deliverables: 'Semantic chunking, similarity indexing & hybrid search.' },
      { week: 'Weeks 7-9', title: 'RAG & Multimodal LLM Pipelines', deliverables: 'Context retrieval, guardrails & structured JSON schemas.' },
      { week: 'Weeks 10-12', title: 'Benchmarking & Production Serving', deliverables: 'Latency optimization, evaluation metrics & live API deployment.' },
    ],
  },
  {
    id: 'track-data-eng',
    slug: 'data-engineering-postgresql-intern',
    title: 'Data Engineering & PostgreSQL Architecture',
    domain: 'Data Science & Engineering',
    badge: 'DATA ARCHITECTURE',
    stipend: 'Performance Stipend + Certificate',
    duration: '12 Weeks',
    mode: 'Remote, India',
    openings: 6,
    skills: ['PostgreSQL', 'SQL Analytics', 'Python', 'ETL Pipelines', 'Index Tuning', 'Redis'],
    imagePng: '/assets/careers/track_data_eng.png',
    mentor: { name: 'Arjun Nambiar', title: 'Staff Database Architect' },
    summary: 'Develop optimized database schemas, automated ETL pipelines, analytics aggregates, and high-performance queries.',
    phases: [
      { week: 'Weeks 1-3', title: 'Relational Schema Design & Normalization', deliverables: 'ER diagrams, BCNF normalization & constraints.' },
      { week: 'Weeks 4-6', title: 'Query Optimization & Indexing', deliverables: 'EXPLAIN ANALYZE, B-Tree vs GIN indexes & connection pooling.' },
      { week: 'Weeks 7-9', title: 'Automated ETL Pipelines', deliverables: 'Scheduled ingestion jobs, batch transformations & error retries.' },
      { week: 'Weeks 10-12', title: 'Analytics & BI Dashboards', deliverables: 'Window functions, materialized views & executive reporting.' },
    ],
  },
  {
    id: 'track-uiux',
    slug: 'ui-ux-product-designer-intern',
    title: 'UI/UX Design Systems & Product Design',
    domain: 'Product Design & UX',
    badge: 'CREATIVE COHORT',
    stipend: 'Performance Stipend + Design Certificate',
    duration: '12 Weeks',
    mode: 'Remote, India',
    openings: 5,
    skills: ['Figma', 'Design Systems', 'User Research', 'Wireframing', 'WCAG Accessibility', 'Micro-Interactions'],
    imagePng: '/assets/careers/track_uiux.png',
    mentor: { name: 'Rohan Varma', title: 'Lead Product Designer' },
    summary: 'Design intuitive enterprise SaaS experiences, accessible design token libraries, and high-fidelity interactive prototypes.',
    phases: [
      { week: 'Weeks 1-3', title: 'User Research & Wireframing', deliverables: 'User journey maps, information architecture & low-fi wireframes.' },
      { week: 'Weeks 4-6', title: 'Design System Component Tokens', deliverables: 'Color/spacing tokens, typography scale & reusable Figma variants.' },
      { week: 'Weeks 7-9', title: 'High-Fidelity Interactive Prototypes', deliverables: 'Realistic micro-interactions, responsive flows & mobile layouts.' },
      { week: 'Weeks 10-12', title: 'Design QA & Developer Handoff', deliverables: 'Component specs, WCAG accessibility checks & design tokens export.' },
    ],
  },
];

export const Interactive3DInternshipShowcase: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<CareerTrack>(CAREER_TRACKS[0]);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'roadmap' | 'credential'>('blueprint');

  // 3D Perspective Card Tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 5;
    const rotY = ((x - centerX) / centerX) * 5;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <section className="w-full py-24 bg-white border-t border-b border-slate-200/80 relative overflow-hidden font-['Sora']">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* ========================================================================= */}
        {/* 1. SECTION HEADER (CLEAN WHITE CORPORATE)                                 */}
        {/* ========================================================================= */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>KAIZENQ &bull; SHAIVIKA GROUPS 2026 INITIATIVE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Build Real Software as a <br className="hidden sm:inline" />
            <span className="text-blue-600">KaizenQ Engineering Intern</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Gain verified hands-on industry experience across structured 12-week cohorts. 
            Work under senior staff mentors, build real production deliverables, and earn verifiable cryptographic credentials.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-600/20"
            >
              <span>Explore All Openings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={`/careers#${selectedTrack.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all border border-slate-200"
            >
              <span>Apply for {selectedTrack.domain}</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TRACK SELECTOR PILLS                                                   */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CAREER_TRACKS.map((track) => {
            const isSelected = selectedTrack.id === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrack(track)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{track.domain}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 3. 3D INTERACTIVE VIEWPORT CONTAINER (CLEAN PURE WHITE)                   */}
        {/* ========================================================================= */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
          className="relative w-full rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          {/* Subtle Dynamic Glare Light Effect */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(37,99,235,0.06) 0%, transparent 60%)`,
            }}
          />

          {/* Window Chrome Header (Apple / Linear Clean Style) */}
          <div className="px-6 py-4 border-b border-slate-200/90 bg-slate-50/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-[11px] font-semibold text-slate-500">
                kaizenq.com/careers/{selectedTrack.slug}
              </span>
            </div>

            {/* Viewport Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-white border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('blueprint')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'blueprint'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Track Specs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('roadmap')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'roadmap'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>12-Week Sprints</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('credential')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'credential'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Verified Credential</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: TRACK BLUEPRINT (CLEAN PNG GRAPHIC + STRUCTURED DETAILS)           */}
          {/* ========================================================================= */}
          {activeTab === 'blueprint' && (
            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white">
              {/* Left Column: Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-extrabold uppercase tracking-wider border border-blue-200">
                      {selectedTrack.domain}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {selectedTrack.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {selectedTrack.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedTrack.summary}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-500 block">Duration</span>
                    <strong className="text-slate-900 font-bold text-sm block">{selectedTrack.duration}</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-500 block">Work Mode</span>
                    <strong className="text-slate-900 font-bold text-sm block">{selectedTrack.mode}</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Openings</span>
                    <strong className="text-blue-600 font-bold text-sm block">{selectedTrack.openings} Positions</strong>
                  </div>
                </div>

                {/* Stipend Callout */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Compensation & Perks</span>
                    <strong className="text-slate-900 font-extrabold text-sm sm:text-base">{selectedTrack.stipend}</strong>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Verified Intake
                  </span>
                </div>

                {/* Tech Skills Chips */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Evaluated Tech Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTrack.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mentor & Apply Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-black text-slate-700 text-xs">
                      {selectedTrack.mentor.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">{selectedTrack.mentor.name}</strong>
                      <span className="text-[11px] text-slate-500">{selectedTrack.mentor.title}</span>
                    </div>
                  </div>

                  <Link
                    to="/careers"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
                  >
                    <span>Apply for this Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: High-Res Professional Track PNG Graphic */}
              <div className="lg:col-span-6 flex items-center justify-center">
                <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white p-2 group">
                  <img
                    src={selectedTrack.imagePng}
                    alt={selectedTrack.title}
                    className="w-full h-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                  <div className="p-3 bg-white flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Official Shaivika Groups Curriculum
                    </span>
                    <span className="font-mono text-[11px]">Shaivika-2026-ENG</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: 12-WEEK SPRINT ROADMAP (CLEAN WHITE CARDS)                         */}
          {/* ========================================================================= */}
          {activeTab === 'roadmap' && (
            <div className="p-6 sm:p-10 space-y-6 bg-white">
              <div className="max-w-2xl">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Structured 12-Week Engineering Syllabus & Sprints
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Every sprint delivers verifiable software reviewed by senior engineers. Zero superficial assignments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedTrack.phases.map((phase, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 relative hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-200">
                        {phase.week}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900">
                      {phase.title}
                    </h5>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {phase.deliverables}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Code Review & Score</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <strong className="text-slate-900 font-bold block">100% Practical Engineering Evaluation</strong>
                  <span className="text-slate-600">Weekly pull requests reviewed with line-by-line feedback from lead engineers.</span>
                </div>
                <Link
                  to="/careers"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs self-start sm:self-auto"
                >
                  Apply for Track
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: VERIFIABLE DIGITAL CREDENTIAL (CLEAN WHITE CARD)                   */}
          {/* ========================================================================= */}
          {activeTab === 'credential' && (
            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <Award className="w-4 h-4" />
                  <span>CRYPTOGRAPHICALLY VERIFIABLE CREDENTIAL</span>
                </div>

                <h4 className="text-2xl font-extrabold text-slate-900">
                  Tamper-Proof Certificate of Internship Completion
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Upon successful defense of all sprint deliverables and meeting peer evaluation standards, 
                  you receive a verified certificate issued by Shaivika Groups and KaizenQ.
                </p>

                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Unique SHA-256 Verification Hash & Direct QR Code Scanner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Public Verification URL shareable on LinkedIn and Resumes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Official Letter of Recommendation for top 15% cohort performers</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    to="/careers"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                  >
                    <span>Apply for 2026 Cohort</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Certificate Preview Card */}
              <div className="lg:col-span-6">
                <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-lg space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <span className="font-extrabold text-xs text-slate-900 tracking-wider">KAIZENQ ACADEMY</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">CERT-2026-ENG-8492</span>
                  </div>

                  <div className="text-center space-y-1.5 py-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">CERTIFICATE OF COMPLETION</span>
                    <h5 className="text-xl font-black text-slate-900">Student Engineer</h5>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      has successfully satisfied all engineering requirements and deliverables for the
                    </p>
                    <strong className="text-sm text-blue-600 font-bold block pt-1">
                      {selectedTrack.title}
                    </strong>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      <strong className="text-slate-800 block">Shaivika Groups</strong>
                      <span>Issuing Organization</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-emerald-700 font-bold block flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Status: Valid & Verified
                      </strong>
                      <span className="font-mono text-[10px]">verify.kaizenq.in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. FOUR CORPORATE TRUST PILLARS (PURE WHITE CARDS)                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <strong className="text-slate-900 text-sm font-bold block">100% Practical Deliverables</strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero simulated quiz-only exercises. Build real cloud applications, microservices, and design systems.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <strong className="text-slate-900 text-sm font-bold block">Verifiable Credentials</strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cryptographically verifiable certificates and completion records with unique verification IDs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <strong className="text-slate-900 text-sm font-bold block">Staff Mentor Reviews</strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              Weekly architecture reviews and line-by-line code feedback directly from senior engineering leaders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <strong className="text-slate-900 text-sm font-bold block">Placement Support</strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              Top 15% cohort performers receive letters of recommendation and fast-tracked interviews with Shaivika Groups.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Interactive3DInternshipShowcase;
