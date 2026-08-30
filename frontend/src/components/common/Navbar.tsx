import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowRight, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
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
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Smooth scroll listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);

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

  // Sync hash and pathname
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

  // Click outside to close user dropdown
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
    } catch {
      toast.error('Failed to log out.');
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  interface NavItem {
    name: string;
    href: string;
  }

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

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href.startsWith('/#')) {
      const targetId = href.substring(2);
      if (window.location.pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          const navOffset = 76;
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
          const navOffset = 76;
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
  const userInitial =
    userProfile?.name?.charAt(0).toUpperCase() ||
    user?.displayName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    'S';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full font-['Sora'] transition-all duration-200 border-b backdrop-blur-md ${
        isScrolled
          ? 'bg-[#ffffff]/95 dark:bg-[#0b0f19]/95 border-[#e2e8f0] dark:border-[#1f2937] shadow-xs'
          : 'bg-[#ffffff]/80 dark:bg-[#0b0f19]/80 border-[#e2e8f0]/70 dark:border-[#1f2937]/70'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto h-16 sm:h-18 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <BrandLogo size="md" showSubtitle={true} responsive={true} />

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <button
                key={link.name}
                type="button"
                onClick={(e) => handleNavClick(e, link.href)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  active
                    ? 'text-[#2563eb] dark:text-[#3b82f6] font-bold bg-[#f8fafc] dark:bg-[#111827]'
                    : 'text-[#475569] dark:text-[#a1a5b7] hover:text-[#0f172a] dark:hover:text-[#ffffff] hover:bg-slate-100/60 dark:hover:bg-[#111827]/60'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Right Actions Area */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#1f2937] rounded-full transition-all cursor-pointer shadow-2xs"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User"
                    className="w-7 h-7 rounded-full object-cover border border-[#2563eb] shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {userInitial}
                  </div>
                )}
                <span className="text-xs font-semibold text-[#0f172a] dark:text-[#ffffff] max-w-[100px] truncate">
                  {userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#111827] border border-[#e2e8f0] dark:border-[#1f2937] rounded-2xl shadow-xl p-2 z-50 space-y-1"
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-[#1f2937] text-xs">
                      <p className="font-bold text-[#0f172a] dark:text-[#ffffff] truncate">
                        {userProfile?.name || user?.displayName || 'User'}
                      </p>
                      <p className="text-[#475569] dark:text-[#a1a5b7] text-[11px] truncate">{user.email}</p>
                    </div>

                    <Link
                      to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#2563eb] dark:hover:text-[#3b82f6] hover:bg-slate-50 dark:hover:bg-[#1e293b] rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-[#2563eb]" />
                      <span>{userProfile?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#2563eb] dark:hover:text-[#3b82f6] hover:bg-slate-50 dark:hover:bg-[#1e293b] rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#2563eb]" />
                      <span>Account Settings</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
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
                className="px-3.5 py-2 text-xs font-semibold text-[#475569] dark:text-[#a1a5b7] hover:text-[#2563eb] dark:hover:text-[#3b82f6] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="px-4.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 active:scale-98"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Right */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#e2e8f0] dark:border-[#1f2937] bg-[#f8fafc] dark:bg-[#111827] text-[#0f172a] dark:text-[#ffffff] hover:text-[#2563eb] transition-colors cursor-pointer active:scale-95 shadow-2xs"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white dark:bg-[#0b0f19] border-t border-[#e2e8f0] dark:border-[#1f2937] px-4 sm:px-6 py-4 space-y-4 shadow-xl font-['Sora'] overflow-hidden"
          >
            {/* Mobile Nav Links */}
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl text-left border transition-colors ${
                    isLinkActive(link.href)
                      ? 'text-[#2563eb] dark:text-[#3b82f6] bg-[#f8fafc] dark:bg-[#111827] border-[#2563eb] dark:border-[#3b82f6] font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#111827] border-transparent'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Mobile Auth Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#1f2937]">
              {!user ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-semibold text-[#0f172a] dark:text-[#ffffff] border border-[#e2e8f0] dark:border-[#1f2937] rounded-xl hover:bg-slate-50 dark:hover:bg-[#111827] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl shadow-xs transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full text-center py-2.5 text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-950 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
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
        userName={userProfile?.name || user?.displayName || 'User'}
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
