import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const TypewriterSegment = ({ text, delay, onComplete, isBold = false }: { text: string, delay: number, onComplete?: () => void, isBold?: boolean }) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let timeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 20); // Typing speed
    return () => clearInterval(interval);
  }, [text, started]);

  if (isBold) {
    return <strong className="font-bold underline decoration-2 underline-offset-4 decoration-[var(--accent)]">{displayed}</strong>;
  }
  return <span>{displayed}</span>;
};

export const WelcomeView: React.FC<{ key?: string; onNext: () => void }> = ({ onNext }) => {
  const [step, setStep] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassCard className="text-center relative overflow-hidden p-6 md:p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            variants={{
              hidden: { opacity: 0, filter: "blur(10px)", scale: 0.95 },
              visible: { opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 1, ease: "easeOut" } }
            }}
            onAnimationComplete={() => setStep(1)}
            className="text-3xl md:text-4xl font-bold tracking-tight text-dm-gradient mb-6"
          >
            Congratulations!
          </motion.h1>
          
          <div className="text-left space-y-6 text-[var(--fg)] leading-relaxed mb-8 text-base md:text-lg min-h-[160px]">
            <p>
              {step >= 1 && <TypewriterSegment text="You have successfully booked your " delay={200} onComplete={() => setStep(2)} />}
              {step >= 2 && <TypewriterSegment text="Orientation Session" isBold delay={0} onComplete={() => setStep(3)} />}
              {step >= 3 && <TypewriterSegment text="! We are thrilled to welcome you." delay={0} onComplete={() => setStep(4)} />}
            </p>
            <p>
              {step >= 4 && <TypewriterSegment text="Before you meet your mentor, you'll connect with your dedicated " delay={200} onComplete={() => setStep(5)} />}
              {step >= 5 && <TypewriterSegment text="Onboarding Specialist" isBold delay={0} onComplete={() => setStep(6)} />}
              {step >= 6 && <TypewriterSegment text=". They will help connect you with your mentor and show you how to use Circle (the platform for our exclusive courses, live sessions, and much more)." delay={0} onComplete={() => setStep(7)} />}
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: step >= 7 ? 1 : 0, y: step >= 7 ? 0 : 15 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 mt-6"
          >
            <p className="text-sm md:text-base text-[var(--fg)] font-bold text-center">
              To provide a personalized experience, please complete this short form.
            </p>
            <button
              onClick={() => {
                trackEvent('start_form_clicked');
                onNext();
              }}
              disabled={step < 7}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] active:scale-95 font-medium py-3.5 px-8 rounded-xl transition-all duration-200 inline-flex items-center gap-2 border border-[var(--border)] shadow-lg w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Customize My Experience <ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}
