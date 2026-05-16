import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/919515192936?text=${encodeURIComponent('Hi! Acadomix, I’m interested in discussing a project collaboration with you.')}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 250 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/40 animate-pulse-glow group"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
      
      {/* Ripple Effect */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
      
      {/* Tooltip - Desktop only */}
      <span className="hidden sm:block absolute right-full mr-3 px-4 py-2 bg-surface-2 text-white text-sm font-medium rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl border border-white/10">
        Chat with us! 💬
      </span>
    </motion.a>
  );
}
