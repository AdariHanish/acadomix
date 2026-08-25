import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Star, CreditCard, FolderOpen, Settings, LogOut, Menu, X, Users, ImageIcon, UserCheck, IdCard, Tag, Database } from 'lucide-react';
import { AdminAuth, AssetsDB } from '../../utils/storage';

const navItems = [
  { path: '/admin/dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: 'Dashboard' },
  { path: '/admin/reviews', icon: <Star className="w-[18px] h-[18px]" />, label: 'Reviews' },
  { path: '/admin/payments', icon: <CreditCard className="w-[18px] h-[18px]" />, label: 'Payments' },
  { path: '/admin/projects', icon: <FolderOpen className="w-[18px] h-[18px]" />, label: 'Projects' },
  { path: '/admin/leads', icon: <Users className="w-[18px] h-[18px]" />, label: 'Leads' },
  { path: '/admin/customers', icon: <UserCheck className="w-[18px] h-[18px]" />, label: 'Customers' },
  { path: '/admin/assets', icon: <ImageIcon className="w-[18px] h-[18px]" />, label: 'Assets' },
  { path: '/admin/id-cards', icon: <IdCard className="w-[18px] h-[18px]" />, label: 'ID Cards' },
  { path: '/admin/offers', icon: <Tag className="w-[18px] h-[18px]" />, label: 'Offers & Pricing' },
  { path: '/admin/database', icon: <Database className="w-[18px] h-[18px]" />, label: 'Database' },
  { path: '/admin/settings', icon: <Settings className="w-[18px] h-[18px]" />, label: 'Settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/images/logo-placeholder.png');

  useEffect(() => {
    AssetsDB.get('logo').then(logo => {
      if (logo) setLogoSrc(logo.data);
    });
  }, []);

  // Check auth on every route change — if not logged in, redirect to login
  useEffect(() => {
    if (!AdminAuth.isLoggedIn()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate, location.pathname]);

  // Auto-logout when user leaves admin pages (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      // If navigating away from admin, logout
      if (!window.location.hash.startsWith('#/admin/')) {
        AdminAuth.logout();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-logout when page visibility changes (tab switch, minimize)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized — logout for security
        AdminAuth.logout();
        navigate('/admin', { replace: true });
        // Removed window.location.reload() because hard-reloading a sleeping background tab 
        // causes modern browsers (Chrome/Edge) to kill the request, resulting in ERR_CONNECTION_TIMED_OUT.
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [navigate]);

  const handleLogout = () => {
    AdminAuth.logout();
    navigate('/admin', { replace: true });
  };

  // If navigating to any non-admin page via sidebar links, logout first
  const handleExternalNav = () => {
    AdminAuth.logout();
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-surface-1 border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border">
            <Link to="/" onClick={handleExternalNav} className="flex items-center gap-2">
              <img src={logoSrc} alt="Acadomix" className="w-8 h-8 rounded-lg object-contain border border-gold/15" />
              <span className="text-[14px] font-black tracking-wider text-gradient uppercase">ACADOMIX</span>
            </Link>
            <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Admin Panel</p>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all active:bg-white/10 ${
                  location.pathname === item.path ? 'bg-white/[0.06] text-white font-medium' : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03]'
                }`}>
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-border">
            <button onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-white/25 hover:text-red-400 hover:bg-red-500/[0.06] active:bg-red-500/10 rounded-lg text-[13px] transition-all">
              <LogOut className="w-[18px] h-[18px]" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-56">
        <header className="sticky top-0 z-30 glass-nav">
          <div className="flex items-center justify-between px-4 sm:px-5 h-12 sm:h-14">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 text-white/40 active:text-white">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <p className="text-[13px] sm:text-sm font-medium text-white/70">
              {navItems.find(i => i.path === location.pathname)?.label || 'Admin'}
            </p>
            <Link to="/" onClick={handleExternalNav} className="text-[11px] sm:text-[12px] text-white/25 hover:text-white/50 active:text-crimson transition-colors">
              View Site →
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-5 lg:p-7">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
