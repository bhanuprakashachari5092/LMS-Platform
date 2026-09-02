import React, { useState, useEffect, useRef, useMemo } from 'react';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import {
  Play,
  RotateCcw,
  Database as DatabaseIcon,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Code2,
} from 'lucide-react';

interface SqlPlaygroundProps {
  title?: string;
  description?: string;
  initialSchema?: string;
  initialQuery?: string;
  isNightMode?: boolean;
}

const DEFAULT_SCHEMA = `
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  salary INTEGER NOT NULL,
  joined_year INTEGER NOT NULL
);

INSERT INTO employees (id, name, department, role, salary, joined_year) VALUES
  (1, 'Alex Rivera', 'Engineering', 'Senior Developer', 95000, 2021),
  (2, 'Sarah Chen', 'Engineering', 'Tech Lead', 120000, 2019),
  (3, 'Marcus Vance', 'Product', 'Product Manager', 88000, 2022),
  (4, 'Priya Patel', 'Engineering', 'Backend Engineer', 92000, 2020),
  (5, 'David Kim', 'Design', 'UI/UX Lead', 84000, 2023),
  (6, 'Elena Rostova', 'Data', 'Data Scientist', 98000, 2021);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  project_name TEXT NOT NULL,
  lead_id INTEGER,
  budget INTEGER NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES employees(id)
);

INSERT INTO projects (id, project_name, lead_id, budget, status) VALUES
  (101, 'Cloud Migration', 2, 45000, 'In Progress'),
  (102, 'Mobile LMS App', 1, 30000, 'Planning'),
  (103, 'AI Tutor Engine', 6, 60000, 'In Progress'),
  (104, 'Design System v2', 5, 15000, 'Completed');
`;

const DEFAULT_QUERY = `SELECT 
  e.name, 
  e.department, 
  e.salary,
  p.project_name,
  p.status AS project_status
FROM employees e
LEFT JOIN projects p ON e.id = p.lead_id
ORDER BY e.salary DESC;`;

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

const getSqlJs = (): Promise<SqlJsStatic> => {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }
  return sqlJsPromise!;
};

export const SqlPlayground: React.FC<SqlPlaygroundProps> = ({
  title = 'Interactive SQL Playground',
  description = 'Write and execute real SQL queries against the in-memory SQLite relational database.',
  initialSchema = DEFAULT_SCHEMA,
  initialQuery = DEFAULT_QUERY,
}) => {
  const [queryText, setQueryText] = useState<string>(initialQuery.trim());
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [queryResults, setQueryResults] = useState<{ columns: string[]; values: any[][] } | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [showSchema, setShowSchema] = useState<boolean>(false);
  const [schemaTables, setSchemaTables] = useState<{ name: string; count: number; columns: string[] }[]>([]);

  const dbRef = useRef<Database | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize SQLite database in WebAssembly
  const initializeDb = async () => {
    setIsInitializing(true);
    setErrorMessage(null);
    try {
      const SQL = await getSqlJs();
      if (dbRef.current) {
        dbRef.current.close();
      }

      const db = new SQL.Database();
      db.run(initialSchema);
      dbRef.current = db;

      // Extract tables and schema info
      inspectSchema(db);
      setIsInitializing(false);
    } catch (err: any) {
      console.error('Failed to initialize sql.js:', err);
      setErrorMessage(`Failed to initialize SQLite engine: ${err.message || String(err)}`);
      setIsInitializing(false);
    }
  };

  const inspectSchema = (db: Database) => {
    try {
      const tablesRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      if (tablesRes.length > 0) {
        const tables = tablesRes[0].values.map((v: any) => String(v[0]));
        const tableDetails = tables.map((tableName: string) => {
          let count = 0;
          let columns: string[] = [];
          try {
            const countRes = db.exec(`SELECT COUNT(*) FROM ${tableName};`);
            if (countRes.length > 0 && countRes[0].values.length > 0) {
              count = Number(countRes[0].values[0][0]);
            }
            const pragmaRes = db.exec(`PRAGMA table_info(${tableName});`);
            if (pragmaRes.length > 0) {
              columns = pragmaRes[0].values.map((row: any) => `${row[1]} (${row[2]})`);
            }
          } catch {}
          return { name: tableName, count, columns };
        });
        setSchemaTables(tableDetails);
      }
    } catch {}
  };

  useEffect(() => {
    initializeDb();
    return () => {
      if (dbRef.current) {
        try {
          dbRef.current.close();
        } catch {}
      }
    };
  }, [initialSchema]);

  const handleRunQuery = () => {
    if (!dbRef.current || !queryText.trim()) return;

    setIsRunning(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setQueryResults(null);

    const startTime = performance.now();

    try {
      const trimmed = queryText.trim();
      const res = dbRef.current.exec(trimmed);
      const endTime = performance.now();
      setExecutionTime(Math.round((endTime - startTime) * 10) / 10);

      if (res.length > 0) {
        setQueryResults({
          columns: res[0].columns,
          values: res[0].values,
        });
        setSuccessMessage(`Returned ${res[0].values.length} row${res[0].values.length === 1 ? '' : 's'}`);
      } else {
        // Non-SELECT statements (INSERT/UPDATE/DELETE/CREATE)
        const modified = dbRef.current.getRowsModified();
        setSuccessMessage(
          `Statement executed successfully. ${modified > 0 ? `${modified} row(s) modified.` : 'No result set returned.'}`
        );
        inspectSchema(dbRef.current);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'SQL Execution Error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = queryText.substring(0, start) + '  ' + queryText.substring(end);
      setQueryText(next);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleReset = () => {
    setQueryText(initialQuery.trim());
    setQueryResults(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    initializeDb();
  };

  const sampleChips = useMemo(() => {
    if (schemaTables.length === 0) return [];
    const firstTable = schemaTables[0].name;
    return [
      { label: `SELECT * FROM ${firstTable}`, query: `SELECT * FROM ${firstTable} LIMIT 10;` },
      { label: `COUNT(*)`, query: `SELECT COUNT(*) AS total_count FROM ${firstTable};` },
      { label: `ORDER BY`, query: `SELECT * FROM ${firstTable} ORDER BY 1 DESC;` },
    ];
  }, [schemaTables]);

  return (
    <div className="my-8 rounded-2xl border border-slate-700/60 bg-slate-900/95 text-slate-100 shadow-xl overflow-hidden font-sans">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <DatabaseIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {title}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SQLite WASM
              </span>
            </h4>
            <p className="text-xs text-slate-400 font-medium">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Schema Explorer Toggle */}
          <button
            onClick={() => setShowSchema(!showSchema)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              showSchema
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Inspect Tables and Columns"
          >
            <TableIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Tables ({schemaTables.length})</span>
            {showSchema ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Database */}
          <button
            onClick={handleReset}
            disabled={isInitializing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer text-xs flex items-center gap-1"
            title="Reset Database & Starter Query"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ── Schema Explorer Panel ────────────────────────────────────────────── */}
      {showSchema && (
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="font-bold text-slate-300 flex items-center gap-1.5 mb-2">
            <TableIcon className="w-3.5 h-3.5 text-sky-400" /> Preloaded Schema & Tables:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schemaTables.map((t) => (
              <div key={t.name} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sky-400 text-xs">{t.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-800">
                    {t.count} rows
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex flex-wrap gap-1">
                  {t.columns.map((c, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Query Editor Area ────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Code2 className="w-3 h-3 text-sky-400" /> SQL Editor
          </span>
          <span className="hidden sm:inline text-slate-500">Press Ctrl + Enter to run query</span>
        </div>

        <textarea
          ref={textareaRef}
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={6}
          spellCheck={false}
          className="w-full p-4 font-mono text-sm leading-relaxed bg-slate-900 text-sky-200 focus:outline-none focus:ring-1 focus:ring-sky-500/30 resize-y"
          placeholder="-- Write your SQL query here (SELECT, INSERT, UPDATE, JOIN)..."
        />

        {/* Floating Run Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950/90 border-t border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setQueryText(chip.query)}
                className="px-2 py-1 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunQuery}
            disabled={isRunning || isInitializing || !queryText.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Query</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Status / Error Bar ───────────────────────────────────────────────── */}
      {errorMessage && (
        <div className="p-4 bg-red-950/60 border-t border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Execution Error:</span>
            <pre className="font-mono text-[11px] whitespace-pre-wrap">{errorMessage}</pre>
          </div>
        </div>
      )}

      {successMessage && !errorMessage && (
        <div className="px-4 py-2 bg-emerald-950/40 border-t border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          {executionTime !== null && (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {executionTime}ms
            </span>
          )}
        </div>
      )}

      {/* ── Query Results Table ──────────────────────────────────────────────── */}
      {queryResults && (
        <div className="border-t border-slate-800 overflow-x-auto max-h-80 overscroll-contain">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10">
              <tr>
                {queryResults.columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-2.5 font-mono font-bold text-sky-300 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {queryResults.values.length === 0 ? (
                <tr>
                  <td colSpan={queryResults.columns.length} className="px-4 py-6 text-center text-slate-500 italic">
                    Query returned 0 rows
                  </td>
                </tr>
              ) : (
                queryResults.values.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2 whitespace-nowrap">
                        {cell === null ? <span className="text-slate-500 italic">NULL</span> : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SqlPlayground;
