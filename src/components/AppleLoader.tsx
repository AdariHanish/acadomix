import { motion } from 'framer-motion';

export default function AppleLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
    : "flex items-center justify-center w-full h-full min-h-[200px]";

  return (
    <div className={containerClass}>
      <motion.div
        className="relative flex items-center justify-center w-12 h-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Outer glowing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/10"
        />
        
        {/* Spinning gradient ring (Apple-style smooth spinner) */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-t-white/80 border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Inner subtle pulse */}
        <motion.div
          className="w-4 h-4 rounded-full bg-white/20 blur-[2px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
