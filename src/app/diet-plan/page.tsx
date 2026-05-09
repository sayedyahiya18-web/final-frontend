'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/user-context';
import { generateDietPlan } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Flame, Target, ChevronRight, Clock, Camera, Search, MessageSquare } from 'lucide-react';
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
          setError('Failed to generate a valid diet plan. Please try again.');
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
        <div className="animate-spin">
          <Calendar size={48} color="var(--primary)" />
        </div>
        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Generating your personalized plan...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '2rem', borderRadius: '1.5rem', textAlign: 'center' }}>
          <Calendar size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Oops!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{error || 'No plan available'}</p>
          <button className="btn btn-primary" onClick={() => typeof window !== 'undefined' && window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title">Your Diet Plan</h1>
        <p className="subtitle">Customized for your goals and lifestyle</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ flex: 1, marginBottom: 0, padding: '1rem', textAlign: 'center' }}>
          <Flame size={20} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{plan.dailyCalories}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Daily Kcal</div>
        </div>
        <div className="card" style={{ flex: 1, marginBottom: 0, padding: '1rem', textAlign: 'center' }}>
          <Target size={20} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{plan.proteinTarget}g</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Protein Goal</div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Daily Schedule</h3>
      {plan.meals.map((meal: any, index: number) => (
        <motion.div 
          key={index}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="card"
          style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
        >
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'var(--secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Clock size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>{meal.type} • {meal.time}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>{meal.calories} kcal</span>
            </div>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{meal.name}</div>
          </div>
        </motion.div>
      ))}

      <div className="card glass" style={{ marginTop: '1rem', background: 'var(--secondary)' }}>
        <h4 style={{ marginBottom: '0.75rem' }}>AI Insights & Tips</h4>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
          {plan.tips.map((tip: string, i: number) => (
            <li key={i} style={{ marginBottom: '0.5rem' }}>{tip}</li>
          ))}
        </ul>
      </div>

      <nav className="nav">
        <Link href="/scan" className="nav-item">
          <Camera size={24} />
          <span>Scan</span>
        </Link>
        <Link href="/diet-plan" className="nav-item active">
          <Calendar size={24} />
          <span>Diet</span>
        </Link>
        <Link href="/chat" className="nav-item">
          <MessageSquare size={24} />
          <span>AI Chat</span>
        </Link>
      </nav>
    </div>
  );
}
