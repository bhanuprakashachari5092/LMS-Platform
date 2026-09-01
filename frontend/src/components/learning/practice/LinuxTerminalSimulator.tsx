import React, { useState, useEffect, useRef } from 'react';
import { PracticeChrome } from './PracticeChrome';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  permissions?: string;
  size?: number;
  updatedAt?: string;
  children?: { [key: string]: FileNode };
}

interface LinuxTerminalSimulatorProps {
  title?: string;
  description?: string;
  initialScenario?: string;
  expectedGoal?: string;
}

const DEFAULT_FS: { [key: string]: FileNode } = {
  home: {
    name: 'home',
    type: 'dir',
    permissions: 'drwxr-xr-x',
    children: {
      student: {
        name: 'student',
        type: 'dir',
        permissions: 'drwx------',
        children: {
          'server.py': {
            name: 'server.py',
            type: 'file',
            permissions: '-rwxr-xr-x',
            size: 420,
            updatedAt: 'Sep 01 10:30',
            content: '#!/usr/bin/env python3\nimport http.server\nimport socketserver\n\nPORT = 8080\nHandler = http.server.SimpleHTTPRequestHandler\nwith socketserver.TCPServer(("", PORT), Handler) as httpd:\n    print("Serving at port", PORT)\n    httpd.serve_forever()\n',
          },
          'notes.txt': {
            name: 'notes.txt',
            type: 'file',
            permissions: '-rw-r--r--',
            size: 156,
            updatedAt: 'Sep 01 11:15',
            content: 'KaizenQ Linux Systems Mastery\n- Practice chmod and chown commands\n- Analyze system logs in /var/log/syslog\n- Manage process pipelines with grep and awk\n',
          },
          'app_config.json': {
            name: 'app_config.json',
            type: 'file',
            permissions: '-rw-r--r--',
            size: 89,
            updatedAt: 'Sep 01 12:00',
            content: '{\n  "env": "production",\n  "port": 8080,\n  "db": "postgresql://localhost:5432/lms"\n}\n',
          },
          logs: {
            name: 'logs',
            type: 'dir',
            permissions: 'drwxr-xr-x',
            children: {
              'app.log': {
                name: 'app.log',
                type: 'file',
                permissions: '-rw-r--r--',
                size: 240,
                updatedAt: 'Sep 01 14:02',
                content: '[INFO] Server started on port 8080\n[INFO] Connected to Database\n[WARN] High memory usage detected: 78%\n[INFO] Health check OK\n',
              },
            },
          },
        },
      },
    },
  },
  var: {
    name: 'var',
    type: 'dir',
    permissions: 'drwxr-xr-x',
    children: {
      log: {
        name: 'log',
        type: 'dir',
        permissions: 'drwxr-xr-x',
        children: {
          'syslog': {
            name: 'syslog',
            type: 'file',
            permissions: '-rw-r-----',
            size: 1024,
            updatedAt: 'Sep 01 09:00',
            content: 'kernel: [0.000000] Linux version 5.15.0-generic\nsystemd[1]: Started Network Manager Script Dispatcher Service.\nsystemd[1]: Reached target Graphical Interface.\nsshd[412]: Server listening on 0.0.0.0 port 22.\n',
          },
          'auth.log': {
            name: 'auth.log',
            type: 'file',
            permissions: '-rw-r-----',
            size: 512,
            updatedAt: 'Sep 01 09:12',
            content: 'sshd[1020]: Accepted publickey for student from 192.168.1.50 port 52341 ssh2\nsudo: student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/usr/bin/apt update\n',
          },
        },
      },
    },
  },
  etc: {
    name: 'etc',
    type: 'dir',
    permissions: 'drwxr-xr-x',
    children: {
      hosts: {
        name: 'hosts',
        type: 'file',
        permissions: '-rw-r--r--',
        size: 98,
        updatedAt: 'Jan 01 00:00',
        content: '127.0.0.1   localhost\n127.0.1.1   kaizenq-lms\n::1         localhost ip6-localhost ip6-loopback\n',
      },
      'os-release': {
        name: 'os-release',
        type: 'file',
        permissions: '-rw-r--r--',
        size: 140,
        updatedAt: 'Jan 01 00:00',
        content: 'NAME="Ubuntu"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 22.04.3 LTS"\n',
      },
    },
  },
};

interface HistoryItem {
  id: string;
  command: string;
  output: React.ReactNode;
  cwd: string;
}

export const LinuxTerminalSimulator: React.FC<LinuxTerminalSimulatorProps> = ({
  title = 'Linux Terminal Simulator',
  description = 'Hands-on bash environment with virtual Linux filesystem and command interpreter.',
  initialScenario,
  expectedGoal,
}) => {
  const [fs, setFs] = useState<{ [key: string]: FileNode }>(() => JSON.parse(JSON.stringify(DEFAULT_FS)));
  const [currentPath, setCurrentPath] = useState<string[]>([ 'home', 'student' ]);
  const [commandInput, setCommandInput] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'welcome',
      command: '',
      cwd: '~',
      output: (
        <div className="space-y-1 text-slate-300">
          <p className="text-emerald-400 font-bold">KaizenQ Interactive Linux Shell v5.15 (x86_64-generic)</p>
          <p className="text-slate-400 text-xs">Type <span className="text-amber-300 font-bold">help</span> to view available commands or <span className="text-amber-300 font-bold">ls -la</span> to inspect current directory.</p>
        </div>
      ),
    },
  ]);
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [goalAchieved, setGoalAchieved] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const getCwdDisplay = () => {
    if (currentPath.length === 2 && currentPath[0] === 'home' && currentPath[1] === 'student') return '~';
    return '/' + currentPath.join('/');
  };

  const getNodeAtPath = (pathArr: string[]): FileNode | null => {
    if (pathArr.length === 0) return { name: '/', type: 'dir', children: fs };
    let current: FileNode | undefined = { name: '/', type: 'dir', children: fs };

    for (const seg of pathArr) {
      if (!current || current.type !== 'dir' || !current.children) return null;
      current = current.children[seg];
    }
    return current || null;
  };

  const resolvePath = (target: string): string[] => {
    if (target === '~' || target === '') return ['home', 'student'];
    let parts = target.split('/').filter(Boolean);
    if (target.startsWith('/')) {
      return parts;
    }
    const current = [...currentPath];
    for (const p of parts) {
      if (p === '.') continue;
      if (p === '..') {
        if (current.length > 0) current.pop();
      } else {
        current.push(p);
      }
    }
    return current;
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = commandInput.trim();
    if (!rawCmd) return;

    // Append to command history log
    setCommandLog((prev) => [...prev, rawCmd]);
    setHistoryPointer(-1);

    const cwdDisplay = getCwdDisplay();
    const parts = rawCmd.split(' ').filter(Boolean);
    const mainCmd = parts[0];
    const args = parts.slice(1);

    let outputResult: React.ReactNode = null;

    switch (mainCmd) {
      case 'clear':
        setHistory([]);
        setCommandInput('');
        return;

      case 'help':
        outputResult = (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono py-1">
            <div><span className="text-sky-400 font-bold">ls [-la]</span>: List directory</div>
            <div><span className="text-sky-400 font-bold">cd &lt;dir&gt;</span>: Change directory</div>
            <div><span className="text-sky-400 font-bold">pwd</span>: Print working dir</div>
            <div><span className="text-sky-400 font-bold">cat &lt;file&gt;</span>: View file content</div>
            <div><span className="text-sky-400 font-bold">grep &lt;text&gt; &lt;file&gt;</span>: Search pattern</div>
            <div><span className="text-sky-400 font-bold">mkdir [-p] &lt;dir&gt;</span>: Make directory</div>
            <div><span className="text-sky-400 font-bold">touch &lt;file&gt;</span>: Create file</div>
            <div><span className="text-sky-400 font-bold">chmod &lt;mode&gt; &lt;file&gt;</span>: Change mode</div>
            <div><span className="text-sky-400 font-bold">rm [-rf] &lt;path&gt;</span>: Remove file/dir</div>
            <div><span className="text-sky-400 font-bold">echo &lt;str&gt;</span>: Print text</div>
            <div><span className="text-sky-400 font-bold">whoami</span>: Active user</div>
            <div><span className="text-sky-400 font-bold">clear</span>: Clear terminal</div>
          </div>
        );
        break;

      case 'pwd':
        outputResult = <div className="text-slate-300">/{currentPath.join('/')}</div>;
        break;

      case 'whoami':
        outputResult = <div className="text-emerald-400">student</div>;
        break;

      case 'uname':
        outputResult = <div className="text-slate-300">Linux kaizenq-lms 5.15.0-generic #1 SMP x86_64 GNU/Linux</div>;
        break;

      case 'date':
        outputResult = <div className="text-slate-300">{new Date().toUTCString()}</div>;
        break;

      case 'cd': {
        const dest = args[0] || '~';
        const targetPath = resolvePath(dest);
        const node = getNodeAtPath(targetPath);
        if (!node) {
          outputResult = <div className="text-red-400 font-mono">bash: cd: {dest}: No such file or directory</div>;
        } else if (node.type !== 'dir') {
          outputResult = <div className="text-red-400 font-mono">bash: cd: {dest}: Not a directory</div>;
        } else {
          setCurrentPath(targetPath);
          if (expectedGoal && dest.includes(expectedGoal)) {
            setGoalAchieved(true);
          }
        }
        break;
      }

      case 'ls': {
        const isLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
        const isAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const targetArg = args.find((a) => !a.startsWith('-')) || '';
        const targetPath = targetArg ? resolvePath(targetArg) : currentPath;
        const node = getNodeAtPath(targetPath);

        if (!node || node.type !== 'dir' || !node.children) {
          outputResult = <div className="text-red-400 font-mono">ls: cannot access '{targetArg}': No such file or directory</div>;
        } else {
          const entries = Object.values(node.children);
          if (isLong) {
            outputResult = (
              <div className="space-y-0.5 font-mono text-xs">
                <div className="text-slate-500">total {entries.length * 4}</div>
                {isAll && (
                  <>
                    <div className="text-slate-400">drwxr-xr-x 2 student student 4096 Sep 01 10:00 .</div>
                    <div className="text-slate-400">drwxr-xr-x 4 root    root    4096 Sep 01 09:00 ..</div>
                  </>
                )}
                {entries.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-slate-400">{item.permissions || (item.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--')}</span>
                    <span className="text-slate-400">1 student student</span>
                    <span className="text-slate-400 w-12 text-right">{item.size || (item.type === 'dir' ? 4096 : 120)}</span>
                    <span className="text-slate-500">{item.updatedAt || 'Sep 01 12:00'}</span>
                    <span className={item.type === 'dir' ? 'text-sky-400 font-bold' : item.permissions?.includes('x') ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                      {item.name}{item.type === 'dir' ? '/' : ''}
                    </span>
                  </div>
                ))}
              </div>
            );
          } else {
            outputResult = (
              <div className="flex flex-wrap gap-4 font-mono text-xs">
                {entries.map((item) => (
                  <span
                    key={item.name}
                    className={item.type === 'dir' ? 'text-sky-400 font-bold' : item.permissions?.includes('x') ? 'text-emerald-400 font-bold' : 'text-slate-200'}
                  >
                    {item.name}{item.type === 'dir' ? '/' : ''}
                  </span>
                ))}
              </div>
            );
          }
        }
        break;
      }

      case 'cat': {
        const filename = args[0];
        if (!filename) {
          outputResult = <div className="text-red-400 font-mono">cat: missing file operand</div>;
        } else {
          const targetPath = resolvePath(filename);
          const node = getNodeAtPath(targetPath);
          if (!node) {
            outputResult = <div className="text-red-400 font-mono">cat: {filename}: No such file or directory</div>;
          } else if (node.type === 'dir') {
            outputResult = <div className="text-red-400 font-mono">cat: {filename}: Is a directory</div>;
          } else {
            outputResult = <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{node.content || ''}</pre>;
          }
        }
        break;
      }

      case 'grep': {
        const pattern = args[0];
        const filename = args[1];
        if (!pattern || !filename) {
          outputResult = <div className="text-red-400 font-mono">Usage: grep [PATTERN] [FILE]</div>;
        } else {
          const targetPath = resolvePath(filename);
          const node = getNodeAtPath(targetPath);
          if (!node) {
            outputResult = <div className="text-red-400 font-mono">grep: {filename}: No such file or directory</div>;
          } else if (node.type === 'dir') {
            outputResult = <div className="text-red-400 font-mono">grep: {filename}: Is a directory</div>;
          } else {
            const lines = (node.content || '').split('\n');
            const matched = lines.filter((l) => l.toLowerCase().includes(pattern.toLowerCase()));
            if (matched.length > 0) {
              outputResult = (
                <div className="space-y-0.5 font-mono text-xs text-slate-300">
                  {matched.map((m, idx) => (
                    <div key={idx} className="text-amber-300">{m}</div>
                  ))}
                </div>
              );
            }
          }
        }
        break;
      }

      case 'mkdir': {
        const dirname = args[0];
        if (!dirname) {
          outputResult = <div className="text-red-400 font-mono">mkdir: missing operand</div>;
        } else {
          const parentNode = getNodeAtPath(currentPath);
          if (parentNode && parentNode.children) {
            parentNode.children[dirname] = {
              name: dirname,
              type: 'dir',
              permissions: 'drwxr-xr-x',
              children: {},
            };
            setFs({ ...fs });
          }
        }
        break;
      }

      case 'touch': {
        const fname = args[0];
        if (!fname) {
          outputResult = <div className="text-red-400 font-mono">touch: missing file operand</div>;
        } else {
          const parentNode = getNodeAtPath(currentPath);
          if (parentNode && parentNode.children) {
            parentNode.children[fname] = {
              name: fname,
              type: 'file',
              permissions: '-rw-r--r--',
              size: 0,
              updatedAt: 'Just now',
              content: '',
            };
            setFs({ ...fs });
          }
        }
        break;
      }

      case 'chmod': {
        const mode = args[0];
        const fname = args[1];
        if (!mode || !fname) {
          outputResult = <div className="text-red-400 font-mono">chmod: missing operand</div>;
        } else {
          const targetPath = resolvePath(fname);
          const node = getNodeAtPath(targetPath);
          if (!node) {
            outputResult = <div className="text-red-400 font-mono">chmod: cannot access '{fname}': No such file or directory</div>;
          } else {
            node.permissions = mode === '+x' ? '-rwxr-xr-x' : mode === '777' ? '-rwxrwxrwx' : '-rw-r--r--';
            setFs({ ...fs });
          }
        }
        break;
      }

      case 'echo': {
        outputResult = <div className="text-slate-300 font-mono">{args.join(' ')}</div>;
        break;
      }

      default:
        outputResult = <div className="text-red-400 font-mono">{mainCmd}: command not found</div>;
        break;
    }

    setHistory((prev) => [
      ...prev,
      {
        id: `cmd_${Date.now()}`,
        command: rawCmd,
        cwd: cwdDisplay,
        output: outputResult,
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
    setFs(JSON.parse(JSON.stringify(DEFAULT_FS)));
    setCurrentPath(['home', 'student']);
    setHistory([
      {
        id: 'reset',
        command: '',
        cwd: '~',
        output: <div className="text-slate-400">Terminal & Virtual Filesystem reset to original snapshot.</div>,
      },
    ]);
    setGoalAchieved(false);
  };

  return (
    <PracticeChrome
      title={title}
      tabLabel="bash — student@kaizenq"
      badgeText="Linux Terminal"
      badgeColor="purple"
      description={description}
      onReset={handleReset}
      isMaximized={isMaximized}
      onToggleMaximize={() => setIsMaximized(!isMaximized)}
    >
      {/* ── Scenario / Objective Bar (If provided) ─────────────────────────── */}
      {initialScenario && (
        <div className="px-4 py-2.5 bg-purple-950/40 border-b border-purple-900/40 text-xs text-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span><strong>Scenario:</strong> {initialScenario}</span>
          </div>
          {goalAchieved && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Goal Completed
            </span>
          )}
        </div>
      )}

      {/* ── Terminal Output Window ───────────────────────────────────────────── */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="p-4 sm:p-5 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm min-h-[300px] max-h-[480px] overflow-y-auto cursor-text space-y-3"
      >
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-2 text-slate-200">
                <span className="text-emerald-400 font-bold">student@kaizenq</span>
                <span className="text-slate-500">:</span>
                <span className="text-sky-400 font-bold">{item.cwd}</span>
                <span className="text-slate-400">$</span>
                <span className="text-slate-100 font-semibold">{item.command}</span>
              </div>
            )}
            {item.output && <div className="pl-0 sm:pl-2">{item.output}</div>}
          </div>
        ))}

        {/* Active Command Input Line */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 font-bold">student@kaizenq</span>
          <span className="text-slate-500">:</span>
          <span className="text-sky-400 font-bold">{getCwdDisplay()}</span>
          <span className="text-slate-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs sm:text-sm caret-emerald-400"
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
          />
        </form>

        <div ref={terminalEndRef} />
      </div>
    </PracticeChrome>
  );
};

export default LinuxTerminalSimulator;
