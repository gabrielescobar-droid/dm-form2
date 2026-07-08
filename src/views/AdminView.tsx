import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Shield, ArrowLeft, ArrowRight, LogOut, Loader2, Users, Search, Activity, Mail, Download, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { FormData } from '../types';
import { ScrollableArea } from '../components/ScrollableArea';
import { format } from 'date-fns';

interface Submission extends FormData {
  id: string;
  createdAt: Date;
}

export function AdminView() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [funnelStats, setFunnelStats] = useState({ entered: 0, started: 0, maxSteps: {} as Record<number, number>, completed: 0 });
  const [rawFunnelData, setRawFunnelData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'DM2026*') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setError(null);
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setSubmissions([]);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'form_submissions', id));
        setSubmissions(prev => prev.filter(s => s.id !== id));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
      } catch (err: any) {
        setError('Error deleting submission: ' + err.message);
      }
    }
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const headers = ['ID', 'Email', 'Timezone', 'Availability', 'Hours/Week', 'Laptop', 'Zoom', 'Circle', 'Mouse/Touchpad', 'OS', 'Contact Methods', 'Anything Else', 'Date'];
    const rows = submissions.map(sub => [
      sub.id,
      sub.email,
      sub.timezone,
      sub.franja.join('; '),
      sub.hoursPerWeek,
      sub.laptop,
      sub.zoom,
      sub.circle,
      sub.mouseTouchpad,
      sub.windowsMac,
      sub.contactMethods?.join('; ') || '',
      sub.anythingElse.replace(/\n/g, ' '),
      format(sub.createdAt, 'yyyy-MM-dd HH:mm:ss')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DM_Submissions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          contactMethods: data.contactMethods || [],
          hoursPerWeek: data.hoursPerWeek || 'N/A',
          anythingElse: data.anythingElse || '',
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      setSubmissions(subs);

      const funnelQ = query(collection(db, 'funnel_tracking'));
      const funnelSnap = await getDocs(funnelQ);

      const rawFunnel: any[] = [];
      const userFunnelMap = new Map<string, any>();

      funnelSnap.forEach(doc => {
        const d = doc.data();
        rawFunnel.push(d);
        
        const uid = d.userId || doc.id; // fallback to sessionId if no userId
        
        if (!userFunnelMap.has(uid)) {
          userFunnelMap.set(uid, {
            entered: d.entered || false,
            started_form: d.started_form || false,
            completed: d.completed || false,
            max_step: d.max_step || 0
          });
        } else {
          const existing = userFunnelMap.get(uid);
          userFunnelMap.set(uid, {
            entered: existing.entered || d.entered,
            started_form: existing.started_form || d.started_form,
            completed: existing.completed || d.completed,
            max_step: Math.max(existing.max_step || 0, d.max_step || 0)
          });
        }
      });
      
      setRawFunnelData(rawFunnel);

      let entered = 0;
      let started = 0;
      let completed = 0;
      let maxSteps: Record<number, number> = {};
      
      userFunnelMap.forEach(d => {
        if (d.entered) entered++;
        if (d.started_form) started++;
        if (d.completed) completed++;
        if (d.max_step !== undefined) {
          maxSteps[d.max_step] = (maxSteps[d.max_step] || 0) + 1;
        }
      });

      setFunnelStats({ entered, started, completed, maxSteps });

    } catch (err: any) {
      setError('Error fetching data. ' + err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const getMetrics = () => {
    const total = submissions.length;
    if (total === 0) return null;
    
    const countIf = (key: keyof Submission, checkValue: string) => {
       return submissions.filter(s => {
         const v = s[key] as string;
         if (!v) return false;
         return v.toLowerCase().includes(checkValue.toLowerCase());
       }).length;
    };

    const hasZoom = countIf('zoom', 'sí') || countIf('zoom', 'installed');
    const isMac = countIf('windowsMac', 'mac');
    const isWindows = countIf('windowsMac', 'windows');
    const hasLaptop = countIf('laptop', 'sí') || countIf('laptop', 'yes');
    const hasJoinedCircle = countIf('circle', 'sí') || countIf('circle', 'i\'m in');
    const hasMouse = countIf('mouseTouchpad', 'mouse');
    
    const prefersEmail = submissions.filter(s => s.contactMethods?.includes('Email')).length;
    const prefersSMS = submissions.filter(s => s.contactMethods?.includes('SMS')).length;
    const prefersPhone = submissions.filter(s => s.contactMethods?.includes('Phone call')).length;
    
    return {
      total,
      zoom: { count: hasZoom, pct: Math.round((hasZoom / total) * 100) },
      mac: { count: isMac, pct: Math.round((isMac / total) * 100) },
      windows: { count: isWindows, pct: Math.round((isWindows / total) * 100) },
      laptop: { count: hasLaptop, pct: Math.round((hasLaptop / total) * 100) },
      circle: { count: hasJoinedCircle, pct: Math.round((hasJoinedCircle / total) * 100) },
      mouse: { count: hasMouse, pct: Math.round((hasMouse / total) * 100) },
      email: { count: prefersEmail, pct: Math.round((prefersEmail / total) * 100) },
      sms: { count: prefersSMS, pct: Math.round((prefersSMS / total) * 100) },
      phone: { count: prefersPhone, pct: Math.round((prefersPhone / total) * 100) },
    };
  };

  const metrics = getMetrics();

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto mt-12 px-4">
        <GlassCard className="text-center p-8">
          <div className="w-16 h-16 bg-[#e0455a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={32} className="text-[#e0455a]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--fg)] mb-2">Admin Access</h1>
          <p className="text-[var(--fg-muted)] mb-8">
            Please enter the admin password.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-3.5 text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                autoFocus
              />
            </div>
            {error && (
              <div className="text-[#e0455a] text-sm text-left">{error}</div>
            )}
            <button 
              type="submit"
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] font-medium py-3.5 px-6 rounded-xl transition-all shadow-md"
            >
              Sign In
            </button>
          </form>

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
          <button 
            onClick={handleLogout}
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
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[var(--fg-muted)] bg-[var(--border)] px-2 py-1 rounded-md">{selectedSubmission.id}</span>
              <button
                onClick={() => handleDelete(selectedSubmission.id)}
                className="p-1.5 rounded-md hover:bg-[#e0455a]/10 text-[#e0455a] transition-colors"
                title="Delete submission"
              >
                <Trash2 size={18} />
              </button>
            </div>
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

              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 shadow-sm col-span-1 md:col-span-2">
                <div className="flex flex-col">
                  <DetailRow label="Timezone" value={selectedSubmission.timezone} />
                  <DetailRow label="Availability" value={selectedSubmission.franja.join(', ')} />
                  <DetailRow label="Hours/Week" value={selectedSubmission.hoursPerWeek} />
                  <DetailRow label="Using Laptop" value={selectedSubmission.laptop} />
                  <DetailRow label="Zoom Installed" value={selectedSubmission.zoom} />
                  <DetailRow label="Joined Circle" value={selectedSubmission.circle} />
                  <DetailRow label="Mouse/Touchpad" value={selectedSubmission.mouseTouchpad} />
                  <DetailRow label="OS" value={selectedSubmission.windowsMac} />
                  <DetailRow label="Contact Preference" value={selectedSubmission.contactMethods?.join(', ') || 'None'} />
                </div>
              </div>
              
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 shadow-sm col-span-1 md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-2">Additional Notes</h3>
                <p className="text-[var(--fg)] whitespace-pre-wrap">{selectedSubmission.anythingElse || 'None'}</p>
              </div>

              {(() => {
                const userIds = new Set(rawFunnelData.filter(d => d.email === selectedSubmission.email && d.userId).map(d => d.userId));
                const userSessions = rawFunnelData.filter(d => d.email === selectedSubmission.email || (d.userId && userIds.has(d.userId)));
                const entered = userSessions.filter(d => d.entered).length;
                const started = userSessions.filter(d => d.started_form).length;
                const completed = userSessions.filter(d => d.completed).length;

                return (
                  <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 shadow-sm col-span-1 md:col-span-2 mt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3">User Journey (Total Attempts)</h3>
                    <div className="flex gap-8">
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--fg-muted)]">App Entries</span>
                        <span className="font-bold text-[var(--fg)] text-lg">{entered}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--fg-muted)]">Form Starts</span>
                        <span className="font-bold text-[var(--fg)] text-lg">{started}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--fg-muted)]">Completions</span>
                        <span className="font-bold text-[var(--fg)] text-lg">{completed}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
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

            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[var(--fg-muted)] border-b border-[var(--border)] pb-2">Funnel Metrics</h3>
              <div className="space-y-3">
                <MetricRow label="Entered App" count={funnelStats.entered} pct={100} />
                <MetricRow label="Started Form" count={funnelStats.started} pct={funnelStats.entered ? Math.round((funnelStats.started / funnelStats.entered) * 100) : 0} />
                <MetricRow label="Completed" count={funnelStats.completed} pct={funnelStats.entered ? Math.round((funnelStats.completed / funnelStats.entered) * 100) : 0} />
              </div>
              {Object.keys(funnelStats.maxSteps).length > 0 && (
                <div className="mt-4 text-xs text-[var(--fg-muted)] space-y-1">
                  <div className="font-bold mb-2">Drop-offs by Step:</div>
                  {Object.entries(funnelStats.maxSteps).sort(([a], [b]) => Number(a) - Number(b)).map(([step, count]) => (
                    <div key={step} className="flex justify-between">
                      <span>Step {step}</span>
                      <span>{count} user{count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {metrics && (
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[var(--fg-muted)] border-b border-[var(--border)] pb-2">Insights</h3>
                <div className="space-y-3">
                  <MetricRow label="Zoom Installed" count={metrics.zoom.count} pct={metrics.zoom.pct} />
                  <MetricRow label="Mac Users" count={metrics.mac.count} pct={metrics.mac.pct} />
                  <MetricRow label="Windows Users" count={metrics.windows.count} pct={metrics.windows.pct} />
                  <MetricRow label="Using Laptop" count={metrics.laptop.count} pct={metrics.laptop.pct} />
                  <MetricRow label="Using Mouse" count={metrics.mouse.count} pct={metrics.mouse.pct} />
                  <MetricRow label="Joined Circle" count={metrics.circle.count} pct={metrics.circle.pct} />
                  <MetricRow label="Prefers Email" count={metrics.email.count} pct={metrics.email.pct} />
                  <MetricRow label="Prefers SMS" count={metrics.sms.count} pct={metrics.sms.pct} />
                  <MetricRow label="Prefers Phone" count={metrics.phone.count} pct={metrics.phone.pct} />
                </div>
              </div>
            )}
            
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
            <div className="p-4 border-b border-[var(--border)] bg-[var(--card-bg)] sticky top-0 z-10 flex items-center justify-between">
              <h2 className="font-bold text-[var(--fg)] flex items-center gap-2">
                <Search size={18} /> Responses
              </h2>
              <button
                onClick={handleExportCSV}
                disabled={submissions.length === 0}
                className="flex items-center gap-2 p-1.5 px-3 bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                <Download size={14} /> Export CSV
              </button>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)] last:border-0 gap-4">
      <span className="text-sm font-medium text-[var(--fg-muted)]">{label}</span>
      <span className="text-sm font-bold text-[var(--fg)] text-right">{value}</span>
    </div>
  );
}

function MetricRow({ label, count, pct }: { label: string; count: number; pct: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-[var(--fg)]">{label}</span>
        <span className="font-bold text-[var(--fg-muted)]">{count} ({pct}%)</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" 
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

