/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIRESTORE COURSE DOCUMENT SCHEMA — KaizenQ LMS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Canonical TypeScript interface for the "courses" Firestore collection.
 * Every course document MUST follow this exact shape — no missing fields,
 * no ad-hoc structure. This is the single source of truth for course data.
 *
 * Usage:
 *   import type { FirestoreCourse } from '../../../shared/types/firestoreCourse';
 *   import { generateSlug, firestoreCourseToICourse } from '../../../shared/types/firestoreCourse';
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { Timestamp } from 'firebase/firestore';
import type { ICourse, CourseLevel } from './course';

/* ── Level union for Firestore documents ──────────────────────────────────── */
export type FirestoreCourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

/* ── Canonical Firestore document interface ────────────────────────────────── */
export interface FirestoreCourse {
  /** Course title — e.g. "Linux Systems & Administration Mastery" */
  title: string;

  /** URL-friendly slug — e.g. "linux-systems-administration-mastery" */
  slug: string;

  /** Category — e.g. "Linux & Systems", "Development Tools" */
  category: string;

  /** Searchable tags — e.g. ["linux", "devops", "systems"] */
  tags: string[];

  /** Difficulty level */
  level: FirestoreCourseLevel;

  /** 1-2 line description shown on card front */
  shortDescription: string;

  /** Longer description shown on card back / detail page */
  fullDescription: string;

  /** "What you'll learn" — 3-6 bullet points (minimum 2) */
  learningOutcomes: string[];

  /** Firebase Storage URL or public image URL */
  thumbnailUrl: string;

  /** Total course duration in hours — e.g. 32 */
  durationHours: number;

  /** Total lesson count (optional but recommended) — e.g. 45 */
  totalLessons: number;

  /** Numeric price for sorting/filtering — e.g. 299 (0 for free) */
  price: number;

  /** Currency code — e.g. "INR" */
  currency: string;

  /** Average rating 0-5 — e.g. 4.8 */
  rating: number;

  /** Number of reviews — e.g. 120 */
  reviewCount: number;

  /** true = visible on site, false = draft/hidden */
  isPublished: boolean;

  /** true = show in featured/highlighted sections */
  isFeatured: boolean;

  /** Manual sort order for course listing display */
  order: number;

  /** Firestore server timestamp — set on creation */
  createdAt: Timestamp;

  /** Firestore server timestamp — updated on every edit */
  updatedAt: Timestamp;
}

/**
 * Firestore document with its auto-generated document ID attached.
 * This is what you get back after reading from Firestore.
 */
export interface FirestoreCourseDoc extends FirestoreCourse {
  /** Firestore document ID */
  id: string;
}

/* ══════════════════════════════════════════════════════════════════════════════
   UTILITY: generateSlug
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Auto-generates a URL-friendly slug from a course title.
 *
 * Rules:
 *  - Lowercase
 *  - Spaces / special characters → hyphens
 *  - No leading / trailing hyphens
 *  - No consecutive hyphens
 *
 * @example
 *   generateSlug("Linux Systems & Administration Mastery")
 *   // → "linux-systems-administration-mastery"
 *
 *   generateSlug("Git & GitHub Mastery")
 *   // → "git-github-mastery"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')              // "&" → "and" for readability
    .replace(/[^a-z0-9\s-]/g, '')      // strip special chars
    .replace(/\s+/g, '-')              // spaces → hyphens
    .replace(/-+/g, '-')               // collapse consecutive hyphens
    .replace(/^-|-$/g, '');            // trim leading/trailing hyphens
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAPPER: FirestoreCourse → ICourse
   ══════════════════════════════════════════════════════════════════════════════ */

/** Maps a FirestoreCourseLevel to the internal CourseLevel enum used by ICourse */
function mapLevel(level: FirestoreCourseLevel): CourseLevel {
  const MAP: Record<FirestoreCourseLevel, CourseLevel> = {
    'Beginner': 'beginner',
    'Intermediate': 'intermediate',
    'Advanced': 'advanced',
    'All Levels': 'all_levels',
  };
  return MAP[level] || 'all_levels';
}

/**
 * Converts a Firestore course document into the ICourse shape consumed
 * by all existing frontend components.
 *
 * This is the **boundary mapper** — the only place where the two type
 * systems touch. Components never see FirestoreCourse directly.
 */
export function firestoreCourseToICourse(doc: FirestoreCourseDoc): ICourse {
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    description: doc.fullDescription,
    thumbnail: doc.thumbnailUrl,
    banner: doc.thumbnailUrl,
    category: doc.category,
    level: mapLevel(doc.level),
    duration: `${doc.durationHours} hrs`,
    language: 'English',
    price: doc.price,
    instructor: {
      id: 'inst_kaizenq',
      name: 'KaizenQ Systems Team',
      role: 'Senior Technical Instructor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: [],
    prerequisites: [],
    learningOutcomes: doc.learningOutcomes,
    status: doc.isPublished ? 'published' : 'draft',
    visibility: 'public',
    featured: doc.isFeatured,
    tags: doc.tags,
    enrollmentCount: 0,
    rating: doc.rating,
    ratingCount: doc.reviewCount,
    order: doc.order,
    syllabus: [],
    modules: [],
    createdAt: doc.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: doc.updatedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
  };
}
