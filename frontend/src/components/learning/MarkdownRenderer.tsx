import React from 'react';
import { LmsCourseRenderer } from './LmsCourseRenderer';

export interface MarkdownRendererProps {
  content: string;
  isNightMode?: boolean;
  courseId?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isNightMode = false, courseId }) => {
  if (!content) return null;
  return <LmsCourseRenderer content={content} isNightMode={isNightMode} courseId={courseId} />;
};
