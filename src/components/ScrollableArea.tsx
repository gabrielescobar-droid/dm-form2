import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ScrollableArea({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollUp(scrollTop > 0);
      // use a tiny buffer for floating point pixel values
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    // Wait a tick for layout shifts
    const timeout = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  return (
    <div className={`relative flex flex-col overflow-hidden ${className}`}>
      <AnimatePresence>
        {canScrollUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--bg)] via-[var(--bg)] to-transparent z-10 pointer-events-none flex items-start justify-center pt-3 rounded-t-2xl"
          >
            <div className="flex flex-col items-center gap-0.5 text-[10px] uppercase font-bold text-[var(--accent)] tracking-widest drop-shadow-md">
              <ChevronUp size={16} />
              <span>Scroll Up</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex-1 overflow-y-auto dm-scroll z-0 pb-12"
      >
        {children}
      </div>

      <AnimatePresence>
        {canScrollDown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent z-10 pointer-events-none flex items-end justify-center pb-4 rounded-b-2xl"
          >
             <div className="flex flex-col items-center gap-0.5 text-[11px] uppercase font-bold text-[var(--accent)] tracking-widest drop-shadow-md">
               <span>Scroll Down</span>
               <ChevronDown size={16} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
