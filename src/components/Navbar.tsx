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
    `relative flex-shrink-0 px-4 py-1.5 sm:px-5 sm:py-2 mx-1 text-[11px] sm:text-[13px] font-medium whitespace-nowrap transition-all duration-300 active:scale-95 group rounded-full glass-card flex items-center justify-center ${
      isActive ? 'border-gold text-white shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'border-white/10 text-white/70 hover:text-white hover:border-gold/50'
    }`;

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
              onClick={() => { AdminAuth.logout(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hidden min-[400px]:inline text-lg sm:text-xl md:text-2xl font-black tracking-[0.15em] text-gradient uppercase active:scale-95 transition-transform"
            >
              ACADOMIX
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center overflow-x-auto hide-scrollbar mx-1 sm:mx-3 flex-1 justify-start sm:justify-center px-2 py-2">
            {sectionLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollTo(link.id)}
                className={navItemClass(activeSection === link.id)}
              >
                {link.name}
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
