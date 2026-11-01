/**
 * TypeScript Interfaces and Types for Course, Module, Lesson, and Syllabus Content
 */

export type LessonType = 'reading' | 'video' | 'quiz' | 'assignment' | 'interactive' | 'lab';

export interface CourseLessonDoc {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  orderIndex: number;
  order?: number;
  duration: string;
  type: LessonType;
  readingTime?: string;
  readingContent?: string;
  content?: string;
  videoUrl?: string;
  published?: boolean;
  isFree?: boolean;
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
  resources?: {
    id: string;
    title: string;
    type: string;
    url: string;
    size?: string;
  }[];
  revision?: number;
  expectedRevision?: number;
  status?: 'draft' | 'published';
  updatedBy?: string | null;
  lastSavedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CourseModuleDoc {
  id: string;
  courseId: string;
  moduleNumber?: number;
  title: string;
  description?: string;
  orderIndex: number;
  order?: number;
  duration?: string;
  published?: boolean;
  lessonsCount?: number;
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
  topics?: CourseTopic[];
  revision?: number;
  expectedRevision?: number;
  status?: 'draft' | 'published';
  updatedBy?: string | null;
  lastSavedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CourseTopic {
  id: string;
  title: string;
  description?: string;
  estimatedDuration?: string;
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
  learningUnits?: CourseLearningUnit[];
}

export interface CourseLearningUnit {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  type: string;
  readingContent?: string;
  videoUrl?: string;
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
}

export interface CourseContentSummary {
  courseId: string;
  title: string;
  modulesCount: number;
  lessonsCount: number;
  modules: Array<{
    id: string;
    title: string;
    order: number;
    duration?: string;
    lessonsCount: number;
  }>;
}

export interface LessonQueryOptions {
  includeContent?: boolean;
}

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

export interface ICourseAuditRevision {
  id: string;
  courseId: string;
  moduleId?: string | null;
  lessonId?: string | null;
  action: string;
  revision: number;
  expectedRevision?: number | null;
  summary?: string;
  updatedBy: string;
  timestamp: string;
  snapshot?: any;
}
