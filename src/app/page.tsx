'use client';

import { useState } from 'react';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Camera, 
  MessageSquare, 
  Calendar, 
  History, 
  Settings,
  TrendingUp,
  Apple,
  Search,
  LogOut,
  ChevronRight,
  Flame,
  Utensils
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isLoggedIn, preferences, login, logout } = useUser();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    // If they have no preferences yet, send them to onboarding
    if (!preferences) {
      router.push('/onboarding');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container">
        <header style={{ marginTop: '2rem', marginBottom: '3rem', textAlign: 'center' }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)', 
              padding: '1.25rem', 
              borderRadius: '2rem', 
              color: 'white',
              boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.4)'
            }}>
              <Leaf size={40} />
            </div>
          </motion.div>
          <h1 className="title">NutriScan AI</h1>
          <p className="subtitle">Your personalized path to mindful eating</p>
        </header>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card glass"
          style={{ border: '1px solid var(--glass-border)' }}
        >
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className={`btn ${isLoginView ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, borderRadius: '1rem' }}
              onClick={() => setIsLoginView(true)}
            >
              Login
            </button>
            <button 
              className={`btn ${!isLoginView ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, borderRadius: '1rem' }}
              onClick={() => setIsLoginView(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '0.5rem', marginBottom: '0.5rem', display: 'block' }}>Email</label>
              <input 
                type="email" 
                placeholder="hello@example.com" 
                className="input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '0.5rem', marginBottom: '0.5rem', display: 'block' }}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ marginBottom: 0 }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {isLoginView ? 'Welcome Back' : 'Create Account'}
              <ArrowRight size={20} />
            </button>
          </form>
        </motion.div>

        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', textAlign: 'center', opacity: 0.7 }}>POWERED BY AI</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <motion.div 
              whileHover={{ y: -5 }}
              className="card glass" 
              style={{ padding: '1.25rem', marginBottom: 0, textAlign: 'center' }}
            >
              <div style={{ background: 'rgba(45, 212, 191, 0.1)', width: '48px', height: '48px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <ShieldCheck size={24} color="var(--primary)" />
              </div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Safety Guard</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>Instant allergen & condition checks</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="card glass" 
              style={{ padding: '1.25rem', marginBottom: 0, textAlign: 'center' }}
            >
              <div style={{ background: 'rgba(249, 115, 22, 0.1)', width: '48px', height: '48px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Zap size={24} color="var(--accent)" />
              </div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Smart Analysis</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>AI-powered nutritional grading</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Logged In Dashboard
  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hi, Friend! 👋</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Ready for a healthy day?</p>
        </div>
        <button 
          onClick={logout}
          style={{ background: 'var(--secondary)', border: 'none', padding: '0.75rem', borderRadius: '1rem', color: 'var(--muted)' }}
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Daily Nutrition Overview */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'var(--card)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
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
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '67%' }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #5eead4 100%)' }}
            />
          </div>
        </div>
      </section>

      {/* Macronutrient Breakdown */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Calories', value: '1.4k', target: '2.1k', color: '#2dd4bf', percent: 67 },
            { label: 'Protein', value: '85g', target: '120g', color: '#60a5fa', percent: 70 },
            { label: 'Carbs', value: '140g', target: '250g', color: '#fbbf24', percent: 56 },
            { label: 'Fat', value: '45g', target: '70g', color: '#f87171', percent: 64 },
          ].map((macro, idx) => (
            <div key={idx} className="card" style={{ padding: '1rem 0.5rem', marginBottom: 0, textAlign: 'center', background: 'var(--card)' }}>
              <div style={{ position: 'relative', width: '50px', height: '50px', margin: '0 auto 0.75rem' }}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="22" fill="none" stroke="var(--secondary)" strokeWidth="4" />
                  <motion.circle 
                    cx="25" cy="25" r="22" 
                    fill="none" 
                    stroke={macro.color} 
                    strokeWidth="4" 
                    strokeDasharray="138.2"
                    initial={{ strokeDashoffset: 138.2 }}
                    animate={{ strokeDashoffset: 138.2 - (138.2 * macro.percent) / 100 }}
                    transition={{ duration: 1.5, delay: idx * 0.1 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                  {macro.percent}%
                </div>
              </div>
              <h5 style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>{macro.label}</h5>
              <p style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>{macro.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hydration & CTA */}
      <section style={{ marginBottom: '2.5rem', display: 'flex', gap: '1rem' }}>
        <div className="card" style={{ flex: 1.2, marginBottom: 0, padding: '1.25rem', background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Hydration</h4>
            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 700 }}>1.8L / 2.5L</span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ 
                flex: 1, 
                height: '24px', 
                borderRadius: '4px', 
                background: i <= 5 ? '#38bdf8' : 'rgba(56, 189, 248, 0.1)',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.75rem', textAlign: 'center' }}>5 of 8 glasses reached</p>
        </div>

        <Link href="/scan" style={{ flex: 1, textDecoration: 'none' }}>
          <motion.div 
            whileTap={{ scale: 0.95 }}
            style={{ 
              height: '100%', 
              background: 'var(--primary)', 
              borderRadius: 'var(--radius)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white',
              gap: '0.5rem',
              boxShadow: '0 10px 20px rgba(15, 118, 110, 0.2)'
            }}
          >
            <Utensils size={24} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Add Meals</span>
          </motion.div>
        </Link>
      </section>

      {/* News Preview */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Trending Health</h3>
          <Link href="/news" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
        </div>
        <Link href="/news" style={{ textDecoration: 'none' }}>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="card" 
            style={{ 
              padding: 0, 
              overflow: 'hidden', 
              position: 'relative', 
              height: '160px', 
              border: 'none',
              borderRadius: '1.5rem'
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              alt="News Preview"
            />
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '1.25rem'
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.25rem' }}>NUTRITION STUDY</span>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>New Study: Plant-based proteins linked to longer life.</h4>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* Storytelling / About Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card glass" 
          style={{ 
            padding: '2rem', 
            border: 'none', 
            background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative elements */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
            <Leaf size={120} color="var(--primary)" />
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Beyond the Barcode: <br />
            <span style={{ color: 'var(--primary)' }}>Your Health Story</span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--foreground)', opacity: 0.9, lineHeight: 1.6 }}>
            <p>
              We believe that food should be your **fuel**, not a mystery. NutriScan AI was born from a simple mission: to empower you with the truth behind every label.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem', flexShrink: 0 }}>
                <Search size={20} />
              </div>
              <p style={{ fontSize: '0.9rem' }}>
                <strong>Total Transparency:</strong> We use advanced AI to decode complex ingredients, giving you instant clarity on what fits your unique dietary needs.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem', flexShrink: 0 }}>
                <Zap size={20} />
              </div>
              <p style={{ fontSize: '0.9rem' }}>
                <strong>Personalized Growth:</strong> Your journey is yours alone. Our AI learns your preferences to guide you toward a healthier version of yourself, one scan at a time.
              </p>
            </div>

            <p style={{ fontStyle: 'italic', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem', marginTop: '0.5rem' }}>
              "Our goal isn't just to count calories—it's to make every calorie count."
            </p>
          </div>

          <Link href="/scan" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ marginTop: '2rem' }}>
              Start Your Journey
              <ArrowRight size={20} />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Recent History */}
      {preferences?.scanHistory && preferences.scanHistory.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Activity</h3>
            <Link href="/history" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>See all</Link>
          </div>
          {preferences.scanHistory.slice(0, 2).map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="card glass" 
              style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}
            >
              <div style={{ background: item.isSafe ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.75rem' }}>
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
        <div className="card glass" style={{ borderStyle: 'dashed', borderColor: 'var(--primary)', background: 'rgba(45, 212, 191, 0.05)' }}>
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
