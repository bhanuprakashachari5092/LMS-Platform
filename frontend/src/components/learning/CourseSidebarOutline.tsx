import React, { useMemo } from 'react';
import { CheckCircle2, Lock, X, ArrowLeft } from 'lucide-react';
import type { ModuleData } from './ModuleAccordion';

interface CourseSidebarOutlineProps {
  courseTitle: string;
  modules: ModuleData[];
  allLessons: { id: string | number; title: string; moduleTitle: string }[];
  selectedLessonId: string | number;
  completedLessonIds: (string | number)[];
  onSelectLesson: (id: string | number) => void;
  isNightMode?: boolean;
  onBackToCourseDetails?: () => void;
  /** Mobile drawer mode — show close button */
  isDrawer?: boolean;
  onClose?: () => void;
}

/**
 * CourseSidebarOutline — flat lesson list with module group headers.
 * Each lesson shows: ✓ completed (green check), ● current (accent circle), 🔒 locked.
 */
export const CourseSidebarOutline: React.FC<CourseSidebarOutlineProps> = ({
  courseTitle,
  modules,
  allLessons,
  selectedLessonId,
  completedLessonIds,
  onSelectLesson,
  isNightMode = false,
  onBackToCourseDetails,
  isDrawer = false,
  onClose,
}) => {
  // Build a flat list grouped by module
  const groupedLessons = useMemo(() => {
    return modules.map((mod: any) => {
      const rawLessons: any[] = [];
      if (mod.topics && mod.topics.length > 0) {
        mod.topics.forEach((t: any) => {
          if (t.learningUnits && t.learningUnits.length > 0) {
            t.learningUnits.forEach((u: any) => {
              rawLessons.push(u);
            });
          }
        });
      } else if (mod.lessons && mod.lessons.length > 0) {
        mod.lessons.forEach((l: any) => rawLessons.push(l));
      }

      return {
        moduleId: mod.id,
        moduleTitle: mod.title,
        lessons: rawLessons.map((lesson) => {
          const flatIdx = allLessons.findIndex((l) => String(l.id) === String(lesson.id));
          const isCompleted = completedLessonIds.some((id) => String(id) === String(lesson.id));
          const isSelected = String(selectedLessonId) === String(lesson.id);

          // Sequential unlock: first lesson always unlocked, rest require previous complete
          let isUnlocked = true;
          if (flatIdx > 0) {
            const prevLesson = allLessons[flatIdx - 1];
            isUnlocked = completedLessonIds.some((id) => String(id) === String(prevLesson.id));
          }

          return {
            id: lesson.id,
            title: lesson.title,
            flatIndex: flatIdx,
            isCompleted,
            isSelected,
            isUnlocked,
          };
        }),
      };
    });
  }, [modules, allLessons, selectedLessonId, completedLessonIds]);

  return (
    <div className={`flex flex-col h-full
      ${isNightMode ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* Header */}
      <div className={`flex flex-col gap-2.5 px-4 py-3 border-b shrink-0
        ${isNightMode ? 'border-slate-800' : 'border-slate-200'}`}>
        {onBackToCourseDetails && (
          <button
            onClick={onBackToCourseDetails}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border
              ${isNightMode
                ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-sky-400 hover:text-white'
                : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 hover:text-sky-900'
              }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course Overview</span>
          </button>
        )}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h2 className={`text-[11px] font-semibold uppercase tracking-wider
              ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Course Outline
            </h2>
            <p className={`text-sm font-semibold truncate mt-0.5
              ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              {courseTitle}
            </p>
          </div>
          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer
                ${isNightMode
                  ? 'hover:bg-slate-800 text-slate-500 hover:text-white'
                  : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                }`}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 space-y-1">
        {groupedLessons.map((group) => (
          <div key={group.moduleId} className="mb-3">
            {/* Module group header */}
            <h3 className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider
              ${isNightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              {group.moduleTitle.replace(/^(🟢|🟡|🔵|🔴)\s*/, '')}
            </h3>

            {/* Lessons */}
            {group.lessons.map((lesson) => {
              const handleClick = () => {
                if (!lesson.isUnlocked) return;
                onSelectLesson(lesson.id);
                if (isDrawer && onClose && window.innerWidth < 1024) {
                  onClose();
                }
              };

              return (
                <button
                  key={lesson.id}
                  onClick={handleClick}
                  disabled={!lesson.isUnlocked}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px]
                    transition-colors duration-150 cursor-pointer
                    ${!lesson.isUnlocked
                      ? `opacity-50 cursor-not-allowed
                          ${isNightMode ? 'text-slate-600' : 'text-slate-400'}`
                      : lesson.isSelected
                        ? isNightMode
                          ? 'bg-sky-500/10 text-sky-300 font-medium'
                          : 'bg-sky-50 text-sky-700 font-medium'
                        : isNightMode
                          ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  title={!lesson.isUnlocked ? 'Complete the previous lesson to unlock' : lesson.title}
                >
                  {/* Status icon */}
                  <span className="shrink-0 flex items-center justify-center w-5 h-5">
                    {!lesson.isUnlocked ? (
                      <Lock className={`w-3.5 h-3.5 ${isNightMode ? 'text-slate-600' : 'text-slate-400'}`} />
                    ) : lesson.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : lesson.isSelected ? (
                      <span className={`w-3 h-3 rounded-full
                        ${isNightMode ? 'bg-sky-400' : 'bg-sky-500'}`} />
                    ) : (
                      <span className={`w-3 h-3 rounded-full border-2
                        ${isNightMode ? 'border-slate-600' : 'border-slate-300'}`} />
                    )}
                  </span>

                  {/* Title */}
                  <span className="truncate">{lesson.title}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
};
