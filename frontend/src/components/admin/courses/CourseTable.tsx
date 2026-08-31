import React from 'react';
import type { CourseItem } from '@/contexts/CourseContext';
import CourseRow from './CourseRow';

interface CourseTableProps {
  courses: CourseItem[];
  onView: (course: CourseItem) => void;
  onEdit: (course: CourseItem) => void;
  onTogglePublish: (course: CourseItem) => void;
  onDelete: (course: CourseItem) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  onView,
  onEdit,
  onTogglePublish,
  onDelete,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-sky-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-sm">
      <table className="w-full border-collapse text-left min-w-[950px]">
        <thead>
          <tr className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-sky-100 dark:border-slate-800 text-[11px] font-heading font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
            <th className="py-4 px-4 font-bold">Thumbnail</th>
            <th className="py-4 px-4 font-bold">Course Title</th>
            <th className="py-4 px-4 font-bold">Category</th>
            <th className="py-4 px-4 font-bold">Level</th>
            <th className="py-4 px-4 font-bold">Price (₹)</th>
            <th className="py-4 px-4 font-bold">Instructor</th>
            <th className="py-4 px-4 font-bold">Duration</th>
            <th className="py-4 px-4 font-bold">Status</th>
            <th className="py-4 px-4 font-bold">Students</th>
            <th className="py-4 px-4 font-bold">Created Date</th>
            <th className="py-4 px-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {courses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              onView={onView}
              onEdit={onEdit}
              onTogglePublish={onTogglePublish}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(CourseTable);
