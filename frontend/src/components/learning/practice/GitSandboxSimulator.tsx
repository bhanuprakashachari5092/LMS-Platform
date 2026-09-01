import React, { useState, useRef, useEffect } from 'react';
import { PracticeChrome } from './PracticeChrome';
import { GitCommit, Sparkles } from 'lucide-react';

interface CommitNode {
  id: string;
  hash: string;
  message: string;
  parents: string[];
  branch: string;
  author: string;
  timestamp: string;
}

interface GitSandboxSimulatorProps {
  title?: string;
  description?: string;
  initialGoal?: string;
}

const INITIAL_COMMITS: CommitNode[] = [
  {
    id: 'c1',
    hash: 'a1b2c3d',
    message: 'Initial project structure and readme',
    parents: [],
    branch: 'main',
    author: 'Bhanu Prakash',
    timestamp: '2 hours ago',
  },
  {
    id: 'c2',
    hash: 'e4f5g6h',
    message: 'Add database schema and migration scripts',
    parents: ['c1'],
    branch: 'main',
    author: 'Bhanu Prakash',
    timestamp: '1 hour ago',
  },
];

export const GitSandboxSimulator: React.FC<GitSandboxSimulatorProps> = ({
  title = 'Interactive Git Sandbox',
  description = 'Execute real git commands and watch the visual commit graph and branch topology update live.',
  initialGoal = 'Create a feature branch, commit changes, and merge back to main.',
}) => {
  const [commits, setCommits] = useState<CommitNode[]>(INITIAL_COMMITS);
  const [branches, setBranches] = useState<string[]>(['main', 'feature/auth']);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  const [modifiedFiles, setModifiedFiles] = useState<string[]>(['src/auth/jwt.ts', 'src/controllers/user.controller.ts']);
  const [commandInput, setCommandInput] = useState<string>('');
  const [history, setHistory] = useState<Array<{ id: string; cmd: string; output: React.ReactNode }>>([
    {
      id: 'welcome',
      cmd: '',
      output: (
        <div className="space-y-1 text-slate-300">
          <p className="text-amber-400 font-bold">KaizenQ Interactive Git Terminal & Visualizer</p>
          <p className="text-slate-400 text-xs">
            Try running <span className="text-sky-400 font-bold">git status</span>,{' '}
            <span className="text-sky-400 font-bold">git add .</span>,{' '}
            <span className="text-sky-400 font-bold">git commit -m "Your message"</span>, or{' '}
            <span className="text-sky-400 font-bold">git checkout -b feature/payments</span>.
          </p>
        </div>
      ),
    },
  ]);
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const generateHash = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = commandInput.trim();
    if (!raw) return;

    setCommandLog((prev) => [...prev, raw]);
    setHistoryPointer(-1);

    const parts = raw.split(' ').filter(Boolean);
    let output: React.ReactNode = null;

    if (parts[0] !== 'git') {
      output = <div className="text-red-400 font-mono">Commands in this sandbox must start with 'git' (e.g. git status, git log)</div>;
    } else {
      const subCmd = parts[1];
      const rest = parts.slice(2);

      switch (subCmd) {
        case 'status': {
          output = (
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <div>On branch <span className="text-emerald-400 font-bold">{currentBranch}</span></div>
              {stagedFiles.length === 0 && modifiedFiles.length === 0 ? (
                <div className="text-slate-400">nothing to commit, working tree clean</div>
              ) : (
                <>
                  {stagedFiles.length > 0 && (
                    <div className="space-y-0.5 pt-1">
                      <div className="text-slate-400">Changes to be committed:</div>
                      <div className="text-slate-500 text-[11px]">&nbsp;&nbsp;(use "git restore --staged &lt;file&gt;..." to unstage)</div>
                      {stagedFiles.map((f) => (
                        <div key={f} className="text-emerald-400 pl-4">modified: {f}</div>
                      ))}
                    </div>
                  )}
                  {modifiedFiles.length > 0 && (
                    <div className="space-y-0.5 pt-1">
                      <div className="text-slate-400">Changes not staged for commit:</div>
                      <div className="text-slate-500 text-[11px]">&nbsp;&nbsp;(use "git add &lt;file&gt;..." to update what will be committed)</div>
                      {modifiedFiles.map((f) => (
                        <div key={f} className="text-rose-400 pl-4">modified: {f}</div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
          break;
        }

        case 'add': {
          const target = rest.join(' ');
          if (!target) {
            output = <div className="text-red-400 font-mono">Nothing specified, nothing added.</div>;
          } else {
            setStagedFiles((prev) => Array.from(new Set([...prev, ...modifiedFiles])));
            setModifiedFiles([]);
            output = <div className="text-emerald-400 font-mono">Staged {modifiedFiles.length || 1} file(s) for commit.</div>;
          }
          break;
        }

        case 'commit': {
          const mIdx = rest.indexOf('-m');
          let msg = '';
          if (mIdx !== -1 && rest[mIdx + 1]) {
            msg = rest.slice(mIdx + 1).join(' ').replace(/^["']|["']$/g, '');
          }
          if (!msg) {
            output = <div className="text-red-400 font-mono">error: switch `m` requires a value (e.g. git commit -m "message")</div>;
          } else if (stagedFiles.length === 0) {
            output = <div className="text-amber-400 font-mono">no changes added to commit (use "git add")</div>;
          } else {
            const newHash = generateHash();
            const lastCommit = commits[commits.length - 1];
            const newCommit: CommitNode = {
              id: `c_${Date.now()}`,
              hash: newHash,
              message: msg,
              parents: lastCommit ? [lastCommit.id] : [],
              branch: currentBranch,
              author: 'Bhanu Prakash',
              timestamp: 'just now',
            };
            setCommits((prev) => [...prev, newCommit]);
            setStagedFiles([]);
            output = (
              <div className="space-y-0.5 font-mono text-xs text-slate-300">
                <div>[{currentBranch} <span className="text-amber-300 font-bold">{newHash}</span>] {msg}</div>
                <div className="text-slate-400"> {stagedFiles.length || 1} file changed, 24 insertions(+), 3 deletions(-)</div>
              </div>
            );
          }
          break;
        }

        case 'branch': {
          const branchName = rest[0];
          if (!branchName) {
            output = (
              <div className="space-y-0.5 font-mono text-xs">
                {branches.map((b) => (
                  <div key={b} className={b === currentBranch ? 'text-emerald-400 font-bold' : 'text-slate-400 pl-2'}>
                    {b === currentBranch ? `* ${b}` : b}
                  </div>
                ))}
              </div>
            );
          } else {
            if (branches.includes(branchName)) {
              output = <div className="text-red-400 font-mono">fatal: a branch named '{branchName}' already exists</div>;
            } else {
              setBranches((prev) => [...prev, branchName]);
              output = <div className="text-emerald-400 font-mono">Created branch '{branchName}'</div>;
            }
          }
          break;
        }

        case 'checkout':
        case 'switch': {
          const isCreate = rest.includes('-b') || rest.includes('-c');
          const targetBranch = rest.filter((a) => a !== '-b' && a !== '-c')[0];

          if (!targetBranch) {
            output = <div className="text-red-400 font-mono">fatal: missing branch name</div>;
          } else if (isCreate) {
            setBranches((prev) => Array.from(new Set([...prev, targetBranch])));
            setCurrentBranch(targetBranch);
            output = <div className="text-emerald-400 font-mono">Switched to a new branch '{targetBranch}'</div>;
          } else {
            if (!branches.includes(targetBranch)) {
              output = <div className="text-red-400 font-mono">error: pathspec '{targetBranch}' did not match any file(s) known to git</div>;
            } else {
              setCurrentBranch(targetBranch);
              output = <div className="text-emerald-400 font-mono">Switched to branch '{targetBranch}'</div>;
            }
          }
          break;
        }

        case 'merge': {
          const targetBranch = rest[0];
          if (!targetBranch) {
            output = <div className="text-red-400 font-mono">fatal: specify a branch to merge</div>;
          } else if (!branches.includes(targetBranch)) {
            output = <div className="text-red-400 font-mono">merge: {targetBranch} - not something we can merge</div>;
          } else if (targetBranch === currentBranch) {
            output = <div className="text-amber-400 font-mono">Already up to date with {targetBranch}.</div>;
          } else {
            const newHash = generateHash();
            const newCommit: CommitNode = {
              id: `c_merge_${Date.now()}`,
              hash: newHash,
              message: `Merge branch '${targetBranch}' into ${currentBranch}`,
              parents: [commits[commits.length - 1]?.id || 'c1'],
              branch: currentBranch,
              author: 'Bhanu Prakash',
              timestamp: 'just now',
            };
            setCommits((prev) => [...prev, newCommit]);
            output = (
              <div className="space-y-0.5 font-mono text-xs text-slate-300">
                <div>Updating {commits[commits.length - 1]?.hash || 'a1b2c3d'}..{newHash}</div>
                <div className="text-emerald-400 font-bold">Fast-forward merge of '{targetBranch}' completed.</div>
              </div>
            );
          }
          break;
        }

        case 'log': {
          output = (
            <div className="space-y-1 font-mono text-xs text-slate-300">
              {commits.slice().reverse().map((c, idx) => (
                <div key={c.id} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">{c.hash}</span>
                  {idx === 0 && (
                    <span className="text-sky-300 font-bold bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800 text-[10px]">
                      (HEAD -&gt; {currentBranch})
                    </span>
                  )}
                  <span className="text-slate-200">{c.message}</span>
                </div>
              ))}
            </div>
          );
          break;
        }

        case 'diff': {
          output = (
            <div className="font-mono text-xs text-slate-300 space-y-1">
              <div className="text-slate-400">diff --git a/src/auth/jwt.ts b/src/auth/jwt.ts</div>
              <div className="text-slate-500">--- a/src/auth/jwt.ts</div>
              <div className="text-slate-500">+++ b/src/auth/jwt.ts</div>
              <div className="text-rose-400">- const TOKEN_EXPIRY = '1h';</div>
              <div className="text-emerald-400">+ const TOKEN_EXPIRY = '24h';</div>
            </div>
          );
          break;
        }

        case 'help': {
          output = (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono py-1">
              <div><span className="text-amber-400 font-bold">git status</span>: Check tree</div>
              <div><span className="text-amber-400 font-bold">git add .</span>: Stage files</div>
              <div><span className="text-amber-400 font-bold">git commit -m</span>: Make commit</div>
              <div><span className="text-amber-400 font-bold">git branch</span>: List branches</div>
              <div><span className="text-amber-400 font-bold">git checkout -b</span>: New branch</div>
              <div><span className="text-amber-400 font-bold">git switch</span>: Switch branch</div>
              <div><span className="text-amber-400 font-bold">git merge</span>: Merge branch</div>
              <div><span className="text-amber-400 font-bold">git log</span>: Commit history</div>
            </div>
          );
          break;
        }

        default:
          output = <div className="text-red-400 font-mono">git: '{subCmd}' is not a git command. See 'git help'.</div>;
          break;
      }
    }

    setHistory((prev) => [
      ...prev,
      {
        id: `git_${Date.now()}`,
        cmd: raw,
        output,
      },
    ]);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandLog.length > 0) {
        const nextIdx = historyPointer === -1 ? commandLog.length - 1 : Math.max(0, historyPointer - 1);
        setHistoryPointer(nextIdx);
        setCommandInput(commandLog[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer !== -1) {
        const nextIdx = historyPointer + 1;
        if (nextIdx >= commandLog.length) {
          setHistoryPointer(-1);
          setCommandInput('');
        } else {
          setHistoryPointer(nextIdx);
          setCommandInput(commandLog[nextIdx] || '');
        }
      }
    }
  };

  const handleReset = () => {
    setCommits(INITIAL_COMMITS);
    setBranches(['main', 'feature/auth']);
    setCurrentBranch('main');
    setStagedFiles([]);
    setModifiedFiles(['src/auth/jwt.ts', 'src/controllers/user.controller.ts']);
    setHistory([
      {
        id: 'reset',
        cmd: '',
        output: <div className="text-slate-400">Git repository sandbox reset to initial state.</div>,
      },
    ]);
  };

  return (
    <PracticeChrome
      title={title}
      tabLabel={`git — (${currentBranch})`}
      badgeText="Git Visualizer"
      badgeColor="amber"
      description={description}
      onReset={handleReset}
      isMaximized={isMaximized}
      onToggleMaximize={() => setIsMaximized(!isMaximized)}
    >
      {initialGoal && (
        <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-900/40 text-xs text-amber-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span><strong>Objective:</strong> {initialGoal}</span>
        </div>
      )}

      {/* ── Visual Branch Topology & Commit Graph ────────────────────────────── */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-2 select-none overflow-x-auto">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 font-bold text-slate-200">
            <GitCommit className="w-4 h-4 text-amber-400" /> Interactive Commit Graph & Branch Topology
          </span>
          <span className="text-emerald-400 font-bold">HEAD -&gt; {currentBranch}</span>
        </div>

        {/* Visual commit graph pipeline */}
        <div className="flex items-center gap-4 py-3 px-2 overflow-x-auto min-w-[500px]">
          {commits.map((c, idx) => {
            const isHead = idx === commits.length - 1;
            return (
              <React.Fragment key={c.id}>
                <div className="flex flex-col items-center group relative cursor-pointer">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-transform group-hover:scale-110 shadow-lg ${
                      isHead
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-300 mt-1.5">{c.hash}</span>
                  <span className="text-[9px] text-slate-500 max-w-[90px] truncate text-center">{c.message}</span>
                  {isHead && (
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold">
                      {currentBranch}
                    </span>
                  )}
                </div>

                {idx < commits.length - 1 && (
                  <div className="h-0.5 w-8 bg-gradient-to-r from-amber-500/60 to-amber-500/30 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Terminal Output Window ───────────────────────────────────────────── */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="p-4 sm:p-5 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm min-h-[250px] max-h-[420px] overflow-y-auto cursor-text space-y-3"
      >
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.cmd && (
              <div className="flex items-center gap-2 text-slate-200">
                <span className="text-amber-400 font-bold">git@kaizenq</span>
                <span className="text-slate-500">:</span>
                <span className="text-sky-400 font-bold">({currentBranch})</span>
                <span className="text-slate-400">$</span>
                <span className="text-slate-100 font-semibold">{item.cmd}</span>
              </div>
            )}
            {item.output && <div className="pl-0 sm:pl-2">{item.output}</div>}
          </div>
        ))}

        {/* Active Command Input Line */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-1">
          <span className="text-amber-400 font-bold">git@kaizenq</span>
          <span className="text-slate-500">:</span>
          <span className="text-sky-400 font-bold">({currentBranch})</span>
          <span className="text-slate-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs sm:text-sm caret-amber-400"
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            placeholder="git status, git add ., git commit -m '...'"
          />
        </form>

        <div ref={terminalEndRef} />
      </div>
    </PracticeChrome>
  );
};

export default GitSandboxSimulator;
