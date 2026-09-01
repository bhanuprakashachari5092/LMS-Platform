import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, Edit, Globe, FileText, Trash2, Tag, Check, X, IndianRupee } from 'lucide-react';
import type { CourseItem } from '@/contexts/CourseContext';
import { useCourses } from '@/contexts/CourseContext';
import { toast } from 'sonner';

interface CourseRowProps {
  course: CourseItem;
  onView: (course: CourseItem) => void;
  onEdit: (course: CourseItem) => void;
  onTogglePublish: (course: CourseItem) => void;
  onDelete: (course: CourseItem) => void;
}

export const CourseRow: React.FC<CourseRowProps> = ({
  course,
  onView,
  onEdit,
  onTogglePublish,
  onDelete,
}) => {
  const { updateCourse } = useCourses();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceInput, setPriceInput] = useState<string>(() => String(course.price !== undefined ? course.price : 0));
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentPrice = course.price !== undefined ? Number(course.price) : 0;

  const handleSavePrice = async (newPriceVal?: number) => {
    const valToSave = newPriceVal !== undefined ? newPriceVal : Number(priceInput);
    if (isNaN(valToSave) || valToSave < 0) {
      toast.error('Please enter a valid non-negative course price.');
      return;
    }

    setIsSavingPrice(true);
    try {
      await updateCourse(course.id, { price: valToSave });
      toast.success(`Course "${course.title}" price set to ₹${valToSave}`);
      setIsPriceModalOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update course price.');
    } finally {
      setIsSavingPrice(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Format creation date safely
  const formatDate = (dateVal: any) => {
    if (!dateVal) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (typeof dateVal.toDate === 'function') {
      return dateVal.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (dateVal instanceof Date) {
      return dateVal.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (typeof dateVal === 'string' || typeof dateVal === 'number') {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <tr className="hover:bg-sky-50/20 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors last:border-0 group">

      {/* Thumbnail */}
      <td className="py-4 px-4 align-middle">
        <div className="w-12 h-8 rounded-lg overflow-hidden border border-sky-100 dark:border-slate-800 shadow-2xs shrink-0 bg-slate-100 dark:bg-slate-800">
          <img
            src={course.thumbnail || (course as any).thumbnailUrl || (course as any).image || (course as any).banner || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80";
            }}
          />
        </div>
      </td>

      {/* Course Title */}
      <td className="py-4 px-4 align-middle font-semibold text-slate-900 dark:text-white text-xs sm:text-sm max-w-xs md:max-w-sm truncate" title={course.title}>
        <div className="font-bold text-slate-900 dark:text-white truncate">{course.title}</div>
        {course.subtitle && (
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">{course.subtitle}</div>
        )}
      </td>

      {/* Category */}
      <td className="py-4 px-4 align-middle">
        <span className="inline-flex items-center text-[10px] font-bold text-sky-800 dark:text-cyan-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-100/80 dark:border-sky-800">
          {course.category}
        </span>
      </td>

      {/* Level */}
      <td className="py-4 px-4 align-middle">
        <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">
          {course.level || 'Beginner'}
        </span>
      </td>

      {/* Price (Manual Admin Edit) */}
      <td className="py-4 px-4 align-middle">
        <button
          type="button"
          onClick={() => {
            setPriceInput(String(currentPrice));
            setIsPriceModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 cursor-pointer shadow-2xs group/price"
          title="Click to edit course price"
        >
          <IndianRupee className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>{currentPrice === 0 ? 'Free' : currentPrice.toLocaleString()}</span>
          <Edit className="w-2.5 h-2.5 text-emerald-500 opacity-60 group-hover/price:opacity-100 transition-opacity ml-0.5" />
        </button>
      </td>

      {/* Instructor */}
      <td className="py-4 px-4 align-middle">
        <div className="flex items-center gap-2">
          {course.avatar && (
            <img
              src={course.avatar}
              alt={typeof course.instructor === 'object' && course.instructor !== null ? (course.instructor as any).name || 'Instructor' : String(course.instructor || 'Instructor')}
              className="w-6 h-6 rounded-full object-cover border border-sky-200 dark:border-slate-700"
            />
          )}
          <span className="text-slate-700 dark:text-slate-200 text-xs font-bold truncate max-w-28">
            {typeof course.instructor === 'object' && course.instructor !== null ? (course.instructor as any).name || 'Instructor' : String(course.instructor || 'Instructor')}
          </span>
        </div>
      </td>

      {/* Duration */}
      <td className="py-4 px-4 align-middle text-slate-500 dark:text-slate-400 font-medium text-xs font-mono">
        {course.duration}
      </td>

      {/* Status */}
      <td className="py-4 px-4 align-middle">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${course.status === 'Published'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${course.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {course.status}
        </span>
      </td>

      {/* Students */}
      <td className="py-4 px-4 align-middle text-slate-700 dark:text-slate-200 font-bold text-xs">
        {course.students || '0'}
      </td>

      {/* Created Date */}
      <td className="py-4 px-4 align-middle text-slate-500 dark:text-slate-400 font-medium text-xs">
        {formatDate(course.createdAt)}
      </td>

      {/* Actions */}
      <td className="py-4 px-4 align-middle text-right relative">
        <div className="inline-block" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Course Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-4 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-40 text-left animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onView(course);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500" />
                <span>View Course</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setPriceInput(String(currentPrice));
                  setIsPriceModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span>Change Price (₹)</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(course);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Details</span>
              </button>

              <Link
                to={`/admin/courses/${course.id}`}
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Build Curriculum</span>
              </Link>

              <Link
                to={`/admin/content?courseId=${course.id}`}
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-sky-600 dark:text-cyan-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
                <span>Manage Lessons & Notes</span>
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onTogglePublish(course);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                {course.status === 'Published' ? (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Unpublish Course</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Publish Course</span>
                  </>
                )}
              </button>

              <hr className="my-1 border-slate-100 dark:border-slate-800" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(course);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete Course</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Price Editor Modal */}
        {isPriceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 text-left font-['Sora'] animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Tag className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">Manual Course Price</h3>
                    <p className="text-[10px] text-slate-400 truncate max-w-56">{course.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPriceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Price in Indian Rupees (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Enter amount (e.g., 299)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                {/* Preset Quick Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Under ₹500:</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0, 199, 299, 399, 499].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setPriceInput(String(amt));
                          handleSavePrice(amt);
                        }}
                        className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                          Number(priceInput) === amt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {amt === 0 ? 'Free' : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingPrice}
                  onClick={() => handleSavePrice()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingPrice ? 'Saving...' : 'Save Price'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </td>

    </tr>
  );
};

export default React.memo(CourseRow);
