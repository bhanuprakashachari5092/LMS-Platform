import { env } from '../../config/env';

export interface CourseAutofillResult {
  shortDescription: string;
  fullDescription: string;
  learningOutcomes: string[];
  category: string;
  level: string;
  tags: string[];
  durationHours: number;
}

export interface LessonAutofillResult {
  title: string;
  content: string;
  estimatedReadMinutes: number;
}

// In-memory rate limiting map (IP / session -> timestamp array)
const rateLimitMap = new Map<string, number[]>();

export function checkAiRateLimit(identifier: string, maxRequestsPerMinute = 15): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(identifier) || [];
  const validTimestamps = timestamps.filter(t => now - t < 60000);

  if (validTimestamps.length >= maxRequestsPerMinute) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(identifier, validTimestamps);
  return true;
}

export class AiAutofillService {
  /**
   * Generates course metadata draft from a given title and initial parameters
   */
  async autofillCourse(params: {
    title: string;
    category?: string;
    level?: string;
  }): Promise<CourseAutofillResult> {
    const { title, category, level } = params;
    const cleanTitle = title.trim();

    // 1. Try Anthropic Claude API if key is available
    if (env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: `You are an expert developer curriculum designer for KaizenQ LMS. 
Given the course title: "${cleanTitle}" (Optional context: Category=${category || 'Auto'}, Level=${level || 'All Levels'}).
Return ONLY a valid JSON object matching this schema with NO markdown wrapping or surrounding text:
{
  "shortDescription": "1-2 sentence high-impact summary (max 160 chars)",
  "fullDescription": "Comprehensive 3-4 sentence overview of the technical skills, tools, and production concepts taught",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4", "Outcome 5"],
  "category": "Development Tools / Programming / Web Development / Database / DevOps & Cloud / Cyber Security",
  "level": "beginner / intermediate / advanced / all_levels",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "durationHours": 25
}`
              }
            ]
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const rawText = data.content?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          return {
            shortDescription: parsed.shortDescription || `Master ${cleanTitle} from fundamentals to production mastery.`,
            fullDescription: parsed.fullDescription || `Comprehensive curriculum covering ${cleanTitle} core concepts, architectural best practices, and real-world projects.`,
            learningOutcomes: Array.isArray(parsed.learningOutcomes) ? parsed.learningOutcomes : [
              `Master core fundamentals and architecture of ${cleanTitle}`,
              `Apply industry best practices and clean code patterns`,
              `Build real-world production-ready projects`,
              `Debug and resolve complex runtime issues`
            ],
            category: parsed.category || category || 'Programming',
            level: parsed.level || level || 'all_levels',
            tags: Array.isArray(parsed.tags) ? parsed.tags : [cleanTitle.toLowerCase().replace(/\s+/g, '-'), 'coding', 'development'],
            durationHours: Number(parsed.durationHours) || 24
          };
        }
      } catch (err) {
        console.warn('⚠️ Anthropic Claude API call failed, falling back to structured generator:', err);
      }
    }

    // 2. High-Quality Structured Generator Fallback
    const detectedCategory = category || (
      /git|github|docker|k8s|kubernetes|cloud|linux|devops|aws|terraform/i.test(cleanTitle) ? 'DevOps & Cloud' :
      /sql|dbms|database|postgres|mongo|mysql|redis/i.test(cleanTitle) ? 'Database' :
      /react|next|vue|angular|html|css|javascript|frontend|web/i.test(cleanTitle) ? 'Web Development' :
      /python|java|c\+\+|rust|golang|c programming|dsa|algorithm/i.test(cleanTitle) ? 'Programming' : 'Computer Science'
    );

    const detectedLevel = level || (
      /advanced|mastery|expert|deep dive/i.test(cleanTitle) ? 'advanced' :
      /intermediate|patterns|architecture/i.test(cleanTitle) ? 'intermediate' :
      /beginner|101|foundations|fundamentals|for beginners/i.test(cleanTitle) ? 'beginner' : 'all_levels'
    );

    const words = cleanTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const generatedTags = Array.from(new Set([
      ...words,
      detectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      'full-stack',
      'production'
    ])).slice(0, 6);

    return {
      shortDescription: `Master ${cleanTitle} from core foundations to production-ready enterprise workflows.`,
      fullDescription: `Welcome to ${cleanTitle}! In this comprehensive, hands-on curriculum, you will build a solid technical understanding of core mechanics, master real-world syntax and best practices, implement scalable patterns, and deploy practical projects with full confidence.`,
      learningOutcomes: [
        `Understand the fundamental architecture, lifecycle, and mechanics of ${cleanTitle}.`,
        `Write clean, idiomatic, and maintainable code adhering to industry standards.`,
        `Diagnose common runtime errors, edge cases, and performance bottlenecks.`,
        `Design and implement hands-on practical exercises and real-world projects.`,
        `Apply security, scalability, and testing strategies in production environments.`
      ],
      category: detectedCategory,
      level: detectedLevel,
      tags: generatedTags,
      durationHours: detectedLevel === 'advanced' ? 35 : detectedLevel === 'intermediate' ? 28 : 20
    };
  }

  /**
   * Generates a complete, structured markdown lesson draft from title and course context
   */
  async autofillLesson(params: {
    lessonTitle: string;
    courseTitle?: string;
    category?: string;
    level?: string;
  }): Promise<LessonAutofillResult> {
    const { lessonTitle, courseTitle, category } = params;
    const cleanLessonTitle = lessonTitle.trim();
    const cleanCourseTitle = courseTitle ? courseTitle.trim() : 'Software Engineering';

    // 1. Try Anthropic Claude API if key is available
    if (env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2500,
            messages: [
              {
                role: 'user',
                content: `You are an expert technical author for KaizenQ LMS.
Write a comprehensive, professional, in-depth educational lesson in Markdown for:
Course: "${cleanCourseTitle}"
Lesson Title: "${cleanLessonTitle}"

STRICT CONTENT STANDARDS:
- Length: 700 to 1200 words of clean Markdown.
- Proper headings: use "# ", "## ", "### " with space after hash.
- Include:
  1. Overview & Learning Objectives
  2. In-depth Concept Explanations with architecture/mechanics
  3. Realistic, executable syntax-highlighted code blocks (e.g. \`\`\`javascript, \`\`\`python, \`\`\`bash, \`\`\`sql)
  4. Common pitfalls and how to avoid them
  5. A dedicated "### Practice" section with a concrete exercise
  6. A blockquote tip: "> 💡 **Tip:** [Actionable tip here]"
- NO conversational intro/outro text. Return ONLY the markdown content.`
              }
            ]
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const rawMarkdown = (data.content?.[0]?.text || '').trim();
          const wordCount = rawMarkdown.split(/\s+/).length;
          return {
            title: cleanLessonTitle,
            content: rawMarkdown,
            estimatedReadMinutes: Math.max(3, Math.ceil(wordCount / 200))
          };
        }
      } catch (err) {
        console.warn('⚠️ Anthropic Claude API lesson generation failed, using structured template generator:', err);
      }
    }

    // 2. High-Quality Markdown Curriculum Generator Fallback
    const codeLang = /python/i.test(cleanCourseTitle) ? 'python' :
      /java\b/i.test(cleanCourseTitle) ? 'java' :
      /c programming|\bc\b/i.test(cleanCourseTitle) ? 'c' :
      /sql|dbms|database/i.test(cleanCourseTitle) ? 'sql' :
      /linux|bash|git|kubernetes|devops/i.test(cleanCourseTitle) ? 'bash' : 'javascript';

    let sampleCode = '';
    if (codeLang === 'python') {
      sampleCode = `\`\`\`python
# Example: Implementing ${cleanLessonTitle}
def process_data(items: list) -> dict:
    """Processes input items and computes summary statistics."""
    if not items:
        return {"status": "empty", "count": 0}
    
    result = {
        "count": len(items),
        "processed": [item.strip().title() for item in items if isinstance(item, str)]
    }
    return result

# Execute demonstration
data = ["alpha", "beta", "gamma"]
output = process_data(data)
print(f"Result: {output}")
\`\`\``;
    } else if (codeLang === 'bash') {
      sampleCode = `\`\`\`bash
# Example: Executing ${cleanLessonTitle} commands
# 1. Verify environment prerequisites
echo "=== Checking System Environment ==="
uname -a

# 2. Execute command workflow
mkdir -p ./workspace/demo
cd ./workspace/demo

# 3. Inspect status output
ls -la
echo "Setup successfully initialized!"
\`\`\``;
    } else if (codeLang === 'sql') {
      sampleCode = `\`\`\`sql
-- Example: Query demonstration for ${cleanLessonTitle}
SELECT 
    u.id AS user_id,
    u.username,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.amount), 0.00) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.username
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;
\`\`\``;
    } else {
      sampleCode = `\`\`\`javascript
// Example: Implementing ${cleanLessonTitle}
async function executeWorkflow(config = {}) {
  try {
    const { timeout = 5000, retries = 3 } = config;
    console.log(\`Initializing workflow with timeout: \${timeout}ms\`);
    
    // Simulate async data processing
    const response = await fetch('/api/data', {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Workflow execution error:', error.message);
    return { success: false, error: error.message };
  }
}

executeWorkflow();
\`\`\``;
    }

    const generatedMarkdown = `# ${cleanLessonTitle}

## 1. Overview & Learning Objectives

Welcome to this in-depth lesson on **${cleanLessonTitle}** in **${cleanCourseTitle}**. In modern production software engineering, mastering this concept is essential for building resilient, high-performance systems.

### What You Will Learn:
- Understand the core architectural principles behind ${cleanLessonTitle}.
- Learn how data flows through the execution pipeline.
- Implement hands-on working code following modern industry best practices.
- Avoid common anti-patterns, memory leaks, and concurrency bugs.

---

## 2. Core Technical Mechanics

When working with ${cleanLessonTitle}, the underlying runtime coordinates multiple subsystems to ensure reliability, correctness, and low latency.

> 📌 **Note:** Understanding the separation of concerns and internal state transitions makes debugging complex production incidents substantially faster.

### Key Structural Concepts:
1. **Deterministic Execution:** Guarantees that identical inputs yield consistent state transitions.
2. **Resource Management:** Ensures open handles, file descriptors, and network connections are cleanly reclaimed.
3. **Error Boundaries:** Prevents localized faults from cascading across the entire application stack.

---

## 3. Implementation & Code Walkthrough

Below is a production-grade implementation demonstrating how to configure and execute ${cleanLessonTitle} step-by-step:

${sampleCode}

### Code Analysis:
- **Safety First:** Notice how inputs are validated before entering the main execution branch.
- **Error Propagation:** Exceptions are caught gracefully and formatted into structured payloads.
- **Readability & Typing:** Clean function signatures and inline documentation ensure team maintainability.

> 💡 **Tip:** Always favor explicit configuration parameters over global state. This makes your unit tests isolated, deterministic, and fast.

---

## 4. Common Pitfalls & Anti-Patterns

| Anti-Pattern | Why It Fails | Recommended Solution |
|---|---|---|
| Unhandled Rejections / Exceptions | Causes silent failures or process crashes | Wrap execution in structured try/catch blocks |
| Memory Bloat | Retaining unused object references | Dereference and cleanup event listeners |
| Hardcoded Credentials | Security vulnerability | Use environment variables and secrets managers |

---

### Practice Exercise

**Challenge:** Extend the code example above to handle an edge case where input data is corrupted or null.
1. Add custom error handling with a user-friendly error message.
2. Write a verification test case to assert that the function returns a valid fallback state.
3. Verify that all resources are cleaned up cleanly.
`;

    const wordCount = generatedMarkdown.split(/\s+/).length;
    return {
      title: cleanLessonTitle,
      content: generatedMarkdown,
      estimatedReadMinutes: Math.max(3, Math.ceil(wordCount / 200))
    };
  }
}
