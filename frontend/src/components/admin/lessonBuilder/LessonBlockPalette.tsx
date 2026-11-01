import React, { useState } from 'react';
import {
  Heading,
  Type,
  Quote,
  Minus,
  List,
  Image,
  Video,
  FileText,
  Layers,
  Code2,
  Terminal,
  HelpCircle,
  FileCheck2,
  Link2,
  Download,
  AlertCircle,
  Search,
  Plus,
} from 'lucide-react';
import type { LessonBlockType, ILessonBlock } from '../../../../../shared/types/course';

export interface BlockPaletteItem {
  type: LessonBlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Basic' | 'Media' | 'Development' | 'Assessment' | 'Resources';
  defaultData: (lessonId: string) => any;
}

export const PALETTE_DEFINITIONS: BlockPaletteItem[] = [
  // 1. Basic
  {
    type: 'heading',
    label: 'Heading',
    description: 'H2, H3, or H4 section break with anchor',
    icon: Heading,
    category: 'Basic',
    defaultData: () => ({ text: 'Section Heading', level: 2 }),
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Rich text paragraph with Markdown support',
    icon: Type,
    category: 'Basic',
    defaultData: () => ({ markdown: 'Write your lesson content, explanations, or concepts here...', html: '' }),
  },
  {
    type: 'callout',
    label: 'Callout',
    description: 'Highlighted tip, info, warning, or note box',
    icon: AlertCircle,
    category: 'Basic',
    defaultData: () => ({
      tone: 'info',
      title: 'Key Information',
      message: 'Add notable takeaways, reminders, or tips for students.',
    }),
  },
  {
    type: 'quote',
    label: 'Quote',
    description: 'Key quote, thought leader excerpt, or principle',
    icon: Quote,
    category: 'Basic',
    defaultData: () => ({
      quote: 'The beautiful thing about learning is that no one can take it away from you.',
      author: 'B.B. King',
      citation: '',
    }),
  },
  {
    type: 'list',
    label: 'List',
    description: 'Bulleted, numbered, or checklist items',
    icon: List,
    category: 'Basic',
    defaultData: () => ({
      style: 'bullet',
      items: ['First key item', 'Second key item', 'Third key item'],
    }),
  },
  {
    type: 'divider',
    label: 'Divider',
    description: 'Subtle separator line to segment sections',
    icon: Minus,
    category: 'Basic',
    defaultData: () => ({ style: 'solid' }),
  },

  // 2. Media
  {
    type: 'image',
    label: 'Image',
    description: 'Diagram, illustration, or infographic with caption',
    icon: Image,
    category: 'Media',
    defaultData: () => ({
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
      alt: 'Illustration illustration',
      caption: 'Visual overview of the architecture concept',
      alignment: 'center',
    }),
  },
  {
    type: 'video',
    label: 'Video',
    description: 'YouTube, Vimeo, Cloudinary, or Storage video',
    icon: Video,
    category: 'Media',
    defaultData: () => ({
      provider: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: '',
      duration: 360,
    }),
  },
  {
    type: 'pdf',
    label: 'PDF Document',
    description: 'Embedded or downloadable PDF guide or sheet',
    icon: FileText,
    category: 'Media',
    defaultData: () => ({
      title: 'Lesson Reading & Reference Guide.pdf',
      url: '',
      size: 1048576,
    }),
  },
  {
    type: 'embed',
    label: 'Embed',
    description: 'Interactive iframe, Codepen, Replit, or web tool',
    icon: Layers,
    category: 'Media',
    defaultData: () => ({
      embedUrl: 'https://codepen.io',
      title: 'Interactive Sandbox',
      height: 400,
    }),
  },

  // 3. Development
  {
    type: 'code',
    label: 'Code',
    description: 'Syntax-highlighted snippet with explanation',
    icon: Code2,
    category: 'Development',
    defaultData: () => ({
      title: 'Implementation Example',
      language: 'typescript',
      code: `// Define a reactive state container\ninterface State {\n  status: 'idle' | 'loading' | 'success';\n}\n\nexport function executeTask(): void {\n  console.log('Task executed successfully.');\n}`,
      explanation: 'Notice how type safety prevents invalid state transitions.',
    }),
  },
  {
    type: 'code',
    label: 'Terminal',
    description: 'CLI / Terminal shell session and commands',
    icon: Terminal,
    category: 'Development',
    defaultData: () => ({
      title: 'Terminal Session',
      language: 'bash',
      code: `# Initialize workspace repository\ngit init my-project\ncd my-project\nnpm install`,
      explanation: 'Run these commands in your local bash or zsh terminal.',
    }),
  },

  // 4. Assessment
  {
    type: 'quiz',
    label: 'Quiz',
    description: 'Multiple choice conceptual check with feedback',
    icon: HelpCircle,
    category: 'Assessment',
    defaultData: () => ({
      title: 'Knowledge Check',
      questions: [
        {
          questionId: `q-${Date.now()}`,
          questionNumber: 1,
          question: 'What is the primary benefit of modular content blocks?',
          type: 'mcq',
          options: [
            'Independent reordering and updating without altering code',
            'Lower video resolution',
            'Enforces monolithic database tables',
            'Requires static HTML compilation only',
          ],
          correctAnswer: 0,
          explanation: 'Blocks allow granular updates, reuse, and seamless drag-and-drop authoring.',
          points: 5,
        },
      ],
    }),
  },
  {
    type: 'assignment',
    label: 'Assignment',
    description: 'Project prompt, requirements, and submission format',
    icon: FileCheck2,
    category: 'Assessment',
    defaultData: () => ({
      title: 'Hands-on Milestone Exercise',
      instructions: 'Build a modular component adhering to the design specifications.',
      requirements: ['Type-safe interfaces', 'Accessible contrast ratios', 'Mobile-responsive layout'],
      submissionFormat: 'code',
      points: 25,
      deadline: '7 days after module start',
    }),
  },

  // 5. Resources
  {
    type: 'link',
    label: 'Link',
    description: 'Curated external article, documentation, or repo',
    icon: Link2,
    category: 'Resources',
    defaultData: () => ({
      title: 'Official Documentation & Standards Guide',
      url: 'https://developer.mozilla.org',
      description: 'Comprehensive specifications and live browser compatibility tables.',
      isExternal: true,
    }),
  },
  {
    type: 'download',
    label: 'Download',
    description: 'Starter archive, lab assets, or dataset file',
    icon: Download,
    category: 'Resources',
    defaultData: () => ({
      title: 'Starter Project Assets (ZIP)',
      url: '',
      fileSize: '4.2 MB',
      category: 'Starter Kit',
    }),
  },
];

interface LessonBlockPaletteProps {
  lessonId: string;
  currentLastOrder: number;
  onAddBlock: (block: ILessonBlock) => void;
  className?: string;
}

export const LessonBlockPalette: React.FC<LessonBlockPaletteProps> = ({
  lessonId,
  currentLastOrder,
  onAddBlock,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Basic', 'Media', 'Development', 'Assessment', 'Resources'];

  const filteredItems = PALETTE_DEFINITIONS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateBlock = (def: BlockPaletteItem) => {
    const uniqueId = `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newBlock: ILessonBlock = {
      id: uniqueId,
      lessonId,
      type: def.type,
      order: currentLastOrder + 1,
      data: def.defaultData(lessonId),
      isVisible: true,
      createdAt: now,
      updatedAt: now,
      updatedBy: 'admin',
    };

    onAddBlock(newBlock);
  };

  return (
    <aside
      className={`w-72 shrink-0 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full overflow-hidden select-none ${className}`}
    >
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Block Palette</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            {PALETTE_DEFINITIONS.length} blocks
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/70 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 text-[10px] rounded-md font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Block List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No content blocks found matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.label}-${index}`}
                onClick={() => handleCreateBlock(item)}
                className="w-full text-left p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/60 hover:border-indigo-500/40 transition-all duration-200 group flex items-start space-x-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 border border-slate-700/50 group-hover:border-indigo-500/30 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {item.label}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-slate-400/80 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
