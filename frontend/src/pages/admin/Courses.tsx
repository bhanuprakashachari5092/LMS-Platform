import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Sparkles, BookCheck, FileEdit, Users, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses, type CourseItem } from '@/contexts/CourseContext';
import { studentService } from '@/services/studentService';
import { courseStorageService } from '@/services/courseStorageService';
import CourseStatsCard from '@/components/admin/courses/CourseStatsCard';
import CourseSearchBar from '@/components/admin/courses/CourseSearchBar';
import CourseFilters from '@/components/admin/courses/CourseFilters';
import CourseTable from '@/components/admin/courses/CourseTable';
import EmptyCourses from '@/components/admin/courses/EmptyCourses';
import CourseDeleteModal from '@/components/admin/courses/CourseDeleteModal';

export const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { courses, toggleCourseStatus, deleteCourse, refreshCourses } = useCourses();
  const [realStudentsCount, setRealStudentsCount] = useState<number>(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');

  // Deletion Modal State
  const [courseToDelete, setCourseToDelete] = useState<CourseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 300ms Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Subscribe to real-time student count
  useEffect(() => {
    const unsub = studentService.subscribeToStudents((studentsList) => {
      setRealStudentsCount(studentsList.length);
    });
    return () => unsub();
  }, []);

  // Sync courses on mount
  useEffect(() => {
    if (refreshCourses) {
      refreshCourses();
    }
  }, [refreshCourses]);

  // Dynamic filter dropdown options
  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((c) => c.category).filter((c): c is string => !!c)));
  }, [courses]);

  const levels = useMemo(() => {
    return Array.from(new Set(courses.map((c) => c.level).filter((l): l is string => !!l)));
  }, [courses]);

  // Calculate statistics dynamically
  const totalCourses = courses.length;
  const publishedCoursesCount = useMemo(() => courses.filter((c) => c.status === 'Published').length, [courses]);
  const draftCoursesCount = useMemo(() => courses.filter((c) => c.status === 'Draft').length, [courses]);

  const totalStudentsEnrolled = useMemo(() => {
    if (realStudentsCount > 0) return realStudentsCount;
    return courses.reduce((sum, c) => {
      const parsed = parseInt(String(c.students).replace(/,/g, '')) || 0;
      return sum + parsed;
    }, 0);
  }, [realStudentsCount, courses]);

  // Memoized Filter & Sort Logic
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Instructor Isolation
      if (userProfile?.role === 'instructor') {
        const instName = (userProfile.name || userProfile.fullName || '').toLowerCase();
        const instUid = userProfile.uid;
        const courseInst = (course.instructor || '').toLowerCase();
        const isAssigned = (course as any).instructorId === instUid || (instName && courseInst.includes(instName));
        if (!isAssigned) return false;
      }

      const title = (course.title || '').toLowerCase();
      const instructor = (course.instructor || '').toLowerCase();
      const category = (course.category || '').toLowerCase();
      const query = (debouncedSearch || '').toLowerCase().trim();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        instructor.includes(query) ||
        category.includes(query);

      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
      const matchesStatus = selectedStatus === 'All' || course.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
    });
  }, [courses, userProfile, debouncedSearch, selectedCategory, selectedLevel, selectedStatus]);

  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
      if (selectedSort === 'Title A-Z') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (selectedSort === 'Most Students') {
        const countA = parseInt(String(a.students).replace(/,/g, '')) || 0;
        const countB = parseInt(String(b.students).replace(/,/g, '')) || 0;
        return countB - countA;
      }
      if (selectedSort === 'Price: Low to High') {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }
      if (selectedSort === 'Price: High to Low') {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }

      // Sort by Newest / Oldest
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (selectedSort === 'Oldest') {
        return dateA - dateB;
      }
      return dateB - dateA;
    });
  }, [filteredCourses, selectedSort]);

  // Action Handlers
  const handleCreateCourseClick = () => {
    navigate('/admin/courses/create');
  };

  const handleView = (course: CourseItem) => {
    window.open(`/courses/${course.id}`, '_blank');
  };

  const handleEdit = (course: CourseItem) => {
    navigate(`/admin/courses/${course.id}/edit`);
  };

  const handleTogglePublish = async (course: CourseItem) => {
    const newStatus = course.status === 'Published' ? 'Draft' : 'Published';
    try {
      await toggleCourseStatus(course.id);
      toast.success(`Course "${course.title}" status updated to ${newStatus}!`);
    } catch {
      toast.error('Failed to update course status.');
    }
  };

  const handleDeletePrompt = (course: CourseItem) => {
    setCourseToDelete(course);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);

    try {
      // 1. Delete associated Storage image if applicable
      if (courseToDelete.thumbnail) {
        await courseStorageService.deleteCourseThumbnail(courseToDelete.thumbnail);
      }

      // 2. Delete Firestore document and update state
      await deleteCourse(courseToDelete.id);
      toast.success(`Course "${courseToDelete.title}" deleted successfully.`);
      setCourseToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 max-w-7xl mx-auto pb-12 font-['Sora']">
      
      {/* Header Banner */}
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-sky-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 text-sky-700 dark:text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-2 select-none">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Kaizen Q Platform</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Course Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Create, edit, publish and manage all learning tracks with single-source-of-truth Firestore pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/courses/bulk-import')}
            className="px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Bulk Import Content</span>
          </button>
          <button
            onClick={handleCreateCourseClick}
            className="px-6 py-3.5 rounded-xl bg-linear-to-r from-[#2563eb] to-[#7c3aed] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Course Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CourseStatsCard
          title="Total Courses"
          value={totalCourses}
          icon={BookOpen}
          color="blue"
        />
        <CourseStatsCard
          title="Published Courses"
          value={publishedCoursesCount}
          icon={BookCheck}
          color="green"
        />
        <CourseStatsCard
          title="Draft Courses"
          value={draftCoursesCount}
          icon={FileEdit}
          color="amber"
        />
        <CourseStatsCard
          title="Students Enrolled"
          value={totalStudentsEnrolled.toLocaleString()}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Main Table & Filter Controls Container */}
      {courses.length === 0 ? (
        <EmptyCourses onCreateCourse={handleCreateCourseClick} />
      ) : (
        <div className="bg-white/95 dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xs backdrop-blur-xl">
          
          {/* Search bar & filter controls */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white select-none">
                All Courses ({filteredCourses.length})
              </h2>
              <CourseSearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            
            <CourseFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              categories={categories}
              levels={levels}
            />
          </div>

          {/* Courses Table View */}
          {sortedCourses.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-sky-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No courses match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                  setSelectedStatus('All');
                }}
                className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-bold hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <CourseTable
              courses={sortedCourses}
              onView={handleView}
              onEdit={handleEdit}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDeletePrompt}
            />
          )}

        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CourseDeleteModal
        isOpen={Boolean(courseToDelete)}
        course={courseToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCourseToDelete(null)}
        isDeleting={isDeleting}
      />

    </div>
  );
};

export default Courses;
