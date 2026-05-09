'use client';

import { useState, useEffect } from 'react';
import { useUser, Challenge } from '@/lib/user-context';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronRight, Target, Flame, Trophy, Clock, Check, AlertTriangle } from 'lucide-react';

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

  const isTie = challenge.winner === 'tie';
  const iWon = challenge.winner === user.uid;

  return (
    <div className="container">
      {/* Header */}
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/challenges" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </Link>
        <div style={{ textAlign: 'right' }}>
          {challenge.status === 'active' && (
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
              {getDaysLeft()} days left
            </span>
          )}
          {challenge.status === 'completed' && (
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', background: 'rgba(107,114,128,0.1)', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
              Completed
            </span>
          )}
        </div>
      </header>

      {/* Bet Info */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Prize Pool</p>
        <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Rs.{challenge.betAmount * 2}</p>
      </div>

      {/* VS Card */}
      <motion.div
        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1.25rem',
          padding: '1.5rem', marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
          {/* My Side */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', margin: '0 auto 0.5rem',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '1.1rem'
            }}>
              {(myName || 'Y')[0].toUpperCase()}
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.15rem' }}>{myName}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>You</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', color: '#f59e0b' }}>{myScore}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>/{maxScore} pts</p>
          </div>

          {/* VS Divider */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.1em' }}>VS</span>
          </div>

          {/* Their Side */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', margin: '0 auto 0.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '1.1rem'
            }}>
              {(theirName || 'O')[0].toUpperCase()}
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.15rem' }}>{theirName || '???'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Opponent</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', color: '#3b82f6' }}>{theirScore}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>/{maxScore} pts</p>
          </div>
        </div>
      </motion.div>

      {/* Goals Reference */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center', marginBottom: 0 }}>
          <Flame size={20} color="#f59e0b" style={{ margin: '0 auto 0.35rem' }} />
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.15rem' }}>Daily Calorie Goal</p>
          <p style={{ fontWeight: 800, fontSize: '1rem' }}>{challenge.goals.dailyCalories}</p>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center', marginBottom: 0 }}>
          <Target size={20} color="#3b82f6" style={{ margin: '0 auto 0.35rem' }} />
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.15rem' }}>Daily Protein Goal</p>
          <p style={{ fontWeight: 800, fontSize: '1rem' }}>{challenge.goals.dailyProtein}g</p>
        </div>
      </div>

      {/* Result Banner */}
      {challenge.status === 'completed' && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{
            textAlign: 'center', padding: '1.75rem', borderRadius: '1.25rem', marginBottom: '1.25rem',
            background: isTie ? 'rgba(107,114,128,0.06)' : iWon ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${isTie ? 'rgba(107,114,128,0.15)' : iWon ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`
          }}
        >
          <Trophy size={36} color={isTie ? '#6b7280' : iWon ? '#16a34a' : '#dc2626'} style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.25rem', color: isTie ? '#6b7280' : iWon ? '#166534' : '#991b1b' }}>
            {isTie ? 'It\'s a Tie' : iWon ? 'You Won!' : 'You Lost'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
            {isTie ? `Rs.${challenge.betAmount} refunded to both` : iWon ? `Rs.${challenge.betAmount * 2} credited to your wallet` : `Better luck next time`}
          </p>
        </motion.div>
      )}

      {/* Daily Log Form */}
      {canLog && !alreadyLoggedToday && !logged && (
        <motion.div
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="card" style={{ padding: '1.5rem' }}
        >
          <h4 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem' }}>
            Log Day {daysLogged + 1} of {challenge.duration}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Calories eaten</label>
              <input type="number" className="input" placeholder="e.g. 2100" value={calories} onChange={e => setCalories(e.target.value)} style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Protein (g)</label>
              <input type="number" className="input" placeholder="e.g. 85" value={protein} onChange={e => setProtein(e.target.value)} style={{ marginBottom: 0 }} />
            </div>
          </div>
          <button className="btn" onClick={handleLog} disabled={logging || !calories || !protein} style={{
            background: '#1c1917', color: '#fafaf9', fontWeight: 700, marginTop: '1rem'
          }}>
            {logging ? 'Logging...' : 'Submit Today\'s Log'}
          </button>
        </motion.div>
      )}

      {(alreadyLoggedToday || logged) && canLog && (
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center', background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.15)' }}>
          <Check size={24} color="#16a34a" style={{ marginBottom: '0.5rem' }} />
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534' }}>Today's log submitted</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Come back tomorrow for Day {daysLogged + 1}</p>
        </div>
      )}

      {/* Log History */}
      {myProgress.dailyLogs.length > 0 && (
        <section style={{ marginTop: '1.25rem' }}>
          <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Your Log</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {myProgress.dailyLogs.map((log, i) => {
              const hitCal = log.calories >= challenge.goals.dailyCalories;
              const hitPro = log.protein >= challenge.goals.dailyProtein;
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', background: 'var(--secondary)', borderRadius: '0.75rem', fontSize: '0.85rem'
                }}>
                  <span style={{ fontWeight: 700 }}>Day {log.day}</span>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: hitCal ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {log.calories} cal {hitCal ? '✓' : '✗'}
                    </span>
                    <span style={{ color: hitPro ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {log.protein}g {hitPro ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
