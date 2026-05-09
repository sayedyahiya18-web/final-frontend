'use client';

import { useUser } from '@/lib/user-context';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Calendar, CheckCircle2, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { preferences } = useUser();
  const history = preferences?.scanHistory || [];

  return (
    <div className="container">
      <header style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="title" style={{ fontSize: '1.25rem', margin: 0 }}>Analysis Log</h1>
          <p className="subtitle" style={{ fontSize: '0.75rem', margin: 0 }}>Review of your recent scans</p>
        </div>
      </header>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <History size={40} style={{ color: 'var(--muted)', opacity: 0.3, marginBottom: '1.5rem' }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No activity recorded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence>
            {history.map((product, index) => (
              <motion.div
                key={`${product.barcode}-${product.timestamp}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card"
                style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 0 }}
              >
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: product.isSafe ? '#10b981' : '#ef4444',
                  flexShrink: 0
                }} />
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>{product.name}</h4>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.75rem' }}>
                    {product.brand} · {new Date(product.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: product.isSafe ? '#10b981' : '#ef4444', background: product.isSafe ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {product.isSafe ? 'SAFE' : 'RISK'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
