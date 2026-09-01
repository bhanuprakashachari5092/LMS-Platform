import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertTriangle, Maximize2, Minimize2, Copy, Check } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
  isNightMode?: boolean;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, isNightMode = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '_');

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart || !chart.trim()) {
        setSvgContent('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: isNightMode ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Sora, Inter, system-ui, sans-serif',
          themeVariables: {
            darkMode: isNightMode,
            primaryColor: isNightMode ? '#6366f1' : '#4f46e5',
            primaryTextColor: isNightMode ? '#ffffff' : '#1e293b',
            primaryBorderColor: isNightMode ? '#4338ca' : '#6366f1',
            lineColor: isNightMode ? '#94a3b8' : '#64748b',
            secondaryColor: isNightMode ? '#1e293b' : '#f1f5f9',
            tertiaryColor: isNightMode ? '#0f172a' : '#ffffff',
            mainBkg: isNightMode ? '#0f172a' : '#f8fafc',
            nodeBorder: isNightMode ? '#475569' : '#cbd5e1',
          },
        });

        const id = `mermaid_${uniqueId}_${Date.now()}`;
        const { svg } = await mermaid.render(id, chart.trim());

        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Invalid diagram syntax.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, isNightMode, uniqueId]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`my-6 rounded-2xl border transition-all overflow-hidden ${
        isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/80 border-slate-200'
      } ${isExpanded ? 'fixed inset-4 z-50 p-6 flex flex-col justify-center items-center backdrop-blur-md shadow-2xl overflow-auto' : 'p-4'}`}
    >
      {/* Top Diagram Action Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-500 w-full">
        <span className="font-bold flex items-center gap-1.5 text-indigo-500">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          Flowchart & Architecture Diagram
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            title={isExpanded ? 'Minimize' : 'Expand Fullscreen'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Render Area */}
      <div className="w-full flex items-center justify-center min-h-[140px] pt-4 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Rendering flow diagram...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2 max-w-md">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <p className="font-bold">Diagram Syntax Error</p>
              <p className="text-[11px] opacity-80 truncate">{error}</p>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="mermaid-svg-container w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
};

export default MermaidDiagram;
