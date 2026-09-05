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
  TrendingUp,
  Award,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import type { StudentUser } from '@/services/studentService';

export interface StudentRosterRowProps {
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

const StudentRosterRowComponent: React.FC<StudentRosterRowProps> = ({
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
    <tr
      className={`transition-colors group ${
        isSelected
          ? 'bg-sky-50/80 dark:bg-cyan-950/40 font-semibold'
          : isAtRisk
          ? 'bg-amber-50/20 dark:bg-amber-950/20 hover:bg-sky-50/40 dark:hover:bg-slate-800/40'
          : 'hover:bg-sky-50/40 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Selection Checkbox */}
      <td className="py-3 px-3 w-10 text-center">
        <button
          type="button"
          onClick={() => onToggleSelect(id)}
          className="cursor-pointer text-slate-600 dark:text-slate-400 focus:outline-hidden"
          aria-label={isSelected ? 'Deselect student' : 'Select student'}
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
          )}
        </button>
      </td>

      {/* Avatar Profile */}
      <td className="py-3 px-4">
        <div className="relative inline-block">
          {student.photoURL ? (
            <img
              src={student.photoURL}
              alt={student.name}
              className="w-9 h-9 rounded-full object-cover border border-sky-300 dark:border-slate-700 shadow-xs"
              loading="lazy"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-linear-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </div>
          )}
          {isGithub ? (
            <span className="absolute -bottom-1 -right-1 text-[10px]" title="GitHub OAuth">🐱</span>
          ) : (
            <span className="absolute -bottom-1 -right-1 text-[10px]" title="Email Account">✉️</span>
          )}
        </div>
      </td>

      {/* Full Name & Telemetry */}
      <td className="py-3 px-4">
        <div
          onClick={() => onInspect(student)}
          className="font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>{student.name || student.fullName}</span>
          {isAtRisk && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300" title="Performance Attention Required">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>At Risk</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-sky-700 dark:text-cyan-300">{score}% Score</span>
          <span>•</span>
          <span>{attendance}% Attn</span>
        </div>
      </td>

      {/* Email */}
      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
        <div className="truncate max-w-44 font-mono text-[11px]">{student.email}</div>
      </td>

      {/* College & Branch */}
      <td className="py-3 px-4">
        <div className="font-bold text-slate-800 dark:text-slate-200">{student.college || 'Shaivika AI Foundation'}</div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400">{student.branch || 'AI & Computer Science'}</div>
      </td>

      {/* Joined Date */}
      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap text-[11px] font-medium">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span>{student.joined || (student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently')}</span>
        </div>
      </td>

      {/* GitHub & Portfolio */}
      <td className="py-3 px-4">
        {student.githubUsername || student.github ? (
          <button
            type="button"
            onClick={() => onInspectGithub(student)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 text-cyan-300 font-mono text-[10px] font-bold border border-slate-700 shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Code2 className="w-3 h-3 text-cyan-400" />
            <span>@{student.githubUsername || 'github'}</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Not Connected</span>
        )}
      </td>

      {/* Status Badge */}
      <td className="py-3 px-4">
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
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
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
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Admin Approve Button */}
          {!isInstructor && status === 'pending' && (
            <button
              type="button"
              disabled={isApproving || isRejecting}
              onClick={() => onApprove(id)}
              className={`p-1.5 rounded-lg border font-bold transition-all shadow-xs ${
                isApproving
                  ? 'bg-emerald-100 text-emerald-400 border-emerald-200 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200 cursor-pointer active:scale-95'
              }`}
              title={isApproving ? 'Approving student...' : 'Approve Student'}
            >
              {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
          )}

          {/* Admin Reject Button */}
          {!isInstructor && status === 'pending' && (
            <button
              type="button"
              disabled={isApproving || isRejecting}
              onClick={() => onOpenRejectModal(id)}
              className={`p-1.5 rounded-lg border font-bold transition-all shadow-xs ${
                isRejecting
                  ? 'bg-rose-100 text-rose-400 border-rose-200 cursor-not-allowed'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-rose-200 cursor-pointer active:scale-95'
              }`}
              title="Reject Application"
            >
              {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            </button>
          )}

          {/* View Profile Telemetry */}
          <button
            type="button"
            onClick={() => onInspect(student)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all cursor-pointer"
            title={isInstructor ? 'View Student Telemetry & Progress Report' : 'View Student Profile'}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Instructor Flag */}
          {isInstructor && onOpenFlagModal && (
            <button
              type="button"
              onClick={() => onOpenFlagModal(student)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
              title="Submit Academic Report / Concern"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}

          {/* Admin Edit Details */}
          {!isInstructor && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(student)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all cursor-pointer"
              title="Edit Student"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {/* Send Email */}
          <button
            type="button"
            onClick={() => onEmail(student)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
            title="Send Email / Feedback"
          >
            <Send className="w-4 h-4" />
          </button>

          {/* Admin Delete Account */}
          {!isInstructor && onOpenDeleteModal && (
            <button
              type="button"
              onClick={() => onOpenDeleteModal(id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              title="Delete Student"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const StudentRosterRow = React.memo(StudentRosterRowComponent, (prevProps, nextProps) => {
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
