import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Copy,
  Check,
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { 
  PortfolioThemeRenderer, 
  PORTFOLIO_THEMES_CONFIG,
} from '@/components/portfolio/themes/PortfolioThemes';
import type { 
  PortfolioData, 
  PortfolioThemeId 
} from '@/components/portfolio/themes/PortfolioThemes';

export const PublicPortfolio: React.FC = () => {
  const { handleOrId } = useParams<{ handleOrId: string }>();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!handleOrId) {
      setError('Invalid portfolio URL parameter.');
      setLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/portfolio/public/${encodeURIComponent(handleOrId)}`);
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          const localFullName = localStorage.getItem('shaivika_portfolio_fullname');
          const localHeadline = localStorage.getItem('shaivika_portfolio_headline');
          const localBio = localStorage.getItem('shaivika_portfolio_bio');
          const localGithub = localStorage.getItem('shaivika_portfolio_github');
          const localLinkedin = localStorage.getItem('shaivika_portfolio_linkedin');
          const localWebsite = localStorage.getItem('shaivika_portfolio_website');
          const localLocation = localStorage.getItem('shaivika_portfolio_location');
          const localTheme = localStorage.getItem('shaivika_portfolio_theme');

          const data = json.data;
          const mergedData = {
            ...data,
            fullName: (data.fullName === 'Scholar Student' || data.fullName === 'Student Developer' || !data.fullName) 
              ? (localFullName || data.fullName || 'Student Developer') 
              : data.fullName,
            headline: (localHeadline && (!data.headline || data.headline.includes('Passionate technologist'))) 
              ? localHeadline 
              : (data.headline || localHeadline),
            bio: (localBio && (!data.bio || data.bio.includes('Passionate technologist'))) 
              ? localBio 
              : (data.bio || localBio),
            githubUrl: localGithub || data.githubUrl || data.githubLink,
            linkedinUrl: localLinkedin || data.linkedinUrl || data.linkedinLink,
            websiteUrl: localWebsite || data.websiteUrl || data.websiteLink,
            location: localLocation || data.location,
            theme: data.theme || localTheme || 'bento_grid',
          };
          setPortfolio(mergedData);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn('Backend portfolio fetch notice:', err);
      }

      // Local fallback for author preview
      try {
        const localHandle = localStorage.getItem('shaivika_portfolio_handle');
        const localUserRaw = localStorage.getItem('shaivika_user');
        const localUser = localUserRaw ? JSON.parse(localUserRaw) : null;
        const skillsRaw = localStorage.getItem('shaivika_portfolio_skills');
        const projectsRaw = localStorage.getItem('shaivika_portfolio_projects');
        const experienceRaw = localStorage.getItem('shaivika_portfolio_experience');
        const educationRaw = localStorage.getItem('shaivika_portfolio_education');
        const localTheme = localStorage.getItem('shaivika_portfolio_theme') || 'bento_grid';

        const localFullName = localStorage.getItem('shaivika_portfolio_fullname') || localUser?.fullName || localUser?.name;
        const localHeadline = localStorage.getItem('shaivika_portfolio_headline') || 'Full-Stack Developer & AI Systems Specialist';
        const localLocation = localStorage.getItem('shaivika_portfolio_location') || 'Hyderabad, India';

        if (
          !localHandle ||
          localHandle === handleOrId ||
          handleOrId === 'preview' ||
          (localUser && (localUser.uid === handleOrId || localUser.email?.split('@')[0] === handleOrId))
        ) {
          const fallbackData = {
            fullName: localFullName || 'Developer Scholar',
            headline: localHeadline,
            bio: localStorage.getItem('shaivika_portfolio_bio') || 'Passionate technologist mastering Linux kernel systems, distributed cloud platforms, and generative AI foundations. Proven project implementations with scalable architecture.',
            githubUrl: localStorage.getItem('shaivika_portfolio_github') || 'https://github.com',
            linkedinUrl: localStorage.getItem('shaivika_portfolio_linkedin') || 'https://linkedin.com',
            websiteUrl: localStorage.getItem('shaivika_portfolio_website') || '',
            location: localLocation,
            email: localUser?.email || '',
            skills: skillsRaw ? JSON.parse(skillsRaw) : ['Linux Systems', 'TypeScript', 'React.js', 'Docker', 'AI Foundation', 'Node.js Express', 'PostgreSQL', 'Tailwind CSS'],
            projects: projectsRaw ? JSON.parse(projectsRaw) : [
              {
                id: 'p1',
                title: 'KaizenQ AI Classroom & Learning Engine',
                description: 'Real-time WebSocket interactive learning platform with telemetry and live socket synchronization.',
                tags: ['React', 'TypeScript', 'Socket.IO', 'TailwindCSS'],
                githubUrl: 'https://github.com',
                liveUrl: 'https://www.kaizenq.in',
                featured: true,
              }
            ],
            experiences: experienceRaw ? JSON.parse(experienceRaw) : [],
            educations: educationRaw ? JSON.parse(educationRaw) : [],
            theme: localTheme,
            isPublished: true,
          };
          setPortfolio(fallbackData);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Local portfolio fallback notice:', e);
      }

      setError('Portfolio not found or set to private.');
      setLoading(false);
    };

    fetchPortfolio();
  }, [handleOrId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Public Portfolio link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading verified portfolio profile...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/40 border border-rose-800/60 text-rose-400 flex items-center justify-center text-2xl mb-4 shadow-xl">
          🔒
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">Portfolio Unavailable</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">{error || 'This portfolio does not exist or has been made private by the author.'}</p>
      </div>
    );
  }

  const name = portfolio.fullName || portfolio.name || 'Developer';
  const rawTheme = portfolio.theme as PortfolioThemeId;
  const activeTheme: PortfolioThemeId = (rawTheme && PORTFOLIO_THEMES_CONFIG.some(t => t.id === rawTheme)) 
    ? rawTheme 
    : 'bento_grid';

  const portfolioData: PortfolioData = {
    fullName: name,
    headline: portfolio.headline || 'Software Engineer & Technologist',
    bio: portfolio.bio || '',
    location: portfolio.location || 'India',
    email: portfolio.email || portfolio.contactEmail || '',
    githubUrl: portfolio.githubUrl || portfolio.githubLink || '',
    linkedinUrl: portfolio.linkedinUrl || portfolio.linkedinLink || '',
    websiteUrl: portfolio.websiteUrl || portfolio.websiteLink || '',
    skills: portfolio.skills || [],
    projects: portfolio.projects || [],
    experiences: portfolio.experiences || portfolio.experience || [],
    educations: portfolio.educations || portfolio.education || [],
    avatarUrl: portfolio.avatarUrl || portfolio.photoURL || portfolio.avatar || localStorage.getItem('shaivika_portfolio_avatar') || '',
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-16 relative">
      {/* Floating Top Action Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px] shadow-md">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xs font-black text-white">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
          <span className="text-xs font-bold text-slate-300 tracking-wide uppercase font-mono">
            {name}
          </span>
        </div>

        <button
          onClick={handleCopyLink}
          className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-slate-500 backdrop-blur-md"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Link Copied' : 'Share Portfolio'}</span>
        </button>
      </div>

      {/* Render Selected Theme */}
      <div className="mt-2">
        <PortfolioThemeRenderer themeId={activeTheme} data={portfolioData} />
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-4 text-center text-xs text-slate-500 border-t border-slate-800/60 mt-12">
        <p>© {new Date().getFullYear()} {name}. Verified Developer Profile on KaizenQ AI LMS.</p>
      </footer>
    </div>
  );
};
