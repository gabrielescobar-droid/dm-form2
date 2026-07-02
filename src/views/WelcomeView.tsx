import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export const WelcomeView: React.FC<{ key?: string; onNext: () => void }> = ({ onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassCard className="text-center relative overflow-hidden p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-dm-gradient mb-4">
          Congratulations!
        </h1>
        
        <div className="text-left space-y-6 text-[var(--fg)] leading-relaxed mb-8 text-base md:text-lg">
          <p>
            You have successfully booked your <strong className="font-bold underline decoration-2 underline-offset-4 decoration-[var(--accent)]">Orientation Session</strong>! We are thrilled to welcome you.
          </p>
          <p>
            Before you meet your mentor, you'll connect with your dedicated <strong className="font-bold underline decoration-2 underline-offset-4 decoration-[var(--accent)]">Onboarding Specialist</strong>. They will show you how to use Circle—the platform for our exclusive courses, live sessions, and much more.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-sm md:text-base text-[var(--fg)] font-bold text-center">
            Please complete this short form so we can provide a personalized experience.
          </p>
          <button
            onClick={() => {
              trackEvent('start_form_clicked');
              onNext();
            }}
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] active:scale-95 font-medium py-3.5 px-8 rounded-xl transition-all duration-200 inline-flex items-center gap-2 border border-[var(--border)] shadow-lg w-full md:w-auto justify-center"
          >
            Continue to Form <ArrowRight size={18} />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
