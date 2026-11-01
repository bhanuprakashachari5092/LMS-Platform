import React from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import type { Internship } from '@/services/internshipService';

interface InternshipCardProps {
  internship: Internship;
  onApply: (internship: Internship) => void;
  onViewDetails: (internship: Internship) => void;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  onApply,
  onViewDetails,
}) => {
  const isRemote = internship.internshipType?.toUpperCase() === 'REMOTE';
  const isHybrid = internship.internshipType?.toUpperCase() === 'HYBRID';

  const skillList = internship.requiredSkills
    ? internship.requiredSkills.split(',').map((s) => s.trim())
    : [];

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300">
      {/* Featured Ribbon / Badge */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            {internship.domain}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
              isRemote
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : isHybrid
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
            }`}
          >
            {internship.internshipType}
          </span>
        </div>

        {internship.isFeatured && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-linear-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Featured
          </span>
        )}
      </div>

      {/* Main Title & Description */}
      <div className="space-y-3 mb-5">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {internship.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {internship.description}
        </p>
      </div>

      {/* Program Metadata Grid */}
      <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 dark:border-slate-800/80 mb-5 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Duration: <strong className="text-slate-800 dark:text-slate-200">{internship.duration}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Openings: <strong className="text-slate-800 dark:text-slate-200">{internship.openings}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="truncate">{internship.location || 'Remote, India'}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate" title={internship.stipendAmount || 'Performance Stipend'}>
            {internship.stipendAmount || 'Performance Stipend'}
          </span>
        </div>
      </div>

      {/* Eligibility Pill */}
      <div className="mb-4 flex items-start gap-2 bg-slate-50 dark:bg-slate-850/50 rounded-xl p-2.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
        <GraduationCap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <span className="line-clamp-2">
          <strong className="text-slate-800 dark:text-slate-200">Eligibility:</strong> {internship.eligibility}
        </span>
      </div>

      {/* Required Skills Chips */}
      <div className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Core Technologies & Skills
        </span>
        <div className="flex flex-wrap gap-1.5">
          {skillList.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {skill}
            </span>
          ))}
          {skillList.length > 5 && (
            <span className="px-2 py-0.5 text-[11px] font-semibold text-slate-400">
              +{skillList.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onViewDetails(internship)}
          className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer text-center"
        >
          View Curriculum
        </button>
        <button
          type="button"
          onClick={() => onApply(internship)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

