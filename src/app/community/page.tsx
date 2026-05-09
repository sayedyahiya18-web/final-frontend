'use client';

import { useState, useEffect } from 'react';
import { useUser, CommunityPost } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronRight, CheckCircle2, AlertTriangle, Clock, Trophy, X, Info, Activity, Utensils, Flame } from 'lucide-react';
import Link from 'next/link';

const COMMUNITY_EMOJIS: Record<string, string> = {
  Gym: '🏋️', Yoga: '🧘', Running: '🏃', Meditation: '🌿', 'Weight Loss': '⚖️', Nutrition: '🥗'
};

export default function CommunityPage() {
  const { preferences, communityPosts, joinCommunity, isLoggedIn } = useUser();
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push('/');
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted) return null;

  const allPosts = communityPosts;

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // No community joined yet
  if (!preferences?.community) {
    return (
      <div className="container">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Community</h1>
            <p className="subtitle" style={{ fontSize: '0.9rem' }}>Connect with health enthusiasts</p>
          </div>
          <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </Link>
        </header>

        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏘️</div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>Join a Community</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Share your food scans, discover what others eat, and stay motivated together.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            {Object.entries(COMMUNITY_EMOJIS).map(([name, emoji]) => (
              <motion.button key={name} whileTap={{ scale: 0.96 }} onClick={() => joinCommunity(name)}
                className="card"
                style={{ padding: '1.25rem', textAlign: 'center', cursor: 'pointer', border: '2px solid var(--border)', background: 'var(--card)', marginBottom: 0 }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{emoji}</div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Community</h1>
          <p className="subtitle" style={{ fontSize: '0.9rem' }}>
            {COMMUNITY_EMOJIS[preferences.community] || '🏘️'} {preferences.community}
          </p>
        </div>
        <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </Link>
      </header>

      {/* Community Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem', color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.25rem' }}>
              {COMMUNITY_EMOJIS[preferences.community]} {preferences.community}
            </h3>
            <p style={{ opacity: 0.85, fontSize: '0.85rem' }}>
              {allPosts.filter(p => p.community === preferences.community).length} posts shared
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.875rem', borderRadius: '1rem' }}>
            <Trophy size={28} />
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Community Feed</h3>
        <Link href="/scan" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 700 }}>+ New Scan</span>
        </Link>
      </div>

      <AnimatePresence>
        {allPosts.filter(p => p.community === preferences.community).length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No posts yet</h4>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Be the first to share a food scan with your community!
            </p>
            <Link href="/scan" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ width: 'auto', padding: '0.875rem 2rem' }}>
                Scan a Product
              </button>
            </Link>
          </motion.div>
        ) : (
          allPosts
            .filter(p => p.community === preferences.community)
            .map((post, idx) => (
              <motion.div key={post.id}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.06 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPost(post)}
                className="card"
                style={{ padding: '1.25rem', marginBottom: '1rem', borderLeft: `4px solid ${post.isSafe ? '#22c55e' : '#ef4444'}`, cursor: 'pointer' }}>
                {/* Post Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>
                      {(post.username || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>@{post.username}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={11} color="var(--muted)" />
                        <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{timeAgo(post.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                  <span style={{
                    padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                    background: post.isSafe ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: post.isSafe ? '#16a34a' : '#dc2626'
                  }}>
                    {post.isSafe ? '✅' : '⚠️'} {post.healthScore}/100
                  </span>
                </div>

                {/* Product */}
                <div style={{ background: 'var(--secondary)', borderRadius: '1rem', padding: '1rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>{post.productName}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.625rem' }}>{post.brand}</p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    {post.isSafe
                      ? <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                      : <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />}
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.4 }}>{post.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            ))
        )}
      </AnimatePresence>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
            onClick={() => setSelectedPost(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card glass"
              style={{ width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', background: 'var(--background)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                    {(selectedPost.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '1rem' }}>@{selectedPost.username}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>shared in {selectedPost.community}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} style={{ background: 'var(--secondary)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{selectedPost.productName}</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{selectedPost.brand}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: selectedPost.isSafe ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', padding: '1.25rem', borderRadius: '1.25rem', border: `1px solid ${selectedPost.isSafe ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, marginBottom: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: `4px solid ${selectedPost.isSafe ? '#22c55e' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem' }}>
                  {selectedPost.healthScore}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, color: selectedPost.isSafe ? '#166534' : '#991b1b' }}>{selectedPost.isSafe ? 'Healthy Pick' : 'Avoid if possible'}</p>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--muted)' }}>{selectedPost.recommendation}</p>
                </div>
              </div>

              {selectedPost.details && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Reality Check */}
                  {selectedPost.details.realityCheck && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={16} color="var(--primary)" /> Reality Check
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: '1rem', textAlign: 'center' }}>
                          <Utensils size={18} style={{ margin: '0 auto 0.4rem', color: '#fbbf24' }} />
                          <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{selectedPost.details.realityCheck.sugarTeaspoons} tsp sugar</p>
                        </div>
                        <div style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: '1rem', textAlign: 'center' }}>
                          <Flame size={18} style={{ margin: '0 auto 0.4rem', color: '#f87171' }} />
                          <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{selectedPost.details.realityCheck.exerciseToBurn?.minutes}m {selectedPost.details.realityCheck.exerciseToBurn?.activity}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ingredients */}
                  {selectedPost.details.ingredientInsights && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={16} color="var(--primary)" /> Ingredient Insights
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedPost.details.ingredientInsights.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.8rem' }}>
                            <span style={{ fontWeight: 800 }}>{item.ingredient}:</span> {item.explanation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => setSelectedPost(null)}>
                Close Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
