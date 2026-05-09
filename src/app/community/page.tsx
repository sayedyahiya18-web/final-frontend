'use client';

import { useState, useEffect } from 'react';
import { useUser, CommunityPost } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronRight, CheckCircle2, AlertTriangle, Clock, Trophy, X, Info, Activity, Utensils, Flame } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  const { preferences, communityPosts, joinCommunity, isLoggedIn } = useUser();
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const COMMUNITIES = [
    { name: 'Gym', desc: 'Focus on protein & macros' },
    { name: 'Yoga', desc: 'Plant-based & holistic' },
    { name: 'Running', desc: 'Carb loading & endurance' },
    { name: 'Weight Loss', desc: 'Calorie conscious' },
    { name: 'Nutrition', desc: 'General healthy eating' }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push('/');
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted) return null;

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!preferences?.community) {
    return (
      <div className="container">
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 className="title">Communities</h1>
          <p className="subtitle">Connect with focused health groups</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {COMMUNITIES.map((c) => (
            <motion.button key={c.name} whileTap={{ scale: 0.98 }} onClick={() => joinCommunity(c.name)}
              className="card"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', textAlign: 'left', cursor: 'pointer', marginBottom: 0, background: 'var(--card)' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{c.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>{c.desc}</p>
              </div>
              <ChevronRight size={18} color="var(--muted)" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const posts = communityPosts.filter(p => p.community === preferences.community);

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="title" style={{ fontSize: '1.5rem' }}>{preferences.community}</h1>
          <p className="subtitle" style={{ fontSize: '0.875rem' }}>Community Group Feed</p>
        </div>
        <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.6rem', borderRadius: '0.75rem' }}>
          <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
        </Link>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Shared Scans</h3>
        <Link href="/scan" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>Share Yours</span>
        </Link>
      </div>

      <AnimatePresence>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No activity in this community yet.</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <motion.div key={post.id}
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedPost(post)}
              className="card"
              style={{ padding: '1.25rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>
                    {(post.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{post.username}</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>{timeAgo(post.timestamp)}</p>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: post.isSafe ? '#10b981' : '#ef4444', background: post.isSafe ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', padding: '0.25rem 0.6rem', borderRadius: '9999px' }}>
                  Score: {post.healthScore}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{post.productName}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>{post.brand}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', lineHeight: 1.5, opacity: 0.8 }}>{post.recommendation}</p>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setSelectedPost(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', padding: '2rem 1.5rem', background: 'var(--background)', borderRadius: '1.5rem 1.5rem 0 0' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Scan Details</h3>
                <button onClick={() => setSelectedPost(null)} style={{ background: 'var(--secondary)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                    {(selectedPost.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>@{selectedPost.username}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Health enthusiast</p>
                  </div>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{selectedPost.productName}</h2>
                <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{selectedPost.brand}</p>
                
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', border: `1px solid ${selectedPost.isSafe ? '#10b981' : '#ef4444'}`, background: selectedPost.isSafe ? 'rgba(16,185,129,0.02)' : 'rgba(239,68,68,0.02)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `3px solid ${selectedPost.isSafe ? '#10b981' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
                    {selectedPost.healthScore}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: selectedPost.isSafe ? '#059669' : '#dc2626', marginBottom: '0.1rem' }}>{selectedPost.isSafe ? 'Healthy Choice' : 'Proceed with Caution'}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.5 }}>{selectedPost.recommendation}</p>
                  </div>
                </div>
              </div>

              {selectedPost.details?.realityCheck && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Impact Analysis</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Sugar Content</p>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedPost.details.realityCheck.sugarTeaspoons} tsp sugar</p>
                    </div>
                    <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Exercise to Burn</p>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedPost.details.realityCheck.exerciseToBurn?.minutes}m {selectedPost.details.realityCheck.exerciseToBurn?.activity}</p>
                    </div>
                  </div>
                </div>
              )}

              <button className="btn btn-primary" onClick={() => setSelectedPost(null)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
