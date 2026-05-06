'use client';

import { useUser } from '@/lib/user-context';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Calendar, CheckCircle2, XCircle, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { preferences } = useUser();
  const history = preferences?.scanHistory || [];

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title">Scan History</h1>
        <p className="subtitle">Products you've analyzed recently</p>
      </header>

      {history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ textAlign: 'center', padding: '3rem 1.5rem' }}
        >
          <div style={{ background: 'var(--secondary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <History size={32} color="var(--muted)" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>No Scans Yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Start scanning products to see your health history here.
          </p>
          <Link href="/scan" className="btn btn-primary">
            Open Scanner
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {history.map((product, index) => (
              <motion.div
                key={`${product.barcode}-${product.timestamp}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card"
                style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '0.75rem', 
                  background: product.isSafe ? '#dcfce7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {product.isSafe ? <CheckCircle2 color="#22c55e" /> : <XCircle color="#ef4444" />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{product.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.75rem' }}>
                    <Calendar size={12} />
                    {new Date(product.timestamp).toLocaleDateString()}
                    <span>•</span>
                    {product.brand}
                  </div>
                </div>

                <ChevronRight size={20} color="var(--muted)" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
