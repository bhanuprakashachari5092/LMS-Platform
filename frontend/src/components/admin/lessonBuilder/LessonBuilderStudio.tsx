import React, { useState, useEffect } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Copy,
  Sliders,
  BookOpen,
  Plus,
  X,
  FileCode2,
} from 'lucide-react';
import { toast } from 'sonner';
import { courseService } from '../../../services/courseService';
import { LessonBlockPalette } from './LessonBlockPalette';
import { BlockShell } from './BlockShell';
import {
  HeadingBlockItem,
  TextBlockItem,
  ImageBlockItem,
  VideoBlockItem,
  PdfBlockItem,
  CodeBlockItem,
  CalloutBlockItem,
  QuoteBlockItem,
  ListBlockItem,
  LinkBlockItem,
  QuizBlockItem,
  AssignmentBlockItem,
  DownloadBlockItem,
  EmbedBlockItem,
  DividerBlockItem,
} from './BlockItemRenderers';
import { lessonToBlocks } from '../../../../../shared/adapters/lessonBlockAdapter';
import type { ILessonBlock, ILessonItem } from '../../../../../shared/types/course';

interface LessonBuilderStudioProps {
  courseId: string;
  moduleId: string;
  lesson: ILessonItem;
  onBack: () => void;
  onUpdateLesson?: (updatedLesson: ILessonItem) => void;
}

export const LessonBuilderStudio: React.FC<LessonBuilderStudioProps> = ({
  courseId,
  moduleId,
  lesson,
  onBack,
  onUpdateLesson,
}) => {
  const [blocks, setBlocks] = useState<ILessonBlock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'inspector'>('inspector');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Lesson Metadata State
  const [title, setTitle] = useState(lesson.title || '');
  const [description, setDescription] = useState(lesson.description || '');
  const [duration, setDuration] = useState(lesson.duration || '15 min');
  const [status, setStatus] = useState<'draft' | 'published'>(lesson.status || 'draft');
  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    lesson.learningObjectives || []
  );

  // Load existing blocks from canonical Firestore subcollection or synthesize from legacy lesson
  useEffect(() => {
    let isMounted = true;
    async function loadBlocks() {
      setIsLoading(true);
      try {
        const fetchedBlocks = await courseService.getLessonBlocks(courseId, moduleId, lesson.lessonId);
        if (isMounted) {
          if (Array.isArray(fetchedBlocks) && fetchedBlocks.length > 0) {
            const sorted = [...fetchedBlocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setBlocks(sorted);
            if (sorted[0]) setSelectedBlockId(sorted[0].id);
          } else {
            // Synthesize from legacy fields via adapter
            const synthesized = lessonToBlocks(lesson);
            setBlocks(synthesized);
            if (synthesized[0]) setSelectedBlockId(synthesized[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load lesson blocks:', err);
        // Fallback to adapter synthesis
        const synthesized = lessonToBlocks(lesson);
        if (isMounted) {
          setBlocks(synthesized);
          if (synthesized[0]) setSelectedBlockId(synthesized[0].id);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadBlocks();
    return () => {
      isMounted = false;
    };
  }, [courseId, moduleId, lesson]);

  // Mark unsaved changes
  const updateBlocksState = (newBlocks: ILessonBlock[]) => {
    setBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  // Reorder Handler (framer-motion)
  const handleReorder = (newOrder: ILessonBlock[]) => {
    const reindexed = newOrder.map((b, idx) => ({ ...b, order: idx }));
    updateBlocksState(reindexed);
  };

  // Add Block
  const handleAddBlock = (newBlock: ILessonBlock) => {
    const updated = [...blocks, newBlock].map((b, idx) => ({ ...b, order: idx }));
    updateBlocksState(updated);
    setSelectedBlockId(newBlock.id);
    setActiveTab('inspector');
    toast.success(`Added ${newBlock.type} block`);
  };

  // Update specific block data
  const handleUpdateBlockData = (blockId: string, newData: any) => {
    const updated = blocks.map((b) =>
      b.id === blockId ? { ...b, data: newData, updatedAt: new Date().toISOString() } : b
    );
    updateBlocksState(updated);
  };

  // Duplicate Block
  const handleDuplicateBlock = (blockId: string) => {
    const targetIdx = blocks.findIndex((b) => b.id === blockId);
    if (targetIdx === -1) return;
    const target = blocks[targetIdx];
    const duplicated: ILessonBlock = {
      ...target,
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order: targetIdx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextBlocks = [...blocks];
    nextBlocks.splice(targetIdx + 1, 0, duplicated);
    const reindexed = nextBlocks.map((b, idx) => ({ ...b, order: idx }));
    updateBlocksState(reindexed);
    setSelectedBlockId(duplicated.id);
    toast.info(`Duplicated ${target.type} block`);
  };

  // Delete Block
  const handleDeleteBlock = (blockId: string) => {
    const updated = blocks.filter((b) => b.id !== blockId).map((b, idx) => ({ ...b, order: idx }));
    updateBlocksState(updated);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(updated[0]?.id || null);
    }
    toast.info('Block removed from canvas');
  };

  // Toggle Block Visibility
  const handleToggleVisibility = (blockId: string) => {
    const updated = blocks.map((b) =>
      b.id === blockId ? { ...b, isVisible: !b.isVisible, updatedAt: new Date().toISOString() } : b
    );
    updateBlocksState(updated);
  };

  // Move Block Up / Down
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const reordered = [...blocks];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    const reindexed = reordered.map((b, idx) => ({ ...b, order: idx }));
    updateBlocksState(reindexed);
  };

  // Save Blocks and Lesson to Firestore
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save discrete blocks to canonical subcollection
      const savedBlocks = await courseService.saveLessonBlocks(
        courseId,
        moduleId,
        lesson.lessonId,
        blocks
      );

      // 2. Update lesson metadata & notify parent
      const updatedLesson: ILessonItem = {
        ...lesson,
        title,
        description,
        duration,
        status,
        learningObjectives,
        blocksCount: savedBlocks.length,
        revision: (lesson.revision || 1) + 1,
        lastSavedAt: new Date().toISOString(),
      };

      if (onUpdateLesson) {
        onUpdateLesson(updatedLesson);
      }

      setHasUnsavedChanges(false);
      toast.success('Lesson and blocks saved successfully!');
    } catch (err: any) {
      console.error('Error saving lesson blocks:', err);
      toast.error(err.message || 'Failed to save lesson blocks.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // Render content block inside BlockShell
  const renderBlockItem = (block: ILessonBlock) => {
    const onDataChange = (data: any) => handleUpdateBlockData(block.id, data);
    switch (block.type) {
      case 'heading':
        return <HeadingBlockItem data={block.data} onChange={onDataChange} />;
      case 'text':
        return <TextBlockItem data={block.data} onChange={onDataChange} />;
      case 'image':
        return <ImageBlockItem data={block.data} onChange={onDataChange} />;
      case 'video':
        return <VideoBlockItem data={block.data} onChange={onDataChange} />;
      case 'pdf':
        return <PdfBlockItem data={block.data} onChange={onDataChange} />;
      case 'code':
        return <CodeBlockItem data={block.data} onChange={onDataChange} />;
      case 'callout':
        return <CalloutBlockItem data={block.data} onChange={onDataChange} />;
      case 'quote':
        return <QuoteBlockItem data={block.data} onChange={onDataChange} />;
      case 'list':
        return <ListBlockItem data={block.data} onChange={onDataChange} />;
      case 'link':
        return <LinkBlockItem data={block.data} onChange={onDataChange} />;
      case 'quiz':
        return <QuizBlockItem data={block.data} onChange={onDataChange} />;
      case 'assignment':
        return <AssignmentBlockItem data={block.data} onChange={onDataChange} />;
      case 'download':
        return <DownloadBlockItem data={block.data} onChange={onDataChange} />;
      case 'embed':
        return <EmbedBlockItem data={block.data} onChange={onDataChange} />;
      case 'divider':
        return <DividerBlockItem data={block.data} onChange={onDataChange} />;
      default:
        return (
          <div className="p-3 text-xs text-slate-400 bg-slate-950/50 rounded-lg">
            Block type: <span className="font-mono text-indigo-400">{block.type}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* ════════════════════════════════════════════════════════════════════════
          TOP STUDIO ACTION BAR
          ════════════════════════════════════════════════════════════════════════ */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0 z-20 backdrop-blur">
        {/* Left: Back & Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Curriculum</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-2 truncate">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 shrink-0">
              Lesson Builder
            </span>
            <span className="text-slate-600">/</span>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Lesson Title"
              className="text-sm font-semibold text-slate-100 bg-transparent hover:bg-slate-800/50 focus:bg-slate-800 px-2 py-1 rounded border border-transparent focus:border-indigo-500/50 focus:outline-none transition-colors truncate max-w-xs sm:max-w-md"
            />
          </div>
        </div>

        {/* Right: Status, Preview, Save */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Status Dot */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            {hasUnsavedChanges ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Unsaved</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="hidden sm:inline">Saved</span>
              </>
            )}
          </div>

          {/* Revision Badge */}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Rev #{lesson.revision || 1}
          </span>

          {/* Preview Button */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Lesson'}</span>
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════════
          THREE-AREA WORKSPACE: [PALETTE] | [CANVAS] | [SETTINGS/PROPERTIES]
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 1. LEFT: BLOCK PALETTE */}
        <LessonBlockPalette
          lessonId={lesson.lessonId}
          currentLastOrder={blocks.length}
          onAddBlock={handleAddBlock}
        />

        {/* 2. CENTER: LESSON CANVAS */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-8 flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-3xl space-y-6 pb-24">
            {/* Canvas Header Info */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/20 border border-slate-800/80 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  Lesson Canvas
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {blocks.length} block{blocks.length === 1 ? '' : 's'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {title || 'Untitled Lesson'}
              </h1>
              {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
            </div>

            {/* Blocks Drag & Drop Canvas */}
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading lesson content blocks...</p>
              </div>
            ) : blocks.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">No Content Blocks Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Choose a block from the palette on the left or click below to start constructing
                    your lesson.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const def = (LessonBlockPalette as any);
                      // Trigger default text block
                      const newB: ILessonBlock = {
                        id: `block_${Date.now()}_text`,
                        lessonId: lesson.lessonId,
                        type: 'text',
                        order: 0,
                        data: { markdown: 'Enter your lesson overview here...' },
                        isVisible: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      handleAddBlock(newB);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    + Add Introduction Text
                  </button>
                </div>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={blocks}
                onReorder={handleReorder}
                className="space-y-4"
              >
                <AnimatePresence initial={false}>
                  {blocks.map((block, index) => (
                    <Reorder.Item
                      key={block.id}
                      value={block}
                      className="cursor-default select-text"
                    >
                      <BlockShell
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        isFirst={index === 0}
                        isLast={index === blocks.length - 1}
                        onSelect={() => {
                          setSelectedBlockId(block.id);
                          setActiveTab('inspector');
                        }}
                        onDuplicate={() => handleDuplicateBlock(block.id)}
                        onDelete={() => handleDeleteBlock(block.id)}
                        onToggleVisibility={() => handleToggleVisibility(block.id)}
                        onMoveUp={() => handleMoveBlock(index, 'up')}
                        onMoveDown={() => handleMoveBlock(index, 'down')}
                      >
                        {renderBlockItem(block)}
                      </BlockShell>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </div>
        </main>

        {/* 3. RIGHT: SETTINGS & PROPERTIES PANEL */}
        <aside className="w-80 shrink-0 bg-slate-900/90 border-l border-slate-800 flex flex-col h-full overflow-hidden select-none">
          {/* Panel Tab Switcher */}
          <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-950/40">
            <button
              type="button"
              onClick={() => setActiveTab('inspector')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'inspector'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Block Inspector</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lesson Meta</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            {activeTab === 'inspector' ? (
              selectedBlock ? (
                <div className="space-y-4">
                  {/* Block Metadata */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Block ID</span>
                      <span className="text-[10px] font-mono text-indigo-400 truncate max-w-[140px]">
                        {selectedBlock.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Type</span>
                      <span className="text-xs font-bold text-slate-200 uppercase">
                        {selectedBlock.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Order Position</span>
                      <span className="text-xs font-mono text-slate-300">#{selectedBlock.order + 1}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Visibility</span>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(selectedBlock.id)}
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          selectedBlock.isVisible
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {selectedBlock.isVisible ? 'Visible to Students' : 'Hidden'}
                      </button>
                    </div>
                  </div>

                  {/* Actions Shelf */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Block Actions
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDuplicateBlock(selectedBlock.id)}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate Block</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(selectedBlock.id)}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 border border-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Block</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Select a block from the canvas to inspect and configure its attributes.
                </div>
              )
            ) : (
              /* LESSON METADATA SETTINGS */
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Lesson Title"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Short summary of lesson concepts..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => {
                        setDuration(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="15 min"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value as any);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Objectives */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Learning Objectives
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setLearningObjectives([...learningObjectives, '']);
                        setHasUnsavedChanges(true);
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {learningObjectives.map((obj, i) => (
                      <div key={i} className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => {
                            const next = [...learningObjectives];
                            next[i] = e.target.value;
                            setLearningObjectives(next);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder={`Objective ${i + 1}`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLearningObjectives(learningObjectives.filter((_, idx) => idx !== i));
                            setHasUnsavedChanges(true);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          STUDENT PREVIEW MODAL
          ════════════════════════════════════════════════════════════════════════ */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Student Course Player Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 custom-scrollbar bg-slate-950/40">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Lesson Preview
                </span>
                <h1 className="text-2xl font-bold text-white mt-1">{title}</h1>
                {description && <p className="text-sm text-slate-400 mt-2">{description}</p>}
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-800/80">
                {blocks
                  .filter((b) => b.isVisible)
                  .map((b) => (
                    <div key={b.id} className="pointer-events-none">
                      {renderBlockItem(b)}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
