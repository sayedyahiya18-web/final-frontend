'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ChevronRight, ExternalLink, Clock, Bookmark, Share2, Search } from 'lucide-react';
import Link from 'next/link';
import { fetchHealthNews } from '@/lib/api';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Nutrition', 'Fitness', 'Science', 'Recipes', 'Mental Health'];

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
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Daily Health</h1>
          <p className="subtitle" style={{ fontSize: '0.9rem' }}>Curated nutrition & wellness news</p>
        </div>
        <div style={{ background: 'rgba(45, 212, 191, 0.1)', padding: '0.75rem', borderRadius: '1rem', color: 'var(--primary)' }}>
          <Newspaper size={24} />
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Search size={48} color="var(--primary)" />
          </motion.div>
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>Fetching {activeCategory} updates...</p>
        </div>
      ) : (
        <>
          {news.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card" 
              style={{ 
                padding: 0, 
                overflow: 'hidden', 
                position: 'relative', 
                height: '240px', 
                border: 'none',
                marginBottom: '2rem'
              }}
            >
              <a href={news[0].url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img 
                  src={news[0].image} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Featured"
                />
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  padding: '1.5rem', 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                  color: 'white'
                }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    background: 'var(--primary)', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '0.5rem', 
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    display: 'inline-block'
                  }}>
                    TRENDING
                  </span>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3 }}>{news[0].title}</h2>
                </div>
              </a>
            </motion.div>
          )}

          {/* Categories Scroller */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none', marginBottom: '1rem' }}>
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  whiteSpace: 'nowrap', 
                  padding: '0.5rem 1.25rem', 
                  borderRadius: '2rem', 
                  border: 'none',
                  background: activeCategory === cat ? 'var(--primary)' : 'var(--secondary)',
                  color: activeCategory === cat ? 'white' : 'var(--muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* News List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {news.map((item, idx) => (
              <motion.a 
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card glass" 
                style={{ padding: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
              >
                <img 
                  src={item.image} 
                  style={{ width: '80px', height: '80px', borderRadius: '0.75rem', objectFit: 'cover' }} 
                  alt={item.title}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800 }}>{activeCategory === 'All' ? 'HEALTH' : activeCategory.toUpperCase()}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={10} /> {item.time}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>{item.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{item.source}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Bookmark size={14} color="var(--muted)" />
                      <ExternalLink size={14} color="var(--muted)" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </>
      )}

      <footer style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Powered by NewsAPI • Updated daily</p>
      </footer>
    </div>
  );
}
