import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  Layers,
  GraduationCap,
  Loader2,
  Terminal,
  Code2,
  Cpu,
  BookOpen,
  FileCheck,
} from 'lucide-react';
import { InternshipCard } from '@/components/careers/InternshipCard';
import { InternshipApplyModal } from '@/components/careers/InternshipApplyModal';
import { InternshipDetailModal } from '@/components/careers/InternshipDetailModal';
import { internshipService, type Internship, type InternshipDetail } from '@/services/internshipService';
import { DEFAULT_CAREER_OPENINGS } from '@/services/careersService';

const JOB_TYPE_TABS = [
  { id: 'ALL', label: 'All Openings' },
  { id: 'INTERNSHIP', label: 'Internships' },
  { id: 'FULL_TIME', label: 'Full-time' },
  { id: 'PART_TIME', label: 'Part-time' },
  { id: 'REMOTE', label: 'Remote Only' },
];

const DOMAIN_CATEGORIES = [
  'ALL',
  'Full Stack Web Development',
  'Frontend Development',
  'Artificial Intelligence & Machine Learning',
  'Data Science',
  'Cloud Computing & DevOps',
  'UI/UX Design',
  'QA / Testing',
  'Cybersecurity',
];

const DEPARTMENTS = [
  'ALL',
  'Engineering',
  'AI & Machine Learning',
  'Data Science',
  'Cloud & Infrastructure',
  'Product & Design',
  'Quality Engineering',
  'Information Security',
];

const WORK_MODES = ['ALL', 'REMOTE', 'HYBRID', 'ONSITE'];

export const CareersPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedInternshipForApply, setSelectedInternshipForApply] = useState<Internship | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [selectedInternshipDetail, setSelectedInternshipDetail] = useState<InternshipDetail | Internship | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load opportunities dynamically from backend (published only)
  const loadInternships = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await internshipService.getOpenInternships({
        domain: selectedDomain !== 'ALL' ? selectedDomain : undefined,
        department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
        employmentType: activeTab !== 'ALL' && activeTab !== 'REMOTE' ? activeTab : undefined,
        internshipType: activeTab === 'REMOTE' ? 'REMOTE' : selectedMode !== 'ALL' ? selectedMode : undefined,
        search: searchQuery.trim() || undefined,
        size: 50,
      });

      if (data && Array.isArray(data.content) && data.content.length > 0) {
        setInternships(data.content);
      } else {
        setInternships(DEFAULT_CAREER_OPENINGS);
      }
    } catch (err: any) {
      console.warn('Backend /careers offline or unreachable, activating fallback openings:', err);
      setInternships(DEFAULT_CAREER_OPENINGS);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, [activeTab, selectedDomain, selectedDepartment, selectedMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInternships();
  };

  const handleOpenApply = (intern: Internship | null) => {
    setSelectedInternshipForApply(intern);
    setIsApplyModalOpen(true);
  };

  const handleOpenDetail = async (intern: Internship) => {
    try {
      const detail = await internshipService.getInternshipDetail(intern.slug || intern.id);
      setSelectedInternshipDetail(detail || intern);
    } catch {
      setSelectedInternshipDetail(intern);
    }
    setIsDetailModalOpen(true);
  };

  const scrollToOpenings = () => {
    const el = document.getElementById('openings-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setActiveTab('ALL');
    setSelectedDomain('ALL');
    setSelectedDepartment('ALL');
    setSelectedMode('ALL');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.25),rgba(2,6,23,0))] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Live Published Count Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/70 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{internships.length} Active Opportunities &bull; Shaivika Groups</span>
          </div>

          {/* Exact Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Build What Matters.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Grow With KaizenQ.
            </span>
          </h1>

          {/* Exact Supporting Text */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Explore opportunities to learn, build real-world products, and grow alongside an ambitious engineering team.
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-xl mx-auto relative flex items-center shadow-lg shadow-blue-500/5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
          >
            <Search className="w-4 h-4 ml-3 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, track, or technical skill (e.g. React, Python, Cloud)..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={scrollToOpenings}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              <span>Browse All Positions</span>
            </button>
            <button
              onClick={() => handleOpenApply(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>General Application</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── CULTURE & VALUE PILLARS ─── */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Why Launch Your Journey with KaizenQ?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Practical Experience Designed for Modern Careers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Production-Grade Codebase</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Work on production repositories with code reviews, Git branching strategies, automated testing, and CI/CD pipelines instead of toy tutorials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Dedicated Technical Mentors</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive weekly rubrics, feedback on pull requests, live interview rounds, and architectural guidance from experienced software practitioners.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Verifiable Cryptographic Proof</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Earn verifiable completion credentials backed by SHA-256 hashes and QR verification links that showcase your real deliverables to employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OPENINGS & INTERNSHIPS SECTION ─── */}
      <section id="openings-section" className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Opportunities
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Current Openings & Internship Programs
              </h2>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role or skill..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden shadow-xs"
              />
            </form>
          </div>

          {/* Job Type Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
            {JOB_TYPE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-8 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Domain</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                >
                  {DOMAIN_CATEGORIES.map((d) => (
                    <option key={d} value={d}>
                      {d === 'ALL' ? 'All Technical Domains' : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === 'ALL' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Work Mode</label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                >
                  {WORK_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m === 'ALL' ? 'All Work Modes (Remote / Hybrid)' : m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(activeTab !== 'ALL' || selectedDomain !== 'ALL' || selectedDepartment !== 'ALL' || selectedMode !== 'ALL' || searchQuery.trim().length > 0) && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 text-[11px]">Filters applied to listing</span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-4">
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-16 w-full bg-slate-100 dark:bg-slate-850 rounded-md" />
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-md mt-6" />
                </div>
              ))}
            </div>
          ) : internships.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md mx-auto space-y-4">
              <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">No openings found</h4>
              <p className="text-xs text-slate-500">
                No active openings match the selected filters. Try resetting the filters or submit an open application.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => handleOpenApply(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  General Application
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {internships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    onApply={handleOpenApply}
                    onViewDetails={handleOpenDetail}
                  />
                ))}
              </div>

              {/* General Application Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-blue-800/40">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    Open Recruitment & Talent Pool
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    Don&apos;t see your specific technical track listed?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    We are constantly onboarding promising engineers, researchers, and designers. Submit your profile to our general recruitment pool and our talent team will review your application.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenApply(null)}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold tracking-wide uppercase transition-all shadow-md shrink-0 hover:scale-[1.03] cursor-pointer"
                >
                  Submit General Application &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── INSTITUTIONAL DISCLAIMER & TRANSPARENCY NOTICE ─── */}
      <section className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Academic & Recruitment Transparency Notice</span>
          </div>
          <p className="leading-relaxed">
            KaizenQ internship programs are designed to provide structured engineering practice, code artifact creation, and industry skills development. Listings clearly indicate compensation terms (performance incentive, fixed stipend, or unstipended practical learning). Completion certificates are issued strictly upon satisfying code review and deliverable rubrics. AICTE documentation workflows are formatted to support academic credit evaluations per institutional policies.
          </p>
        </div>
      </section>

      {/* ─── MODALS ─── */}
      <InternshipApplyModal
        internship={selectedInternshipForApply}
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedInternshipForApply(null);
        }}
        onSuccess={() => loadInternships()}
      />

      <InternshipDetailModal
        internship={selectedInternshipDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedInternshipDetail(null);
        }}
        onApply={(intern) => {
          setIsDetailModalOpen(false);
          handleOpenApply(intern);
        }}
      />
    </div>
  );
};
