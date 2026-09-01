import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Heart, Phone, Mail, MapPin, Shield } from 'lucide-react';
import { AdminAuth, AssetsDB, SettingsDB, getCachedData } from '../utils/storage';
import { SiteSettings } from '../types';
import LazyImage from './LazyImage';

const footerLinks = {
  Services: [
    { name: 'Mini Projects', href: '#services' }, { name: 'Major Projects', href: '#services' },
    { name: 'Websites', href: '#services' }, { name: 'Research Papers', href: '#services' },
    { name: 'Assignments', href: '#services' }, { name: 'Plagiarism Removal', href: '#services' },
  ],
  Company: [
    { name: 'How It Works', href: '#how-it-works' }, { name: 'Pricing', href: '#pricing' },
    { name: 'Reviews', href: '/reviews', isRoute: true }, { name: 'Payment', href: '/payment', isRoute: true },
    { name: 'Admin', href: '/admin', isRoute: true },
  ],
  Support: [
    { name: 'Contact Us', href: '#contact' },
    { name: 'WhatsApp', href: `https://wa.me/918897492936?text=${encodeURIComponent('Hi! Acadomix, I’m interested in discussing a project collaboration with you.')}`, external: true },
    { name: 'Privacy Policy', href: '#' }, { name: 'Terms', href: '#' },
  ],
};

export default function Footer() {
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  
  const handleFooterLinkClick = (item: any, categoryTitle: string) => {
    if (categoryTitle === 'Services') {
      let domain = item.name;
      if (item.name === 'Mini Projects') domain = 'Mini Project';
      else if (item.name === 'Major Projects') domain = 'Major Project';
      else if (item.name === 'Websites') domain = 'Website';
      else if (item.name === 'Research Papers') domain = 'Research Paper';
      else if (item.name === 'Assignments') domain = 'Assignment';
      else if (item.name === 'Plagiarism Removal') domain = 'Plagiarism Removal';
      
      window.dispatchEvent(new CustomEvent('select-service', { detail: domain }));
    } else {
      scrollTo(item.href.replace('#', ''));
    }
  };

  const [logoSrc, setLogoSrc] = useState(() => {
    return localStorage.getItem('acadomix_cached_logo') || '/images/logo-placeholder.png';
  });
  
  const [tagline, setTagline] = useState(() => {
    const cached = getCachedData<SiteSettings>('/settings');
    return cached?.company_tagline || 'Coding Your Ideas';
  });
  const [locationText, setLocationText] = useState(() => {
    const cached = getCachedData<SiteSettings>('/settings');
    return cached?.office_location_text || '65-5-259, VUDA Colony, Vizag - 530011';
  });
  const [locationLink, setLocationLink] = useState(() => {
    const cached = getCachedData<SiteSettings>('/settings');
    return cached?.office_location_link || 'https://maps.google.com/?q=VUDA+Colony+Visakhapatnam';
  });

  useEffect(() => {
    AssetsDB.get('logo').then(logo => {
      if (logo?.data) {
        setLogoSrc(logo.data);
        localStorage.setItem('acadomix_cached_logo', logo.data);
      }
    }).catch(() => {
      // Silently keep placeholder if API unavailable
    });
    
    SettingsDB.get().then(settings => {
      if (settings?.company_tagline) setTagline(settings.company_tagline);
      if (settings?.office_location_text) setLocationText(settings.office_location_text);
      if (settings?.office_location_link) setLocationLink(settings.office_location_link);
    }).catch(() => {
      // Keep defaults
    });
  }, []);

  return (
    <footer className="relative pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8">
      <div className="gold-divider mb-10 sm:mb-14" />
      <div className="container-responsive">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 mb-10 sm:mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <Link to="/" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-start gap-2.5 mb-3 sm:mb-5 group">
              <LazyImage 
                src={logoSrc} 
                alt="Acadomix" 
                spinnerSize="sm"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain border border-gold/20 group-active:scale-90 transition-transform shadow-lg shadow-crimson/10 mt-1"
              />
              <div className="flex flex-col items-start">
                <span className="text-lg sm:text-xl font-black tracking-[0.2em] text-gradient uppercase leading-none">ACADOMIX</span>
                <span className="text-[7px] sm:text-[9px] font-extrabold text-gradient tracking-[0.05em] uppercase mt-1.5 leading-none">{tagline}</span>
              </div>
            </Link>
            <p className="text-[10px] sm:text-sm text-white/25 leading-relaxed max-w-xs mb-4">
              Your trusted partner for academic projects. Student-friendly prices, expert delivery.
            </p>
            <div className="space-y-1.5 text-[10px] sm:text-sm">
              <a href="tel:+918897492936" className="flex items-center gap-2 text-white/25 hover:text-gold active:text-crimson transition-colors">
                <Phone className="w-3 h-3 flex-shrink-0" /> +91 88974 92936
              </a>
              <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=acadomix@gmail.com&su=${encodeURIComponent('Project Collaboration')}&body=${encodeURIComponent("Hi! Acadomix, I'm interested in discussing a project collaboration with you.")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/25 hover:text-gold active:text-crimson transition-colors">
                <Mail className="w-3 h-3 flex-shrink-0" /> acadomix@gmail.com
              </a>
              <a href={locationLink} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-white/25 hover:text-gold active:text-crimson transition-colors">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" /> {locationText}
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-[10px] sm:text-xs font-bold text-gold/50 mb-3 sm:mb-4 uppercase tracking-wider">{title}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {items.map((item: any, i: number) => (
                  <li key={i}>
                    {item.isRoute ? (
                      <Link to={item.href} className="text-[10px] sm:text-sm text-white/25 hover:text-white active:text-gold transition-colors flex items-center gap-1">
                        {item.name === 'Admin' && <Shield className="w-3 h-3" />}{item.name}
                      </Link>
                    ) : item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-sm text-white/25 hover:text-white active:text-gold transition-colors">{item.name}</a>
                    ) : (
                      <button onClick={() => handleFooterLinkClick(item, title)} className="text-[10px] sm:text-sm text-white/25 hover:text-white active:text-gold transition-colors text-left">{item.name}</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="gold-divider mb-5" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[9px] sm:text-xs text-white/15 flex items-center gap-1">
            © {new Date().getFullYear()} Acadomix. Made with <Heart className="w-2.5 h-2.5 text-crimson fill-crimson" /> for students.
          </p>
          <div className="flex items-center gap-2">
            <a href={`https://wa.me/918897492936?text=${encodeURIComponent('Hi! Acadomix, I’m interested in discussing a project collaboration with you.')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/25 hover:text-green-400 active:bg-green-500/10 transition-all text-xs">💬</a>
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=acadomix@gmail.com&su=${encodeURIComponent('Project Collaboration')}&body=${encodeURIComponent("Hi! Acadomix, I'm interested in discussing a project collaboration with you.")}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/25 hover:text-gold active:bg-gold/10 transition-all"><Mail className="w-3.5 h-3.5" /></a>
            <Link to="/admin" onClick={() => AdminAuth.logout()} className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/25 hover:text-crimson active:bg-crimson/10 transition-all"><Shield className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </div>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-[68px] sm:bottom-[84px] right-3 sm:right-5 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-crimson to-gold-dark text-white flex items-center justify-center shadow-lg shadow-crimson/20 btn-glow active:scale-90 transition-transform">
        <ArrowUp className="w-4 h-4" />
      </button>
    </footer>
  );
}
