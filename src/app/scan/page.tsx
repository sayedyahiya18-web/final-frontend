'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { getProductByBarcode, generateHealthInsight } from '@/lib/api';
import Scanner from '@/components/Scanner';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Search, AlertTriangle, CheckCircle2, Info, ChevronRight, Utensils, Activity, Flame, Users, X, Send } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const { preferences, addToHistory, addExerciseGoal, postToCommunity } = useUser();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [insight, setInsight] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [goalAdded, setGoalAdded] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postSent, setPostSent] = useState(false);

  useEffect(() => {
    if (insight?.voiceSummary && typeof window !== 'undefined') {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(insight.voiceSummary);
      utterance.rate = 0.9; utterance.pitch = 1.1; utterance.volume = 0.8;
      const voices = synth.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
      if (preferred) utterance.voice = preferred;
      synth.speak(utterance);
    }
    return () => { if (typeof window !== 'undefined') window.speechSynthesis.cancel(); };
  }, [insight]);

  const handleScan = async (barcode: string) => {
    setShowScanner(false); setLoading(true); setError(null);
    setProduct(null); setInsight(null); setGoalAdded(false); setPostSent(false);
    try {
      const productData = await getProductByBarcode(barcode);
      if (productData) {
        setProduct(productData);
        const healthInsight = await generateHealthInsight(productData, preferences);
        setInsight(healthInsight);
        await addToHistory({ barcode, name: productData.name, brand: productData.brand, timestamp: Date.now(), isSafe: healthInsight.isSafe });
      } else {
        setError('Product not found. Please try another barcode.');
      }
    } catch (err) {
      setError('An error occurred during scanning. Please try again.');
    }
    setLoading(false);
  };

  const handleAddGoal = async () => {
    if (!insight?.realityCheck?.exerciseToBurn) return;
    await addExerciseGoal(insight.realityCheck.exerciseToBurn.minutes, insight.realityCheck.exerciseToBurn.activity);
    setGoalAdded(true);
  };

  const handlePostToCommunity = async () => {
    if (!product || !insight || !preferences?.community) return;
    await postToCommunity({
      username: preferences.username || 'Anonymous',
      community: preferences.community,
      productName: product.name,
      brand: product.brand,
      healthScore: insight.score || 0,
      isSafe: insight.isSafe,
      recommendation: insight.recommendation,
      warning: insight.warning,
    });
    setPostSent(true);
    setShowPostModal(false);
  };

  const resetScan = () => { setProduct(null); setInsight(null); setGoalAdded(false); setPostSent(false); };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Analyze Food</h1>
          <p className="subtitle" style={{ fontSize: '0.9rem' }}>Instant clarity for your choices</p>
        </div>
        <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </Link>
      </header>

      {!product && !loading && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card glass"
          style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, #064e3b 100%)', color: 'white', border: 'none', boxShadow: '0 20px 40px rgba(15, 118, 110, 0.2)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <Camera size={72} strokeWidth={1} />
            </motion.div>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 800 }}>Ready to Scan?</h2>
          <p style={{ marginBottom: '2.5rem', opacity: 0.8, maxWidth: '280px', margin: '0 auto 2.5rem' }}>Point your camera at a barcode to decode ingredients instantly.</p>
          <button className="btn" style={{ background: 'white', color: 'var(--primary)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', width: 'auto', padding: '1rem 2.5rem', margin: '0 auto' }} onClick={() => setShowScanner(true)}>
            Open Scanner
          </button>
        </motion.div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: '1.5rem' }}>
            <Search size={48} color="var(--primary)" />
          </motion.div>
          <h3 style={{ fontWeight: 700 }}>AI is analyzing...</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Comparing with your health goals</p>
        </div>
      )}

      {error && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card" style={{ textAlign: 'center', borderColor: '#ef4444' }}>
          <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => setShowScanner(true)}>Try Another Product</button>
        </motion.div>
      )}

      {product && insight && !loading && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          {postSent && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              style={{ background: 'linear-gradient(135deg, var(--primary), #0d9488)', borderRadius: '1rem', padding: '0.875rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
              <Users size={18} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Posted to {preferences?.community} community! 🎉</p>
            </motion.div>
          )}

          {/* Product Info */}
          <div className="card glass" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1rem' }}>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ width: '90px', height: '90px', borderRadius: '1rem', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '90px', height: '90px', background: 'var(--secondary)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Info size={32} color="var(--muted)" />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{product.name}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 600 }}>{product.brand}</p>
              <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', background: 'var(--secondary)', borderRadius: '0.5rem', color: 'var(--muted)', marginTop: '0.5rem', display: 'inline-block' }}>{product.quantity || 'Standard Size'}</span>
            </div>
          </div>

          {/* Health Score */}
          <div className="card" style={{ borderColor: insight.isSafe ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', background: insight.isSafe ? 'rgba(240,253,244,0.5)' : 'rgba(254,242,242,0.5)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                <svg width="70" height="70" viewBox="0 0 70 70">
                  <circle cx="35" cy="35" r="31" fill="none" stroke="currentColor" strokeWidth="6" style={{ opacity: 0.1 }} />
                  <motion.circle cx="35" cy="35" r="31" fill="none" stroke="currentColor" strokeWidth="6"
                    strokeDasharray="194.7" initial={{ strokeDashoffset: 194.7 }}
                    animate={{ strokeDashoffset: 194.7 - (194.7 * (insight.score || 0)) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }} style={{ color: insight.isSafe ? '#22c55e' : '#ef4444' }} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.125rem' }}>{insight.score || 0}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: insight.isSafe ? '#166534' : '#991b1b', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{insight.isSafe ? 'Healthy Choice ✅' : 'Proceed with Caution ⚠️'}</h4>
                <p style={{ fontSize: '0.9rem', marginTop: '0.4rem', color: 'var(--foreground)', opacity: 0.8, lineHeight: 1.4 }}>{insight.warning || insight.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Reality Check + Exercise Goal */}
          {insight.realityCheck && (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={18} color="var(--primary)" /> Reality Check
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                  <Utensils size={24} style={{ margin: '0 auto 0.5rem', color: '#fbbf24' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Sugar Content</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800 }}>{insight.realityCheck.sugarTeaspoons} Teaspoons</p>
                </div>
                <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                  <Activity size={24} style={{ margin: '0 auto 0.5rem', color: '#f87171' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Burn it with</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800 }}>{insight.realityCheck.exerciseToBurn.minutes}m {insight.realityCheck.exerciseToBurn.activity}</p>
                </div>
              </div>
              {!insight.isSafe && (
                <motion.button whileTap={{ scale: 0.96 }} onClick={handleAddGoal} disabled={goalAdded}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '1rem', border: 'none', background: goalAdded ? 'rgba(34,197,94,0.1)' : 'linear-gradient(135deg, #f97316, #ef4444)', color: goalAdded ? '#22c55e' : 'white', fontWeight: 700, fontSize: '0.9rem', cursor: goalAdded ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s ease' }}>
                  <Flame size={18} />
                  {goalAdded ? `✅ +${insight.realityCheck.exerciseToBurn.minutes}min added to your goal!` : `Add ${insight.realityCheck.exerciseToBurn.minutes}min ${insight.realityCheck.exerciseToBurn.activity} to my goal`}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Smart Swap */}
          {insight.smartSwap && (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card" style={{ background: 'rgba(45,212,191,0.05)', borderColor: 'var(--primary)', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <CheckCircle2 size={18} /> Smart Swap
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Try <strong>{insight.smartSwap.productName}</strong> instead.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.4 }}>{insight.smartSwap.reason}</p>
            </motion.div>
          )}

          {/* Ingredient Insights */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1.25rem', fontWeight: 800 }}>Ingredient Insights</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {insight.ingredientInsights ? insight.ingredientInsights.map((item: any, idx: number) => (
                <div key={idx} style={{ padding: '0.75rem 1rem', background: 'var(--secondary)', borderRadius: '1rem' }}>
                  <h5 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.ingredient}</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>{item.explanation}</p>
                </div>
              )) : <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.5 }}>{product.ingredients || 'Not available.'}</p>}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              {[{ label: 'Sugar', val: `${product.nutrition.sugars_100g?.toFixed(1) || 0}g` }, { label: 'Protein', val: `${product.nutrition.proteins_100g?.toFixed(1) || 0}g` }, { label: 'Energy', val: `${product.nutrition['energy-kcal_100g'] || 0}kcal` }].map(m => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>{m.label}</p>
                  <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{m.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { resetScan(); setShowScanner(true); }}>
              <Camera size={20} /> New Scan
            </button>
            {preferences?.community && !postSent && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowPostModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                <Users size={18} /> Post
              </motion.button>
            )}
            <button className="btn btn-secondary" style={{ width: 'auto', paddingLeft: '1.25rem', paddingRight: '1.25rem' }} onClick={resetScan}>Back</button>
          </div>
        </motion.div>
      )}

      {/* Post to Community Modal */}
      <AnimatePresence>
        {showPostModal && product && insight && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}
            onClick={() => setShowPostModal(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '500px', margin: '0 auto', background: 'var(--card)', borderRadius: '2rem', padding: '1.75rem', boxShadow: '0 -20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Post to {preferences?.community} 🏷️</h3>
                <button onClick={() => setShowPostModal(false)} style={{ background: 'var(--secondary)', border: 'none', borderRadius: '0.75rem', padding: '0.5rem', cursor: 'pointer' }}>
                  <X size={18} color="var(--muted)" />
                </button>
              </div>
              <div style={{ background: 'var(--secondary)', borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '1.25rem', borderLeft: `4px solid ${insight.isSafe ? '#22c55e' : '#ef4444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '1rem' }}>{product.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{product.brand}</p>
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: insight.isSafe ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: insight.isSafe ? '#16a34a' : '#dc2626' }}>
                    Score: {insight.score}/100
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>{insight.recommendation}</p>
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>
                    {(preferences?.username || 'A')[0].toUpperCase()}
                  </div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>@{preferences?.username || 'anonymous'}</p>
                </div>
              </div>
              <button onClick={handlePostToCommunity}
                style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', borderRadius: '1.25rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Send size={18} /> Share with Community
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScanner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'black' }}>
            <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
