'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getLocationHealthAlerts } from '@/lib/api';
import { 
  Leaf, ArrowRight, ShieldCheck, Zap, Camera, LogOut,
  ChevronRight, Flame, Utensils, Apple, Droplets, 
  AlertTriangle, Thermometer, Users, Activity, Target
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isLoggedIn, preferences, login, logout, loading } = useUser();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [locationAlerts, setLocationAlerts] = useState<any>(null);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && preferences?.city && !locationAlerts) {
      setLoadingAlerts(true);
      getLocationHealthAlerts(preferences.city)
        .then(data => setLocationAlerts(data))
        .finally(() => setLoadingAlerts(false));
    }
  }, [isLoggedIn, preferences?.city]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await login(email, password, !isLoginView, username, city);
      // If they have no preferences (newly signed up), they'll stay on onboarding logic
      if (isLoginView && preferences) {
        router.push('/');
      } else if (!isLoginView) {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const heatColor = (risk: string) => {
    if (risk === 'high') return { bg: 'rgba(239,68,68,0.08)', border: '#ef4444', icon: '#ef4444' };
    if (risk === 'medium') return { bg: 'rgba(249,115,22,0.08)', border: '#f97316', icon: '#f97316' };
    return { bg: 'rgba(34,197,94,0.08)', border: '#22c55e', icon: '#22c55e' };
  };

  const exerciseGoal = preferences?.exerciseGoal;
  const exercisePercent = exerciseGoal && exerciseGoal.totalMinutes > 0
    ? Math.min(100, Math.round((exerciseGoal.completedMinutes / exerciseGoal.totalMinutes) * 100))
    : 0;

  if (!isLoggedIn) {
    return (
      <div className="container">
        <header style={{ marginTop: '2rem', marginBottom: '3rem', textAlign: 'center' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)', padding: '1.25rem', borderRadius: '2rem', color: 'white', boxShadow: '0 10px 25px -5px rgba(13,148,136,0.4)' }}>
              <Leaf size={40} />
            </div>
          </motion.div>
          <h1 className="title">NutriScan AI</h1>
          <p className="subtitle">Your personalized path to mindful eating</p>
        </header>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="card glass" style={{ border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button className={`btn ${isLoginView ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, borderRadius: '1rem' }} onClick={() => setIsLoginView(true)}>Login</button>
            <button className={`btn ${!isLoginView ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, borderRadius: '1rem' }} onClick={() => setIsLoginView(false)}>Sign Up</button>
          </div>

          <form onSubmit={handleLoginSubmit}>
            {authError && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                {authError}
              </div>
            )}
            {!isLoginView && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '0.5rem', marginBottom: '0.5rem', display: 'block' }}>Username</label>
                <input type="text" placeholder="@yourusername" className="input" value={username} onChange={e => setUsername(e.target.value)} style={{ marginBottom: 0 }} />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '0.5rem', marginBottom: '0.5rem', display: 'block' }}>Email</label>
              <input type="email" placeholder="hello@example.com" className="input" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ marginBottom: 0 }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '0.5rem', marginBottom: '0.5rem', display: 'block' }}>Password</label>
              <input type="password" placeholder="••••••••" className="input" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" style={{ marginBottom: 0 }} />
            </div>
            {!isLoginView && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '0.5rem', marginBottom: '0.5rem', display: 'block' }}>
                  📍 Your City <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(for health alerts)</span>
                </label>
                <input type="text" placeholder="e.g. Mumbai, India" className="input" value={city} onChange={e => setCity(e.target.value)} style={{ marginBottom: 0 }} />
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Processing...' : (isLoginView ? 'Welcome Back' : 'Create Account')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </motion.div>

        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', textAlign: 'center', opacity: 0.7 }}>POWERED BY AI</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { icon: <ShieldCheck size={24} color="var(--primary)" />, bg: 'rgba(45,212,191,0.1)', title: 'Safety Guard', desc: 'Instant allergen & condition checks' },
              { icon: <Zap size={24} color="var(--accent)" />, bg: 'rgba(249,115,22,0.1)', title: 'Smart Analysis', desc: 'AI-powered nutritional grading' },
              { icon: <Users size={24} color="#8b5cf6" />, bg: 'rgba(139,92,246,0.1)', title: 'Community', desc: 'Share scans with health communities' },
              { icon: <Thermometer size={24} color="#0ea5e9" />, bg: 'rgba(14,165,233,0.1)', title: 'Local Alerts', desc: 'Heatwave & disease warnings near you' },
            ].map((f, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="card glass" style={{ padding: '1.25rem', marginBottom: 0, textAlign: 'center' }}>
                <div style={{ background: f.bg, width: '48px', height: '48px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>{f.icon}</div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{f.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hi, {preferences?.username || 'User'}! 👋</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {preferences?.city ? `📍 ${preferences.city}` : 'Ready for a healthy day?'}
          </p>
        </div>
        <button onClick={logout} style={{ background: 'var(--secondary)', border: 'none', padding: '0.75rem', borderRadius: '1rem', color: 'var(--muted)' }}>
          <LogOut size={20} />
        </button>
      </header>

      {/* Location Health Alert */}
      {loadingAlerts && (
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
            <Thermometer size={20} color="var(--primary)" />
          </motion.div>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Checking local health alerts...</p>
        </div>
      )}

      {locationAlerts && !loadingAlerts && (
        <motion.section initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '1.5rem' }}>
          {/* Heatwave + Water Card */}
          <div className="card" style={{ padding: '1.25rem', background: heatColor(locationAlerts.heatwaveRisk).bg, borderColor: heatColor(locationAlerts.heatwaveRisk).border, marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Thermometer size={20} color={heatColor(locationAlerts.heatwaveRisk).icon} />
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {locationAlerts.heatwaveRisk === 'high' ? '🔥 High Heatwave Risk' : locationAlerts.heatwaveRisk === 'medium' ? '⚠️ Moderate Heat Alert' : '✅ Normal Conditions'}
                </h4>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: heatColor(locationAlerts.heatwaveRisk).border, color: 'white' }}>
                {preferences?.city}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{locationAlerts.summary}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14,165,233,0.1)', padding: '0.625rem 0.875rem', borderRadius: '0.75rem' }}>
              <Droplets size={18} color="#0ea5e9" />
              <span style={{ fontWeight: 700, color: '#0ea5e9', fontSize: '0.875rem' }}>Daily water goal: {locationAlerts.waterGoalLitres}L</span>
            </div>
          </div>

          {/* Disease Alerts */}
          {locationAlerts.diseaseAlerts?.length > 0 && (
            <div className="card" style={{ padding: '1.25rem', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={18} color="#ef4444" />
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ef4444' }}>Disease Alerts Near You</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {locationAlerts.diseaseAlerts.map((alert: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#ef4444', marginTop: '1px' }}>•</span>
                    <p style={{ fontSize: '0.83rem', color: 'var(--foreground)', lineHeight: 1.4 }}>{alert}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Daily Nutrition Overview */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Daily Nutrition</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Consumed vs. Goal</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>1,420</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}> / 2,100 kcal</span>
            </div>
          </div>
          <div style={{ height: '12px', background: 'var(--secondary)', borderRadius: '6px', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: '67%' }} transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #5eead4 100%)' }} />
          </div>
        </div>
      </section>

      {/* Macros */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Calories', value: '1.4k', color: '#2dd4bf', percent: 67 },
            { label: 'Protein', value: '85g', color: '#60a5fa', percent: 70 },
            { label: 'Carbs', value: '140g', color: '#fbbf24', percent: 56 },
            { label: 'Fat', value: '45g', color: '#f87171', percent: 64 },
          ].map((macro, idx) => (
            <div key={idx} className="card" style={{ padding: '1rem 0.5rem', marginBottom: 0, textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '50px', height: '50px', margin: '0 auto 0.75rem' }}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="22" fill="none" stroke="var(--secondary)" strokeWidth="4" />
                  <motion.circle cx="25" cy="25" r="22" fill="none" stroke={macro.color} strokeWidth="4"
                    strokeDasharray="138.2" initial={{ strokeDashoffset: 138.2 }}
                    animate={{ strokeDashoffset: 138.2 - (138.2 * macro.percent) / 100 }}
                    transition={{ duration: 1.5, delay: idx * 0.1 }} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>{macro.percent}%</div>
              </div>
              <h5 style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>{macro.label}</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>{macro.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hydration + Scan CTA */}
      <section style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div className="card" style={{ flex: 1.2, marginBottom: 0, padding: '1.25rem', background: 'rgba(56,189,248,0.05)', borderColor: 'rgba(56,189,248,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Hydration</h4>
            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 700 }}>
              1.8L / {locationAlerts?.waterGoalLitres || 2.5}L
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {Array.from({ length: Math.round((locationAlerts?.waterGoalLitres || 2.5) / 0.25) }, (_, i) => i + 1).slice(0, 10).map(i => (
              <div key={i} style={{ flex: 1, height: '24px', borderRadius: '4px', background: i <= 7 ? '#38bdf8' : 'rgba(56,189,248,0.1)', transition: 'all 0.3s ease' }} />
            ))}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.75rem', textAlign: 'center' }}>
            Goal: {locationAlerts?.waterGoalLitres || 2.5}L/day
          </p>
        </div>
        <Link href="/scan" style={{ flex: 1, textDecoration: 'none' }}>
          <motion.div whileTap={{ scale: 0.95 }}
            style={{ height: '100%', background: 'var(--primary)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '0.5rem', boxShadow: '0 10px 20px rgba(15,118,110,0.2)' }}>
            <Utensils size={24} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Add Meals</span>
          </motion.div>
        </Link>
      </section>

      {/* Exercise Goal Card */}
      {exerciseGoal && exerciseGoal.totalMinutes > 0 && (
        <motion.section initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={20} color="#f97316" />
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Burn-Off Goal</h4>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316' }}>
                {exerciseGoal.completedMinutes}/{exerciseGoal.totalMinutes} min
              </span>
            </div>
            <div style={{ height: '10px', background: 'var(--secondary)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${exercisePercent}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #f97316, #ef4444)', borderRadius: '5px' }} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              {exerciseGoal.totalMinutes}min of {exerciseGoal.activity} from your scanned products
            </p>
          </div>
        </motion.section>
      )}

      {/* Community card */}
      {preferences?.community && (
        <section style={{ marginBottom: '2rem' }}>
          <Link href="/community" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} className="card glass"
              style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(109,40,217,0.05) 100%)', borderColor: 'rgba(139,92,246,0.25)' }}>
              <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', padding: '0.875rem', borderRadius: '1rem', color: 'white', flexShrink: 0 }}>
                <Users size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>{preferences.community} Community</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>View posts & share your scans</p>
              </div>
              <ChevronRight size={18} color="var(--muted)" />
            </motion.div>
          </Link>
        </section>
      )}

      {/* Recent History */}
      {preferences?.scanHistory && preferences.scanHistory.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Activity</h3>
            <Link href="/history" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>See all</Link>
          </div>
          {preferences.scanHistory.slice(0, 2).map((item, idx) => (
            <motion.div key={idx} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}
              className="card glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ background: item.isSafe ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                <Apple size={24} color={item.isSafe ? '#22c55e' : '#ef4444'} />
              </div>
              <div style={{ flex: 1 }}>
                <h5 style={{ margin: 0, fontSize: '0.95rem' }}>{item.name}</h5>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)' }}>{item.brand}</p>
              </div>
              <ChevronRight size={18} color="var(--muted)" />
            </motion.div>
          ))}
        </section>
      )}

      {/* Daily Tip */}
      <section>
        <div className="card glass" style={{ borderStyle: 'dashed', borderColor: 'var(--primary)', background: 'rgba(45,212,191,0.05)' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ color: 'var(--primary)' }}><Utensils size={24} /></div>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Health Tip of the Day</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                Try incorporating more protein into your breakfast. It helps stabilize blood sugar and keeps you feeling full longer!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
