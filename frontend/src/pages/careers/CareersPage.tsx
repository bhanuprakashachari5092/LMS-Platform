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
} from 'lucide-react';
import { InternshipCard } from '@/components/careers/InternshipCard';
import { InternshipApplyModal } from '@/components/careers/InternshipApplyModal';
import { InternshipDetailModal } from '@/components/careers/InternshipDetailModal';
import { internshipService, type Internship, type InternshipDetail } from '@/services/internshipService';

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
  'Backend Development',
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

  // Load internships from backend
  const loadInternships = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await internshipService.getOpenInternships({
        domain: selectedDomain !== 'ALL' ? selectedDomain : undefined,
        department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
        employmentType: (activeTab !== 'ALL' && activeTab !== 'REMOTE') ? activeTab : undefined,
        internshipType: activeTab === 'REMOTE' ? 'REMOTE' : (selectedMode !== 'ALL' ? selectedMode : undefined),
        search: searchQuery || undefined,
        size: 50,
      });
      setInternships(data.content || []);
    } catch (err: any) {
      console.error('Failed to load openings from backend:', err);
      setError('Unable to load openings. Please try again.');
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

  const handleOpenApply = (intern: Internship) => {
    setSelectedInternshipForApply(intern);
    setIsApplyModalOpen(true);
  };

  const handleOpenDetail = async (intern: Internship) => {
    try {
      const detail = await internshipService.getInternshipDetail(intern.slug || intern.id);
      setSelectedInternshipDetail(detail);
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
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.25),rgba(2,6,23,0))] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/70 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Shaivika Groups &bull; Education & Career Development</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Build the Future of Learning with{' '}
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
              KaizenQ
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            KaizenQ is an advanced educational and career-development platform by Shaivika Groups. Gain practical industry experience through structured virtual internships, real-world engineering projects, and dedicated mentorship.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={scrollToOpenings}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 flex items-center gap-2 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Openings</span>
            </button>
            <button
              onClick={scrollToOpenings}
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Apply for Internship</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 pt-10 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">8+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Specialized Tech Tracks</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Hands-on Project Based</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">1-on-1</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Mentor Evaluation</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Verified</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">QR Credentials</div>
            </div>
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
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          ) : error ? (
            <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl max-w-md mx-auto space-y-3">
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
              <button
                onClick={loadInternships}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : internships.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md mx-auto space-y-4">
              <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">No openings found</h4>
              <p className="text-xs text-slate-500">
                No active openings match the selected filters. Try resetting the filters or searching with different keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
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
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => loadInternships()}
      />

      <InternshipDetailModal
        internship={selectedInternshipDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onApply={(intern) => {
          setIsDetailModalOpen(false);
          handleOpenApply(intern);
        }}
      />
    </div>
  );
};
