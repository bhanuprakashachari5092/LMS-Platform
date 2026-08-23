import React from 'react';
import { Map, Star, ShieldCheck, Briefcase, Zap, GitBranch, Terminal, Database, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { soundService } from '@/services/soundService';
import { courseService } from '../../services/courseService';

interface RoadmapNode {
  id: string;
  title: string;
  desc: string;
  prereq: string;
  unlockedRole: string;
  color: string;
  icon: React.ReactNode;
}

export const CareerRoadmap: React.FC = () => {
  const { user, userProfile } = useAuth();
  const activeUserId = user?.uid || 'default_student';
  const xp = userProfile?.xp || 0;

  // Track progress nodes
  const completedCourses = userProfile?.completedCoursesCount || 0;

  const nodes: RoadmapNode[] = [
    {
      id: 'git',
      title: 'Git & GitHub Mastery',
      desc: 'Master collaborative coding workflows, branching models, pull requests, and CI/CD actions pipeline automation.',
      prereq: 'No prerequisites required',
      unlockedRole: 'Version Control Architect',
      color: 'indigo',
      icon: <GitBranch className="w-4 h-4" />,
    },
    {
      id: 'linux',
      title: 'Linux Systems Administration',
      desc: 'Deep-dive into Kernel architectures, shell scripts, cron scheduling, and visudo permissions.',
      prereq: 'Git & GitHub Mastery recommended',
      unlockedRole: 'Linux Systems Administrator',
      color: 'emerald',
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      id: 'dbms',
      title: 'RDBMS Database Engineering',
      desc: 'Learn advanced SQL joins, indexing optimizations, ACID compliance, and connection pools.',
      prereq: 'Linux fundamentals recommended',
      unlockedRole: 'Database Reliability Engineer',
      color: 'cyan',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'devops',
      title: 'Cloud DevOps & Orchestration',
      desc: 'Implement Infrastructure-as-Code (IaC), deploy Docker containers, and structure Kubernetes pods.',
      prereq: 'Git + Linux completion required',
      unlockedRole: 'Junior Cloud DevOps Engineer',
      color: 'violet',
      icon: <Cloud className="w-4 h-4" />,
    },
  ];

  // Determine locked states dynamically
  const isNodeComplete = (nodeId: string) => {
    let courseId = '';
    if (nodeId === 'git') courseId = 'git-github-mastery';
    if (nodeId === 'linux') courseId = 'course_linux_101';
    if (nodeId === 'dbms') courseId = 'database-management-system';
    if (nodeId === 'devops') courseId = 'kubernetes-complete-course-beginner-to-advanced';

    if (courseId) {
      // 1. Check dynamic checkpoint
      const checkpoint = courseService.getCourseCheckpoint(courseId, activeUserId);
      if (checkpoint && checkpoint.progressPercent >= 100) return true;

      // 2. Check shaivika_completed array
      try {
        const savedCompletedStr = localStorage.getItem(`shaivika_completed_${courseId}`);
        if (savedCompletedStr) {
          const completedIds: any[] = JSON.parse(savedCompletedStr);
          const totalLessons = courseId === 'git-github-mastery' ? 31 : courseId === 'course_linux_101' ? 17 : 29;
          if (completedIds && completedIds.length >= totalLessons) return true;
        }
      } catch {}
    }

    try {
      const stored = localStorage.getItem('shaivika_user_enrollments');
      if (stored) {
        const enrollments = JSON.parse(stored);
        const recs = enrollments[activeUserId] || [];
        const rec = recs.find((r: any) => r.courseId === courseId);
        if (rec && rec.progress >= 100) return true;
      }
    } catch {}

    if (nodeId === 'git') return completedCourses >= 1 || xp > 150;
    if (nodeId === 'linux') return completedCourses >= 2 || xp > 350;
    if (nodeId === 'dbms') return completedCourses >= 3 || xp > 500;

    return false;
  };

  const getActiveRole = () => {
    const gitDone = isNodeComplete('git');
    const linuxDone = isNodeComplete('linux');
    const dbmsDone = isNodeComplete('dbms');

    if (gitDone && linuxDone && dbmsDone) return 'Associate Systems Architect (Tier 3)';
    if (gitDone && linuxDone) return 'Infrastructure Engineer (Tier 2)';
    if (gitDone) return 'Version Control Specialist (Tier 1)';
    return 'Aspiring Tech Engineer';
  };

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-zinc-100 animate-in fade-in duration-300 select-none">
      {/* Roadmap 3D Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-gradient-to-r from-white via-sky-50/20 to-indigo-50/30 dark:from-slate-900/90 dark:via-slate-950/90 dark:to-indigo-950/40 shadow-lg backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-heading">
            <Map className="w-6 h-6 text-cyan-500" />
            <span>Interactive Career & Syllabus Roadmap</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master your interactive learning roadmap • Unlock 3D architectural milestones & verified badges.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-4.5 py-2.5 rounded-2xl shadow-xs">
          <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-mono">
              UNLOCKED CAREER RANK
            </span>
            <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 block font-heading">
              {getActiveRole()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Visual Roadmap Nodes Pipeline */}
      <div className="relative border-l-2 border-cyan-400/40 dark:border-cyan-500/30 ml-6 pl-8 space-y-10 py-2">
        {nodes.map((node, index) => {
          const completed = isNodeComplete(node.id);
          const isNextActive = index === 0 ? !completed : isNodeComplete(nodes[index - 1].id) && !completed;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Circle Indicator Node */}
              <div
                className={`absolute -left-[43px] top-4 w-8 h-8 rounded-2xl flex items-center justify-center font-bold text-xs border transition-all duration-300 shadow-md ${
                  completed
                    ? 'bg-emerald-500 text-white border-emerald-400 ring-4 ring-emerald-100 dark:ring-emerald-950/60 shadow-emerald-500/20'
                    : isNextActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-4 ring-cyan-100 dark:ring-cyan-950/60 shadow-cyan-500/30 animate-pulse'
                    : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                }`}
              >
                {completed ? '✓' : index + 1}
              </div>

              {/* 3D Gamified Node Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => soundService.play('select')}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  completed
                    ? 'bg-white dark:bg-slate-900/90 border-emerald-300 dark:border-emerald-800/80 shadow-md ring-1 ring-emerald-500/20'
                    : isNextActive
                    ? 'bg-gradient-to-br from-cyan-50/40 via-white to-indigo-50/20 dark:from-slate-900/90 dark:via-cyan-950/30 dark:to-slate-900/90 border-cyan-400 dark:border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-400/40'
                    : 'bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/60 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
                        {node.icon}
                      </div>
                      <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        {node.title}
                      </h3>
                      {completed && (
                        <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                          Complete
                        </span>
                      )}
                      {isNextActive && (
                        <span className="text-[9px] font-black text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 px-2 py-0.5 rounded-lg uppercase tracking-wider border border-cyan-300 dark:border-cyan-800 flex items-center gap-1">
                          <Zap className="w-3 h-3 animate-pulse" />
                          <span>Active Mission</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-2xl font-sans">
                      {node.desc}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider font-mono">
                      Prerequisite
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 block">
                      {node.prereq}
                    </span>
                  </div>
                </div>

                {/* Node Unlocked Career Roles */}
                <div className="mt-5 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Unlocked Profile:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{node.unlockedRole}</span>
                  </span>
                  {completed && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 py-0.5 px-2.5 rounded-xl font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Syllabus Verified</span>
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
