import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Video as VideoIcon,
  HelpCircle,
  CheckSquare,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  GripVertical,
  PlayCircle,
  Clock
} from 'lucide-react';
import type { ModuleItem, LearningUnitItem, LearningUnitType } from '@/contexts/CourseContext';
import { getPresentationLessonTitle } from '@/contexts/CourseContext';

export interface CourseBuilderTreeProps {
  modules: ModuleItem[];
  selectedLessonId?: string | null;
  onSelectLesson: (unit: LearningUnitItem, moduleId: string, topicId: string) => void;
  onAddItem: (moduleId: string, type: LearningUnitType, topicId?: string) => void;
  onDeleteModule: (module: ModuleItem) => void;
  onDeleteLesson: (unit: LearningUnitItem, moduleId: string) => void;
  onAddModule: () => void;
  onReorderLesson?: (draggedLessonId: string, targetLessonId: string, sourceModId: string, targetModId: string) => void;
  searchQuery?: string;
}

export const getItemTypeMeta = (type?: string) => {
  const norm = (type || 'Reading').toLowerCase();
  if (norm === 'video') {
    return {
      label: 'Video',
      icon: VideoIcon,
      badgeClass: 'bg-purple-950/70 text-purple-300 border-purple-800/80',
      iconClass: 'text-purple-400',
      accentColor: '#a855f7',
      bgGlow: 'hover:border-purple-500/50',
    };
  }
  if (norm === 'quiz') {
    return {
      label: 'Quiz',
      icon: HelpCircle,
      badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-800/80',
      iconClass: 'text-amber-400',
      accentColor: '#f59e0b',
      bgGlow: 'hover:border-amber-500/50',
    };
  }
  if (norm === 'assignment') {
    return {
      label: 'Assignment',
      icon: CheckSquare,
      badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80',
      iconClass: 'text-emerald-400',
      accentColor: '#10b981',
      bgGlow: 'hover:border-emerald-500/50',
    };
  }
  // Default: Lesson / Reading
  return {
    label: 'Lesson',
    icon: BookOpen,
    badgeClass: 'bg-sky-950/70 text-sky-300 border-sky-800/80',
    iconClass: 'text-sky-400',
    accentColor: '#38bdf8',
    bgGlow: 'hover:border-sky-500/50',
  };
};

export const CourseBuilderTree: React.FC<CourseBuilderTreeProps> = ({
  modules,
  selectedLessonId,
  onSelectLesson,
  onAddItem,
  onDeleteModule,
  onDeleteLesson,
  onAddModule,
  onReorderLesson,
  searchQuery = '',
}) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [openAddMenuModId, setOpenAddMenuModId] = useState<string | null>(null);
  const [draggedLesson, setDraggedLesson] = useState<{ lessonId: string; moduleId: string } | null>(null);
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: prev[modId] !== undefined ? !prev[modId] : false,
    }));
  };

  const handleDragStart = (e: React.DragEvent, lessonId: string, moduleId: string) => {
    e.dataTransfer.setData('text/plain', lessonId);
    setDraggedLesson({ lessonId, moduleId });
  };

  const handleDrop = (e: React.DragEvent, targetLessonId: string, targetModId: string) => {
    e.preventDefault();
    setDragOverLessonId(null);
    if (!draggedLesson || draggedLesson.lessonId === targetLessonId) return;
    if (onReorderLesson) {
      onReorderLesson(draggedLesson.lessonId, targetLessonId, draggedLesson.moduleId, targetModId);
    }
    setDraggedLesson(null);
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header with Title and Add Unit */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-slate-200">Course Builder</h4>
            <p className="text-[10px] text-slate-500 font-mono">Curriculum Tree</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddModule}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-300 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 rounded-lg transition-all shadow-xs hover:shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="w-3 h-3 text-indigo-400" />
          <span>Add Unit</span>
        </button>
      </div>

      {/* Curriculum Tree Nodes */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        {(!modules || modules.length === 0) ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-2">
            <Layers className="w-7 h-7 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No curriculum units yet</p>
            <p className="text-[10px] text-slate-500">Create your first Unit to start structuring lessons, videos, and quizzes.</p>
            <button
              type="button"
              onClick={onAddModule}
              className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              + Create Unit 1
            </button>
          </div>
        ) : (
          modules.map((module, modIdx) => {
            const isExpanded = expandedModules[module.id] !== false;
            const allUnits = module.lessons || module.topics?.flatMap((t) => t.learningUnits) || [];
            const firstTopicId = module.topics?.[0]?.id || `${module.id}-t1`;
            const filteredUnits = allUnits.filter(
              (u) => !searchQuery || u.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const isAddMenuOpen = openAddMenuModId === module.id;

            return (
              <div
                key={module.id}
                className="relative rounded-xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80 transition-all shadow-xs"
              >
                {/* Unit Header Card */}
                <div
                  onClick={() => toggleModule(module.id)}
                  className="group flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-900 cursor-pointer rounded-t-xl transition-colors select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-indigo-400">U{modIdx + 1}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                      {module.title || `Unit ${modIdx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {allUnits.length}
                    </span>

                    {/* Quick Add Dropdown Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenAddMenuModId(isAddMenuOpen ? null : module.id)}
                        className={`p-1 rounded-md transition-all cursor-pointer ${
                          isAddMenuOpen
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-slate-800 text-indigo-400'
                        }`}
                        title="Add item to Unit"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {isAddMenuOpen && (
                        <div
                          className="absolute right-0 top-full mt-1 w-44 z-50 py-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                            Add to Unit {modIdx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onAddItem(module.id, 'Reading', firstTopicId);
                              setOpenAddMenuModId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:text-sky-300 hover:bg-sky-950/50 transition-colors text-left cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                            <span className="font-semibold">Lesson</span>
                            <span className="ml-auto text-[9px] text-slate-500 font-mono">Reading</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onAddItem(module.id, 'Video', firstTopicId);
                              setOpenAddMenuModId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:text-purple-300 hover:bg-purple-950/50 transition-colors text-left cursor-pointer"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-semibold">Video</span>
                            <span className="ml-auto text-[9px] text-slate-500 font-mono">Lecture</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onAddItem(module.id, 'Quiz', firstTopicId);
                              setOpenAddMenuModId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:text-amber-300 hover:bg-amber-950/50 transition-colors text-left cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-semibold">Quiz</span>
                            <span className="ml-auto text-[9px] text-slate-500 font-mono">Test</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onAddItem(module.id, 'Assignment', firstTopicId);
                              setOpenAddMenuModId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/50 transition-colors text-left cursor-pointer"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-semibold">Assignment</span>
                            <span className="ml-auto text-[9px] text-slate-500 font-mono">Project</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteModule(module)}
                      className="p-1 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                      title="Delete Unit"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Subtree Children (Lessons / Videos / Quizzes / Assignments) */}
                {isExpanded && (
                  <div className="p-2 space-y-1 bg-slate-950/50 border-t border-slate-800/60 rounded-b-xl relative">
                    {/* Visual tree guide line */}
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-800/80 pointer-events-none" />

                    {filteredUnits.length === 0 ? (
                      <div className="pl-6 py-2.5 text-center text-[11px] text-slate-500">
                        No items in this unit yet.{' '}
                        <button
                          type="button"
                          onClick={() => onAddItem(module.id, 'Reading', firstTopicId)}
                          className="text-indigo-400 hover:underline font-bold"
                        >
                          + Add Item
                        </button>
                      </div>
                    ) : (
                      filteredUnits.map((unit, uIdx) => {
                        const isSelected = selectedLessonId === unit.id;
                        const isLast = uIdx === filteredUnits.length - 1;
                        const typeMeta = getItemTypeMeta(unit.type);
                        const ItemIcon = typeMeta.icon;
                        const isDragOver = dragOverLessonId === unit.id;
                        const displayTitle = getPresentationLessonTitle(
                          unit.title,
                          modIdx + 1,
                          filteredUnits.length
                        );

                        return (
                          <div
                            key={unit.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, unit.id, module.id)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOverLessonId(unit.id);
                            }}
                            onDragLeave={() => setDragOverLessonId(null)}
                            onDrop={(e) => handleDrop(e, unit.id, module.id)}
                            onClick={() => onSelectLesson(unit, module.id, firstTopicId)}
                            className={`group relative flex items-center justify-between gap-2 p-2 pl-6 rounded-xl cursor-pointer transition-all ${
                              isDragOver
                                ? 'border-2 border-indigo-500 bg-indigo-950/80 scale-[1.01]'
                                : isSelected
                                ? 'bg-indigo-600/90 text-white shadow-lg border border-indigo-400/50'
                                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/70 border border-slate-800/60 hover:border-slate-700'
                            }`}
                          >
                            {/* Branch connector visual glyph */}
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center text-slate-700 pointer-events-none text-xs font-mono font-bold">
                              {isLast ? '└──' : '├──'}
                            </div>

                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical
                                className={`w-3 h-3 shrink-0 cursor-grab ${
                                  isSelected ? 'text-indigo-200' : 'text-slate-600 group-hover:text-slate-400'
                                }`}
                              />

                              {/* Distinct Type Badge / Icon */}
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-white/20 border-white/40 text-white'
                                    : typeMeta.badgeClass
                                }`}
                                title={typeMeta.label}
                              >
                                <ItemIcon className="w-3.5 h-3.5" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-bold text-xs truncate leading-tight">
                                    {displayTitle}
                                  </h5>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] opacity-75 mt-0.5">
                                  <span
                                    className={`px-1 py-0.2 rounded font-mono text-[9px] uppercase font-bold ${
                                      isSelected
                                        ? 'bg-white/20 text-white'
                                        : typeMeta.badgeClass
                                    }`}
                                  >
                                    {typeMeta.label}
                                  </span>
                                  {unit.duration && (
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {unit.duration}
                                    </span>
                                  )}
                                  {unit.isDraft && (
                                    <span className="px-1 py-0.2 rounded bg-amber-950/70 text-amber-300 text-[9px] font-mono">
                                      Draft
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Item Actions */}
                            <div
                              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => onDeleteLesson(unit, module.id)}
                                className={`p-1 rounded-md transition-colors ${
                                  isSelected
                                    ? 'hover:bg-white/20 text-white'
                                    : 'hover:bg-rose-950/60 text-slate-500 hover:text-rose-400'
                                }`}
                                title="Delete item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
