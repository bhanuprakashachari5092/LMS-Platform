import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowRight, User, LogOut, Settings, ChevronDown, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BrandLogo } from './BrandLogo';
import { LogoutConfirmModal } from './LogoutConfirmModal';

/* ─── Inline ThemeToggle (compact, professional) ───────────────────────────── */
const ThemeButton: React.FC = () => {
  const { kqAppearance, setKqAppearance } = useTheme();
  const isNight = kqAppearance === 'night';
  return (
    <button
      type="button"
      onClick={() => setKqAppearance(isNight ? 'day' : 'night')}
      title={isNight ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isNight ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="
        w-8 h-8 flex items-center justify-center rounded-lg
        text-slate-500 dark:text-slate-400
        hover:text-slate-900 dark:hover:text-white
        hover:bg-slate-100 dark:hover:bg-white/[0.07]
        transition-colors duration-150 cursor-pointer
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        {isNight ? (
          <motion.span key="sun"
            initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-[15px] h-[15px]" />
          </motion.span>
        ) : (
          <motion.span key="moon"
            initial={{ opacity: 0, rotate: 60, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -60, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-[15px] h-[15px]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

/* ─── Exported GradientButton for hero CTA reuse ───────────────────────────── */
export const GradientButton: React.FC<{
  to: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}> = ({ to, onClick, className = '', children }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`
      inline-flex items-center gap-1.5
      px-4 py-1.5 rounded-lg
      bg-[#2563EB] hover:bg-[#1d4ed8]
      text-white font-semibold text-[13px]
      shadow-sm hover:shadow-[0_4px_14px_rgba(37,99,235,0.4)]
      hover:scale-[1.02] active:scale-[0.98]
      transition-all duration-150
      group
      ${className}
    `}
  >
    {children}
    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
  </Link>
);

/* ══════════════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════════════ */
export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen]     = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut]     = useState(false);
  const [activeHash, setActiveHash]         = useState(window.location.hash);
  const [activePath, setActivePath]         = useState(window.location.pathname);

  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef  = useRef<HTMLDivElement>(null);

  /* ── Scroll listener ───────────────────────────────────────────────────── */
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          if (window.location.pathname === '/') {
            const sections = ['courses', 'features', 'pricing', 'about', 'contact'];
            let current = '';
            for (const s of sections) {
              const el = document.getElementById(s);
              if (el) {
                const r = el.getBoundingClientRect();
                if (r.top <= 200 && r.bottom >= 120) { current = `#${s}`; break; }
              }
            }
            if (current) setActiveHash(current);
            else if (window.scrollY < 200) setActiveHash('');
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Hash / path sync ──────────────────────────────────────────────────── */
  useEffect(() => {
    const sync = () => { setActiveHash(window.location.hash); setActivePath(window.location.pathname); };
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('popstate', sync); };
  }, []);

  /* ── Click outside to close user dropdown ──────────────────────────────── */
  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── Close mobile menu on resize ───────────────────────────────────────── */
  useEffect(() => {
    const h = () => { if (window.innerWidth >= 1024) setMobileMenuOpen(false); };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const handleLogoutClick = () => { setUserMenuOpen(false); setMobileMenuOpen(false); setLogoutModalOpen(true); };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch {
      toast.error('Failed to log out.');
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  interface NavItem { name: string; href: string; }

  const getNavLinks = (): NavItem[] => {
    if (!user || !userProfile) return [
      { name: 'Home',     href: '/'         },
      { name: 'Courses',  href: '/#courses'  },
      { name: 'Features', href: '/#features' },
      { name: 'Pricing',  href: '/#pricing'  },
      { name: 'About',    href: '/#about'    },
      { name: 'Contact',  href: '/#contact'  },
    ];
    if (userProfile.role === 'admin') return [
      { name: 'Dashboard',   href: '/admin/dashboard'   },
      { name: 'Users',       href: '/admin/users'       },
      { name: 'Courses',     href: '/#courses'          },
      { name: 'Students',    href: '/admin/students'    },
      { name: 'Instructors', href: '/admin/instructors' },
    ];
    return [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Courses',   href: '/#courses'  },
      { name: 'Profile',   href: '/profile'   },
    ];
  };

  const navLinks = getNavLinks();

  const isLinkActive = (href: string) => {
    if (href.startsWith('/#')) {
      const h = href.substring(1);
      return activePath === '/' && (activeHash === h || (activeHash === '' && h === '#home'));
    }
    if (href === '/' && activePath === '/' && activeHash === '') return true;
    return activePath === href;
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const id = href.substring(2);
      const scrollTo = () => {
        const el = document.getElementById(id);
        if (el) {
          window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 72, behavior: 'smooth' });
        }
      };
      if (window.location.pathname === '/') {
        scrollTo();
        setActiveHash(`#${id}`);
        window.history.replaceState(null, '', `/#${id}`);
      } else {
        navigate(`/#${id}`);
        setTimeout(scrollTo, 120);
      }
      return;
    }
    if (href === '/') {
      if (window.location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveHash('');
        window.history.replaceState(null, '', '/');
      } else navigate('/');
      return;
    }
    navigate(href);
  };

  const avatarUrl  = userProfile?.photoURL || user?.photoURL || undefined;
  const userInitial = userProfile?.name?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S';

  /* ── Navbar classes ────────────────────────────────────────────────────── */
  const headerClass = [
    'fixed top-0 left-0 right-0 z-50 w-full',
    "font-['Inter',sans-serif]",
    'transition-all duration-200',
    'border-b',
    'backdrop-blur-xl',
    isScrolled
      ? 'bg-white/95 dark:bg-[#0a0e1a]/95 border-slate-200/70 dark:border-white/[0.07] shadow-[0_1px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.4)]'
      : 'bg-white/80 dark:bg-[#0a0e1a]/80 border-slate-200/40 dark:border-white/[0.05]',
  ].join(' ');

  return (
    <>
      <header className={headerClass}>
        <div className="w-full max-w-7xl mx-auto h-[60px] flex items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Brand Logo */}
          <BrandLogo size="md" showSubtitle={true} responsive={true} />

          {/* Center nav links — desktop only */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`
                    relative px-3.5 py-1.5 text-[13px] rounded-md cursor-pointer
                    transition-colors duration-150
                    ${active
                      ? 'text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 font-medium'
                    }
                  `}
                >
                  {link.name}
                  {/* Thin animated underline */}
                  <span
                    className="absolute bottom-0.5 left-3 right-3 h-[1.5px] rounded-full bg-slate-800 dark:bg-slate-200 transition-all duration-200"
                    style={{
                      transform: active ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'center',
                      opacity: active ? 1 : 0,
                    }}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right actions — desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeButton />

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User" className="w-6 h-6 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-[11px] shrink-0">{userInitial}</div>
                  )}
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                    {userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.13 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-white/[0.09] rounded-xl shadow-xl p-1.5 z-50"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-white/[0.07] mb-1">
                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{userProfile?.name || user?.displayName || 'User'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-lg transition-colors">
                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        {userProfile?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                      </Link>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] rounded-lg transition-colors">
                        <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        Account Settings
                      </Link>
                      <div className="border-t border-slate-100 dark:border-white/[0.07] mt-1 pt-1">
                        <button type="button" onClick={handleLogoutClick} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer text-left">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-3.5 py-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <GradientButton to="/auth/register">Get Started</GradientButton>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex lg:hidden items-center gap-1.5">
            <ThemeButton />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.span key="close" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 45 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ opacity: 0, rotate: 45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -45 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ── Mobile menu panel ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden border-t border-slate-200/60 dark:border-white/[0.07] bg-white/98 dark:bg-[#0a0e1a]/98 backdrop-blur-xl"
            >
              <div className="px-4 sm:px-6 py-4 space-y-1">
                {/* Nav links */}
                {navLinks.map((link, i) => {
                  const active = isLinkActive(link.href);
                  return (
                    <motion.button
                      key={link.name}
                      type="button"
                      onClick={(e) => handleNavClick(e, link.href)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className={`
                        w-full flex items-center px-3 h-11 rounded-lg text-left text-[14px] cursor-pointer transition-colors
                        ${active
                          ? 'text-slate-900 dark:text-white font-semibold bg-slate-100 dark:bg-white/[0.07]'
                          : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                        }
                      `}
                    >
                      {link.name}
                    </motion.button>
                  );
                })}

                {/* Divider */}
                <div className="h-px bg-slate-200 dark:bg-white/[0.07] my-2" />

                {/* Auth section */}
                {!user ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center h-11 rounded-lg border border-slate-200 dark:border-white/[0.1] text-[14px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center h-11 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[14px] font-semibold transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.05]">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="User" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-sm">{userInitial}</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{userProfile?.name || user?.displayName || 'User'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 h-11 rounded-lg text-[14px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors">
                      <User className="w-4 h-4 text-slate-400" /> {userProfile?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                    </Link>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 h-11 rounded-lg text-[14px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                    </Link>
                    <button type="button" onClick={handleLogoutClick} className="w-full flex items-center gap-2 px-3 h-11 rounded-lg text-[14px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Logout modal */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        userName={userProfile?.name || user?.displayName || 'User'}
        userEmail={userProfile?.email || user?.email || undefined}
        userRole={userProfile?.role || 'student'}
        userAvatar={userProfile?.photoURL || user?.photoURL || undefined}
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
        isProcessing={isLoggingOut}
      />
    </>
  );
};
