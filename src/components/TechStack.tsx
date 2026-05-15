import { motion } from 'framer-motion';

const tech = [
  { name: 'React', color: '#61DAFB' }, { name: 'Next.js', color: '#ffffff' }, { name: 'Python', color: '#3776AB' },
  { name: 'Java', color: '#ED8B00' }, { name: 'Node.js', color: '#339933' }, { name: 'Flutter', color: '#02569B' },
  { name: 'Django', color: '#092E20' }, { name: 'MongoDB', color: '#47A248' }, { name: 'MySQL', color: '#4479A1' },
  { name: 'Firebase', color: '#FFCA28' }, { name: 'TensorFlow', color: '#FF6F00' }, { name: 'AWS', color: '#FF9900' },
  { name: 'Docker', color: '#2496ED' }, { name: 'TypeScript', color: '#3178C6' }, { name: 'Tailwind', color: '#06B6D4' },
  { name: 'WordPress', color: '#21759B' },
];

export default function TechStack() {
  return (
    <section className="relative py-10 sm:py-14 lg:py-16 overflow-hidden">
      <div className="gold-divider mb-10 sm:mb-14" />
      <div className="container-responsive mb-6 sm:mb-8 text-center">
        <p className="text-[10px] sm:text-xs text-gold/40 uppercase tracking-widest">Technologies We Master</p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }} className="flex gap-2 sm:gap-3">
          {[...tech, ...tech].map((t, i) => (
            <div key={i} className="flex-shrink-0 glass-card rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
              <span className="text-[10px] sm:text-xs text-white/35 font-medium whitespace-nowrap">{t.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="gold-divider mt-10 sm:mt-14" />
    </section>
  );
}
