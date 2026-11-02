import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  Cpu,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  Layers,
  Zap,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';

interface FeaturedTrack {
  id: string;
  slug: string;
  title: string;
  domain: string;
  badge: string;
  badgeColor: string;
  stipend: string;
  duration: string;
  mode: string;
  openings: number;
  skills: string[];
  mentor: { name: string; title: string };
  codeSnippet: string;
  language: string;
}

const FEATURED_TRACKS: FeaturedTrack[] = [
  {
    id: 'track-ai-genai',
    slug: 'ai-ml-generative-ai-internship',
    title: 'AI & Generative AI Systems Engineering',
    domain: 'Artificial Intelligence & ML',
    badge: 'HOTTEST TRACK',
    badgeColor: 'from-amber-500 to-rose-500',
    stipend: 'Performance Stipend + AI Certificate',
    duration: '12 Weeks',
    mode: 'Remote, India',
    openings: 8,
    skills: ['Google Gemini API', 'Python', 'PyTorch', 'LangChain', 'Vector DB', 'RAG'],
    mentor: { name: 'Siddharth Menon', title: 'Lead AI Research Engineer' },
    codeSnippet: `// Gemini Multimodal Inference Pipeline
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function reviewStudentCode(sourceCode: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ text: \`Review code for time complexity & edge cases:\\n\${sourceCode}\` }],
  });
  return response.text;
}`,
    language: 'typescript',
  },
  {
    id: 'track-backend-java',
    slug: 'backend-java-spring-boot-internship',
    title: 'Backend Engineering (Java 21 & Spring Boot 3)',
    domain: 'Backend Development',
    badge: 'ENTERPRISE STACK',
    badgeColor: 'from-blue-600 to-cyan-500',
    stipend: '₹12,000 / month + Official Certificate',
    duration: '12 Weeks',
    mode: 'Hybrid / Remote',
    openings: 10,
    skills: ['Java 21', 'Spring Boot 3', 'Spring Security', 'PostgreSQL', 'Docker', 'Flyway'],
    mentor: { name: 'Vikramaditya Roy', title: 'Staff Backend Architect' },
    codeSnippet: `// High-Throughput Multi-Tenant Controller
@RestController
@RequestMapping("/api/v1/internships")
public class InternshipController {
    private final InternshipService internshipService;

    @GetMapping("/openings")
    public ResponseEntity<ApiResponse<Page<InternshipDTO>>> listOpenings(Pageable pageable) {
        Page<InternshipDTO> results = internshipService.getActiveOpenings(pageable);
        return ResponseEntity.ok(ApiResponse.success("Active openings retrieved", results));
    }
}`,
    language: 'java',
  },
  {
    id: 'track-fullstack-web',
    slug: 'full-stack-web-development-internship',
    title: 'Full Stack Web Development Virtual Internship',
    domain: 'Full Stack Development',
    badge: 'MOST POPULAR',
    badgeColor: 'from-emerald-500 to-teal-500',
    stipend: 'Performance Stipend + Certificate',
    duration: '12 Weeks',
    mode: 'Remote, India',
    openings: 15,
    skills: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Git'],
    mentor: { name: 'Dr. Aris Thorne', title: 'Principal Software Architect' },
    codeSnippet: `// Server-Sent Reactive Learning State
export const useLiveEvaluation = (submissionId: string) => {
  const [evalState, setEvalState] = useState<EvaluationStatus>('PENDING');

  useEffect(() => {
    const sse = new EventSource(\`/api/v1/judge/\${submissionId}/stream\`);
    sse.onmessage = (event) => setEvalState(JSON.parse(event.data));
    return () => sse.close();
  }, [submissionId]);

  return evalState;
};`,
    language: 'typescript',
  },
  {
    id: 'track-cloud-devops',
    slug: 'cloud-computing-devops-internship',
    title: 'Cloud Infrastructure & DevOps Internship',
    domain: 'Cloud Computing & DevOps',
    badge: 'INFRASTRUCTURE',
    badgeColor: 'from-purple-600 to-indigo-600',
    stipend: 'Performance Stipend + Cloud Badge',
    duration: '10 Weeks',
    mode: 'Remote, India',
    openings: 6,
    skills: ['Docker', 'Kubernetes', 'Linux/Bash', 'GitHub Actions', 'Terraform', 'Prometheus'],
    mentor: { name: 'Kavita Sharma', title: 'Senior Cloud Engineer' },
    codeSnippet: `# Automated Continuous Deployment Pipeline
name: Deploy KaizenQ SaaS Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & Push Container to Registry
        run: |
          docker build -t registry.kaizenq.in/lms-core:latest .
          docker push registry.kaizenq.in/lms-core:latest`,
    language: 'yaml',
  },
  {
    id: 'track-qa-automation',
    slug: 'qa-software-testing-internship',
    title: 'QA & Automated Software Testing Internship',
    domain: 'Quality Engineering',
    badge: 'NEW LAUNCH',
    badgeColor: 'from-rose-500 to-pink-500',
    stipend: 'Incentive on Coverage + Certificate',
    duration: '8 Weeks',
    mode: 'Remote, India',
    openings: 10,
    skills: ['Playwright', 'Selenium', 'Postman', 'API Testing', 'Jest', 'CI/CD Pipelines'],
    mentor: { name: 'Pooja Sharma', title: 'Principal QA Automation Engineer' },
    codeSnippet: `// End-to-End Regression Suite with Playwright
import { test, expect } from '@playwright/test';

test('Verify student code sandbox execution & test evaluation', async ({ page }) => {
  await page.goto('/dashboard?tab=practice-hub');
  await page.click('button:has-text("Run Test Cases")');
  await expect(page.locator('.test-verdict-badge')).toHaveText('All 5 Tests Passed (100%)');
});`,
    language: 'typescript',
  },
];

export const Interactive3DInternshipShowcase: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<FeaturedTrack>(FEATURED_TRACKS[0]);
  const [activeIframeTab, setActiveIframeTab] = useState<'ide' | 'roadmap' | 'certificate'>('ide');

  // 3D Perspective Card Tilt calculations
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    // Max 10 deg tilt on X & Y
    setTilt({
      rotateX: -normY * 12,
      rotateY: normX * 12,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  return (
    <section className="w-full py-24 border-t border-slate-200 dark:border-slate-800/80 bg-slate-900 text-white relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-600/15 via-cyan-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/10">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>KaizenQ Career & Internship Portal • 2026 Season</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading">
            Learn, Build & Grow Through <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Real-World Virtual Internships
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Gain structured industry experience, solve production architectural challenges under senior engineering mentorship, and graduate with verifiable digital credentials.
          </p>
        </div>

        {/* Domain Navigation Chips */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
          {FEATURED_TRACKS.map((track) => {
            const isSelected = selectedTrack.id === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrack(track)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <Briefcase className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{track.domain}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── 3D HOLOGRAPHIC VIEWPORT / SIMULATED DEV WORKSPACE ─── */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative transition-transform duration-300 ease-out"
          style={{
            perspective: 1200,
          }}
        >
          <div
            className="w-full rounded-3xl bg-slate-900/90 border border-slate-700/70 backdrop-blur-2xl shadow-2xl shadow-indigo-950/50 overflow-hidden relative group"
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Glossy Reflective Sheen Layer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 500px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.4), transparent)`,
              }}
            />

            {/* Top 3D Chrome Header Bar */}
            <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/50 shadow-xs" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/50 shadow-xs" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50 shadow-xs" />
                <span className="ml-2 text-[11px] font-mono text-slate-400 hidden sm:inline">
                  workspace://kaizenq-cloud-ide/{selectedTrack.slug}
                </span>
              </div>

              {/* Viewport Tabs */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveIframeTab('ide')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeIframeTab === 'ide'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>Role Specs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIframeTab('roadmap')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeIframeTab === 'roadmap'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Syllabus & Sprints</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIframeTab('certificate')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeIframeTab === 'certificate'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  <span>Credential</span>
                </button>
              </div>

              {/* Live Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Hiring • {selectedTrack.openings} Openings</span>
              </div>
            </div>

            {/* ─── 3D VIEWPORT BODY ─── */}
            <div className="p-6 sm:p-8 min-h-[420px] flex flex-col justify-between">
              {/* TAB 1: IDE / ROLE SPECS */}
              {activeIframeTab === 'ide' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Track Details */}
                  <div className="lg:col-span-6 space-y-5">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gradient-to-r text-white text-[10px] font-black uppercase tracking-wider" style={{ backgroundImage: 'linear-gradient(to right, #4f46e5, #06b6d4)' }}>
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>{selectedTrack.badge}</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {selectedTrack.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        Work directly with production microservices, perform high-impact architecture sprints, and submit weekly pull requests evaluated by our core engineering staff.
                      </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Duration</span>
                        <div className="flex items-center gap-1 font-bold text-white mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>{selectedTrack.duration}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Mode</span>
                        <div className="flex items-center gap-1 font-bold text-white mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{selectedTrack.mode}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Openings</span>
                        <div className="flex items-center gap-1 font-bold text-white mt-0.5">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{selectedTrack.openings} Positions</span>
                        </div>
                      </div>
                    </div>

                    {/* Stipend & Mentor Banner */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-800/40 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Stipend & Rewards</span>
                        <strong className="text-white text-xs sm:text-sm font-extrabold">{selectedTrack.stipend}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">Evaluator</span>
                        <span className="text-xs text-indigo-300 font-bold">{selectedTrack.mentor.name}</span>
                      </div>
                    </div>

                    {/* Skills Tag Cloud */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Required Stack & Tools</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTrack.skills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <Link
                        to={`/careers/${selectedTrack.slug}`}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>Apply For This Track</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        to="/careers"
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View All 9 Openings</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Simulated Live Code Editor */}
                  <div className="lg:col-span-6 bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-[11px] sm:text-xs text-slate-300 space-y-3 shadow-inner relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[10px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        <span>{selectedTrack.slug}.{selectedTrack.language === 'java' ? 'java' : 'ts'}</span>
                      </div>
                      <span className="text-emerald-400 font-bold uppercase tracking-wider">● EVALUATED PRODUCTION CODE</span>
                    </div>

                    <pre className="overflow-x-auto p-2 scrollbar-none leading-relaxed text-blue-200/90 font-mono">
                      <code>{selectedTrack.codeSnippet}</code>
                    </pre>

                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between text-xs font-semibold text-emerald-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Automated CI/CD Test Pipeline Passed (100% Code Coverage)</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400/80">0.04s</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SYLLABUS & ROADMAP */}
              {activeIframeTab === 'roadmap' && (
                <div className="space-y-6 py-2">
                  <div className="text-center space-y-1">
                    <h4 className="text-xl font-bold text-white">12-Week Structured Sprint Progression</h4>
                    <p className="text-xs text-slate-400">From architectural onboarding to automated production deployment</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        sprint: 'Phase 1 • Weeks 1-3',
                        title: 'Architecture & Foundations',
                        desc: 'Deep-dive into tech stack fundamentals, git conventions, database modeling, and domain architecture design.',
                        deliverable: 'Approved High-Level Design (HLD) & Schema Migration PR',
                      },
                      {
                        sprint: 'Phase 2 • Weeks 4-6',
                        title: 'Core Microservices & APIs',
                        desc: 'Construct secure RESTful endpoints, idempotency filters, multi-tenant authentication, and background workers.',
                        deliverable: 'Functional Endpoints with 90%+ Unit Test Coverage',
                      },
                      {
                        sprint: 'Phase 3 • Weeks 7-9',
                        title: 'Real-time & AI Integrations',
                        desc: 'Hook in telemetry, WebSocket events, caching, or LLM agent pipelines with latency optimizations.',
                        deliverable: 'Performance-tuned Integration PR & Benchmark Report',
                      },
                      {
                        sprint: 'Phase 4 • Weeks 10-12',
                        title: 'Production Deploy & Defense',
                        desc: 'Containerize, configure GitHub Actions CI/CD, deploy to cloud cluster, and defend code in technical review.',
                        deliverable: 'Live Staging Deployment & Verified Internship Credential',
                      },
                    ].map((step, idx) => (
                      <div
                        key={step.sprint}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 relative flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">
                            {step.sprint}
                          </span>
                          <strong className="text-sm font-bold text-white block">{step.title}</strong>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-normal">{step.desc}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[10px] text-blue-300 font-semibold">
                          📦 <strong>Deliverable:</strong> {step.deliverable}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-2">
                    <Link
                      to="/careers"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                    >
                      <span>Explore Detailed Curriculum Roadmaps</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 3: VERIFIED CREDENTIAL HOLOGRAM */}
              {activeIframeTab === 'certificate' && (
                <div className="py-4 flex flex-col items-center justify-center space-y-6">
                  <div className="max-w-md w-full p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-2xl text-center space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-950/50">
                      <Award className="w-8 h-8 text-amber-400" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                        Official Industry Experience Credential
                      </span>
                      <h4 className="text-lg font-black text-white">KaizenQ Virtual Internship Certificate</h4>
                      <p className="text-xs text-slate-300">
                        Awarded upon successful completion and code defense of {selectedTrack.title}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-left space-y-1 text-xs">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Verification Hash:</span>
                        <span className="font-mono text-cyan-400 font-bold">sha256-kq-2026-verified</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Accreditation:</span>
                        <span className="text-emerald-400 font-bold">Shaivika Groups LMS Core</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">QR Cryptographic Seal:</span>
                        <span className="text-indigo-300 font-bold">Tamper-Proof Digital Verification</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        to={`/careers/${selectedTrack.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-950/50"
                      >
                        <span>Start Internship Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── 3 FLOATING STATS CALLOUTS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-slate-850/60 border border-slate-800 backdrop-blur-md flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white text-sm font-bold block">100% Practical Engineering</strong>
              <p className="text-xs text-slate-400">Zero superficial tasks. Build and test real cloud software.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-850/60 border border-slate-800 backdrop-blur-md flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <strong className="text-white text-sm font-bold block">Verifiable Credentials</strong>
              <p className="text-xs text-slate-400">Cryptographically verifiable certificates & letters of completion.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-850/60 border border-slate-800 backdrop-blur-md flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <strong className="text-white text-sm font-bold block">Staff Mentor Guidance</strong>
              <p className="text-xs text-slate-400">Weekly code reviews and architecture guidance from senior engineers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Interactive3DInternshipShowcase;
