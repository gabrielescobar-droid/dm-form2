import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function WelcomeView({ onNext }: { onNext: () => void }) {
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
        
        <div className="text-left space-y-4 text-[var(--fg)] leading-relaxed mb-6 font-light text-base md:text-lg">
          <p>
            You have successfully booked your <strong><u>orientation session</u></strong>! We are thrilled to welcome you to Decentralized Masters.
          </p>
          <p>
            The next person you will meet is your dedicated <strong><u>Onboarding Specialist</u></strong>. They will show you where to find our <em>exclusive courses</em>, how to join the <em>live sessions</em>, and how to interact with the community.
          </p>
          <p>
            Please complete this short form so we can provide you with a <strong><u>personalized experience</u></strong> right from the start.
          </p>
        </div>

        <button
          onClick={onNext}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] active:scale-95 font-medium py-3.5 px-8 rounded-xl transition-all duration-200 inline-flex items-center gap-2 border border-[var(--border)] shadow-lg"
        >
          Continue to Form <ArrowRight size={18} />
        </button>
      </GlassCard>
    </motion.div>
  );
}
