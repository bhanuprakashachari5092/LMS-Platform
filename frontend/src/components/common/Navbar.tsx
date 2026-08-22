import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, User, LogOut, Settings, ChevronDown, Sparkles, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeHash, setActiveHash] = useState(window.location.hash);
  const [activePath, setActivePath] = useState(window.location.pathname);

  const { user, userProfile, logout } = useAuth();
  const { kqAppearance, setKqAppearance } = useTheme();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Smooth & performant scroll listener using requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 15);

          // Scroll spy logic for section highlighting on homepage
          if (window.location.pathname === '/') {
            const sections = ['courses', 'features', 'pricing', 'about', 'contact'];
            let currentSection = '';

            for (const section of sections) {
              const el = document.getElementById(section);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 200 && rect.bottom >= 120) {
                  currentSection = `#${section}`;
                  break;
                }
              }
            }

            if (currentSection) {
              setActiveHash(currentSection);
            } else if (window.scrollY < 200) {
              setActiveHash('');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync hash and pathname changes
  useEffect(() => {
    const handleLocationChange = () => {
      setActiveHash(window.location.hash);
      setActivePath(window.location.pathname);
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to log out.');
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  interface NavItem {
    name: string;
    href: string;
    badge?: boolean;
  }

  // Role-based Navigation Links
  const getNavLinks = (): NavItem[] => {
    if (!user || !userProfile) {
      return [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/#courses' },
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'About', href: '/#about' },
        { name: 'Contact', href: '/#contact' },
      ];
    }

    if (userProfile.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Users', href: '/admin/users' },
        { name: 'Courses', href: '/#courses' },
        { name: 'Students', href: '/admin/students' },
        { name: 'Instructors', href: '/admin/instructors' },
      ];
    }

    return [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Courses', href: '/#courses' },
      { name: 'Profile', href: '/profile' },
    ];
  };

  const navLinks = getNavLinks();

  const isLinkActive = (href: string) => {
    if (href.startsWith('/#')) {
      const linkHash = href.substring(1);
      return activePath === '/' && (activeHash === linkHash || (activeHash === '' && linkHash === '#home'));
    }
    if (href === '/' && activePath === '/' && activeHash === '') return true;
    return activePath === href;
  };

  // Instant SPA Navigation without lag or page refresh
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href.startsWith('/#')) {
      const targetId = href.substring(2);
      if (window.location.pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          const navOffset = 72;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navOffset,
            behavior: 'smooth',
          });
          setActiveHash(`#${targetId}`);
          window.history.replaceState(null, '', `/#${targetId}`);
          return;
        }
      }
      navigate(`/#${targetId}`);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const navOffset = 72;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navOffset,
            behavior: 'smooth',
          });
        }
      }, 100);
      return;
    }

    if (href === '/') {
      if (window.location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveHash('');
        window.history.replaceState(null, '', '/');
      } else {
        navigate('/');
      }
      return;
    }

    navigate(href);
  };

  const avatarUrl = userProfile?.photoURL || user?.photoURL || undefined;
  const userInitial = userProfile?.name?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full font-['Sora'] transition-all duration-200 border-b backdrop-blur-xl ${
        isScrolled
          ? 'bg-white/95 border-[#E6EEF9] shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:bg-[#0B0F19]/95 dark:border-slate-800/80 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          : 'bg-white/85 border-slate-200/60 dark:bg-[#0B0F19]/85 dark:border-zinc-800/60'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto h-16 sm:h-18 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <BrandLogo size="md" showSubtitle={true} responsive={true} />

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/70 dark:bg-zinc-900/60 p-1 rounded-full border border-slate-200/70 dark:border-zinc-800/80 backdrop-blur-md">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <button
                key={link.name}
                type="button"
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative px-3.5 py-1.5 lg:px-2.5 lg:text-[11.5px] xl:px-4 xl:text-xs font-bold transition-all duration-150 flex items-center gap-1.5 rounded-full cursor-pointer active:scale-95 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900 shadow-xs font-extrabold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {link.badge && <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />}
                <span>{link.name}</span>
                {active && (
                  <motion.span
                    layoutId="navActiveDot"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action / User Menu Area */}
        <div className="hidden lg:flex items-center lg:gap-2 xl:gap-3">
          <ThemeToggle responsive={true} />
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 lg:gap-1.5 xl:gap-2.5 p-1.5 pr-3 lg:p-1 lg:pr-2.5 xl:p-1.5 xl:pr-3.5 bg-white/90 dark:bg-zinc-900/90 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md active:scale-97"
              >
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userProfile?.name || 'Student'}
                      className="w-8 h-8 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full object-cover border-2 border-blue-400 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full bg-linear-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs lg:text-[10px] xl:text-xs border border-blue-300 shadow-xs shrink-0">
                      {userInitial}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
                </div>

                <div className="text-left hidden lg:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight max-w-[80px] xl:max-w-[120px] truncate">
                    {userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'Student User'}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block leading-none mt-0.5">
                    {userProfile?.role || 'Student'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2.5 w-64 bg-white/98 dark:bg-[#0E1325]/98 backdrop-blur-2xl border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-zinc-800/80 mb-1 flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={userProfile?.name || 'Student'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm border border-blue-300 shrink-0">
                          {userInitial}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {userProfile?.name || user?.displayName || 'Student User'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate font-medium">
                          {user.email}
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase border border-blue-100 dark:border-blue-900">
                          {userProfile?.role || 'STUDENT'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl transition-colors duration-150"
                    >
                      <User className="w-4 h-4 text-blue-500" />
                      <span>{userProfile?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl transition-colors duration-150"
                    >
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span>Account Profile & Settings</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors duration-150 text-left cursor-pointer active:scale-97"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="px-4 py-2 lg:px-3 lg:py-1.5 xl:px-4 xl:py-2 text-[11px] xl:text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-2xs transition-all duration-150 active:scale-95"
              >
                Sign In
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 lg:px-3.5 lg:py-2 xl:px-5 xl:py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] xl:text-xs shadow-md shadow-blue-500/20 transition-all duration-150 hover:scale-102 active:scale-95 flex items-center gap-1.5"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Action Buttons: Quick Mode Toggle, Avatar & Hamburger */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Quick Day/Night Toggle Button */}
          <button
            type="button"
            onClick={() => setKqAppearance(kqAppearance === 'day' ? 'night' : 'day')}
            title={kqAppearance === 'day' ? 'Switch to Night Mode' : 'Switch to Day Mode'}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-100/70 dark:bg-zinc-900/70 text-slate-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-cyan-400 transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs"
            aria-label="Toggle Dark/Light Mode"
          >
            {kqAppearance === 'day' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* User Profile quick avatar on mobile if authenticated */}
          {user && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative shrink-0 active:scale-95 cursor-pointer"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userProfile?.name || 'Student'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-400 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs border border-blue-300 shadow-xs">
                  {userInitial}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
            </button>
          )}

          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-100/70 dark:bg-zinc-900/70 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white/98 dark:bg-[#0E1325]/98 backdrop-blur-2xl border-t border-slate-100 dark:border-zinc-800 px-4 sm:px-6 py-4 space-y-3.5 shadow-2xl font-['Sora'] overflow-hidden"
          >
            {/* User Profile Card if logged in */}
            {user && (
              <div className="p-3 bg-slate-50/90 dark:bg-zinc-900/70 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userProfile?.name || 'Student'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm border border-blue-300 shrink-0">
                    {userInitial}
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {userProfile?.name || user?.displayName || 'Student User'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                    {user.email}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase border border-blue-100 dark:border-blue-900">
                  {userProfile?.role || 'STUDENT'}
                </span>
              </div>
            )}

            {/* Nav links grid */}
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3.5 py-2.5 text-xs font-bold transition-all duration-150 rounded-xl flex items-center gap-1.5 border text-left cursor-pointer active:scale-95 ${
                    isLinkActive(link.href)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 font-extrabold shadow-2xs'
                      : 'text-slate-700 dark:text-zinc-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-zinc-900 border-slate-100 dark:border-zinc-800'
                  }`}
                >
                  {link.badge && <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />}
                  <span>{link.name}</span>
                </button>
              ))}
            </div>

            {/* Complete Theme and Mode controls inside drawer */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-zinc-900/70 border border-slate-100 dark:border-zinc-800 flex items-center justify-center">
                <ThemeToggle responsive={false} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {!user ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 active:scale-95 transition-all duration-150"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-150"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full text-center py-2.5 text-xs font-bold text-rose-600 border border-rose-200 dark:border-rose-950 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        userName={userProfile?.name || user?.displayName || userProfile?.fullName || 'User'}
        userEmail={userProfile?.email || user?.email || undefined}
        userRole={userProfile?.role || 'student'}
        userAvatar={userProfile?.photoURL || user?.photoURL || undefined}
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
        isProcessing={isLoggingOut}
      />
    </header>
  );
};
