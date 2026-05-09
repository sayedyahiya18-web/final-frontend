'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/user-context';
import { generateDietPlan } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Flame, Target, ChevronRight, Clock, Camera, MessageSquare, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function DietPlanPage() {
  const { preferences } = useUser();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!preferences) {
      router.push('/onboarding');
      return;
    }
    
    setLoading(true);
    setError(null);
    generateDietPlan(preferences)
      .then(data => {
        if (data && data.meals) {
          setPlan(data);
        } else {
          setError('Failed to generate a valid diet plan.');
        }
      })
      .catch(err => {
        console.error('Diet plan error:', err);
        setError('An error occurred while generating your plan.');
      })
      .finally(() => setLoading(false));
  }, [preferences, router]);

  if (loading || !preferences) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <RefreshCw size={32} color="var(--primary)" className="animate-spin" />
        <p style={{ marginTop: '1.5rem', fontWeight: 500, color: 'var(--muted)', fontSize: '0.9375rem' }}>Designing your nutrition strategy...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--secondary)', border: 'none' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{error || 'Plan temporarily unavailable'}</p>
          <button className="btn btn-primary" onClick={() => typeof window !== 'undefined' && window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="title">Daily Strategy</h1>
        <p className="subtitle">Precision nutrition for {preferences.username}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem', textAlign: 'left', border: 'none', background: 'var(--secondary)' }}>
          <Flame size={18} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{plan.dailyCalories} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted)' }}>kcal</span></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>Total Energy</div>
        </div>
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem', textAlign: 'left', border: 'none', background: 'var(--secondary)' }}>
          <Target size={18} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{plan.proteinTarget}g <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted)' }}>protein</span></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>Protein Goal</div>
        </div>
      </div>

      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Meal Schedule</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
        {plan.meals.map((meal: any, index: number) => (
          <motion.div 
            key={index}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="card"
            style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem', marginBottom: 0 }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              <Clock size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.1rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meal.type} • {meal.time}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground)', fontWeight: 600 }}>{meal.calories} kcal</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{meal.name}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card" style={{ borderStyle: 'solid', borderColor: 'var(--border)', background: 'transparent', padding: '1.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Expert Insights</h4>
        <ul style={{ paddingLeft: '1.1rem', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          {plan.tips.map((tip: string, i: number) => (
            <li key={i} style={{ marginBottom: '0.625rem' }}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
