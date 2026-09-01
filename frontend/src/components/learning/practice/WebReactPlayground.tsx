import React, { useState, useEffect, useRef } from 'react';
import { PracticeChrome } from './PracticeChrome';
import { Eye, RefreshCw } from 'lucide-react';

interface WebReactPlaygroundProps {
  title?: string;
  description?: string;
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      padding: 24px;
      border-radius: 16px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 8px;
    }
    .badge {
      display: inline-block;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 16px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    button {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover {
      background: #0369a1;
      transform: scale(1.03);
    }
    #counter-display {
      font-size: 32px;
      font-weight: 900;
      color: #10b981;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="title">React & Web Studio</div>
    <div class="badge">Interactive Live Component</div>
    <div id="counter-display">0</div>
    <button id="btn-count">Increment Counter</button>
  </div>

  <script>
    let count = 0;
    const display = document.getElementById('counter-display');
    const btn = document.getElementById('btn-count');
    
    btn.addEventListener('click', () => {
      count++;
      display.textContent = count;
      display.style.transform = 'scale(1.2)';
      setTimeout(() => display.style.transform = 'scale(1)', 150);
    });
  </script>
</body>
</html>`;

export const WebReactPlayground: React.FC<WebReactPlaygroundProps> = ({
  title = 'Web & React Live Playground',
  description = 'Live-reloading web environment with rendered HTML/CSS/JS and instant preview.',
  initialHtml = DEFAULT_HTML,
}) => {
  const [code, setCode] = useState<string>(initialHtml.trim());
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'code'>('split');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const updatePreview = () => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(code);
      doc.close();
    }
  };

  useEffect(() => {
    const timer = setTimeout(updatePreview, 300);
    return () => clearTimeout(timer);
  }, [code]);

  const handleReset = () => {
    setCode(initialHtml.trim());
  };

  return (
    <PracticeChrome
      title={title}
      tabLabel="index.html"
      badgeText="Live Preview"
      badgeColor="emerald"
      description={description}
      onReset={handleReset}
      isMaximized={isMaximized}
      onToggleMaximize={() => setIsMaximized(!isMaximized)}
      rightActions={
        <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              viewMode === 'split' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              viewMode === 'code' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              viewMode === 'preview' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Preview
          </button>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row min-h-[360px] bg-slate-950">
        {/* Editor Area */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <div className={`${viewMode === 'split' ? 'w-full md:w-1/2 border-r border-slate-800' : 'w-full'} flex flex-col`}>
            <div className="px-4 py-1.5 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>HTML / CSS / JS Source</span>
              <span className="text-[10px] text-slate-500">Live Reload Enabled</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 p-4 font-mono text-xs sm:text-sm leading-relaxed bg-slate-950 text-sky-200 focus:outline-none resize-none min-h-[300px]"
            />
          </div>
        )}

        {/* Live Rendered Iframe Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'} flex flex-col bg-slate-900`}>
            <div className="px-4 py-1.5 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-emerald-400" /> Rendered Output
              </span>
              <button
                onClick={updatePreview}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Refresh Preview"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <iframe
              ref={iframeRef}
              title="Live Component Preview"
              sandbox="allow-scripts allow-modals"
              className="w-full flex-1 min-h-[300px] bg-slate-950 border-0"
            />
          </div>
        )}
      </div>
    </PracticeChrome>
  );
};

export default WebReactPlayground;
