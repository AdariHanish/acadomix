import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { AssetsDB, SettingsDB, getCachedData } from '../utils/storage';
import { SiteSettings } from '../types';

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
  const [activeSection, setActiveSection] = useState('');
  const [logoSrc, setLogoSrc] = useState(() => {
    return localStorage.getItem('acadomix_cached_logo') || '/images/logo.png';
  });
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [tagline, setTagline] = useState(() => {
    const cached = getCachedData<SiteSettings>('/settings');
    return cached?.company_tagline || 'Coding Your Ideas';
  });

  useEffect(() => {
    AssetsDB.get('logo').then(logo => {
      if (logo) {
        setLogoSrc(logo.data);
        localStorage.setItem('acadomix_cached_logo', logo.data);
      }
    });
    SettingsDB.get().then(settings => {
      if (settings?.company_tagline) setTagline(settings.company_tagline);
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

  // Center active navigation button horizontally in its container
  useEffect(() => {
    if (activeSection) {
      const activeEl = document.getElementById(`nav-btn-${activeSection}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeSection]);

  useEffect(() => {
    if (!isHome) {
      const pageName = location.pathname.replace('/', '').toLowerCase();
      const activeEl = document.getElementById(`nav-btn-${pageName}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [location.pathname, isHome]);

  const scrollTo = (id: string) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const navItemClass = (isActive: boolean) =>
    `relative flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-[13px] font-medium whitespace-nowrap transition-colors duration-250 active:scale-95 group flex items-center justify-center ${
      isActive ? 'text-gold font-bold' : 'text-white/70 hover:text-white'
    }`;

  // Gold animated underline
  const Underline = ({ active }: { active: boolean }) => (
    <span className={`absolute bottom-1 left-1/2 h-[1.5px] rounded-full transition-all duration-300 ease-out ${
      active
        ? 'w-1/2 -translate-x-1/2 bg-gradient-to-r from-crimson via-gold to-crimson'
        : 'w-0 -translate-x-1/2 bg-gradient-to-r from-gold to-crimson group-hover:w-1/2'
    }`} />
  );

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 inset-x-0 z-50 transition-all duration-500 navbar-gold"
    >
      <div className="container-responsive">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img
              src={logoSrc}
              alt="Acadomix Logo"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { src: logoSrc, alt: 'Acadomix Logo' } }));
              }}
              className="h-11 w-11 sm:h-13 sm:w-13 rounded-2xl object-contain cursor-pointer active:scale-95 transition-transform shadow-lg shadow-crimson/20 border border-gold/30 hover:border-gold transition-colors"
            />
            <Link
              to="/"
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex flex-col items-start active:scale-95 transition-transform"
            >
              <span className="text-xs sm:text-lg md:text-2xl font-black tracking-[0.1em] sm:tracking-[0.15em] text-gradient uppercase leading-none">
                ACADOMIX
              </span>
              <span className="text-[6px] sm:text-[9px] md:text-[10px] font-extrabold text-gradient tracking-[0.02em] sm:tracking-[0.05em] uppercase leading-none mt-0.5 sm:mt-1">
                {tagline}
              </span>
            </Link>
          </div>

          {/* Nav Links - Unified Solid Glass Pill */}
          <div className="flex-1 max-w-[50%] sm:max-w-xl mx-2 sm:mx-4 overflow-hidden flex justify-center">
            <nav className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-full glass-pill-solid border border-gold/25 overflow-x-auto small-header-scrollbar whitespace-nowrap max-w-full">
              {sectionLinks.map((link) => (
                <button
                  key={link.name}
                  id={`nav-btn-${link.id}`}
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
                  id={`nav-btn-${link.name.toLowerCase()}`}
                  to={link.href}
                  className={navItemClass(location.pathname === link.href)}
                >
                  {link.name}
                  <Underline active={location.pathname === link.href} />
                </Link>
              ))}
            </nav>
          </div>

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
