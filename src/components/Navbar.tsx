import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { AssetsDB, AdminAuth } from '../utils/storage';

const sectionLinks = [
  { name: 'Services', id: 'services' },
  { name: 'Projects', id: 'projects' },
  { name: 'Pricing', id: 'pricing' },
  { name: 'Contact', id: 'contact' },
];

const routeLinks = [
  { name: 'Reviews', href: '/reviews' },
  { name: 'Pay', href: '/payment' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [logoSrc, setLogoSrc] = useState('/images/logo-placeholder.png');
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    AssetsDB.get('logo').then(logo => {
      if (logo) setLogoSrc(logo.data);
    });
  }, []);

  // Track which section is in view
  const handleScroll = useCallback(() => {
    if (!isHome) return;
    const sections = sectionLinks.map(s => s.id);
    let current = '';
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          current = id;
        }
      }
    }
    setActiveSection(current);
  }, [isHome]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Clear active when on route pages
  useEffect(() => {
    if (!isHome) setActiveSection('');
  }, [isHome]);

  const scrollTo = (id: string) => {
    AdminAuth.logout();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItemClass = (isActive: boolean) =>
    `relative flex-shrink-0 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[13px] font-medium whitespace-nowrap transition-colors duration-200 active:scale-95 group ${
      isActive ? 'text-gold' : 'text-white/50 hover:text-white/80'
    }`;

  // Gold animated underline
  const Underline = ({ active }: { active: boolean }) => (
    <span className={`absolute bottom-0 left-1/2 h-[2px] rounded-full transition-all duration-400 ease-out ${
      active
        ? 'w-3/4 -translate-x-1/2 bg-gradient-to-r from-crimson via-gold to-crimson'
        : 'w-0 -translate-x-1/2 bg-gradient-to-r from-gold to-crimson group-hover:w-3/4'
    }`} />
  );

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-nav' : 'bg-transparent'
      }`}
    >
      <div className="container-responsive">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => { AdminAuth.logout(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 group"
          >
            <img src={logoSrc} alt="Acadomix" className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg object-contain group-active:scale-90 transition-transform" />
            <span className="hidden min-[400px]:inline text-[13px] sm:text-sm font-bold tracking-tight text-white/90">
              Acado<span className="text-gradient">mix</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-0 sm:gap-0.5 overflow-x-auto no-scrollbar mx-1 sm:mx-3 flex-1 justify-center">
            {sectionLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollTo(link.id)}
                className={navItemClass(activeSection === link.id)}
              >
                {link.name}
                <Underline active={activeSection === link.id} />
              </button>
            ))}
            {routeLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => AdminAuth.logout()}
                className={navItemClass(location.pathname === link.href)}
              >
                {link.name}
                <Underline active={location.pathname === link.href} />
              </Link>
            ))}
          </nav>

          {/* Admin + CTA */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link to="/admin" className="p-1.5 text-white/30 hover:text-gold active:text-crimson transition-colors" title="Admin">
              <Shield className="w-4 h-4" />
            </Link>
            <button
              onClick={() => scrollTo('contact')}
              className="hidden sm:flex px-3 lg:px-4 py-1.5 text-[11px] lg:text-[12px] font-semibold text-white bg-gradient-to-r from-crimson to-gold-dark hover:from-crimson-light hover:to-gold rounded-full transition-all items-center btn-glow active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
