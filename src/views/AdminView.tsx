import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Shield, ArrowLeft, ArrowRight, LogOut, Loader2, Users, Search, Activity, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { FormData } from '../types';
import { ScrollableArea } from '../components/ScrollableArea';
import { format } from 'date-fns';

interface Submission extends FormData {
  id: string;
  createdAt: Date;
}

export function AdminView() {
  const [user, setUser] = useState(auth.currentUser);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoadingAuth(false);
      if (u) {
        fetchSubmissions();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchSubmissions = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const q = query(collection(db, 'form_submissions'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const subs: Submission[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        subs.push({
          id: doc.id,
          email: data.email || 'N/A',
          timezone: data.timezone || 'N/A',
          franja: data.franja || [],
          laptop: data.laptop || 'N/A',
          zoom: data.zoom || 'N/A',
          circle: data.circle || 'N/A',
          mouseTouchpad: data.mouseTouchpad || 'N/A',
          windowsMac: data.windowsMac || 'N/A',
          anythingElse: data.anythingElse || '',
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      setSubmissions(subs);
    } catch (err: any) {
      setError('Error fetching data. Ensure you are an admin. ' + err.message);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto mt-12 px-4">
        <GlassCard className="text-center p-8">
          <div className="w-16 h-16 bg-[#e0455a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={32} className="text-[#e0455a]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--fg)] mb-2">Admin Access</h1>
          <p className="text-[var(--fg-muted)] mb-8">
            Please sign in to access the admin dashboard.
          </p>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] font-medium py-3.5 px-6 rounded-xl transition-all shadow-md"
          >
            Sign in with Google
          </button>
          
          <Link 
            to="/"
            className="block mt-4 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
          >
            Return to App
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 bg-[var(--card-bg)] rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] border border-[var(--border)] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[var(--fg-muted)] hidden md:inline">{user.email}</span>
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 p-2 px-4 bg-[var(--card-bg)] rounded-lg text-[#e0455a] border border-[#e0455a]/20 hover:bg-[#e0455a]/10 transition-colors font-medium text-sm"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#e0455a]/10 border border-[#e0455a]/20 text-[#e0455a] p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {selectedSubmission ? (
        <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative">
          <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--card-bg)] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-md hover:bg-[var(--border)] transition-colors text-[var(--fg)]"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="font-bold text-[var(--fg)]">Submission Details</h2>
            </div>
            <span className="text-xs font-mono text-[var(--fg-muted)] bg-[var(--border)] px-2 py-1 rounded-md">{selectedSubmission.id}</span>
          </div>
          <ScrollableArea className="flex-1 p-6">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 shadow-sm col-span-1 md:col-span-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-1">User Email</h3>
                  <div className="flex items-center gap-2 text-[var(--fg)] font-medium text-lg">
                    <Mail size={18} className="text-[var(--accent)]" /> {selectedSubmission.email}
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-1">Submitted</h3>
                  <div className="text-[var(--fg)] font-medium">
                    {format(selectedSubmission.createdAt, 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>

              <DetailItem label="Timezone" value={selectedSubmission.timezone} />
              <DetailItem label="Availability" value={selectedSubmission.franja.join(', ')} />
              <DetailItem label="Using Laptop" value={selectedSubmission.laptop} />
              <DetailItem label="Zoom Installed" value={selectedSubmission.zoom} />
              <DetailItem label="Joined Circle" value={selectedSubmission.circle} />
              <DetailItem label="Mouse/Touchpad" value={selectedSubmission.mouseTouchpad} />
              <DetailItem label="OS" value={selectedSubmission.windowsMac} />
              
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 shadow-sm col-span-1 md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-2">Additional Notes</h3>
                <p className="text-[var(--fg)] whitespace-pre-wrap">{selectedSubmission.anythingElse || 'None'}</p>
              </div>
            </div>
          </ScrollableArea>
        </GlassCard>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 h-full pb-6">
          {/* Sidebar Metrics */}
          <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-[var(--fg-muted)]">
                <Users size={20} />
                <h3 className="font-bold text-sm">Total Submissions</h3>
              </div>
              <div className="text-4xl font-bold text-[var(--fg)]">
                {loadingData ? <Loader2 className="animate-spin text-sm" size={24} /> : submissions.length}
              </div>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-[var(--fg-muted)]">
                <Activity size={20} />
                <h3 className="font-bold text-sm">Recent Activity</h3>
              </div>
              <div className="text-2xl font-bold text-[var(--fg)]">
                {loadingData ? <Loader2 className="animate-spin text-sm" size={24} /> : submissions.filter(s => s.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <span className="text-xs font-medium text-[var(--fg-muted)]">last 7 days</span>
            </div>
          </div>

          {/* Submissions List */}
          <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative">
            <div className="p-4 border-b border-[var(--border)] bg-[var(--card-bg)] sticky top-0 z-10">
              <h2 className="font-bold text-[var(--fg)] flex items-center gap-2">
                <Search size={18} /> Responses
              </h2>
            </div>
            
            <ScrollableArea className="flex-1">
              {loadingData ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
                </div>
              ) : submissions.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-[var(--fg-muted)]">
                  No submissions yet.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {submissions.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className="w-full text-left p-4 hover:bg-[var(--card-bg)] transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-[var(--fg)] text-sm mb-1">{sub.email}</div>
                        <div className="text-xs font-medium text-[var(--fg-muted)] flex items-center gap-2">
                          <span className="bg-[var(--border)] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{sub.timezone}</span>
                          {format(sub.createdAt, 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                    </button>
                  ))}
                </div>
              )}
            </ScrollableArea>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-1">{label}</h3>
      <div className="text-[var(--fg)] font-medium">{value}</div>
    </div>
  );
}

