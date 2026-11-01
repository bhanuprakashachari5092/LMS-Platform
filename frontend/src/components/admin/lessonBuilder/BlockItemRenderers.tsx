import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  FileText,
  Download,
  AlertCircle,
  Lightbulb,
  Info,
  AlertTriangle,
  Play,
  Eye,
  Edit3,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type {
  HeadingBlockData,
  TextBlockData,
  ImageBlockData,
  VideoBlockData,
  PdfBlockData,
  CodeBlockData,
  CalloutBlockData,
  QuoteBlockData,
  ListBlockData,
  LinkBlockData,
  QuizBlockData,
  AssignmentBlockData,
  DownloadBlockData,
  EmbedBlockData,
  DividerBlockData,
} from '../../../../../shared/types/course';

interface BlockRendererProps<T> {
  data: T;
  onChange: (data: T) => void;
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. HEADING BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const HeadingBlockItem: React.FC<BlockRendererProps<HeadingBlockData>> = ({ data, onChange }) => {
  const level = data?.level || 2;
  const text = data?.text || '';

  const anchorId = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {([2, 3, 4] as const).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => onChange({ ...data, level: lvl })}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              level === lvl
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            H{lvl}
          </button>
        ))}
        <span className="text-[11px] text-slate-500 font-mono ml-auto">
          #{anchorId || 'anchor'}
        </span>
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Enter section heading..."
        className={`w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 font-bold transition-all ${
          level === 2 ? 'text-xl' : level === 3 ? 'text-lg' : 'text-base'
        }`}
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 2. TEXT BLOCK (Rich Markdown)
// ═════════════════════════════════════════════════════════════════════════════
export const TextBlockItem: React.FC<BlockRendererProps<TextBlockData>> = ({ data, onChange }) => {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const markdown = data?.markdown || '';

  const insertSyntax = (prefix: string, suffix = '') => {
    onChange({
      ...data,
      markdown: `${markdown}\n${prefix}text${suffix}`,
    });
  };

  return (
    <div className="space-y-2">
      {/* Mini Formatting Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => insertSyntax('**', '**')}
            title="Bold"
            className="px-2 py-1 text-xs font-bold rounded bg-slate-800/70 text-slate-300 hover:bg-slate-700"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('*', '*')}
            title="Italic"
            className="px-2 py-1 text-xs italic rounded bg-slate-800/70 text-slate-300 hover:bg-slate-700"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('> ')}
            title="Quote"
            className="px-2 py-1 text-xs rounded bg-slate-800/70 text-slate-300 hover:bg-slate-700 font-mono"
          >
            &quot;
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('`', '`')}
            title="Inline Code"
            className="px-2 py-1 text-xs rounded bg-slate-800/70 text-slate-300 hover:bg-slate-700 font-mono"
          >
            &lt;/&gt;
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('- ')}
            title="Bullet List"
            className="px-2 py-1 text-xs rounded bg-slate-800/70 text-slate-300 hover:bg-slate-700"
          >
            • List
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg bg-slate-800/60 p-0.5 border border-slate-700/50">
          <button
            type="button"
            onClick={() => setTab('edit')}
            className={`px-2 py-0.5 text-xs rounded-md font-medium transition-all ${
              tab === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3 h-3 inline mr-1" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`px-2 py-0.5 text-xs rounded-md font-medium transition-all ${
              tab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Preview
          </button>
        </div>
      </div>

      {tab === 'edit' ? (
        <textarea
          rows={5}
          value={markdown}
          onChange={(e) => onChange({ ...data, markdown: e.target.value })}
          placeholder="Write in Markdown or plain text..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 font-mono leading-relaxed transition-all resize-y"
        />
      ) : (
        <div className="p-4 bg-slate-950/50 border border-slate-800/70 rounded-xl min-h-[100px] prose prose-invert prose-sm max-w-none">
          {markdown ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          ) : (
            <p className="text-slate-600 italic">No content to preview.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 3. IMAGE BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const ImageBlockItem: React.FC<BlockRendererProps<ImageBlockData>> = ({ data, onChange }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Image URL
          </label>
          <input
            type="url"
            value={data?.url || ''}
            onChange={(e) => {
              setImageError(false);
              onChange({ ...data, url: e.target.value });
            }}
            placeholder="https://example.com/diagram.png"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Alt Text (Accessibility)
          </label>
          <input
            type="text"
            value={data?.alt || ''}
            onChange={(e) => onChange({ ...data, alt: e.target.value })}
            placeholder="Descriptive image label"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Caption
        </label>
        <input
          type="text"
          value={data?.caption || ''}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          placeholder="Figure caption or explanation"
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Image Preview */}
      {data?.url && (
        <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 p-2 flex flex-col items-center">
          {imageError ? (
            <div className="py-8 text-center text-xs text-rose-400">
              Unable to load preview from URL. Please verify the image link.
            </div>
          ) : (
            <img
              src={data.url}
              alt={data.alt || 'Preview'}
              onError={() => setImageError(true)}
              className="max-h-64 object-contain rounded-lg shadow"
            />
          )}
          {data?.caption && <p className="text-[11px] text-slate-400 mt-2 italic text-center">{data.caption}</p>}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 4. VIDEO BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const VideoBlockItem: React.FC<BlockRendererProps<VideoBlockData>> = ({ data, onChange }) => {
  const url = data?.url || '';

  const detectProvider = (videoUrl: string): VideoBlockData['provider'] => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) return 'youtube';
    if (videoUrl.includes('vimeo.com')) return 'vimeo';
    if (videoUrl.includes('cloudinary.com')) return 'cloudinary';
    if (videoUrl.includes('firebasestorage.googleapis.com')) return 'firebase-storage';
    return 'custom';
  };

  const getEmbedUrl = (videoUrl: string, provider: string) => {
    if (provider === 'youtube') {
      const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0` : null;
    }
    if (provider === 'vimeo') {
      const match = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=0` : null;
    }
    return null;
  };

  const currentProvider = data?.provider || detectProvider(url);
  const embedUrl = getEmbedUrl(url, currentProvider);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Video URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              const newUrl = e.target.value;
              onChange({
                ...data,
                url: newUrl,
                provider: detectProvider(newUrl),
              });
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Provider
          </label>
          <select
            value={currentProvider}
            onChange={(e) => onChange({ ...data, provider: e.target.value as any })}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="cloudinary">Cloudinary</option>
            <option value="firebase-storage">Firebase Storage</option>
            <option value="custom">Direct MP4 / Custom</option>
          </select>
        </div>
      </div>

      {/* Video Preview */}
      {url && (
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Lesson Video Preview"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="p-4 text-center">
              <Play className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs text-slate-300 font-medium">Custom Stream / Direct MP4</p>
              <p className="text-[11px] text-slate-500 font-mono truncate max-w-sm mt-1">{url}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 5. PDF BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const PdfBlockItem: React.FC<BlockRendererProps<PdfBlockData>> = ({ data, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Document Title
          </label>
          <input
            type="text"
            value={data?.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="e.g. Course Cheatsheet & Lab Instructions.pdf"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            PDF Storage / Download URL
          </label>
          <input
            type="url"
            value={data?.url || ''}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://storage.googleapis.com/.../document.pdf"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* PDF Card Preview */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">{data?.title || 'Document.pdf'}</h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {data?.size ? `${(data.size / 1024 / 1024).toFixed(1)} MB` : 'PDF Document'}
            </p>
          </div>
        </div>

        {data?.url ? (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        ) : (
          <span className="text-[11px] text-slate-500 italic">No URL provided</span>
        )}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 6. CODE BLOCK
// ═════════════════════════════════════════════════════════════════════════════
const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'sql',
  'html',
  'css',
  'json',
  'bash',
];

export const CodeBlockItem: React.FC<BlockRendererProps<CodeBlockData>> = ({ data, onChange }) => {
  const [tab, setTab] = useState<'editor' | 'preview'>('editor');
  const code = data?.code || '';
  const language = data?.language || 'typescript';

  return (
    <div className="space-y-2">
      {/* Code Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={data?.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Code snippet title..."
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-48"
          />

          <select
            value={language}
            onChange={(e) => onChange({ ...data, language: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            {CODE_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center rounded-lg bg-slate-800/60 p-0.5 border border-slate-700/50">
          <button
            type="button"
            onClick={() => setTab('editor')}
            className={`px-2 py-0.5 text-xs rounded-md font-medium transition-all ${
              tab === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`px-2 py-0.5 text-xs rounded-md font-medium transition-all ${
              tab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Syntax Preview
          </button>
        </div>
      </div>

      {tab === 'editor' ? (
        <textarea
          rows={6}
          value={code}
          onChange={(e) => onChange({ ...data, code: e.target.value })}
          placeholder="// Paste or write code snippet here..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-400 placeholder-slate-700 focus:outline-none focus:border-indigo-500/70 leading-relaxed transition-all resize-y"
        />
      ) : (
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {`\`\`\`${language}\n${code || '// Empty code block'}\n\`\`\``}
          </ReactMarkdown>
        </div>
      )}

      {/* Explanation Note */}
      <input
        type="text"
        value={data?.explanation || ''}
        onChange={(e) => onChange({ ...data, explanation: e.target.value })}
        placeholder="Explanation or annotation for students (optional)..."
        className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 7. CALLOUT BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const CalloutBlockItem: React.FC<BlockRendererProps<CalloutBlockData>> = ({ data, onChange }) => {
  const tone = data?.tone || 'info';

  const toneConfig: Record<
    CalloutBlockData['tone'],
    { icon: React.ComponentType<{ className?: string }>; border: string; bg: string; text: string }
  > = {
    info: { icon: Info, border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    tip: { icon: Lightbulb, border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
    },
    note: { icon: AlertCircle, border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  };

  const current = toneConfig[tone] || toneConfig.info;
  const ToneIcon = current.icon;

  return (
    <div className={`p-4 rounded-xl border ${current.border} ${current.bg} space-y-2.5 transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ToneIcon className={`w-4 h-4 ${current.text}`} />
          <input
            type="text"
            value={data?.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Callout Title..."
            className="bg-transparent font-semibold text-xs text-slate-200 placeholder-slate-500 focus:outline-none border-b border-transparent focus:border-slate-500"
          />
        </div>

        {/* Tone Selector */}
        <div className="flex space-x-1">
          {(['info', 'tip', 'warning', 'note'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...data, tone: t })}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded transition-all ${
                tone === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <textarea
        rows={2}
        value={data?.message || ''}
        onChange={(e) => onChange({ ...data, message: e.target.value })}
        placeholder="Enter callout message, warning, or tip..."
        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 leading-relaxed resize-y"
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 8. QUOTE BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const QuoteBlockItem: React.FC<BlockRendererProps<QuoteBlockData>> = ({ data, onChange }) => {
  return (
    <div className="border-l-4 border-indigo-500 pl-4 py-1 space-y-2 bg-slate-950/30 rounded-r-xl p-3">
      <textarea
        rows={2}
        value={data?.quote || ''}
        onChange={(e) => onChange({ ...data, quote: e.target.value })}
        placeholder="&quot;Enter quotation or inspiring insight...&quot;"
        className="w-full bg-transparent text-sm italic text-slate-200 placeholder-slate-600 focus:outline-none resize-y"
      />
      <div className="flex items-center space-x-2">
        <span className="text-xs text-slate-500">—</span>
        <input
          type="text"
          value={data?.author || ''}
          onChange={(e) => onChange({ ...data, author: e.target.value })}
          placeholder="Author or source..."
          className="bg-transparent text-xs text-slate-400 placeholder-slate-600 focus:outline-none border-b border-slate-800 focus:border-indigo-500 pb-0.5"
        />
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 9. LIST BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const ListBlockItem: React.FC<BlockRendererProps<ListBlockData>> = ({ data, onChange }) => {
  const style = data?.style || 'bullet';
  const items = Array.isArray(data?.items) ? data.items : [];

  const handleUpdateItem = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    onChange({ ...data, items: next });
  };

  const handleAddItem = () => {
    onChange({ ...data, items: [...items, ''] });
  };

  const handleRemoveItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">List Style:</span>
        <div className="flex space-x-1">
          {(['bullet', 'numbered', 'checklist'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...data, style: s })}
              className={`px-2 py-0.5 text-xs rounded-md font-medium transition-all ${
                style === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-500 w-5 text-right shrink-0">
              {style === 'numbered' ? `${idx + 1}.` : style === 'checklist' ? '☑' : '•'}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => handleUpdateItem(idx, e.target.value)}
              placeholder={`Item ${idx + 1}...`}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(idx)}
              className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        className="inline-flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-1"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add List Item</span>
      </button>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 10. LINK BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const LinkBlockItem: React.FC<BlockRendererProps<LinkBlockData>> = ({ data, onChange }) => {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Link Title
          </label>
          <input
            type="text"
            value={data?.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="e.g. Official Documentation"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Target URL
          </label>
          <input
            type="url"
            value={data?.url || ''}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      <input
        type="text"
        value={data?.description || ''}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        placeholder="Brief description or notes for the link..."
        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 11. QUIZ BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const QuizBlockItem: React.FC<BlockRendererProps<QuizBlockData>> = ({ data, onChange }) => {
  const questions = Array.isArray(data?.questions) ? data.questions : [];

  const handleAddQuestion = () => {
    const newQ = {
      questionId: `q-${Date.now()}`,
      questionNumber: questions.length + 1,
      question: 'New question prompt...',
      type: 'mcq' as const,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Explanation for correct choice.',
      points: 5,
    };
    onChange({ ...data, questions: [...questions, newQ] });
  };

  const handleUpdateQuestion = (qIndex: number, updated: any) => {
    const next = [...questions];
    next[qIndex] = { ...next[qIndex], ...updated };
    onChange({ ...data, questions: next });
  };

  const handleRemoveQuestion = (qIndex: number) => {
    onChange({ ...data, questions: questions.filter((_, idx) => idx !== qIndex) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <input
          type="text"
          value={data?.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Quiz Title..."
          className="bg-transparent font-bold text-sm text-slate-200 placeholder-slate-500 focus:outline-none border-b border-transparent focus:border-indigo-500"
        />
        <span className="text-xs text-purple-400 font-medium">
          {questions.length} Question{questions.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((q, qIdx) => (
          <div key={q.questionId || qIdx} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">Question {qIdx + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveQuestion(qIdx)}
                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="text"
              value={q.question || ''}
              onChange={(e) => handleUpdateQuestion(qIdx, { question: e.target.value })}
              placeholder="What is the primary concept...?"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />

            {/* Options */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Options (Select correct radio)
              </p>
              {(q.options || []).map((opt: string, optIdx: number) => (
                <div key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${q.questionId || qIdx}`}
                    checked={q.correctAnswer === optIdx}
                    onChange={() => handleUpdateQuestion(qIdx, { correctAnswer: optIdx })}
                    className="accent-purple-500"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const nextOpts = [...(q.options || [])];
                      nextOpts[optIdx] = e.target.value;
                      handleUpdateQuestion(qIdx, { options: nextOpts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>

            <input
              type="text"
              value={q.explanation || ''}
              onChange={(e) => handleUpdateQuestion(qIdx, { explanation: e.target.value })}
              placeholder="Explanation when answered..."
              className="w-full bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-400 placeholder-slate-600 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddQuestion}
        className="inline-flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Question</span>
      </button>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 12. ASSIGNMENT BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const AssignmentBlockItem: React.FC<BlockRendererProps<AssignmentBlockData>> = ({ data, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Assignment Title
          </label>
          <input
            type="text"
            value={data?.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="e.g. Build a Responsive Dashboard"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Points
          </label>
          <input
            type="number"
            value={data?.points ?? 25}
            onChange={(e) => onChange({ ...data, points: Number(e.target.value) })}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Instructions & Deliverables
        </label>
        <textarea
          rows={3}
          value={data?.instructions || ''}
          onChange={(e) => onChange({ ...data, instructions: e.target.value })}
          placeholder="Specify clear requirements, submission criteria, and evaluation rubrics..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
        />
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 13. DOWNLOAD BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const DownloadBlockItem: React.FC<BlockRendererProps<DownloadBlockData>> = ({ data, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            File / Archive Title
          </label>
          <input
            type="text"
            value={data?.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="e.g. Starter Code.zip"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            File URL
          </label>
          <input
            type="url"
            value={data?.url || ''}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 14. EMBED BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const EmbedBlockItem: React.FC<BlockRendererProps<EmbedBlockData>> = ({ data, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Embed URL (iFrame Sandbox)
          </label>
          <input
            type="url"
            value={data?.embedUrl || ''}
            onChange={(e) => onChange({ ...data, embedUrl: e.target.value })}
            placeholder="https://codepen.io/embed/..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Height (px)
          </label>
          <input
            type="number"
            value={data?.height || 400}
            onChange={(e) => onChange({ ...data, height: Number(e.target.value) })}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {data?.embedUrl && (
        <div
          className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 w-full"
          style={{ height: `${data.height || 400}px` }}
        >
          <iframe
            src={data.embedUrl}
            title={data.title || 'Embed'}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 15. DIVIDER BLOCK
// ═════════════════════════════════════════════════════════════════════════════
export const DividerBlockItem: React.FC<BlockRendererProps<DividerBlockData>> = ({ data, onChange }) => {
  const style = data?.style || 'solid';

  return (
    <div className="py-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider">Divider Style:</span>
        <div className="flex space-x-1">
          {(['solid', 'dashed', 'dots'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...data, style: s })}
              className={`px-2 py-0.5 text-xs rounded transition-all ${
                style === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        {style === 'solid' && <div className="border-b border-slate-700" />}
        {style === 'dashed' && <div className="border-b border-dashed border-slate-700" />}
        {style === 'dots' && (
          <div className="flex justify-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          </div>
        )}
      </div>
    </div>
  );
};
