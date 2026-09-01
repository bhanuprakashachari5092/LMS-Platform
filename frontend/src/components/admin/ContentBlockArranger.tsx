import React, { useState, useEffect } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Workflow,
  Code2,
  FileText,
  CheckSquare,
  ListOrdered,
  Lightbulb,
  Table as TableIcon
} from 'lucide-react';
import { MermaidDiagram } from '../learning/MermaidDiagram';

export interface ContentBlock {
  id: string;
  type: 'heading' | 'text' | 'flowchart' | 'code' | 'callout' | 'steps' | 'checklist' | 'table' | 'practice';
  content: string;
  meta?: {
    lang?: string;
    level?: number;
    calloutType?: 'tip' | 'note' | 'warning';
    title?: string;
  };
}

interface ContentBlockArrangerProps {
  markdown: string;
  onChange: (newMarkdown: string) => void;
  isNightMode?: boolean;
}

/** Parse markdown text into modular blocks */
export function parseMarkdownToBlocks(markdown: string): ContentBlock[] {
  if (!markdown || !markdown.trim()) {
    return [
      {
        id: `block-${Date.now()}-1`,
        type: 'heading',
        content: 'Lesson Introduction',
        meta: { level: 1 },
      },
      {
        id: `block-${Date.now()}-2`,
        type: 'text',
        content: 'Write your introductory conceptual overview here.',
      },
    ];
  }

  const rawBlocks = markdown.split(/\n\n(?=(?:#|```|>|\||1\.|- \[))/g);
  const blocks: ContentBlock[] = [];

  rawBlocks.forEach((chunk, index) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    // Heading block
    if (/^#{1,4}\s+/.test(trimmed)) {
      const match = trimmed.match(/^(#{1,4})\s+(.+)/);
      const level = match ? match[1].length : 2;
      const text = match ? match[2].trim() : trimmed.replace(/^#+\s*/, '');
      blocks.push({
        id: `block-${index}-${Date.now()}`,
        type: 'heading',
        content: text,
        meta: { level },
      });
      return;
    }

    // Code block or Flowchart or Practice
    if (trimmed.startsWith('```')) {
      const lines = trimmed.split('\n');
      const firstLine = lines[0].replace(/```/, '').trim();
      const codeContent = lines.slice(1, lines.length - 1).join('\n');

      if (['mermaid', 'flowchart', 'sequence', 'mindmap'].includes(firstLine.toLowerCase())) {
        blocks.push({
          id: `block-${index}-${Date.now()}`,
          type: 'flowchart',
          content: codeContent || 'flowchart TD\n  Start([Start]) --> End([Done])',
        });
      } else if (firstLine.startsWith('practice-')) {
        blocks.push({
          id: `block-${index}-${Date.now()}`,
          type: 'practice',
          content: codeContent,
          meta: { lang: firstLine },
        });
      } else {
        blocks.push({
          id: `block-${index}-${Date.now()}`,
          type: 'code',
          content: codeContent,
          meta: { lang: firstLine || 'typescript' },
        });
      }
      return;
    }

    // Callout quote block
    if (trimmed.startsWith('>')) {
      let calloutType: 'tip' | 'note' | 'warning' = 'note';
      let cleanText = trimmed.replace(/^>\s*/gm, '');

      if (/\*\*Tip\*\*/i.test(cleanText) || /\[!TIP\]/i.test(cleanText)) {
        calloutType = 'tip';
        cleanText = cleanText.replace(/\*\*Tip\*\*:\s*|\[!TIP\]\s*/i, '');
      } else if (/\*\*Warning\*\*/i.test(cleanText) || /\[!WARNING\]/i.test(cleanText)) {
        calloutType = 'warning';
        cleanText = cleanText.replace(/\*\*Warning\*\*:\s*|\[!WARNING\]\s*/i, '');
      } else if (/\*\*Note\*\*/i.test(cleanText) || /\[!NOTE\]/i.test(cleanText)) {
        calloutType = 'note';
        cleanText = cleanText.replace(/\*\*Note\*\*:\s*|\[!NOTE\]\s*/i, '');
      }

      blocks.push({
        id: `block-${index}-${Date.now()}`,
        type: 'callout',
        content: cleanText.trim(),
        meta: { calloutType },
      });
      return;
    }

    // Checklist block
    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      blocks.push({
        id: `block-${index}-${Date.now()}`,
        type: 'checklist',
        content: trimmed,
      });
      return;
    }

    // Numbered Step list
    if (/^1\.\s+\*\*/.test(trimmed) || /^1\.\s+Step/i.test(trimmed)) {
      blocks.push({
        id: `block-${index}-${Date.now()}`,
        type: 'steps',
        content: trimmed,
      });
      return;
    }

    // Table block
    if (trimmed.startsWith('|')) {
      blocks.push({
        id: `block-${index}-${Date.now()}`,
        type: 'table',
        content: trimmed,
      });
      return;
    }

    // Default text/paragraph block
    blocks.push({
      id: `block-${index}-${Date.now()}`,
      type: 'text',
      content: trimmed,
    });
  });

  return blocks.length > 0
    ? blocks
    : [
        {
          id: `block-empty-${Date.now()}`,
          type: 'text',
          content: 'Add lesson content...',
        },
      ];
}

/** Serialize blocks back into clean Markdown string */
export function serializeBlocksToMarkdown(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'heading': {
          const hashes = '#'.repeat(b.meta?.level || 2);
          return `${hashes} ${b.content.trim()}`;
        }
        case 'flowchart':
          return `\`\`\`mermaid\n${b.content.trim()}\n\`\`\``;
        case 'code': {
          const lang = b.meta?.lang || 'typescript';
          return `\`\`\`${lang}\n${b.content.trim()}\n\`\`\``;
        }
        case 'practice': {
          const lang = b.meta?.lang || 'practice-sql';
          return `\`\`\`${lang}\n${b.content.trim()}\n\`\`\``;
        }
        case 'callout': {
          const type = b.meta?.calloutType || 'note';
          const label = type === 'tip' ? 'Tip' : type === 'warning' ? 'Warning' : 'Note';
          return `> **${label}**: ${b.content.trim()}`;
        }
        case 'steps':
        case 'checklist':
        case 'table':
        case 'text':
        default:
          return b.content.trim();
      }
    })
    .join('\n\n');
}

export const ContentBlockArranger: React.FC<ContentBlockArrangerProps> = ({
  markdown,
  onChange,
  isNightMode = true,
}) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => parseMarkdownToBlocks(markdown));
  const [expandedBlockIds, setExpandedBlockIds] = useState<Record<string, boolean>>({});

  // Sync incoming external markdown if completely changed
  useEffect(() => {
    // Only resync if block length is 0 or completely out of sync
    const currentSerialized = serializeBlocksToMarkdown(blocks);
    if (markdown.trim() && currentSerialized.trim() !== markdown.trim()) {
      setBlocks(parseMarkdownToBlocks(markdown));
    }
  }, [markdown]);

  const updateBlocksAndSync = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
    const serialized = serializeBlocksToMarkdown(newBlocks);
    onChange(serialized);
  };

  const toggleExpand = (id: string) => {
    setExpandedBlockIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateBlockContent = (id: string, content: string) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, content } : b));
    updateBlocksAndSync(updated);
  };

  const handleUpdateBlockMeta = (id: string, metaPatch: Record<string, any>) => {
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, meta: { ...b.meta, ...metaPatch } } : b
    );
    updateBlocksAndSync(updated);
  };

  const handleDeleteBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    updateBlocksAndSync(updated);
  };

  const handleDuplicateBlock = (index: number) => {
    const target = blocks[index];
    const duplicate: ContentBlock = {
      ...target,
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, duplicate);
    updateBlocksAndSync(updated);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updateBlocksAndSync(updated);
  };

  const handleAddBlock = (type: ContentBlock['type'], customPayload?: { content: string; meta?: any }) => {
    let initialContent = '';
    let meta: any = {};

    switch (type) {
      case 'heading':
        initialContent = 'New Section Heading';
        meta = { level: 2 };
        break;
      case 'text':
        initialContent = 'Add detailed concept explanation, syntax rules, and practical examples...';
        break;
      case 'flowchart':
        initialContent =
          customPayload?.content ||
          'flowchart TD\n  Start([🚀 Start]) --> Check{Is Valid?}\n  Check -- Yes --> Process[⚙️ Process Step]\n  Check -- No --> Error[⚠️ Show Error]\n  Process --> End([✅ Complete])';
        break;
      case 'code':
        initialContent = customPayload?.content || '// Code implementation\nfunction executeTask() {\n  return true;\n}';
        meta = { lang: customPayload?.meta?.lang || 'typescript' };
        break;
      case 'steps':
        initialContent =
          '1. **Step 1: Setup Environment** — Initialize project dependencies.\n2. **Step 2: Core Implementation** — Execute the algorithm logic.\n3. **Step 3: Verification** — Run test suite and check edge cases.';
        break;
      case 'checklist':
        initialContent =
          '- [ ] Conceptual architecture understood\n- [ ] Interactive simulation tested\n- [ ] Review performance and complexity\n- [ ] Knowledge assessment completed';
        break;
      case 'callout':
        initialContent = 'Always allocate sufficient memory boundaries before writing data buffer.';
        meta = { calloutType: 'tip' };
        break;
      case 'table':
        initialContent =
          '| Approach | ✅ Advantages (Pros) | ❌ Tradeoffs (Cons) |\n|---|---|---|\n| Pattern A | High throughput | Memory intensive |\n| Pattern B | Low memory footprint | CPU overhead |';
        break;
      case 'practice':
        initialContent =
          '-- @title: Interactive SQL Lab\nCREATE TABLE students (id INT, name TEXT);\nINSERT INTO students VALUES (1, "Bhanu");\nSELECT * FROM students;';
        meta = { lang: 'practice-sql' };
        break;
    }

    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      content: initialContent,
      meta,
    };

    const updated = [...blocks, newBlock];
    setExpandedBlockIds((prev) => ({ ...prev, [newBlock.id]: true }));
    updateBlocksAndSync(updated);
  };

  return (
    <div className="space-y-4 font-['Sora']">
      
      {/* Quick Add Floating Action Bar */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <GripVertical className="w-4 h-4 text-indigo-400" />
          <span>Visual Block Arranger</span>
          <span className="text-[11px] font-mono text-slate-500">({blocks.length} sections)</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => handleAddBlock('heading')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3 text-indigo-400" /> Heading
          </button>
          <button
            type="button"
            onClick={() => handleAddBlock('text')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3 h-3 text-sky-400" /> Text
          </button>
          <button
            type="button"
            onClick={() => handleAddBlock('flowchart')}
            className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <Workflow className="w-3 h-3 text-indigo-400" /> Flowchart
          </button>
          <button
            type="button"
            onClick={() => handleAddBlock('code')}
            className="px-2.5 py-1 bg-amber-950/70 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <Code2 className="w-3 h-3" /> Code
          </button>
          <button
            type="button"
            onClick={() => handleAddBlock('steps')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <ListOrdered className="w-3 h-3 text-emerald-400" /> Steps
          </button>
          <button
            type="button"
            onClick={() => handleAddBlock('checklist')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <CheckSquare className="w-3 h-3 text-purple-400" /> Checklist
          </button>
          <button
            type="button"
            onClick={() => handleAddBlock('callout')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" /> Callout
          </button>
          <button
            type="button"
            onClick={() => handleAddBlock('table')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <TableIcon className="w-3 h-3 text-blue-400" /> Table
          </button>
        </div>
      </div>

      {/* Draggable & Reorderable Blocks List */}
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={updateBlocksAndSync}
        className="space-y-3"
      >
        <AnimatePresence initial={false}>
          {blocks.map((block, index) => {
            const isExpanded = expandedBlockIds[block.id] ?? true;

            return (
              <Reorder.Item
                key={block.id}
                value={block}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-sm overflow-hidden transition-all"
              >
                {/* Block Header Drag Handle & Actions */}
                <div className="p-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-400 text-[10px] font-mono font-bold flex items-center justify-center">
                      {index + 1}
                    </span>

                    {/* Block Type Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        block.type === 'flowchart'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : block.type === 'code'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : block.type === 'heading'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : block.type === 'callout'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : block.type === 'steps'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {block.type === 'flowchart' && <Workflow className="w-3 h-3" />}
                      {block.type === 'code' && <Code2 className="w-3 h-3" />}
                      {block.type === 'steps' && <ListOrdered className="w-3 h-3" />}
                      {block.type === 'checklist' && <CheckSquare className="w-3 h-3" />}
                      {block.type === 'callout' && <Lightbulb className="w-3 h-3" />}
                      <span>{block.type}</span>
                    </span>

                    <span className="text-xs font-semibold text-slate-300 truncate max-w-xs sm:max-w-md">
                      {block.type === 'heading'
                        ? block.content
                        : block.content.split('\n')[0] || 'Empty section'}
                    </span>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-slate-800 text-slate-500 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveBlock(index, 'down')}
                      disabled={index === blocks.length - 1}
                      className="p-1 rounded hover:bg-slate-800 text-slate-500 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateBlock(index)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer"
                      title="Duplicate Section"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(block.id)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 cursor-pointer"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1 rounded hover:bg-rose-950/60 text-rose-500 cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block Content Editor Body */}
                {isExpanded && (
                  <div className="p-3.5 space-y-2.5">
                    
                    {/* Heading Level Controller */}
                    {block.type === 'heading' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Heading Level:</span>
                        {[1, 2, 3, 4].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleUpdateBlockMeta(block.id, { level: lvl })}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                              (block.meta?.level || 2) === lvl
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            H{lvl}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Code Language Controller */}
                    {block.type === 'code' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Language:</span>
                        <select
                          value={block.meta?.lang || 'typescript'}
                          onChange={(e) => handleUpdateBlockMeta(block.id, { lang: e.target.value })}
                          className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-xs text-amber-300 font-mono"
                        >
                          <option value="typescript">TypeScript</option>
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="c">C</option>
                          <option value="cpp">C++</option>
                          <option value="java">Java</option>
                          <option value="sql">SQL</option>
                          <option value="bash">Bash</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>
                    )}

                    {/* Callout Type Controller */}
                    {block.type === 'callout' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Callout Style:</span>
                        {(['tip', 'note', 'warning'] as const).map((ct) => (
                          <button
                            key={ct}
                            type="button"
                            onClick={() => handleUpdateBlockMeta(block.id, { calloutType: ct })}
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase cursor-pointer ${
                              (block.meta?.calloutType || 'note') === ct
                                ? ct === 'tip'
                                  ? 'bg-emerald-600 text-white'
                                  : ct === 'warning'
                                  ? 'bg-amber-600 text-slate-950 font-extrabold'
                                  : 'bg-sky-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {ct}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Textarea Input */}
                    <textarea
                      rows={block.type === 'flowchart' ? 6 : block.type === 'code' ? 5 : 3}
                      value={block.content}
                      onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-hidden leading-relaxed resize-y"
                      placeholder={`Enter ${block.type} content...`}
                      spellCheck={false}
                    />

                    {/* Live Inline Flowchart Diagram Preview */}
                    {block.type === 'flowchart' && (
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                        <MermaidDiagram chart={block.content} isNightMode={isNightMode} />
                      </div>
                    )}

                  </div>
                )}
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {/* Bottom Add Section Card */}
      <div className="p-4 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="text-xs font-bold text-slate-300">Need another section?</p>
          <p className="text-[11px] text-slate-500">Drag any card above by its handle to adjust section order.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleAddBlock('text')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Block
          </button>
        </div>
      </div>

    </div>
  );
};

export default ContentBlockArranger;
