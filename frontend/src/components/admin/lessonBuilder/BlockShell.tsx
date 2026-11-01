import React from 'react';
import {
  GripVertical,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Heading,
  Type,
  Image,
  Video,
  FileText,
  Layers,
  Code2,
  HelpCircle,
  FileCheck2,
  Link2,
  Download,
  AlertCircle,
  Quote,
  List,
  Minus,
} from 'lucide-react';
import type { ILessonBlock, LessonBlockType } from '../../../../../shared/types/course';

interface BlockShellProps {
  block: ILessonBlock;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  children: React.ReactNode;
}

const TYPE_ICONS: Record<LessonBlockType, React.ComponentType<{ className?: string }>> = {
  heading: Heading,
  text: Type,
  callout: AlertCircle,
  quote: Quote,
  list: List,
  divider: Minus,
  image: Image,
  video: Video,
  pdf: FileText,
  embed: Layers,
  code: Code2,
  quiz: HelpCircle,
  assignment: FileCheck2,
  link: Link2,
  download: Download,
};

const TYPE_COLORS: Record<LessonBlockType, { bg: string; text: string; border: string }> = {
  heading: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  text: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  callout: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  quote: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  list: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  divider: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  image: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  video: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  pdf: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  embed: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  code: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  quiz: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  assignment: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
  link: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  download: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
};

export const BlockShell: React.FC<BlockShellProps> = ({
  block,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  children,
}) => {
  const Icon = TYPE_ICONS[block.type] || Type;
  const colors = TYPE_COLORS[block.type] || TYPE_COLORS.text;

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl transition-all duration-200 border cursor-pointer ${
        isSelected
          ? 'bg-slate-900/95 border-indigo-500/70 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
          : 'bg-slate-900/70 hover:bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
      } ${!block.isVisible ? 'opacity-50' : ''}`}
    >
      {/* Block Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-950/40 rounded-t-2xl">
        {/* Left: Drag Handle & Type Badge */}
        <div className="flex items-center space-x-2.5">
          <div
            title="Drag to reorder block"
            className="p-1 rounded text-slate-500 hover:text-slate-200 cursor-grab active:cursor-grabbing hover:bg-slate-800 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <div
            className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            <Icon className="w-3 h-3" />
            <span className="text-[11px]">{block.type}</span>
          </div>

          {!block.isVisible && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Hidden
            </span>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div
          className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Move Up */}
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            title="Move block up"
            className={`p-1.5 rounded-lg transition-colors ${
              isFirst
                ? 'text-slate-700 cursor-not-allowed'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            title="Move block down"
            className={`p-1.5 rounded-lg transition-colors ${
              isLast
                ? 'text-slate-700 cursor-not-allowed'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px bg-slate-800 mx-1" />

          {/* Hide / Show */}
          <button
            type="button"
            onClick={onToggleVisibility}
            title={block.isVisible ? 'Hide block from students' : 'Show block'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {block.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate block"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            title="Delete block"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block Body Content */}
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
};
