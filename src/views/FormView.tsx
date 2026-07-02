import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { ScrollableArea } from '../components/ScrollableArea';
import { FormData } from '../types';
import { ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const TIMEZONES = [
  'US Eastern', 'US Central', 'US Mountain', 'US Pacific', 'Central Europe', 'Sydney', 'Other'
];
const FRANJAS = ['Morning', 'Afternoon', 'Evening'];

interface Props {
  key?: string;
  formData: FormData;
  updateData: (data: Partial<FormData>) => void;
  onComplete: () => void | Promise<void>;
}

export const FormView: React.FC<Props> = ({ formData, updateData, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const nextStep = () => {
    trackEvent('form_step_completed', { step_number: step });
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      trackEvent('form_fully_completed');
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const progress = (step / totalSteps) * 100;

  React.useEffect(() => {
    trackEvent('form_step_viewed', { step_number: step });
  }, [step]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full max-w-2xl mx-auto flex flex-col"
    >
      <GlassCard className="flex-1 flex flex-col p-0 md:p-0 overflow-hidden relative h-[75vh] max-h-[600px]">
        {/* Progress Bar */}
        <div className="h-2 w-full bg-[var(--border)] relative z-20">
          <motion.div
            className="absolute top-0 left-0 h-full bg-[var(--accent)] shadow-[0_0_12px_rgba(56,114,238,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Header navigation */}
        <div className="flex items-center justify-between p-6 z-20 relative">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`p-2 rounded-lg transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-[var(--border)] text-[var(--fg-muted)]'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-medium tracking-widest text-[var(--fg-muted)] uppercase">
            Step {step} of {totalSteps}
          </span>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        <ScrollableArea className="flex-1 px-6 md:px-12 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-dm-gradient">What's your best email?</h2>
                  <p className="text-[var(--fg-muted)] text-sm">We'll use this to find your profile and keep your information in our database.</p>
                  
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateData({ email: e.target.value })}
                    placeholder="Enter your email address"
                    className="w-full bg-[var(--bg)] border-2 border-[var(--border)] hover:border-[var(--border-hover)] rounded-xl p-4 text-[var(--fg)] font-medium focus:outline-none focus:border-[var(--accent)] transition-colors shadow-sm"
                  />

                  <button
                    onClick={() => {
                      if (formData.email) {
                        trackEvent('question_answered', { question: 'email', answer: 'provided' });
                        nextStep();
                      }
                    }}
                    disabled={!formData.email || !formData.email.includes('@')}
                    className="mt-4 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] text-[var(--accent-fg)] font-medium py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-transparent shadow-lg"
                  >
                    Next <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-dm-gradient">Best time to reach you</h2>
                  
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[var(--fg)]">Timezone</label>
                    <div className="relative">
                      <select
                        value={formData.timezone}
                        onChange={(e) => updateData({ timezone: e.target.value })}
                        className="w-full bg-[var(--bg)] border-2 border-[var(--border)] hover:border-[var(--border-hover)] rounded-xl p-4 pr-12 text-[var(--fg)] font-medium appearance-none focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer shadow-sm"
                      >
                        <option value="" disabled>Select your timezone</option>
                        {TIMEZONES.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--fg-muted)]">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[var(--fg)]">Availability (Select all that apply)</label>
                    <div className="flex flex-wrap gap-3">
                      {FRANJAS.map(f => {
                        const isSelected = formData.franja.includes(f);
                        return (
                          <button
                            key={f}
                            onClick={() => {
                              const newFranja = isSelected
                                ? formData.franja.filter(item => item !== f)
                                : [...formData.franja, f];
                              updateData({ franja: newFranja });
                            }}
                            className={`px-6 py-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 font-medium shadow-sm cursor-pointer ${
                              isSelected 
                                ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] shadow-[0_4px_12px_rgba(56,114,238,0.1)]' 
                                : 'bg-[var(--bg)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--border-hover)] hover:shadow-md'
                            }`}
                          >
                            {isSelected && <Check size={18} />}
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      trackEvent('question_answered', { question: 'timezone', answer: formData.timezone });
                      trackEvent('question_answered', { question: 'franja', answer: formData.franja.join(',') });
                      nextStep();
                    }}
                    disabled={!formData.timezone || formData.franja.length === 0}
                    className="mt-4 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] text-[var(--accent-fg)] font-medium py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-transparent shadow-lg"
                  >
                    Next <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {step === 3 && (
                <RadioQuestion
                  title="Tech check"
                  subtitle="Will you be using a laptop or desktop computer?"
                  options={['Yes', 'Phone only']}
                  value={formData.laptop}
                  onChange={(val) => {
                    updateData({ laptop: val });
                    trackEvent('question_answered', { question: 'laptop', answer: val });
                    setTimeout(nextStep, 300);
                  }}
                />
              )}

              {step === 4 && (
                <RadioQuestion
                  title="Zoom desktop app"
                  subtitle="Do you have the Zoom desktop app installed?"
                  options={['Installed', 'Not yet']}
                  value={formData.zoom}
                  onChange={(val) => {
                    updateData({ zoom: val });
                    trackEvent('question_answered', { question: 'zoom', answer: val });
                    setTimeout(nextStep, 300);
                  }}
                />
              )}

              {step === 5 && (
                <RadioQuestion
                  title="Circle community"
                  subtitle="Have you joined our Circle community platform?"
                  options={["I'm in", 'Not yet', 'Need help']}
                  value={formData.circle}
                  onChange={(val) => {
                    updateData({ circle: val });
                    trackEvent('question_answered', { question: 'circle', answer: val });
                    setTimeout(nextStep, 300);
                  }}
                />
              )}

              {step === 6 && (
                <RadioQuestion
                  title="Your setup"
                  subtitle="Are you using a Mouse or a Touchpad?"
                  options={['Mouse', 'Touchpad']}
                  value={formData.mouseTouchpad}
                  onChange={(val) => {
                    updateData({ mouseTouchpad: val });
                    trackEvent('question_answered', { question: 'mouseTouchpad', answer: val });
                    setTimeout(nextStep, 300);
                  }}
                />
              )}

              {step === 7 && (
                <RadioQuestion
                  title="Operating System"
                  subtitle="Are you on Windows or Mac?"
                  options={['Windows', 'Mac']}
                  value={formData.windowsMac}
                  onChange={(val) => {
                    updateData({ windowsMac: val });
                    trackEvent('question_answered', { question: 'windowsMac', answer: val });
                    setTimeout(nextStep, 300);
                  }}
                />
              )}

              {step === 8 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-dm-gradient">Anything to cover?</h2>
                  <p className="text-[var(--fg-muted)] text-sm">Is there anything specific you'd like us to know before the session? (Optional)</p>
                  
                  <textarea
                    value={formData.anythingElse}
                    onChange={(e) => updateData({ anythingElse: e.target.value })}
                    placeholder="Type your thoughts here..."
                    className="w-full h-40 bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none dm-scroll"
                  />

                  <button
                    onClick={() => {
                      if (formData.anythingElse) {
                        trackEvent('question_answered', { question: 'anythingElse', answer: 'provided' });
                      }
                      nextStep();
                    }}
                    className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] text-[var(--accent-fg)] font-medium py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  >
                    Awesome. You're ready to master DeFi! <Check size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollableArea>
      </GlassCard>
    </motion.div>
  );
}

function RadioQuestion({ title, subtitle, options, value, onChange }: { title: string, subtitle?: string, options: string[], value: string, onChange: (val: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-dm-gradient">{title}</h2>
        {subtitle && <p className="text-[var(--fg-muted)] text-sm">{subtitle}</p>}
      </div>
      
      <div className="flex flex-col gap-4">
        {options.map(opt => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group cursor-pointer shadow-sm ${
                isSelected 
                  ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] shadow-[0_4px_12px_rgba(56,114,238,0.1)]' 
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--border-hover)] hover:bg-[var(--card-bg)] hover:shadow-md'
              }`}
            >
              <span className="font-bold text-lg">{opt}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected ? 'border-[var(--accent)]' : 'border-[var(--border-hover)] group-hover:border-[var(--accent)]/50'
              }`}>
                {isSelected && <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
