import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Eye,
  Briefcase,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { InternshipCard } from './InternshipCard';
import type { Internship } from '@/services/internshipService';

interface CareersPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: Internship[];
}

export const CareersPreviewModal: React.FC<CareersPreviewModalProps> = ({
  isOpen,
  onClose,
  opportunities,
}) => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // In public view, only published / open opportunities are visible
  const publishedList = opportunities.filter(
    (o) => o.status === 'PUBLISHED' || o.status === 'OPEN'
  );

  const filtered = publishedList.filter((item) => {
    if (activeTab === 'REMOTE' && item.internshipType !== 'REMOTE') return false;
    if (activeTab !== 'ALL' && activeTab !== 'REMOTE' && item.employmentType !== activeTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        item.title?.toLowerCase().includes(q) ||
        item.domain?.toLowerCase().includes(q) ||
        item.requiredSkills?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Preview Control Bar */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Public Careers Page Preview
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Showing candidate view for published opportunities ({publishedList.length} live)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/careers"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Open Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Mock Public Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/60">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Shaivika Groups &bull; Education & Career Development</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Build the Future of Learning with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                KaizenQ
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Gain practical industry experience through structured virtual internships, real-world engineering projects, and dedicated mentorship.
            </p>
          </div>

          {/* Search & Tabs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                {[
                  { id: 'ALL', label: 'All Openings' },
                  { id: 'INTERNSHIP', label: 'Internships' },
                  { id: 'FULL_TIME', label: 'Full-time' },
                  { id: 'PART_TIME', label: 'Part-time' },
                  { id: 'REMOTE', label: 'Remote Only' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === t.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search role or skill..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Live Cards Grid */}
            {filtered.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  No published openings match this filter
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Make sure opportunities in the admin catalog have status set to &quot;PUBLISHED&quot; or &quot;OPEN&quot;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item) => (
                  <InternshipCard
                    key={item.id}
                    internship={item}
                    onApply={() => {}}
                    onViewDetails={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>This is a real-time preview of the candidate-facing portal.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

