import React from 'react';

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`liquid-glass rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
