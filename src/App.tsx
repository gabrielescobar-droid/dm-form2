import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { WelcomeView } from './views/WelcomeView';
import { FormView } from './views/FormView';
import { SuccessView } from './views/SuccessView';
import { AdminView } from './views/AdminView';
import { FormData, INITIAL_FORM_DATA } from './types';
import { Moon, Sun } from 'lucide-react';
import { trackPageView, trackEvent } from './utils/analytics';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function MainApp() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [currentView, setCurrentView] = useState<'welcome' | 'form' | 'success'>('welcome');

  useEffect(() => {
    trackPageView(`/${currentView}`);
  }, [currentView]);

  const handleFormComplete = async () => {
    try {
      await addDoc(collection(db, 'form_submissions'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      trackEvent('form_submission_success');
    } catch (error) {
      console.error('Error submitting form', error);
      trackEvent('form_submission_error', { error: String(error) });
    }
    setCurrentView('success');
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 pb-4 md:px-6 w-full max-w-7xl mx-auto relative z-10">
      <AnimatePresence mode="wait">
        {currentView === 'welcome' && (
          <WelcomeView key="welcome" onNext={() => setCurrentView('form')} />
        )}
        {currentView === 'form' && (
          <FormView 
            key="form"
            formData={formData} 
            updateData={(data) => setFormData(prev => ({ ...prev, ...data }))}
            onComplete={handleFormComplete} 
          />
        )}
        {currentView === 'success' && (
          <SuccessView key="success" />
        )}
      </AnimatePresence>
    </div>
  );
}

function Layout() {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (clickCount >= 3) {
      setClickCount(0);
      navigate('/admin');
    }
    
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 1000);
      return () => clearTimeout(timer);
    }
  }, [clickCount, navigate]);

  return (
    <div className="flex-1 flex flex-col relative w-full h-[100dvh]">
      {/* Background ambient glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent)] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#011D6F] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />
      
      {/* Navbar Frame */}
      <header className="w-full relative z-20 px-6 pt-6 pb-2 flex items-center justify-between max-w-7xl mx-auto shrink-0">
        <div className="w-10"></div> {/* Spacer to center logo */}
        
        <button 
          onClick={() => setClickCount(prev => prev + 1)}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:outline-none flex items-center justify-center bg-white"
        >
          {!imgError ? (
            <img 
              src="https://i.ibb.co/JR4GZdDm/image-22.png" 
              alt="DM Logo" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-[1.15]" 
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="font-bold text-xl md:text-2xl tracking-tight text-[#011D6F]">DM</span>
          )}
        </button>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-hover)] transition-all"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
