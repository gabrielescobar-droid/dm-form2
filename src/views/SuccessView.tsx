import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { ScrollableArea } from '../components/ScrollableArea';
import { CheckCircle2, Copy, Mail } from 'lucide-react';

export function SuccessView() {
  const [copied, setCopied] = useState(false);
  const emailSender = "no-reply@notification.circle.so";

  const handleCopy = () => {
    navigator.clipboard.writeText(emailSender);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailLinks = [
    { name: 'Gmail', url: 'https://mail.google.com/mail/u/0/#search/in%3Aanywhere+from%3Ano-reply%40notification.circle.so' },
    { name: 'Outlook', url: 'https://outlook.live.com/mail/0/search?q=from%3Ano-reply%40notification.circle.so' },
    { name: 'Yahoo', url: 'https://login.yahoo.com/?.src=ym&pspid=159600001&activity=mail-direct&.lang=en-US&.intl=us&.done=https%3A%2F%2Fmail.yahoo.com%2Fd%2Fsearch%2Fkeyword%3Dno-reply%40notification.circle.so' },
    { name: 'AOL', url: 'https://mail.aol.com/d#search/query=no-reply%40notification.circle.so' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto flex flex-col"
    >
      <GlassCard className="flex-1 flex flex-col p-0 md:p-0 overflow-hidden relative max-h-[80vh]">
        <ScrollableArea className="flex-1 px-6 md:px-12 py-8">
          
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-[#1bbd7c]/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_4px_30px_rgba(27,189,124,0.15)]"
            >
              <CheckCircle2 size={32} className="text-[#1bbd7c]" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--fg)] mb-2">
              All set! You're ready to begin.
            </h1>
          </div>

          <div className="space-y-8 bg-[var(--bg)] p-6 md:p-8 rounded-2xl border border-[var(--border)] shadow-sm">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-dm-gradient mb-4">Getting Into Circle</h2>
              <p className="text-[var(--fg-muted)] text-sm md:text-base leading-relaxed mb-6">
                This is the first step, and the one that trips up about 1 in 3 people. Take it slow.
              </p>
            </div>

            <ol className="space-y-6 relative border-l border-[var(--border)] ml-3 md:ml-4">
              <StepItem number={1}>
                Open the email you signed up with and search for the sender:
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <code className="bg-[var(--card-bg)] px-3 py-2 rounded-lg text-[var(--accent)] font-mono text-xs md:text-sm border border-[var(--border)] break-all flex-1">
                    {emailSender}
                  </code>
                  <button 
                    onClick={handleCopy}
                    className="p-2 bg-[var(--border)] hover:bg-[var(--border-hover)] rounded-lg transition-colors flex items-center justify-center gap-2 text-xs text-[var(--fg)] min-w-[80px]"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-[#1bbd7c]" /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </StepItem>
              
              <StepItem number={2}>
                Open the email titled <strong>"Welcome to the DeFi Clan"</strong> or <strong>"Decentralized Masters Sent you an Invitation"</strong>.
              </StepItem>
              
              <StepItem number={3}>
                Click the black <strong>Accept Invitation</strong> button inside the email.
              </StepItem>
              
              <StepItem number={4}>
                A new tab opens on Circle. Fill in your details to finish your sign-up.
              </StepItem>
            </ol>

            <div className="pt-6 mt-6 border-t border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--fg)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Mail size={16} /> Fast Search Shortcuts
              </h3>
              <p className="text-sm text-[var(--fg-muted)] mb-4">
                Instead of searching by hand, tap your email provider below to jump straight to the invite.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {emailLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--border)] hover:bg-[var(--border-hover)] border border-transparent text-center py-3 px-4 rounded-xl text-[var(--fg)] text-sm font-medium transition-all hover:-translate-y-1"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

          </div>

        </ScrollableArea>
      </GlassCard>
    </motion.div>
  );
}

function StepItem({ number, children }: { number: number, children: React.ReactNode }) {
  return (
    <li className="pl-8 relative text-sm md:text-base text-[var(--fg)]">
      <div className="absolute -left-[17px] top-[-2px] w-8 h-8 rounded-full bg-[var(--accent)] border-4 border-[var(--card-bg)] flex items-center justify-center font-bold text-[var(--accent-fg)] text-sm shadow-sm">
        {number}
      </div>
      {children}
    </li>
  );
}
