'use client';

import { useState, useEffect } from 'react';
import { useUser, Challenge } from '@/lib/user-context';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronRight, Target, Flame, Trophy, Clock, Check, AlertTriangle, ChevronLeft } from 'lucide-react';

export default function ChallengeDetailPage() {
  const { user, preferences, logDailyProgress } = useUser();
  const params = useParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [mounted, setMounted] = useState(false);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!params?.id) return;
    const unsub = onSnapshot(doc(db, 'challenges', params.id as string), (snap) => {
      if (snap.exists()) setChallenge({ id: snap.id, ...snap.data() } as Challenge);
    });
    return () => unsub();
  }, [params?.id]);

  if (!mounted || !challenge || !user) return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <Clock size={32} color="var(--muted)" className="animate-spin" />
    </div>
  );

  const isCreator = challenge.creatorId === user.uid;
  const myProgress = isCreator ? challenge.creatorProgress : challenge.opponentProgress;
  const theirProgress = isCreator ? challenge.opponentProgress : challenge.creatorProgress;
  const myName = isCreator ? challenge.creatorName : challenge.opponentName;
  const theirName = isCreator ? challenge.opponentName : challenge.creatorName;
  const myScore = myProgress.caloriesDaysHit + myProgress.proteinDaysHit;
  const theirScore = theirProgress.caloriesDaysHit + theirProgress.proteinDaysHit;
  const maxScore = challenge.duration * 2;
  const daysLogged = myProgress.dailyLogs.length;
  const canLog = challenge.status === 'active' && daysLogged < challenge.duration;

  const alreadyLoggedToday = (() => {
    if (myProgress.dailyLogs.length === 0) return false;
    const lastLog = myProgress.dailyLogs[myProgress.dailyLogs.length - 1];
    const now = new Date();
    const logDate = new Date(lastLog.date);
    return now.toDateString() === logDate.toDateString();
  })();

  const handleLog = async () => {
    if (!calories || !protein) return;
    setLogging(true);
    await logDailyProgress(challenge.id, parseInt(calories), parseInt(protein));
    setCalories('');
    setProtein('');
    setLogged(true);
    setLogging(false);
  };

  const getDaysLeft = () => {
    if (!challenge.endDate) return challenge.duration;
    return Math.max(0, Math.ceil((challenge.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/challenges" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
          <ChevronLeft size={18} />
        </Link>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--secondary)', padding: '0.35rem 0.75rem', borderRadius: '9999px' }}>
            {challenge.status === 'active' ? `${getDaysLeft()} Days Remaining` : 'Contest Ended'}
          </span>
        </div>
      </header>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>The Stakes</p>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Rs.{challenge.betAmount * 2}</h2>
      </div>

      {/* VS Comparison */}
      <div className="card" style={{ padding: '2rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--primary-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, margin: '0 auto 0.75rem' }}>
              {(myName || 'Y')[0].toUpperCase()}
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{myName}</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginBottom: '1rem' }}>You</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{myScore}</div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>Points</p>
          </div>
          
          <div style={{ color: 'var(--muted)', fontWeight: 800, fontSize: '0.8125rem', opacity: 0.3 }}>VS</div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, margin: '0 auto 0.75rem' }}>
              {(theirName || 'O')[0].toUpperCase()}
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{theirName || 'Pending'}</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginBottom: '1rem' }}>Opponent</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{theirScore}</div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>Points</p>
          </div>
        </div>
      </div>

      {/* Daily Progress Log */}
      {canLog && !alreadyLoggedToday && !logged && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card" style={{ padding: '1.5rem', border: '1px solid var(--primary)', background: 'rgba(16,185,129,0.02)' }}>
          <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Submit Daily Performance</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Calories</label>
              <input type="number" className="input" placeholder="Total consumed" value={calories} onChange={e => setCalories(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Protein (g)</label>
              <input type="number" className="input" placeholder="Total grams" value={protein} onChange={e => setProtein(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleLog} disabled={logging}>
            {logging ? 'Submitting...' : 'Confirm Daily Entry'}
          </button>
        </motion.div>
      )}

      {(alreadyLoggedToday || logged) && canLog && (
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center', background: 'var(--secondary)', border: 'none' }}>
          <Check size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Day {daysLogged} Entry Confirmed</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Return tomorrow to log your next phase.</p>
        </div>
      )}

      {/* Rules */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Contest Criteria</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="card" style={{ padding: '1rem', marginBottom: 0, background: 'var(--secondary)', border: 'none' }}>
            <p style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>Energy Limit</p>
            <p style={{ fontWeight: 700 }}>{challenge.goals.dailyCalories} kcal</p>
          </div>
          <div className="card" style={{ padding: '1rem', marginBottom: 0, background: 'var(--secondary)', border: 'none' }}>
            <p style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>Protein Floor</p>
            <p style={{ fontWeight: 700 }}>{challenge.goals.dailyProtein}g protein</p>
          </div>
        </div>
      </div>
    </div>
  );
}
