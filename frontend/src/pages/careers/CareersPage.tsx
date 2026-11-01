import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  Loader2,
  Terminal,
} from 'lucide-react';
import { InternshipCard } from '@/components/careers/InternshipCard';
import { InternshipApplyModal } from '@/components/careers/InternshipApplyModal';
import { InternshipDetailModal } from '@/components/careers/InternshipDetailModal';
import { internshipService, type Internship, type InternshipDetail } from '@/services/internshipService';

const DOMAIN_CATEGORIES = [
  'ALL',
  'Full Stack Web Development',
  'Frontend Development',
  'Backend Development',
  'Artificial Intelligence & Machine Learning',
  'Data Science',
  'Cloud Computing & DevOps',
  'UI/UX Design',
  'Cybersecurity',
];

const INTERNSHIP_TYPES = ['ALL', 'REMOTE', 'HYBRID', 'ONSITE'];

export const CareersPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
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
        domain: selectedDomain,
        type: selectedType,
        search: searchQuery || undefined,
        size: 50,
      });
      setInternships(data.content || []);
    } catch (err: any) {
      console.error('Failed to load internships from backend:', err);
      setError('Unable to load internship opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, [selectedDomain, selectedType]);

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

  const scrollToInternships = () => {
    const el = document.getElementById('internship-listings');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors font-['Sora']">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800/80 bg-linear-to-b from-blue-50/50 via-white to-slate-50/50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 dark:opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KaizenQ Student Careers & Internship Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Build Your Career with <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">KaizenQ</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Learn, build, and grow through real-world projects and structured internship opportunities designed to transition engineering students into industry-ready software engineers.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={scrollToInternships}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Internships</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (internships.length > 0) {
                  handleOpenApply(internships[0]);
                } else {
                  scrollToInternships();
                }
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4 text-blue-500" />
            </button>
          </div>

          {/* Quick Pillars Banner */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 font-bold">
                1
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Real Deliverables</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Production repos & live apps, not dummy theory.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 font-bold">
                2
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Industry Mentors</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Direct code reviews by senior engineering architects.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 font-bold">
                3
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Verified Credentials</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tamper-proof certificates with public QR verification.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 font-bold">
                4
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Structured Tasks</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Weekly milestones tracked inside your LMS dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Internship Listings & Filter Section */}
      <section id="internship-listings" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
              Active Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Available Internships
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Select a specialized domain to view eligibility, curriculum milestones, and submit your application.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or tech stack..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:border-blue-500 focus:outline-hidden shadow-2xs"
            />
          </form>
        </div>

        {/* Filter Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="font-bold text-slate-400 shrink-0 text-[11px] uppercase tracking-wider mr-1">
              Domain:
            </span>
            {DOMAIN_CATEGORIES.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDomain === domain
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                {domain === 'ALL' ? 'All Domains' : domain}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 shrink-0 text-[11px] uppercase tracking-wider mr-1">
              Mode:
            </span>
            {INTERNSHIP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                  selectedType === type
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                    : 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Grid or Empty/Loading States */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading open internship positions...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm text-rose-500 font-semibold">{error}</p>
            <button
              onClick={loadInternships}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : internships.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No internship programs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find matching roles with the selected filters. Try choosing "All Domains" or clearing your search.
            </p>
            <button
              onClick={() => {
                setSelectedDomain('ALL');
                setSelectedType('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((intern) => (
              <InternshipCard
                key={intern.id}
                internship={intern}
                onApply={handleOpenApply}
                onViewDetails={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. AICTE & Institutional Compliance Section */}
      <section className="py-16 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Institutional Documentation & Accreditation Guidelines</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Designed for Academic & Industry Curriculum Alignment
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
            KaizenQ internship cohorts follow structured syllabus outlines, measurable weekly capstone milestones, and cryptographic QR certificate verification suitable for university submission, AICTE activity points documentation, and autonomous engineering college internship credits. Official affiliations and academic credits are verifiable per participating institutional partner policies.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left text-xs">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white mb-1">Standardized Learning Outcomes</h5>
              <p className="text-slate-500 text-[11px]">Clear weekly syllabi, evaluation rubrics, and project deliverables for academic documentation.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white mb-1">Authentic Industry Experience</h5>
              <p className="text-slate-500 text-[11px]">Hands-on engineering using production Git repos, CI/CD, and real cloud backends.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white mb-1">Cryptographic QR Verification</h5>
              <p className="text-slate-500 text-[11px]">Every completion certificate features a tamper-proof SHA-256 digital hash verification portal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <InternshipApplyModal
        internship={selectedInternshipForApply}
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedInternshipForApply(null);
        }}
        onSuccess={() => {
          loadInternships();
        }}
      />

      <InternshipDetailModal
        internship={selectedInternshipDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedInternshipDetail(null);
        }}
        onApply={(intern) => {
          handleOpenApply(intern);
        }}
      />
    </div>
  );
};

