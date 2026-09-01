import { API_BASE_URL } from '@/config/api';

export interface CourseAutofillData {
  shortDescription: string;
  fullDescription: string;
  learningOutcomes: string[];
  category: string;
  level: string;
  tags: string[];
  durationHours: number;
}

export interface LessonAutofillData {
  title: string;
  content: string;
  estimatedReadMinutes: number;
}

class AiAutofillService {
  /**
   * Calls the backend to auto-generate course metadata from a title
   */
  async autofillCourse(params: {
    title: string;
    category?: string;
    level?: string;
  }): Promise<CourseAutofillData> {
    const response = await fetch(`${API_BASE_URL}/ai/autofill-course`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errText = await response.text();
      try {
        const parsed = JSON.parse(errText);
        throw new Error(parsed.message || 'AI Autofill request failed.');
      } catch {
        throw new Error(errText || `Server responded with ${response.status}`);
      }
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to generate course metadata.');
    }

    return data.data;
  }

  /**
   * Calls the backend to auto-generate a full in-depth markdown lesson from title and course context
   */
  async autofillLesson(params: {
    lessonTitle: string;
    courseTitle?: string;
    category?: string;
    level?: string;
  }): Promise<LessonAutofillData> {
    const response = await fetch(`${API_BASE_URL}/ai/autofill-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errText = await response.text();
      try {
        const parsed = JSON.parse(errText);
        throw new Error(parsed.message || 'AI Autofill request failed.');
      } catch {
        throw new Error(errText || `Server responded with ${response.status}`);
      }
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to generate lesson content.');
    }

    return data.data;
  }
}

export const aiAutofillService = new AiAutofillService();
export default aiAutofillService;
