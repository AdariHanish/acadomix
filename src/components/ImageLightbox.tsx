import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

interface Props {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

import useLockBodyScroll from '../hooks/useLockBodyScroll';

export default function ImageLightbox({ src, alt = 'Image', onClose }: Props) {
  useLockBodyScroll(src !== null);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
            src={src}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl shadow-black"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Helper: wrap any img element with a click-to-enlarge behaviour */
export function ClickableImage({
  src, alt = 'Image', className = ''
}: { src: string; alt?: string; className?: string }) {
  return (
    <div
      className="relative group cursor-zoom-in"
      onClick={() => {
        // Dispatch a custom event to open the global lightbox
        window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { src, alt } }));
      }}
    >
      <img src={src} alt={alt} className={className} />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center rounded-inherit">
        <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
      </div>
    </div>
  );
}
