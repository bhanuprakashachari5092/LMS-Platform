import React from 'react';
import {
  X,
  Briefcase,
  Clock,
  MapPin,
  Users,
  DollarSign,
  GraduationCap,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import type { Internship, InternshipDetail } from '@/services/internshipService';

interface InternshipDetailModalProps {
  internship: InternshipDetail | Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (internship: Internship) => void;
}

export const InternshipDetailModal: React.FC<InternshipDetailModalProps> = ({
  internship,
  isOpen,
  onClose,
  onApply,
}) => {
  if (!isOpen || !internship) return null;

  const tasks = (internship as InternshipDetail).tasks || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                {internship.domain}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {internship.internshipType}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {internship.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-sm">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Duration</span>
              <strong className="text-slate-900 dark:text-white font-bold">{internship.duration}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Location</span>
              <strong className="text-slate-900 dark:text-white font-bold">{internship.location || 'Remote'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Openings</span>
              <strong className="text-slate-900 dark:text-white font-bold">{internship.openings} Positions</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Stipend / Incentive</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold truncate block">
                {internship.stipendAmount || 'Performance Stipend'}
              </strong>
            </div>
          </div>

          {/* Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Program Overview</h4>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">{internship.description}</p>
          </div>

          {/* Eligibility & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                Eligibility Criteria
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{internship.eligibility}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                Required Tech Stack
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{internship.requiredSkills}</p>
            </div>
          </div>

          {/* Responsibilities */}
          {internship.responsibilities && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Responsibilities</h4>
              <div className="space-y-1.5">
                {internship.responsibilities.split('\n').filter(Boolean).map((resp, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{resp.replace(/^[-*]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          {internship.learningOutcomes && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Learning Outcomes & Deliverables</h4>
              <div className="space-y-1.5">
                {internship.learningOutcomes.split('\n').filter(Boolean).map((out, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{out.replace(/^[-*]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Tasks / Syllabus */}
          {tasks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Structured Weekly Deliverables</h4>
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                      W{task.weekNumber}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">{task.title}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{task.description}</p>
                      {task.deliverables && (
                        <span className="inline-block mt-1 text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                          Deliverable: {task.deliverables}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance & Verification Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Academic & Industry Standards:</strong> Structured internship programs adhere to industry skill standards with verifiable digital credentials. Stipends and certifications are subject to performance metrics and completion criteria.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onApply(internship);
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>Apply for this Role</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

