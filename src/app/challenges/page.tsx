'use client';

import { useState, useEffect } from 'react';
import { useUser, Challenge } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronRight, Plus, Wallet, ArrowDownToLine,
  Swords, Clock, Trophy, Copy, Check, X, ChevronLeft
} from 'lucide-react';

export default function ChallengesPage() {
  const { preferences, challenges, isLoggedIn, depositToWallet, createChallenge, joinChallenge } = useUser();
  const [mounted, setMounted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState('');
  const [betAmt, setBetAmt] = useState('100');
  const [duration, setDuration] = useState('7');
  const [goalCal, setGoalCal] = useState('2000');
  const [goalPro, setGoalPro] = useState('80');
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isLoggedIn) router.push('/'); }, [mounted, isLoggedIn, router]);

  if (!mounted || !preferences) return null;

  const wallet = preferences.wallet || { balance: 0, transactions: [] };
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const waitingChallenges = challenges.filter(c => c.status === 'waiting');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const handleDeposit = async () => {
    const amt = parseInt(depositAmt);
    if (!amt || amt <= 0) return;
    setBusy(true);
    await depositToWallet(amt);
    setDepositAmt('');
    setShowDeposit(false);
    setBusy(false);
  };

  const handleCreate = async () => {
    setError(null);
    setBusy(true);
    try {
      const code = await createChallenge(
        parseInt(betAmt),
        parseInt(duration),
        { dailyCalories: parseInt(goalCal), dailyProtein: parseInt(goalPro) }
      );
      setCreatedCode(code);
      setShowCreate(false);
    } catch (e: any) {
      setError(e.message);
    }
    setBusy(false);
  };

  const handleJoin = async () => {
    setError(null);
    setBusy(true);
    try {
      await joinChallenge(joinCode);
      setJoinCode('');
      setShowJoin(false);
    } catch (e: any) {
      setError(e.message);
    }
    setBusy(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDaysLeft = (c: Challenge) => {
    if (!c.endDate) return c.duration;
    const left = Math.ceil((c.endDate - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, left);
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="title" style={{ fontSize: '1.25rem', margin: 0 }}>Challenges</h1>
          <p className="subtitle" style={{ fontSize: '0.75rem', margin: 0 }}>Health betting arena</p>
        </div>
      </header>

      {/* Wallet */}
      <div className="card" style={{ padding: '1.5rem', background: 'var(--foreground)', color: 'var(--background)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>Wallet Balance</span>
          <button onClick={() => setShowDeposit(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'inherit', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            + Add Funds
          </button>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span style={{ fontSize: '1.25rem', opacity: 0.6 }}>Rs.</span>{wallet.balance.toLocaleString()}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1.5rem 0' }}>
        <button className="btn btn-primary" onClick={() => { setShowCreate(true); setCreatedCode(null); }} style={{ padding: '1.25rem', borderRadius: '1rem' }}>
          <Plus size={18} /> Create
        </button>
        <button className="btn btn-secondary" onClick={() => setShowJoin(true)} style={{ padding: '1.25rem', borderRadius: '1rem' }}>
          <Swords size={18} /> Join
        </button>
      </div>

      {/* Invitation Code */}
      <AnimatePresence>
        {createdCode && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ padding: '1.25rem', textAlign: 'center', border: '1px dashed var(--primary)', background: 'rgba(16,185,129,0.02)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Challenge Invite Code</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--primary)' }}>{createdCode}</span>
              <button onClick={() => copyCode(createdCode)} style={{ background: 'var(--secondary)', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                {copied ? <Check size={18} color="var(--primary)" /> : <Copy size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active */}
      {activeChallenges.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Active Contests</h3>
          {activeChallenges.map((c) => (
            <Link href={`/challenges/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1.25rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>{c.creatorName} vs {c.opponentName}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Stake: Rs.{c.betAmount} · {getDaysLeft(c)}d left</p>
                  </div>
                  <ChevronRight size={16} color="var(--muted)" />
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <div style={{ flex: 1, height: '4px', background: 'var(--secondary)', borderRadius: '2px' }}>
                    <div style={{ width: `${((c.creatorProgress.caloriesDaysHit + c.creatorProgress.proteinDaysHit) / (c.duration * 2)) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px' }} />
                  </div>
                  <div style={{ flex: 1, height: '4px', background: 'var(--secondary)', borderRadius: '2px' }}>
                    <div style={{ width: `${((c.opponentProgress.caloriesDaysHit + c.opponentProgress.proteinDaysHit) / (c.duration * 2)) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px' }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* Waiting */}
      {waitingChallenges.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Pending Opponent</h3>
          {waitingChallenges.map((c) => (
            <div key={c.id} className="card" style={{ padding: '1rem 1.25rem', borderStyle: 'dashed', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Rs.{c.betAmount} · {c.duration} days</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--secondary)', padding: '0.35rem 0.6rem', borderRadius: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{c.inviteCode}</span>
                  <Copy size={14} style={{ cursor: 'pointer' }} onClick={() => copyCode(c.inviteCode)} />
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* History */}
      {completedChallenges.length > 0 && (
        <section>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Past Challenges</h3>
          {completedChallenges.map((c) => (
            <Link href={`/challenges/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '0.5rem', opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.creatorName} vs {c.opponentName}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{c.winner === 'tie' ? 'Tie' : c.winner === preferences?.username ? 'Won' : 'Lost'}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowDeposit(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '480px', margin: '0 auto', background: 'var(--background)', borderRadius: '1.5rem 1.5rem 0 0', padding: '2rem 1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Add Funds</h3>
              <input type="number" placeholder="Enter amount" className="input" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} />
              <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0' }}>
                {[500, 1000, 2000].map(a => (
                  <button key={a} onClick={() => setDepositAmt(String(a))} className="btn btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>{a}</button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={handleDeposit} disabled={busy}>{busy ? 'Processing...' : 'Confirm Deposit'}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '480px', margin: '0 auto', background: 'var(--background)', borderRadius: '1.5rem 1.5rem 0 0', padding: '2rem 1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Create Challenge</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Bet Amount (Rs.)</label>
                  <input type="number" className="input" value={betAmt} onChange={e => setBetAmt(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Duration (Days)</label>
                  <input type="number" className="input" value={duration} onChange={e => setDuration(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Calorie Goal</label>
                    <input type="number" className="input" value={goalCal} onChange={e => setGoalCal(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Protein Goal (g)</label>
                    <input type="number" className="input" value={goalPro} onChange={e => setGoalPro(e.target.value)} />
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleCreate} disabled={busy} style={{ marginTop: '1.5rem' }}>{busy ? 'Creating...' : 'Launch Challenge'}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowJoin(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '480px', margin: '0 auto', background: 'var(--background)', borderRadius: '1.5rem 1.5rem 0 0', padding: '2rem 1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Join Contest</h3>
              <input type="text" className="input" placeholder="Invite Code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.2em' }} />
              <button className="btn btn-primary" onClick={handleJoin} disabled={busy || joinCode.length !== 6} style={{ marginTop: '1.5rem' }}>{busy ? 'Verifying...' : 'Join & Stake'}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
