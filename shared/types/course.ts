export type CourseStatus = 'draft' | 'review' | 'published' | 'archived';

export type CourseVisibility = 'public' | 'private' | 'unlisted';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';

export type VideoProvider = 'cloudinary' | 'youtube' | 'vimeo' | 'firebase-storage' | 'direct';

export type LessonType = 'video' | 'reading' | 'lab' | 'quiz' | 'assignment' | 'project';

export interface CourseRoadmapItem {
  order: number;
  title: string;
  description: string;
  estimatedDuration: string;
}

export interface IVideoItem {
  videoId: string;
  lessonId: string;
  courseId?: string;
  moduleId?: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  provider: VideoProvider;
  order: number;
  isPreview?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IResourceItem {
  resourceId: string;
  lessonId: string;
  courseId?: string;
  moduleId?: string;
  title: string;
  description?: string;
  type: 'pdf' | 'ppt' | 'zip' | 'doc' | 'image' | 'github' | 'url' | 'doc_link' | 'video_link';
  url: string;
  order: number;
  downloadable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPracticalLabItem {
  objective: string;
  requirements: string[];
  steps: string[];
  commands: Array<{ command: string; description: string }>;
  expectedOutput?: string;
  expectedResult?: string;
  troubleshooting?: string[];
  bestPractices?: string[];
}

export interface IQuizQuestion {
  questionId: string;
  questionNumber: number;
  question: string;
  type: 'mcq' | 'single' | 'tf';
  options: string[];
  correctAnswer: number | string;
  explanation?: string;
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface IQuizItem {
  quizId: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: IQuizQuestion[];
  totalPoints: number;
  passingScore: number;
  timeLimit?: number; // In minutes
  attemptLimit?: number;
}

export interface IAssignmentItem {
  assignmentId: string;
  lessonId: string;
  title: string;
  description: string;
  objective?: string;
  instructions: string[]; // Numbered instructions
  requirements: string[];
  submissionType: 'text' | 'file' | 'link' | 'code';
  deadline?: string;
  points: number;
  rubric?: string;
  resources?: IResourceItem[];
}

export interface ILessonItem {
  lessonId: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  type: LessonType;
  duration: string;
  learningObjectives: string[];
  video?: IVideoItem | null;
  notes?: string | null;
  resources: IResourceItem[];
  practical?: IPracticalLabItem | null;
  quiz?: IQuizItem | null;
  quizId?: string | null;
  assignment?: IAssignmentItem | null;
  assignmentId?: string | null;
  isPublished: boolean;
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
  revision?: number;
  expectedRevision?: number;
  status?: 'draft' | 'published';
  blocksCount?: number;
  lastSavedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string | null;
}

export interface IModuleItem {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  estimatedDuration: string;
  learningObjectives: string[];
  lessons: ILessonItem[];
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
  status?: 'draft' | 'published';
  revision?: number;
  expectedRevision?: number;
  lastSavedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string | null;
}

export interface IVideoProgress {
  studentId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  videoId: string;
  watchTime: number; // in seconds
  duration: number; // in seconds
  percentage: number; // 0-100
  lastPosition: number; // position in seconds to resume
  completed: boolean;
  updatedAt: string;
}

export interface ICourse {
  id: string;
  courseId?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  banner?: string;
  coverImage?: string;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  category: string;
  level: CourseLevel;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  language: string;
  price: number;
  instructorId?: string;
  instructorName?: string;
  instructor: {
    id?: string;
    name: string;
    role?: string;
    avatar?: string;
  };
  skills: string[]; // Ordered list of skills
  prerequisites: string[]; // Ordered list of prerequisites
  learningOutcomes: string[]; // Measurable point-wise list
  roadmap?: CourseRoadmapItem[]; // Structured roadmap
  status: CourseStatus;
  visibility: CourseVisibility;
  featured: boolean;
  tags: string[];
  enrollmentCount: number;
  rating: number;
  ratingCount?: number;
  order?: number;
  syllabus?: {
    id: string;
    title: string;
    description?: string;
    lessonsCount?: number;
    duration?: string;
  }[];
  modules?: IModuleItem[] | any[];
  aiGenerated?: boolean;
  aiPrompt?: string;
  aiMetadata?: Record<string, any>;
  practiceType?: 'sql' | 'terminal' | 'git' | 'code-c' | 'code-python' | 'code-java' | 'sandpack' | 'k8s-sim' | null;
  progress?: number; // Enrollment completion percentage (0-100)
  isEnrolled?: boolean; // Whether current student is enrolled
  version?: number; // Optimistic concurrency version
  builderVersion?: number; // Course builder schema version (default: 1)
  contentVersion?: number; // Course content version (default: 1)
  draftRevision?: number;
  publishedRevision?: number;
  lastPublishedAt?: string | null;
  lastPublishedBy?: string | null;
  revision?: number;
  expectedRevision?: number;
  isDeleted?: boolean; // Soft delete flag
  deletedAt?: string;
  deletedBy?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCourseDTO = Omit<
  ICourse,
  'id' | 'slug' | 'enrollmentCount' | 'rating' | 'ratingCount' | 'createdAt' | 'updatedAt' | 'progress' | 'isEnrolled'
> & {
  id?: string;
  slug?: string;
};

export type UpdateCourseDTO = Partial<Omit<CreateCourseDTO, 'instructor'>> & {
  instructor?: Partial<ICourse['instructor']>;
};

export interface CourseFilterOptions {
  search?: string;
  category?: string;
  level?: CourseLevel | 'all';
  status?: CourseStatus | 'all';
  featured?: boolean;
  language?: string;
  sortBy?: 'createdAt' | 'rating' | 'price' | 'enrollmentCount' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CoursePaginationResult {
  courses: ICourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ══════════════════════════════════════════════════════════════════════════════
   CONTENT BLOCK ARCHITECTURE (Phase 1 Data Foundation)
   Path: /courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/blocks/{blockId}
   ══════════════════════════════════════════════════════════════════════════════ */

export type LessonBlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'video'
  | 'pdf'
  | 'code'
  | 'callout'
  | 'quote'
  | 'list'
  | 'link'
  | 'quiz'
  | 'assignment'
  | 'download'
  | 'embed'
  | 'divider';

export interface ILessonBlock<T = any> {
  id: string;
  lessonId: string;
  type: LessonBlockType;
  order: number;
  data: T;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface TextBlockData {
  html?: string;
  markdown: string;
}

export interface HeadingBlockData {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ImageBlockData {
  assetId?: string;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface VideoBlockData {
  provider: 'youtube' | 'vimeo' | 'cloudinary' | 'firebase-storage' | 'custom';
  url: string;
  thumbnailUrl?: string;
  duration?: number; // seconds
}

export interface PdfBlockData {
  assetId?: string;
  url: string;
  title: string;
  size?: number;
}

export interface CodeBlockData {
  language: string;
  code: string;
  explanation?: string;
  title?: string;
}

export interface CalloutBlockData {
  tone: 'info' | 'warning' | 'tip' | 'note';
  title?: string;
  message: string;
}

export interface QuoteBlockData {
  quote: string;
  author?: string;
  citation?: string;
}

export interface ListBlockData {
  style: 'bullet' | 'numbered' | 'checklist';
  items: string[];
}

export interface LinkBlockData {
  title: string;
  url: string;
  description?: string;
  isExternal?: boolean;
}

export interface QuizBlockData {
  quizId?: string;
  title?: string;
  questions: IQuizQuestion[];
}

export interface AssignmentBlockData {
  assignmentId?: string;
  title: string;
  instructions: string;
  deadline?: string;
  points?: number;
}

export interface DownloadBlockData {
  assetId?: string;
  title: string;
  url: string;
  fileSize?: string;
  category?: string;
}

export interface EmbedBlockData {
  embedUrl: string;
  title?: string;
  height?: number;
}

export interface DividerBlockData {
  style?: 'solid' | 'dashed' | 'dots';
}

/* ══════════════════════════════════════════════════════════════════════════════
   CENTRALIZED ASSET METADATA SCHEMA
   Collection: /course_assets/{assetId}
   ══════════════════════════════════════════════════════════════════════════════ */

export interface ICourseAsset {
  id: string;
  courseId: string;
  lessonId?: string | null;
  type: 'image' | 'video' | 'pdf' | 'document' | 'archive' | 'audio';
  provider: 'cloudinary' | 'firebase-storage' | 'external';
  url: string;
  publicId?: string | null;
  storagePath?: string | null;
  filename: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  altText?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

/* ══════════════════════════════════════════════════════════════════════════════
   COURSE AUDIT REVISION SCHEMA
   Subcollection: /courses/{courseId}/course_audit_revisions/{auditId}
   ══════════════════════════════════════════════════════════════════════════════ */

export interface ICourseAuditRevision {
  id: string;
  courseId: string;
  moduleId?: string | null;
  lessonId?: string | null;
  action: 'create_course' | 'update_course' | 'save_module' | 'delete_module' | 'save_lesson' | 'delete_lesson' | 'batch_reorder' | 'restore_revision';
  revision: number;
  expectedRevision?: number | null;
  summary?: string;
  updatedBy: string;
  timestamp: string;
  snapshot?: any;
}

/* ══════════════════════════════════════════════════════════════════════════════
   STANDARDIZED SAVE RESPONSE CONTRACTS
   ══════════════════════════════════════════════════════════════════════════════ */

export interface LessonSaveSuccessResult {
  success: true;
  conflict: false;
  revision: number;
  updatedAt: string;
  lessonId: string;
  data?: any;
  message?: string;
}

export interface LessonSaveConflictResult {
  success: false;
  conflict: true;
  currentRevision: number;
  expectedRevision: number;
  error: string;
  message: string;
}

export type LessonSaveResponse = LessonSaveSuccessResult | LessonSaveConflictResult;

/* ── Standard Convenience Aliases ── */
export type Course = ICourse;
export type Module = IModuleItem;
export type Lesson = ILessonItem;
export type LessonBlock = ILessonBlock;
export type CourseAsset = ICourseAsset;
export type CourseRevision = ICourseAuditRevision;
