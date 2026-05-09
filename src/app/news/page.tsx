'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ChevronRight, ExternalLink, Clock, Bookmark, Search, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { fetchHealthNews } from '@/lib/api';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Nutrition', 'Fitness', 'Science', 'Mental Health'];

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      const articles = await fetchHealthNews(activeCategory);
      setNews(articles);
      setLoading(false);
    }
    loadNews();
  }, [activeCategory]);

  return (
    <div className="container">
      <header style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="title" style={{ fontSize: '1.25rem', margin: 0 }}>Intelligence</h1>
          <p className="subtitle" style={{ fontSize: '0.75rem', margin: 0 }}>Curated clinical & wellness news</p>
        </div>
      </header>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            style={{ 
              whiteSpace: 'nowrap', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              border: activeCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: activeCategory === cat ? 'var(--primary)' : 'transparent',
              color: activeCategory === cat ? 'var(--primary-foreground)' : 'var(--muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Search size={32} className="animate-pulse" color="var(--muted)" />
          <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>Scanning archives...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {news.map((item, idx) => (
            <motion.a 
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              key={item.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card" 
              style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginBottom: 0 }}
            >
              {item.image && (
                <img 
                  src={item.image} 
                  style={{ width: '70px', height: '70px', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} 
                  alt=""
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.source}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{item.time}</span>
                </div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
                  <ExternalLink size={12} />
                  <span>Read Article</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Clinical data refreshed daily • Intelligence by NewsAPI</p>
      </footer>
    </div>
  );
}
