import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronDown,
  Send,
  Star,
  Sparkles,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { courseService } from '@/services/courseService';
import type { ICourse } from '../../../shared/types/course';
import { SEOHead } from '@/components/seo/SEOHead';
import { OrganizationSchema, CoFounderSchema } from '@/components/seo/StructuredData';
import { useAuth } from '@/contexts/AuthContext';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

// Lazy-load CheckoutModal on-demand to prevent payment bundle bloat on landing page
const CheckoutModal = React.lazy(() =>
  import('../components/courses/CheckoutModal').then((m) => ({ default: m.CheckoutModal }))
);

import { AnimatedHeroBackground } from '@/components/landing/AnimatedHeroBackground';
import { RotatingSplitText } from '@/components/landing/RotatingSplitText';
import { FloatingLogo } from '@/components/landing/FloatingLogo';
import { FlipCard } from '@/components/landing/FlipCard';
import { ParallaxMethodologyCards } from '@/components/landing/ParallaxMethodologyCards';
import { SmoothViewTransitionGridCards } from '@/components/landing/SmoothViewTransitionGridCards';
import { ProductPlanCards } from '@/components/landing/ProductPlanCards';
import { RevealOnScroll, StaggerContainer, StaggerItem } from '@/components/landing/RevealOnScroll';
import { BackToTop } from '@/components/landing/BackToTop';
import { Interactive3DInternshipShowcase } from '@/components/landing/Interactive3DInternshipShowcase';

// Minimal Course Card Skeleton
const CourseSkeleton: React.FC = () => (
  <div className="bg-[#f8fafc] dark:bg-[#111827] rounded-2xl p-6 border border-[#e2e8f0] dark:border-[#1f2937] animate-pulse space-y-4">
    <div className="h-44 bg-slate-200 dark:bg-[#1e293b] rounded-xl" />
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <div className="h-4 bg-slate-200 dark:bg-[#1e293b] rounded w-1/4" />
        <div className="h-4 bg-slate-200 dark:bg-[#1e293b] rounded w-1/4" />
      </div>
      <div className="h-6 bg-slate-200 dark:bg-[#1e293b] rounded w-5/6" />
      <div className="h-4 bg-slate-200 dark:bg-[#1e293b] rounded w-1/2" />
    </div>
    <div className="h-10 bg-slate-200 dark:bg-[#1e293b] rounded-xl w-full" />
  </div>
);

// Hoisted static arrays to prevent re-allocation on each render

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'DevOps Engineer',
    quote:
      'The structured curriculum and hands-on Linux and Git practice made understanding complex system concepts effortless. The clean interface kept me focused.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&fm=webp&q=80',
  },
  {
    name: 'Alex Chen',
    role: 'Software Developer',
    quote:
      'One of the cleanest and most practical learning platforms available. Zero clutter, direct access to code exercises, and instant certificate verification.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&fm=webp&q=80',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Cloud Engineer',
    quote:
      'The step-by-step modular lessons enabled our team to onboard new engineers rapidly with practical command-line and version control confidence.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&fm=webp&q=80',
  },
];

const faqs = [
  {
    question: 'What is KaizenQ and who is it designed for?',
    answer:
      'KaizenQ is a modern learning platform built for students, aspiring developers, and engineering teams. We combine structured curricula, hands-on terminal practice, and verifiable digital credentials.',
  },
  {
    question: 'How do the hands-on practice labs work?',
    answer:
      'Each core track includes built-in browser-based exercises. You do not need to install complex local environments—you can practice Linux commands, Git workflows, and code logic right inside your browser.',
  },
  {
    question: 'Are KaizenQ certificates verified and shareable?',
    answer:
      'Yes. Every completed course awards a tamper-proof digital certificate featuring a unique verification ID and cryptographic QR code that can be shared on LinkedIn, resumes, and portfolios.',
  },
  {
    question: 'Can I learn at my own pace?',
    answer:
      'Absolutely. All courses provide lifetime access with self-paced progression, bookmarking, and progress tracking across all your devices.',
  },
  {
    question: 'Do you offer options for schools, colleges, and enterprise teams?',
    answer:
      'Yes! We provide institutional licensing, custom student cohort management, and progress dashboards for academic institutions and engineering departments. Use the contact form below to request details.',
  },
];

export const LandingPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleViewAllCourses = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (user) {
      navigate('/courses');
    } else {
      toast.info('Please sign in to view all courses.');
      navigate('/auth/login?redirect=/courses');
    }
  };

  const getStartedRoute = user
    ? (userProfile?.role === 'admin'
        ? '/admin/dashboard'
        : userProfile?.role === 'instructor'
        ? '/instructor/dashboard'
        : '/dashboard')
    : '/auth/register';

  const getStartedText = user ? 'Go to Dashboard' : 'Get Started';

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutCourses, setCheckoutCourses] = useState<{ id: string; title: string }[]>([]);
  const [checkoutPrice, setCheckoutPrice] = useState(0);

  // Demo Contact Form State
  const [demoForm, setDemoForm] = useState({ fullName: '', workEmail: '', institutionDetails: '' });
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [demoStatus, setDemoStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Courses Catalog State
  const [catalogCourses, setCatalogCourses] = useState<ICourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Handle Demo Form Submission (Google Apps Script)
  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.fullName || !demoForm.workEmail) return;

    setIsSubmittingDemo(true);
    try {
      await fetch(
        'https://script.google.com/macros/s/AKfycbymyplApey5wf8qnE-gmXuiDQHcrdh9gKZdJKY-Bw_JxpfA20F4y2cPyaWgdqQlK9Vy/exec',
        {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(demoForm),
        }
      );
      setDemoStatus('success');
      setDemoForm({ fullName: '', workEmail: '', institutionDetails: '' });
    } catch (error) {
      console.error('Demo request submission error:', error);
      setDemoStatus('error');
    } finally {
      setIsSubmittingDemo(false);
      setTimeout(() => setDemoStatus('idle'), 6000);
    }
  };

  // Fetch Published & Featured Courses
  useEffect(() => {
    const fetchCatalogCourses = async () => {
      try {
        const result = await courseService.getCourses({ status: 'published', limit: 30 });
        const list = result.courses || [];

        let featuredList = list.filter(
          (c) => c.status === 'published' && c.visibility === 'public' && c.featured === true
        );

        const hasLinux = featuredList.some(
          (c) =>
            c.slug === 'linux-systems-administration-mastery' ||
            (c.title || '').toLowerCase().includes('linux')
        );
        const hasGit = featuredList.some(
          (c) =>
            c.slug === 'git-github-mastery' ||
            (c.title || '').toLowerCase().includes('git')
        );

        if (!hasLinux) {
          const found = list.find(
            (c) =>
              c.slug === 'linux-systems-administration-mastery' ||
              (c.title || '').toLowerCase().includes('linux')
          );
          if (found && found.status === 'published' && found.visibility === 'public') {
            featuredList.push(found);
          } else {
            featuredList.push(
              courseService.normalizeCourseToICourse({
                id: 'course_linux_101',
                title: 'Linux Systems & Administration Mastery',
                slug: 'linux-systems-administration-mastery',
                shortDescription:
                  'Enterprise curriculum covering Linux Architecture, Kernel Mechanics, Permissions, Systemd, Bash Scripting, and SSH Security.',
                category: 'Linux & Systems',
                level: 'all_levels',
                duration: '32 hrs',
                status: 'published',
                visibility: 'public',
                featured: true,
                rating: 5.0,
                ratingCount: 145,
                thumbnail: '/assets/images/linux_course_thumbnail.webp',
                banner: '/assets/images/linux_os_architecture.webp',
                instructor: { name: 'KaizenQ Systems Team', role: 'Linux Systems Architect' },
                skills: ['Linux CLI', 'Kernel Mechanics', 'Systemd Services', 'Bash Automation', 'SSH & Security'],
              })
            );
          }
        }

        if (!hasGit) {
          const found = list.find(
            (c) =>
              c.slug === 'git-github-mastery' ||
              (c.title || '').toLowerCase().includes('git')
          );
          if (found && found.status === 'published' && found.visibility === 'public') {
            featuredList.push(found);
          } else {
            featuredList.push(
              courseService.normalizeCourseToICourse({
                id: 'git-github-mastery',
                title: 'Git & GitHub Mastery',
                slug: 'git-github-mastery',
                shortDescription:
                  'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, and CI/CD.',
                category: 'Development Tools',
                level: 'all_levels',
                duration: '20 Hours',
                status: 'published',
                visibility: 'public',
                featured: true,
                rating: 5.0,
                ratingCount: 180,
                thumbnail: '/assets/images/github_course_banner.webp',
                banner: '/assets/images/github_course_banner.webp',
                instructor: { name: 'Kaizen Q Team', role: 'Senior Technical Instructor' },
                skills: ['Git CLI', 'Version Control', 'GitHub Actions', 'Codespaces', 'Semantic Versioning'],
              })
            );
          }
        }

        featuredList = featuredList.filter(
          (c) => c.status === 'published' && c.visibility === 'public'
        );

        setCatalogCourses(featuredList);
      } catch (err) {
        console.warn('Failed to load courses for landing page:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCatalogCourses();
  }, []);

  const getCourseImage = (course: ICourse) => {
    const rawThumb = course.thumbnail || (course as any).thumbnailUrl || (course as any).image || (course as any).imageUrl || course.banner;
    if (rawThumb && typeof rawThumb === 'string' && rawThumb.trim() !== '' && !rawThumb.includes('placeholder')) {
      return rawThumb;
    }
    const t = (course.title || '').toLowerCase();
    const cat = (course.category || '').toLowerCase();
    if (t.includes('linux') || cat.includes('linux')) return '/assets/images/linux_course_thumbnail.webp';
    if (t.includes('git') || cat.includes('git') || t.includes('github')) return '/assets/images/github_course_banner.webp';
    if (t.includes('c programming') || t.includes('c language')) return '/assets/images/c_course_thumbnail.webp';
    if (t.includes('python')) return '/assets/images/python_course_thumbnail.webp';
    if (t.includes('java')) return '/assets/images/java_course_thumbnail.webp';
    if (t.includes('react') || t.includes('web') || t.includes('javascript'))
      return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=500&fm=webp&q=80';
    if (t.includes('ai') || cat.includes('ai') || t.includes('machine learning'))
      return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=500&fm=webp&q=80';
    if (t.includes('devops') || cat.includes('devops') || t.includes('cloud') || t.includes('kubernetes'))
      return 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=500&fm=webp&q=80';
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&fm=webp&q=80';
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };



  return (
    <div className="w-full bg-[#ffffff] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#ffffff] font-['Sora'] selection:bg-[#2563eb] selection:text-white transition-colors duration-300">
      <SEOHead
        title="KaizenQ - Modern Learning Platform | Learn. Build. Evolve."
        description="KaizenQ is a modern learning platform and virtual internship accelerator co-founded by Bhanu Prakash, designed to help students and developers build practical engineering skills."
        keywords="KaizenQ, Kaizen Q, Co-Founder of KaizenQ, Bhanu Prakash, Banu Prakash, Shaivika Groups, virtual internships, technology learning platform, software engineering"
        author="Bhanu Prakash — Co-Founder of KaizenQ"
      />
      <OrganizationSchema />
      <CoFounderSchema />

      {/* ========================================================================= */}
      {/* 4. HERO SECTION (MOST IMPORTANT)                                          */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 4. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative w-full pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden lg:overflow-visible border-b border-[#e2e8f0]/40 dark:border-white/[0.04]">
        
        {/* Animated Hero Background (Floating Orbs + Depth Grid) */}
        <AnimatedHeroBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* LEFT — TEXT CONTENT (desktop: left col; mobile: second below logo) */}
          <div className="lg:col-span-7 order-last lg:order-first flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            
            {/* Clean White Professional Live Internship Banner */}
            <Link
              to="/careers"
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:border-slate-300 hover:shadow-xs transition-all group shadow-2xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="tracking-wide">2026 Virtual & Hybrid Internships &bull; 6 Core Tracks</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Rotating Split-Text Animated Heading */}
            <RotatingSplitText />

            {/* Supporting Headline */}
            <p className="text-lg sm:text-xl font-semibold text-[#0f172a] dark:text-[#ffffff]">
              Learning that helps you grow.
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#475569] dark:text-[#a1a5b7] max-w-xl leading-relaxed font-normal">
              KaizenQ is a modern learning platform designed to help students and aspiring developers build practical technology skills through structured learning, hands-on practice, and continuous improvement.
            </p>

            {/* Supporting line */}
            <p className="text-xs sm:text-sm font-medium text-[#475569] dark:text-[#a1a5b7] italic">
              A smarter way to learn. A better way to grow.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              {/* Primary: animated gradient Get Started / Go to Dashboard */}
              <Link
                to={getStartedRoute}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] group"
                style={{
                  background: 'linear-gradient(110deg, #2563EB 0%, #6366F1 50%, #8B5CF6 100%)',
                  backgroundSize: '200% auto',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  transition: 'background-position 0.4s ease, box-shadow 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.backgroundPosition = '100% center';
                  el.style.boxShadow = '0 6px 24px rgba(99,102,241,0.45)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.backgroundPosition = '0% center';
                  el.style.boxShadow = '0 2px 8px rgba(37,99,235,0.3)';
                }}
              >
                <span>{getStartedText}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              {/* Secondary: Explore 2026 Internships CTA */}
              <Link
                to="/careers"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-slate-800 font-bold text-sm bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs"
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Explore Internships</span>
              </Link>

              {/* Tertiary: ghost with gradient border on hover */}
              <a
                href="#courses"
                className="
                  w-full sm:w-auto inline-flex items-center justify-center gap-2
                  px-6 py-3.5 rounded-xl
                  text-[#0f172a] dark:text-[#ffffff] font-semibold text-sm
                  bg-white/80 dark:bg-[#111827]/70
                  border border-[#e2e8f0] dark:border-[#1f2937]
                  backdrop-blur-md
                  transition-all duration-200
                  hover:bg-white dark:hover:bg-[#1e293b]
                  hover:border-[#6366F1]/50 dark:hover:border-[#6366F1]/40
                  hover:shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_4px_16px_rgba(99,102,241,0.12)]
                  hover:scale-[1.02] active:scale-[0.98]
                  cursor-pointer
                "
              >
                <span>Explore Courses</span>
              </a>
            </div>

          </div>


          {/* RIGHT — FLOATING LOGO (mobile: first / top; desktop: right col) */}
          <div className="lg:col-span-5 order-first lg:order-last flex items-center justify-center py-6 lg:py-0">
            {/*
              Mobile: h-64 — compact but clear visual anchor
              sm+:   h-80 — comfortable display
              Both centre the logo + leave room for the wordmark label offset (translate-y-14)
            */}
            <div className="relative h-64 sm:h-80 w-full flex items-center justify-center">
              <FloatingLogo />
            </div>
          </div>


        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION — WHAT IS KAIZENQ?                                             */}
      {/* ========================================================================= */}
      <section className="py-24 border-t border-[#e2e8f0] dark:border-[#1f2937] bg-[#f8fafc]/60 dark:bg-[#111827]/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#2563eb] dark:text-[#3b82f6] uppercase">
            ABOUT THE PLATFORM
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] dark:text-[#ffffff] tracking-tight">
            What is KaizenQ?
          </h2>

          <p className="text-sm sm:text-base text-[#475569] dark:text-[#a1a5b7] leading-relaxed font-normal max-w-2xl mx-auto">
            KaizenQ is built to make learning technology more practical, structured, and continuous — helping learners move from understanding concepts to developing real skills.
          </p>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7B. SECTION — VIRTUAL INTERNSHIPS & INDUSTRY OPPORTUNITIES GATEWAY        */}
      {/* ========================================================================= */}
      <section className="w-full py-12 px-6 md:px-12 lg:px-16 border-t border-[#e2e8f0] dark:border-[#1f2937] bg-gradient-to-b from-[#f8fafc] via-blue-50/40 to-[#ffffff] dark:from-[#111827]/40 dark:via-blue-950/20 dark:to-[#0b0f19]">
        <RevealOnScroll className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl p-8 sm:p-12 bg-white dark:bg-slate-900/90 border border-blue-200/90 dark:border-blue-900/50 shadow-2xl shadow-blue-500/10 overflow-hidden">
            {/* Ambient Backlight */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/15 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/15 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>2026 Virtual & Hybrid Internships &bull; Shaivika Groups</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Launch Your Tech Career With <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">KaizenQ Internships</span>
                </h3>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
                  Work on production-grade repositories with code reviews, Git branching strategies, automated testing, and CI/CD pipelines instead of toy tutorials. Gain verified credentials and fast-track your path to corporate placements.
                </p>

                {/* Micro-features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs font-bold text-slate-900 dark:text-white block">Production Experience</strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Real PRs & CI/CD pipelines</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs font-bold text-slate-900 dark:text-white block">Verified Credentials</strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">QR-verifiable certificates</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs font-bold text-slate-900 dark:text-white block">Direct Placement Track</strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">LOR for top 15% performers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Column */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center gap-3.5 w-full">
                <Link
                  to="/careers"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center group"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Explore Internships & Careers</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/careers"
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all text-center"
                >
                  <span>General Internship Application</span>
                </Link>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  ⚡ 10+ Virtual & Hybrid Positions Available
                </span>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ========================================================================= */}
      {/* 8. SECTION — LEARN / BUILD / EVOLVE (3D DEPTH PARALLAX POP-OUT CARDS)     */}
      {/* ========================================================================= */}
      <section className="w-full py-24 border-t border-[#e2e8f0] dark:border-[#1f2937] relative overflow-hidden">
        {/* Subtle background decorative ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-amber-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 space-y-14 relative z-10">
          
          <RevealOnScroll className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#475569] dark:text-[#a1a5b7] uppercase">
              THE METHODOLOGY
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] dark:text-[#ffffff] tracking-tight font-heading">
              How You Grow With KaizenQ
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#a1a5b7] max-w-xl mx-auto font-normal leading-relaxed">
              A 3-stage progression from conceptual clarity to practical mastery and continuous career excellence.
            </p>
          </RevealOnScroll>
  
          <ParallaxMethodologyCards />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. SECTION — PLATFORM FEATURES (SMOOTH VIEW TRANSITION GRID CARDS)        */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 border-t border-[#e2e8f0] dark:border-[#1f2937] bg-[#f8fafc] dark:bg-[#0b0f19] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 space-y-12 relative z-10">
          
          <RevealOnScroll className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#2563eb] dark:text-[#3b82f6] uppercase">
              PLATFORM FEATURES
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] dark:text-[#ffffff] tracking-tight font-heading">
              Essential Tools for Practical Mastery
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#a1a5b7] max-w-xl mx-auto font-normal leading-relaxed">
              Engineered for seamless conceptual learning, terminal execution, live collaboration, and verifiable credentials.
            </p>
          </RevealOnScroll>

          <SmoothViewTransitionGridCards />

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9B. SECTION — 2026 VIRTUAL & HYBRID INTERNSHIPS (3D ANIMATED SHOWCASE)   */}
      {/* ========================================================================= */}
      <Interactive3DInternshipShowcase />

      {/* ========================================================================= */}
      {/* 10. SECTION — TOP COURSES                                                 */}
      {/* ========================================================================= */}
      <section id="courses" className="w-full py-24 border-t border-[#e2e8f0] dark:border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 space-y-12">
          
          <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#475569] dark:text-[#a1a5b7] uppercase">
                COURSES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#ffffff] tracking-tight">
                Explore What You Can Learn
              </h2>
            </div>

            <button
              type="button"
              onClick={handleViewAllCourses}
              className="px-4 py-2 rounded-xl bg-[#f8fafc] hover:bg-slate-200/70 dark:bg-[#111827] dark:hover:bg-[#1e293b] text-[#0f172a] dark:text-[#ffffff] border border-[#e2e8f0] dark:border-[#1f2937] font-semibold text-xs flex items-center gap-1.5 self-start md:self-auto transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </RevealOnScroll>

          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <CourseSkeleton />
              <CourseSkeleton />
            </div>
          ) : catalogCourses.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-[#f8fafc] dark:bg-[#111827] rounded-2xl border border-[#e2e8f0] dark:border-[#1f2937] p-8 space-y-4">
              <p className="text-[#0f172a] dark:text-[#ffffff] font-bold text-base">No featured courses available.</p>
              <button
                type="button"
                onClick={handleViewAllCourses}
                className="px-5 py-2.5 rounded-xl bg-[#2563eb] text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {catalogCourses.slice(0, 2).map((course, idx) => (
                  <StaggerItem key={course.id || course.slug || idx}>
                    <FlipCard
                      course={course}
                      index={idx}
                      getCourseImage={getCourseImage}
                      onEnrollClick={(c) => {
                        setCheckoutCourses([{ id: c.id || c.slug, title: c.title }]);
                        setCheckoutPrice(c.price ?? 0);
                        setIsCheckoutOpen(true);
                      }}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* View All Courses Unlock Banner */}
              <div className="max-w-4xl mx-auto p-6 sm:p-7 rounded-3xl bg-linear-to-r from-blue-500/5 via-indigo-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-cyan-500/10 border border-blue-500/20 dark:border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left backdrop-blur-md shadow-xs">
                <div className="space-y-1.5">
                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#0f172a] dark:text-white flex items-center justify-center sm:justify-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Want to explore all technical courses?</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl font-normal leading-relaxed">
                    {user
                      ? 'Browse our complete catalog with Linux, Git, DSA, Web Development, Databases, and DevOps labs.'
                      : 'Sign in to your KaizenQ account to unlock the full engineering course catalog and interactive playgrounds.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleViewAllCourses}
                  className="px-6 py-3 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/25 active:scale-98 shrink-0"
                >
                  <span>{user ? 'Explore All Courses' : 'Sign In to View All Courses'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PRICING & TIERS (PRODUCT PLAN CARDS WITH CSS RIBBONS)                     */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-24 border-t border-[#e2e8f0] dark:border-[#1f2937] bg-[#f8fafc]/60 dark:bg-[#111827]/40 relative overflow-hidden">
        {/* Ambient decorative backdrop glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[380px] bg-gradient-to-r from-blue-500/5 via-amber-500/5 to-purple-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 space-y-14 relative z-10">
          
          <RevealOnScroll className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#2563eb] dark:text-[#3b82f6] uppercase">
              PLANS & ENROLLMENT
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] dark:text-[#ffffff] tracking-tight font-heading">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#a1a5b7] max-w-xl mx-auto font-normal leading-relaxed">
              Choose the ideal track for your learning journey with lifetime access, verified certificates, and interactive labs.
            </p>
          </RevealOnScroll>

          <ProductPlanCards
            onSelectPlan={(courses, price) => {
              setCheckoutCourses(courses);
              setCheckoutPrice(price);
              setIsCheckoutOpen(true);
            }}
          />

        </div>
      </section>

      {/* ========================================================================= */}
      {/* LEARNER REVIEWS                                                           */}
      {/* ========================================================================= */}
      <section className="w-full py-24 border-t border-[#e2e8f0] dark:border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 space-y-14">
          <RevealOnScroll className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#475569] dark:text-[#a1a5b7] uppercase">
              LEARNER REVIEWS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#ffffff] tracking-tight">
              Trusted by Developers & Students
            </h2>
          </RevealOnScroll>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <StaggerItem
                key={idx}
                className="bg-[#f8fafc] dark:bg-[#111827] p-7 rounded-2xl border border-[#e2e8f0] dark:border-[#1f2937] flex flex-col justify-between space-y-6 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-850 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#475569] dark:text-[#a1a5b7] leading-relaxed font-normal">
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#e2e8f0] dark:border-[#1f2937]">
                  <img
                    src={getOptimizedImageUrl(item.avatar, { width: 72, quality: 80 })}
                    alt={item.name}
                    width="36"
                    height="36"
                    loading="lazy"
                    decoding="async"
                    className="w-9 h-9 rounded-full object-cover border border-[#e2e8f0] dark:border-[#1f2937]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#0f172a] dark:text-[#ffffff]">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#2563eb] dark:text-[#3b82f6] font-medium">
                      {item.role}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FAQ ACCORDION                                                             */}
      {/* ========================================================================= */}
      <section id="about" className="py-24 border-t border-[#e2e8f0] dark:border-[#1f2937] bg-[#f8fafc]/60 dark:bg-[#111827]/40">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16 space-y-12">
          <RevealOnScroll className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#2563eb] dark:text-[#3b82f6] uppercase">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#ffffff] tracking-tight">
              Frequently Asked Questions
            </h2>
          </RevealOnScroll>

          <RevealOnScroll className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#111827] rounded-xl border border-[#e2e8f0] dark:border-[#1f2937] overflow-hidden hover:border-[#cbd5e1] dark:hover:border-slate-800 transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-sm sm:text-base text-[#0f172a] dark:text-[#ffffff] hover:text-[#2563eb] dark:hover:text-[#3b82f6] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-[#2563eb]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#475569] dark:text-[#a1a5b7] leading-relaxed border-t border-[#e2e8f0] dark:border-[#1f2937] font-normal animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INSTITUTIONAL INQUIRIES & CONTACT                                         */}
      {/* ========================================================================= */}
      <section id="contact" className="py-24 border-t border-[#e2e8f0] dark:border-[#1f2937]">
        <RevealOnScroll className="max-w-4xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="bg-[#f8fafc] dark:bg-[#111827] rounded-3xl p-8 sm:p-12 border border-[#e2e8f0] dark:border-[#1f2937] space-y-8 shadow-2xs">
            
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#2563eb] dark:text-[#3b82f6] uppercase">
                INSTITUTIONAL INQUIRIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#ffffff] tracking-tight">
                Connect With Our Team
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#a1a5b7] max-w-lg mx-auto">
                Looking to deploy KaizenQ curricula, cohort tracking, or custom student labs? Send us an inquiry.
              </p>
            </div>

            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={demoForm.fullName}
                  onChange={(e) => setDemoForm({ ...demoForm, fullName: e.target.value })}
                  placeholder="Full Name *"
                  className="bg-white dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1f2937] focus:border-[#2563eb] focus:outline-hidden rounded-xl px-4 py-3 text-xs text-[#0f172a] dark:text-[#ffffff] placeholder-slate-400"
                />
                <input
                  type="email"
                  required
                  value={demoForm.workEmail}
                  onChange={(e) => setDemoForm({ ...demoForm, workEmail: e.target.value })}
                  placeholder="Work / Institutional Email *"
                  className="bg-white dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1f2937] focus:border-[#2563eb] focus:outline-hidden rounded-xl px-4 py-3 text-xs text-[#0f172a] dark:text-[#ffffff] placeholder-slate-400"
                />
              </div>

              <textarea
                rows={3}
                value={demoForm.institutionDetails}
                onChange={(e) => setDemoForm({ ...demoForm, institutionDetails: e.target.value })}
                placeholder="Institution details, student headcount, or specific requirements..."
                className="w-full bg-white dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1f2937] focus:border-[#2563eb] focus:outline-hidden rounded-xl px-4 py-3 text-xs text-[#0f172a] dark:text-[#ffffff] placeholder-slate-400"
              />

              <button
                type="submit"
                disabled={isSubmittingDemo}
                className="w-full py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmittingDemo ? 'Submitting...' : 'Submit Inquiry'}</span>
                {!isSubmittingDemo && <Send className="w-3.5 h-3.5" />}
              </button>
            </form>

            {demoStatus === 'success' && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Inquiry submitted successfully! Our team will contact you shortly.</span>
              </div>
            )}

          </div>
        </RevealOnScroll>
      </section>

      {/* ========================================================================= */}
      {/* 11. CTA SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="py-24 md:py-28 text-center border-t border-[#e2e8f0] dark:border-[#1f2937] bg-[#f8fafc]/60 dark:bg-[#111827]/40">
        <RevealOnScroll className="max-w-3xl mx-auto px-6 md:px-12 lg:px-16 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-[#ffffff] tracking-tight">
            Start Your Learning Journey
          </h2>
          
          <p className="text-sm sm:text-base text-[#475569] dark:text-[#a1a5b7] max-w-lg mx-auto leading-relaxed font-normal">
            Learn with purpose. Build with confidence. Keep evolving.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to={getStartedRoute}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{getStartedText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#courses"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#0b0f19] dark:hover:bg-[#111827] text-[#0f172a] dark:text-[#ffffff] border border-[#e2e8f0] dark:border-[#1f2937] font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Explore Courses</span>
            </a>
          </div>
        </RevealOnScroll>
      </section>

      {/* Floating Back to Top Button */}
      <BackToTop />

      {/* Checkout Modal (Loaded on-demand only when user opens checkout) */}
      {isCheckoutOpen && (
        <React.Suspense fallback={null}>
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            courses={checkoutCourses}
            totalPrice={checkoutPrice}
          />
        </React.Suspense>
      )}
    </div>
  );
};
