import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminView() {
  return (
    <div className="w-full max-w-lg mx-auto mt-12">
      <GlassCard className="text-center p-6 md:p-8">
        <div className="w-16 h-16 bg-[#e0455a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield size={32} className="text-[#e0455a]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/60 mb-8">
          This section is restricted to authorized personnel. Content will be populated based on future requirements.
        </p>
        
        <Link 
          to="/"
          className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all inline-block"
        >
          Return to App
        </Link>
      </GlassCard>
    </div>
  );
}
