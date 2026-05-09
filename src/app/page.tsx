'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getLocationHealthAlerts } from '@/lib/api';
import { 
  Leaf, ArrowRight, ShieldCheck, Zap, Camera, LogOut,
  ChevronRight, Flame, Utensils, Apple, Droplets, 
  AlertTriangle, Thermometer, Users, Activity, Target, Swords
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isLoggedIn, preferences, login, logout, loading, challenges } = useUser();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [locationAlerts, setLocationAlerts] = useState<any>(null);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn && preferences?.city && !locationAlerts) {
      setLoadingAlerts(true);
      getLocationHealthAlerts(preferences.city)
        .then(data => setLocationAlerts(data))
        .finally(() => setLoadingAlerts(false));
    }
  }, [isLoggedIn, preferences?.city]);

  if (!mounted || loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem', color: 'var(--primary-foreground)' }}>
          <Leaf size={32} className="animate-spin" />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500 }}>Initializing NutriScan AI...</p>
      </div>
    );
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (!isLoginView && !city.trim()) {
        setAuthError('City is mandatory for location-aware health insights.');
        return;
      }
      await login(email, password, !isLoginView, username, city);
      if (isLoginView && preferences) {
        router.push('/');
      } else if (!isLoginView) {
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error('Firebase error:', err);
      setAuthError(err.message || 'An error occurred. Please check your credentials.');
    }
  };

  const riskTheme = (risk: string) => {
    if (risk === 'high') return { bg: 'rgba(239, 68, 68, 0.05)', border: '#ef4444', text: '#ef4444' };
    if (risk === 'medium') return { bg: 'rgba(245, 158, 11, 0.05)', border: '#f59e0b', text: '#f59e0b' };
    return { bg: 'var(--secondary)', border: 'var(--border)', text: 'var(--muted)' };
  };

  const exerciseGoal = preferences?.exerciseGoal;
  const exercisePercent = exerciseGoal && exerciseGoal.totalMinutes > 0
    ? Math.min(100, Math.round((exerciseGoal.completedMinutes / exerciseGoal.totalMinutes) * 100))
    : 0;

  if (!isLoggedIn) {
    return (
      <div className="container" style={{ paddingTop: '4rem' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary)', padding: '1.25rem', borderRadius: '1.25rem', color: 'var(--primary-foreground)' }}>
              <Leaf size={40} />
            </div>
          </motion.div>
          <h1 className="title" style={{ background: 'none', webkitTextFillColor: 'initial', fontSize: '2.5rem' }}>NutriScan AI</h1>
          <p className="subtitle">Sophisticated nutrition tracking & AI insights</p>
        </header>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="card" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--secondary)', padding: '0.25rem', borderRadius: 'var(--radius)' }}>
            <button className={`btn ${isLoginView ? 'btn-primary' : ''}`} style={{ flex: 1, background: isLoginView ? 'var(--primary)' : 'transparent', color: isLoginView ? 'var(--primary-foreground)' : 'var(--muted)', fontSize: '0.875rem' }} onClick={() => setIsLoginView(true)}>Login</button>
            <button className={`btn ${!isLoginView ? 'btn-primary' : ''}`} style={{ flex: 1, background: !isLoginView ? 'var(--primary)' : 'transparent', color: !isLoginView ? 'var(--primary-foreground)' : 'var(--muted)', fontSize: '0.875rem' }} onClick={() => setIsLoginView(false)}>Sign Up</button>
          </div>

          <form onSubmit={handleLoginSubmit}>
            {authError && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239,68,68,0.05)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.1)' }}>
                {authError}
              </div>
            )}
            {!isLoginView && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Username</label>
                <input type="text" placeholder="John Doe" className="input" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
              <input type="email" placeholder="john@example.com" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Password</label>
              <input type="password" placeholder="••••••••" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {!isLoginView && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>City for Health Alerts</label>
                <input type="text" placeholder="London, UK" className="input" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }} disabled={loading}>
              {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </motion.div>

        <div style={{ marginTop: '4rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', color: 'var(--muted)', letterSpacing: '0.1em' }}>PRECISION NUTRITION TECHNOLOGY</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { icon: <ShieldCheck size={20} />, title: 'Safety First', desc: 'Real-time allergen tracking' },
              { icon: <Zap size={20} />, title: 'AI Scoring', desc: 'Scientific data analysis' },
              { icon: <Users size={20} />, title: 'Connect', desc: 'Healthy social groups' },
              { icon: <Thermometer size={20} />, title: 'Local Data', desc: 'Regional health alerts' },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem', marginBottom: 0, textAlign: 'left', border: 'none', background: 'var(--secondary)' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{f.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Hello, {preferences?.username || 'User'}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            {preferences?.city ? `📍 ${preferences.city}` : 'Your daily nutrition overview'}
          </p>
        </div>
        <button onClick={logout} className="btn" style={{ width: 'auto', padding: '0.6rem', borderRadius: '0.75rem', background: 'var(--secondary)', color: 'var(--muted)' }}>
          <LogOut size={18} />
        </button>
      </header>

      {/* Health Alert */}
      {locationAlerts && !loadingAlerts && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem', background: riskTheme(locationAlerts.heatwaveRisk).bg, borderColor: riskTheme(locationAlerts.heatwaveRisk).border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Thermometer size={18} color={riskTheme(locationAlerts.heatwaveRisk).text} />
              <h4 style={{ fontWeight: 600, fontSize: '0.9375rem', color: riskTheme(locationAlerts.heatwaveRisk).text }}>
                {locationAlerts.heatwaveRisk === 'high' ? 'High Temperature Alert' : locationAlerts.heatwaveRisk === 'medium' ? 'Moderate Temperature Alert' : 'Normal Temperature'}
              </h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{locationAlerts.summary}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <Droplets size={16} color="var(--accent)" />
              <span style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.8125rem' }}>Water Goal: {locationAlerts.waterGoalLitres}L</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Stats */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Daily Progress</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>1,420 <span style={{ fontSize: '0.875rem', fontWeight: 400, opacity: 0.8 }}>/ 2,100 kcal</span></h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Status</p>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600 }}>67% Hit</p>
            </div>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: '67%' }} transition={{ duration: 1 }}
              style={{ height: '100%', background: 'var(--primary-foreground)' }} />
          </div>
        </div>
      </section>

      {/* Macros Grid */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Protein', value: '85g', target: '120g', percent: 70, color: 'var(--accent)' },
            { label: 'Carbs', value: '140g', target: '250g', percent: 56, color: '#f59e0b' },
            { label: 'Fats', value: '45g', target: '70g', percent: 64, color: '#10b981' },
            { label: 'Fiber', value: '12g', target: '30g', percent: 40, color: '#8b5cf6' },
          ].map((m, idx) => (
            <div key={idx} className="card" style={{ padding: '1rem', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>{m.label}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{m.percent}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--secondary)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${m.percent}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                  style={{ height: '100%', background: m.color }} />
              </div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{m.value} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '0.7rem' }}>of {m.target}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* Challenges & Community */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Engagement</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link href="/challenges" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 0 }}>
              <div style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', padding: '0.75rem', borderRadius: '0.75rem' }}><Swords size={20} /></div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.1rem' }}>Nutrition Challenges</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {challenges.filter(c => c.status === 'active').length > 0 ? `${challenges.filter(c => c.status === 'active').length} active goals` : 'Bet on your discipline'}
                </p>
              </div>
              <ChevronRight size={16} color="var(--muted)" />
            </div>
          </Link>
          
          <Link href="/community" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 0 }}>
              <div style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '0.75rem' }}><Users size={20} /></div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.1rem' }}>Communities</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{preferences?.community || 'Join a health group'}</p>
              </div>
              <ChevronRight size={16} color="var(--muted)" />
            </div>
          </Link>
        </div>
      </section>

      {/* Action Center */}
      <section style={{ marginBottom: '2.5rem' }}>
        <Link href="/scan" style={{ textDecoration: 'none' }}>
          <div className="btn btn-primary" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
            <Camera size={20} />
            <span>Start AI Food Analysis</span>
          </div>
        </Link>
      </section>

      {/* Recent Activity */}
      {preferences?.scanHistory && preferences.scanHistory.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Scans</h3>
            <Link href="/history" style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>View History</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {preferences.scanHistory.slice(0, 3).map((item, idx) => (
              <div key={idx} className="card" style={{ padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.isSafe ? '#10b981' : '#ef4444' }} />
                <div style={{ flex: 1 }}>
                  <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>{item.name}</h5>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--muted)' }}>{item.brand}</p>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
