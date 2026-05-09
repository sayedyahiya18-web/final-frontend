'use client';

import { useState, useEffect } from 'react';
import { useUser, Challenge } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronRight, Plus, Wallet, ArrowDownToLine,
  Swords, Clock, Trophy, Copy, Check, X
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
      {/* Header */}
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.15rem' }}>Challenges</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Bet on your discipline</p>
        </div>
        <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </Link>
      </header>

      {/* Wallet Card */}
      <motion.div
        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'linear-gradient(145deg, #1c1917 0%, #292524 100%)',
          borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.25rem', color: '#fafaf9',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={18} color="#a8a29e" />
            <span style={{ fontSize: '0.8rem', color: '#a8a29e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeposit(true)}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fafaf9', padding: '0.4rem 0.875rem', borderRadius: '0.75rem',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
            }}
          >
            <ArrowDownToLine size={14} /> Add Funds
          </motion.button>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#a8a29e', marginRight: '0.15rem' }}>Rs.</span>
          {wallet.balance.toLocaleString()}
        </div>
        {wallet.transactions.length > 0 && (
          <p style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.75rem' }}>
            Last: {wallet.transactions[0].desc}
          </p>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => { setShowCreate(true); setCreatedCode(null); setError(null); }}
          style={{
            padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)', background: 'var(--card)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.625rem', borderRadius: '0.75rem' }}>
            <Plus size={20} color="#f59e0b" />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)' }}>Create</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => { setShowJoin(true); setError(null); }}
          style={{
            padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)', background: 'var(--card)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.625rem', borderRadius: '0.75rem' }}>
            <Swords size={20} color="#3b82f6" />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)' }}>Join</span>
        </motion.button>
      </div>

      {/* Created Code Banner */}
      <AnimatePresence>
        {createdCode && (
          <motion.div
            initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Share this code with your opponent</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.15em', color: '#b45309' }}>{createdCode}</span>
              <button onClick={() => copyCode(createdCode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b45309' }}>
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Swords size={16} color="#f59e0b" /> Active
          </h3>
          {activeChallenges.map((c, i) => (
            <Link href={`/challenges/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="card"
                style={{ padding: '1.25rem', borderLeft: '3px solid #f59e0b', cursor: 'pointer', marginBottom: '0.75rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.creatorName} vs {c.opponentName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Rs.{c.betAmount} each  ·  {getDaysLeft(c)} days left</p>
                  </div>
                  <ChevronRight size={18} color="var(--muted)" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--secondary)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${((c.creatorProgress.caloriesDaysHit + c.creatorProgress.proteinDaysHit) / (c.duration * 2)) * 100}%`,
                      height: '100%', background: '#f59e0b', borderRadius: '3px'
                    }} />
                  </div>
                  <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--secondary)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${((c.opponentProgress.caloriesDaysHit + c.opponentProgress.proteinDaysHit) / (c.duration * 2)) * 100}%`,
                      height: '100%', background: '#3b82f6', borderRadius: '3px'
                    }} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </section>
      )}

      {/* Waiting Challenges */}
      {waitingChallenges.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="var(--muted)" /> Waiting for Opponent
          </h3>
          {waitingChallenges.map((c) => (
            <div key={c.id} className="card" style={{ padding: '1.25rem', borderStyle: 'dashed', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Rs.{c.betAmount} · {c.duration} days</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.goals.dailyCalories} cal / {c.goals.dailyProtein}g protein daily</p>
                </div>
                <button onClick={() => copyCode(c.inviteCode)} style={{
                  background: 'var(--secondary)', border: 'none', padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                  fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
                  color: 'var(--foreground)'
                }}>
                  <Copy size={14} /> {c.inviteCode}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Completed */}
      {completedChallenges.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trophy size={16} color="#a8a29e" /> Completed
          </h3>
          {completedChallenges.map((c) => {
            const isWinner = c.winner === preferences?.username || false;
            const isTie = c.winner === 'tie';
            return (
              <Link href={`/challenges/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ padding: '1rem 1.25rem', opacity: 0.75, marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.creatorName} vs {c.opponentName}</p>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '9999px',
                      background: isTie ? 'rgba(107,114,128,0.1)' : isWinner ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: isTie ? '#6b7280' : isWinner ? '#16a34a' : '#dc2626'
                    }}>
                      {isTie ? 'Tie' : isWinner ? 'Won' : 'Lost'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}

      {/* Empty state */}
      {challenges.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Swords size={48} color="var(--muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>No challenges yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Create a challenge and share the invite code with a friend to get started.
          </p>
        </div>
      )}

      {/* ── MODALS ── */}

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}
            onClick={() => setShowDeposit(false)}
          >
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '500px', margin: '0 auto', background: 'var(--card)', borderRadius: '1.5rem', padding: '1.75rem', boxShadow: '0 -10px 40px rgba(0,0,0,0.15)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Add Funds</h3>
                <button onClick={() => setShowDeposit(false)} style={{ background: 'var(--secondary)', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <input type="number" placeholder="Amount in Rs." className="input" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} style={{ marginBottom: '1rem' }} />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[100, 250, 500, 1000].map(a => (
                  <button key={a} onClick={() => setDepositAmt(String(a))} style={{
                    flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: '1px solid var(--border)',
                    background: depositAmt === String(a) ? 'var(--foreground)' : 'var(--card)',
                    color: depositAmt === String(a) ? 'var(--background)' : 'var(--foreground)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                  }}>
                    {a}
                  </button>
                ))}
              </div>
              <button className="btn" onClick={handleDeposit} disabled={busy} style={{
                background: '#1c1917', color: '#fafaf9', fontWeight: 700
              }}>
                {busy ? 'Processing...' : 'Deposit'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Challenge Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '500px', margin: '0 auto', background: 'var(--card)', borderRadius: '1.5rem', padding: '1.75rem', boxShadow: '0 -10px 40px rgba(0,0,0,0.15)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>New Challenge</h3>
                <button onClick={() => setShowCreate(false)} style={{ background: 'var(--secondary)', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Bet Amount (Rs.)</label>
              <input type="number" className="input" value={betAmt} onChange={e => setBetAmt(e.target.value)} />
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Duration (days)</label>
              <input type="number" className="input" value={duration} onChange={e => setDuration(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Daily Calories Goal</label>
                  <input type="number" className="input" value={goalCal} onChange={e => setGoalCal(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Daily Protein (g)</label>
                  <input type="number" className="input" value={goalPro} onChange={e => setGoalPro(e.target.value)} />
                </div>
              </div>
              <button className="btn" onClick={handleCreate} disabled={busy} style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 700, marginTop: '0.5rem'
              }}>
                {busy ? 'Creating...' : `Stake Rs.${betAmt} & Create`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Challenge Modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}
            onClick={() => setShowJoin(false)}
          >
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '500px', margin: '0 auto', background: 'var(--card)', borderRadius: '1.5rem', padding: '1.75rem', boxShadow: '0 -10px 40px rgba(0,0,0,0.15)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Join Challenge</h3>
                <button onClick={() => setShowJoin(false)} style={{ background: 'var(--secondary)', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <input
                type="text" className="input" placeholder="Enter 6-letter invite code"
                value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.15em' }}
                maxLength={6}
              />
              <button className="btn" onClick={handleJoin} disabled={busy || joinCode.length !== 6} style={{
                background: '#3b82f6', color: 'white', fontWeight: 700
              }}>
                {busy ? 'Joining...' : 'Join & Stake'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
