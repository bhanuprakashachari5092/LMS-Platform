import React from 'react';
import {
  Check,
  XCircle,
  Eye,
  Edit,
  Send,
  Trash2,
  Flag,
  Calendar,
  Code2,
  CheckSquare,
  Square,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { StudentUser } from '@/services/studentService';

export interface StudentRosterMobileCardProps {
  student: StudentUser;
  isSelected: boolean;
  isInstructor: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  onToggleSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onOpenRejectModal: (id: string) => void;
  onInspect: (student: StudentUser) => void;
  onInspectGithub: (student: StudentUser) => void;
  onEdit?: (student: StudentUser) => void;
  onEmail: (student: StudentUser) => void;
  onOpenDeleteModal?: (id: string) => void;
  onOpenFlagModal?: (student: StudentUser) => void;
}

const StudentRosterMobileCardComponent: React.FC<StudentRosterMobileCardProps> = ({
  student,
  isSelected,
  isInstructor,
  isApproving,
  isRejecting,
  onToggleSelect,
  onApprove,
  onOpenRejectModal,
  onInspect,
  onInspectGithub,
  onEdit,
  onEmail,
  onOpenDeleteModal,
  onOpenFlagModal,
}) => {
  const id = student.id || student.uid;
  const isGithub = student.provider === 'github.com' || Boolean(student.photoURL?.includes('github')) || student.githubUsername;
  const status = (student.status || (student.approved ? 'approved' : 'pending')).toLowerCase();
  const perf = student.studentPerformanceSummary;

  const score = perf?.overallScore ?? student.learningScore ?? 85;
  const attendance = perf?.attendance ?? 92;
  const isAtRisk = perf?.riskLevel === 'high' || score < 65;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all space-y-3 font-['Sora'] ${
        isSelected
          ? 'bg-sky-50/90 dark:bg-cyan-950/40 border-sky-300 dark:border-cyan-800 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-sky-100 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleSelect(id)}
            className="cursor-pointer text-slate-600 dark:text-slate-400 focus:outline-hidden"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            )}
          </button>

          <div className="relative">
            {student.photoURL ? (
              <img
                src={student.photoURL}
                alt={student.name}
                className="w-10 h-10 rounded-full object-cover border border-sky-300 dark:border-slate-700 shadow-xs"
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
            {isGithub ? (
              <span className="absolute -bottom-1 -right-1 text-[10px]">🐱</span>
            ) : (
              <span className="absolute -bottom-1 -right-1 text-[10px]">✉️</span>
            )}
          </div>

          <div>
            <div
              onClick={() => onInspect(student)}
              className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:text-sky-600 dark:hover:text-cyan-400"
            >
              {student.name || student.fullName}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
              {student.email}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isApproving ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
              <span>Approving...</span>
            </span>
          ) : isRejecting ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
              <span>Rejecting...</span>
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                status === 'pending'
                  ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                  : status === 'approved' || status === 'active'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : status === 'rejected'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      {/* College & Performance row */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{student.branch || 'AI & CS'}</span>
          <span className="text-[10px] text-slate-400 block">{student.college || 'Shaivika Institute'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-cyan-300 font-bold text-[11px] border border-sky-200 dark:border-sky-800">
            {score}% Score
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
            {attendance}% Attn
          </span>
          {isAtRisk && (
            <span className="px-1.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
              Risk
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          {student.githubUsername && (
            <button
              type="button"
              onClick={() => onInspectGithub(student)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 text-cyan-300 font-mono text-[10px] font-bold border border-slate-700 cursor-pointer"
            >
              <Code2 className="w-3 h-3 text-cyan-400" />
              <span>@{student.githubUsername}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isInstructor && status === 'pending' && (
            <>
              <button
                type="button"
                disabled={isApproving || isRejecting}
                onClick={() => onApprove(id)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isApproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                <span>Approve</span>
              </button>
              <button
                type="button"
                disabled={isApproving || isRejecting}
                onClick={() => onOpenRejectModal(id)}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isRejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                <span>Reject</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onInspect(student)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all cursor-pointer"
            title="Inspect"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEmail(student)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
            title="Email"
          >
            <Send className="w-4 h-4" />
          </button>
          {!isInstructor && onOpenDeleteModal && (
            <button
              type="button"
              onClick={() => onOpenDeleteModal(id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const StudentRosterMobileCard = React.memo(StudentRosterMobileCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.student.id === nextProps.student.id &&
    prevProps.student.status === nextProps.student.status &&
    prevProps.student.approved === nextProps.student.approved &&
    prevProps.student.learningScore === nextProps.student.learningScore &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isApproving === nextProps.isApproving &&
    prevProps.isRejecting === nextProps.isRejecting &&
    prevProps.isInstructor === nextProps.isInstructor
  );
});
