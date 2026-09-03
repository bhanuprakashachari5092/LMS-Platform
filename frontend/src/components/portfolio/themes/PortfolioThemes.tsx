import React from 'react';
import {
  ExternalLink,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  FolderGit2,
  Cpu
} from 'lucide-react';

export interface PortfolioData {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  email?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  skills: string[];
  projects: Array<{
    id?: string;
    title: string;
    description: string;
    tags: string[];
    githubUrl?: string;
    liveUrl?: string;
    featured?: boolean;
  }>;
  experiences: Array<{
    id?: string;
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  educations: Array<{
    id?: string;
    degree: string;
    institution: string;
    year: string;
    score?: string;
  }>;
  certificates?: Array<{
    id?: string;
    courseTitle?: string;
    verificationId?: string;
    issuedAt?: string;
  }>;
}

export type PortfolioThemeId =
  | 'bento_grid'
  | 'terminal_hacker'
  | 'minimal_studio'
  | 'aurora_glass'
  | 'executive_architect'
  | 'neo_brutalist';

export interface PortfolioThemeMeta {
  id: PortfolioThemeId;
  name: string;
  tagline: string;
  badge: string;
  accentClass: string;
  previewBg: string;
}

export const PORTFOLIO_THEMES_CONFIG: PortfolioThemeMeta[] = [
  {
    id: 'bento_grid',
    name: 'Silicon Bento Grid',
    tagline: 'Modern Apple/Vercel dark bento grid cards with interactive metrics',
    badge: 'Bento Grid',
    accentClass: 'text-indigo-400 border-indigo-500/30',
    previewBg: 'bg-[#0b0f19]',
  },
  {
    id: 'terminal_hacker',
    name: 'Cyberpunk Terminal',
    tagline: 'Matrix & CLI monospace aesthetic with interactive terminal logs',
    badge: 'CLI Hacker',
    accentClass: 'text-emerald-400 border-emerald-500/30',
    previewBg: 'bg-[#090d16]',
  },
  {
    id: 'minimal_studio',
    name: 'Clean Studio Minimal',
    tagline: 'Editorial high-contrast typography with smooth whitespace & sleek rows',
    badge: 'Minimalist',
    accentClass: 'text-sky-400 border-sky-500/30',
    previewBg: 'bg-[#0c1017]',
  },
  {
    id: 'aurora_glass',
    name: '3D Aurora Glass',
    tagline: 'Translucent glassmorphism with dynamic glowing mesh gradients',
    badge: 'Glassmorphic',
    accentClass: 'text-purple-400 border-purple-500/30',
    previewBg: 'bg-[#0f0c1b]',
  },
  {
    id: 'executive_architect',
    name: 'Executive Architect',
    tagline: 'Senior engineering format with structured dual-panel technical overview',
    badge: 'Dual Column',
    accentClass: 'text-blue-400 border-blue-500/30',
    previewBg: 'bg-[#0a0e1a]',
  },
  {
    id: 'neo_brutalist',
    name: 'Neo-Brutalist Bold',
    tagline: 'High-contrast bold borders, colorful badges, and vibrant developer personality',
    badge: 'Neo-Brutalism',
    accentClass: 'text-amber-400 border-amber-500/30',
    previewBg: 'bg-[#121118]',
  },
];

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

// ============================================================================
// 1. SILICON BENTO GRID THEME (Modern Apple / Vercel Style)
// ============================================================================
export const BentoGridTheme: React.FC<{ data: PortfolioData }> = ({ data }) => {
  return (
    <div className="min-h-full bg-[#070b14] text-slate-100 p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Profile Hero Bento Card */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Main Intro Card (8 cols) */}
          <div className="md:col-span-8 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between space-y-6 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400 p-[2px] shrink-0 shadow-lg">
                {data.avatarUrl ? (
                  <img src={data.avatarUrl} alt={data.fullName} className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-3xl font-black text-white">
                    {data.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Available for Engineering Roles
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                  {data.fullName}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-indigo-300">
                  {data.headline}
                </p>
                {data.location && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{data.location}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {data.bio}
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {data.githubUrl && (
                <a href={data.githubUrl.startsWith('http') ? data.githubUrl : `https://${data.githubUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all">
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {data.linkedinUrl && (
                <a href={data.linkedinUrl.startsWith('http') ? data.linkedinUrl : `https://${data.linkedinUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-700/50 text-xs font-semibold flex items-center gap-1.5 transition-all">
                  <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>LinkedIn</span>
                </a>
              )}
              {data.email && (
                <a href={`mailto:${data.email}`} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics & Highlights Card (4 cols) */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900/80 to-slate-900/80 border border-indigo-800/40 backdrop-blur-xl flex flex-col justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Technical Stack</span>
              <div className="text-3xl font-black text-white mt-2">{data.skills.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">Core proficiencies mastered</p>
            </div>
            <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-950/50 via-slate-900/80 to-slate-900/80 border border-cyan-800/40 backdrop-blur-xl flex flex-col justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">Engineering Work</span>
              <div className="text-3xl font-black text-white mt-2">{data.projects.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">Featured software deployments</p>
            </div>
          </div>
        </div>

        {/* Skills Bento Row */}
        {data.skills && data.skills.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Core Technologies & Tools
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Featured Projects Bento Grid */}
        {data.projects && data.projects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Featured Projects
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">{data.projects.length} Projects</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 backdrop-blur-xl transition-all space-y-3 flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {proj.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {proj.githubUrl && (
                          <a href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white p-1" title="View Code">
                            <GithubIcon className="w-4 h-4" />
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 p-1" title="Live Preview">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                  {proj.tags && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-semibold text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience & Education 2-Column Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.experiences && data.experiences.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Experience
                </h2>
              </div>
              <div className="space-y-4">
                {data.experiences.map((exp, i) => (
                  <div key={i} className="border-l-2 border-slate-700 pl-3 space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-white text-xs">
                      <span>{exp.role}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{exp.duration}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-indigo-400">{exp.company}</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.educations && data.educations.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Education
                </h2>
              </div>
              <div className="space-y-3">
                {data.educations.map((ed, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs">
                    <div className="font-bold text-white">{ed.degree}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{ed.institution}</div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                      <span>{ed.year}</span>
                      {ed.score && <span>Score: {ed.score}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. CYBERPUNK TERMINAL THEME (Matrix / CLI Dev Style)
// ============================================================================
export const TerminalHackerTheme: React.FC<{ data: PortfolioData }> = ({ data }) => {
  return (
    <div className="min-h-full bg-[#05080f] text-slate-200 p-4 sm:p-8 font-mono selection:bg-emerald-500 selection:text-black">
      <div className="max-w-4xl mx-auto rounded-3xl bg-[#090d16] border border-emerald-500/30 shadow-2xl shadow-emerald-950/20 overflow-hidden">
        {/* Terminal Header Bar */}
        <div className="bg-[#0e1422] px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-xs text-slate-400 font-semibold ml-2">bash - {data.fullName.toLowerCase().replace(/\s+/g, '_')}@kaizenq</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60">
            TTY: ONLINE
          </span>
        </div>

        {/* Terminal Body */}
        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-[13px] leading-relaxed">
          {/* Command 1: whoami */}
          <div className="space-y-2">
            <div className="text-emerald-400 font-bold flex items-center gap-2">
              <span>root@lms:~$</span>
              <span className="text-white">whoami --verbose</span>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-emerald-950 text-slate-300 space-y-1">
              <div className="text-lg font-black text-emerald-300">{data.fullName}</div>
              <div className="text-xs text-emerald-500 font-semibold">{data.headline}</div>
              <div className="text-[11px] text-slate-400">Location: {data.location || 'Distributed'} | Verified: TRUE</div>
              <p className="text-xs text-slate-300 pt-2">{data.bio}</p>
            </div>
          </div>

          {/* Command 2: cat skills.json */}
          {data.skills && data.skills.length > 0 && (
            <div className="space-y-2">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <span>root@lms:~$</span>
                <span className="text-white">cat /etc/skills.conf</span>
              </div>
              <div className="flex flex-wrap gap-2 p-3 bg-black/40 rounded-xl border border-emerald-950">
                {data.skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs">
                    {`[${s}]`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Command 3: ./fetch_projects.sh */}
          {data.projects && data.projects.length > 0 && (
            <div className="space-y-2">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <span>root@lms:~$</span>
                <span className="text-white">./list_deployments.sh --featured</span>
              </div>
              <div className="space-y-3">
                {data.projects.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-emerald-950 space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-emerald-300 text-sm">{`#${idx + 1} ${p.title}`}</span>
                      <div className="flex gap-2">
                        {p.githubUrl && (
                          <a href={p.githubUrl.startsWith('http') ? p.githubUrl : `https://${p.githubUrl}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400">
                            [git]
                          </a>
                        )}
                        {p.liveUrl && (
                          <a href={p.liveUrl.startsWith('http') ? p.liveUrl : `https://${p.liveUrl}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                            [launch ↗]
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">{p.description}</p>
                    {p.tags && (
                      <div className="text-[10px] text-emerald-500 font-semibold pt-1">
                        STACK: {p.tags.join(' // ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Command 4: experience.log */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="space-y-2">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <span>root@lms:~$</span>
                <span className="text-white">tail -n 10 /var/log/career_timeline.log</span>
              </div>
              <div className="space-y-2 p-3 bg-black/40 rounded-xl border border-emerald-950">
                {data.experiences.map((exp, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-emerald-500 font-bold">{`[${exp.duration}]`}</span>{' '}
                    <span className="font-bold text-white">{exp.role}</span> @ <span className="text-indigo-300">{exp.company}</span>
                    <p className="text-slate-400 text-[11px] pl-4 pt-0.5">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. CLEAN STUDIO MINIMAL THEME (Modern Minimalist / Editorial)
// ============================================================================
export const MinimalStudioTheme: React.FC<{ data: PortfolioData }> = ({ data }) => {
  return (
    <div className="min-h-full bg-[#0a0d14] text-slate-100 p-6 sm:p-12 font-sans selection:bg-slate-700 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Title */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 uppercase tracking-widest">
            <span>Verified Portfolio</span>
            <span>•</span>
            <span>{data.location}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white">
            {data.fullName}
          </h1>
          <p className="text-base sm:text-lg text-slate-400 font-normal max-w-2xl leading-relaxed">
            {data.headline}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {data.bio}
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-400">
            {data.email && <a href={`mailto:${data.email}`} className="hover:text-white transition-colors">Email ↗</a>}
            {data.githubUrl && <a href={data.githubUrl.startsWith('http') ? data.githubUrl : `https://${data.githubUrl}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub ↗</a>}
            {data.linkedinUrl && <a href={data.linkedinUrl.startsWith('http') ? data.linkedinUrl : `https://${data.linkedinUrl}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn ↗</a>}
          </div>
        </div>

        {/* Selected Works (Projects) */}
        {data.projects && data.projects.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
              01 / Selected Engineering Projects
            </h2>
            <div className="space-y-4">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                    {proj.tags && (
                      <div className="text-[11px] font-mono text-slate-500 pt-1">
                        {proj.tags.join(' • ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                        Code
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1">
                        <span>Live</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills List */}
        {data.skills && data.skills.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
              02 / Competencies
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
              03 / Experience
            </h2>
            <div className="space-y-3">
              {data.experiences.map((exp, i) => (
                <div key={i} className="flex justify-between items-baseline text-xs border-b border-slate-900 pb-2">
                  <div>
                    <span className="font-bold text-white">{exp.role}</span>
                    <span className="text-slate-400 ml-2">— {exp.company}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{exp.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 4. 3D AURORA GLASS THEME (Vibrant Glassmorphism)
// ============================================================================
export const AuroraGlassTheme: React.FC<{ data: PortfolioData }> = ({ data }) => {
  return (
    <div className="min-h-full bg-[#080414] text-slate-100 p-4 sm:p-8 font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Glass Hero Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 p-[2px] shadow-2xl shadow-purple-500/30 shrink-0">
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt={data.fullName} className="w-full h-full object-cover rounded-[22px]" />
              ) : (
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-4xl font-black text-white">
                  {data.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <span className="px-3 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
                ✨ Verified Creator
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {data.fullName}
              </h1>
              <p className="text-sm font-semibold text-purple-200">
                {data.headline}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {data.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Glass Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-300">Featured Builds</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-white text-base">{proj.title}</h3>
                      {proj.liveUrl && (
                        <a href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`} target="_blank" rel="noreferrer" className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-bold">
                          Launch ↗
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                  </div>
                  {proj.tags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-purple-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Glass Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-300">Tech & Tools</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 5. EXECUTIVE ARCHITECT THEME (Senior Engineer / Dual-Column)
// ============================================================================
export const ExecutiveArchitectTheme: React.FC<{ data: PortfolioData }> = ({ data }) => {
  return (
    <div className="min-h-full bg-[#090e1a] text-slate-100 p-4 sm:p-8 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 p-0.5 overflow-hidden">
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt={data.fullName} className="w-full h-full object-cover rounded-[14px]" />
              ) : (
                <div className="w-full h-full bg-slate-950 flex items-center justify-center text-2xl font-black text-white">
                  {data.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{data.fullName}</h1>
              <p className="text-xs font-semibold text-blue-400 mt-0.5">{data.headline}</p>
              {data.location && <p className="text-[11px] text-slate-400 mt-1">📍 {data.location}</p>}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
              {data.bio}
            </p>
          </div>

          {data.skills && data.skills.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">Technical Arsenal</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          {data.projects && data.projects.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">Engineering Portfolio</h2>
              <div className="space-y-4">
                {data.projects.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-white text-sm">{p.title}</h3>
                      {p.liveUrl && (
                        <a href={p.liveUrl.startsWith('http') ? p.liveUrl : `https://${p.liveUrl}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 font-bold hover:underline">
                          View Demo ↗
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                    {p.tags && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.tags.map((t, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.experiences && data.experiences.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">Career History</h2>
              <div className="space-y-3">
                {data.experiences.map((exp, i) => (
                  <div key={i} className="border-l-2 border-blue-500/50 pl-3 space-y-0.5">
                    <div className="flex justify-between items-baseline font-bold text-white text-xs">
                      <span>{exp.role}</span>
                      <span className="text-[10px] text-slate-400">{exp.duration}</span>
                    </div>
                    <div className="text-[11px] text-blue-300 font-semibold">{exp.company}</div>
                    <p className="text-xs text-slate-300 pt-0.5">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. NEO-BRUTALIST BOLD THEME (Trendy & Creative)
// ============================================================================
export const NeoBrutalistTheme: React.FC<{ data: PortfolioData }> = ({ data }) => {
  return (
    <div className="min-h-full bg-[#14121e] text-slate-900 p-4 sm:p-8 font-sans selection:bg-amber-400 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-amber-400 border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-wider inline-block mb-2">
                VERIFIED DEVELOPER
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight">
                {data.fullName}
              </h1>
              <p className="text-xs sm:text-sm font-black text-black/80 mt-1">
                {data.headline}
              </p>
            </div>
            {data.location && (
              <span className="px-3 py-1 bg-white border-2 border-black font-black text-xs shadow-[3px_3px_0px_0px_#000]">
                📍 {data.location}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-bold text-black/90 leading-relaxed bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
            {data.bio}
          </p>
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="p-6 rounded-2xl bg-cyan-400 border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-black">SKILLS & PROFICIENCIES</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-white border-2 border-black text-xs font-black shadow-[3px_3px_0px_0px_#000]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-white">FEATURED BUILDS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projects.map((p, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline font-black text-black text-base">
                      <span>{p.title}</span>
                      {p.liveUrl && (
                        <a href={p.liveUrl.startsWith('http') ? p.liveUrl : `https://${p.liveUrl}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline font-black">
                          LIVE ↗
                        </a>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{p.description}</p>
                  </div>
                  {p.tags && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {p.tags.map((t, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 bg-yellow-300 border border-black text-[10px] font-black">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN THEME RENDERER
// ============================================================================
export const PortfolioThemeRenderer: React.FC<{
  themeId: PortfolioThemeId;
  data: PortfolioData;
}> = ({ themeId, data }) => {
  switch (themeId) {
    case 'bento_grid':
      return <BentoGridTheme data={data} />;
    case 'terminal_hacker':
      return <TerminalHackerTheme data={data} />;
    case 'minimal_studio':
      return <MinimalStudioTheme data={data} />;
    case 'aurora_glass':
      return <AuroraGlassTheme data={data} />;
    case 'executive_architect':
      return <ExecutiveArchitectTheme data={data} />;
    case 'neo_brutalist':
      return <NeoBrutalistTheme data={data} />;
    default:
      return <BentoGridTheme data={data} />;
  }
};
