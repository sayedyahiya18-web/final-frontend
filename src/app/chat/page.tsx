'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { chatWithAI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Camera, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const { preferences } = useUser();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: "Hi! I'm your NutriScan AI assistant. You can ask me anything about nutrition, recipes, or how to manage your dietary goals." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const response = await chatWithAI(userMsg, preferences);
    setMessages(prev => [...prev, { role: 'bot', content: response }]);
    setLoading(false);
  };

  return (
    <div className="container" style={{ paddingBottom: '100px', height: '100vh', overflow: 'hidden' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 className="title" style={{ fontSize: '1.5rem' }}>Health Chat</h1>
        <p className="subtitle" style={{ marginBottom: '0' }}>Instant answers to your nutrition questions</p>
      </header>

      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          paddingBottom: '1rem'
        }}
      >
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start'
            }}
          >
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: msg.role === 'user' ? 'white' : 'var(--primary)',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div style={{ 
              maxWidth: '80%', 
              padding: '0.875rem 1rem', 
              borderRadius: '1.25rem',
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--card)',
              color: msg.role === 'user' ? 'white' : 'var(--foreground)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              borderTopRightRadius: msg.role === 'user' ? '0.25rem' : '1.25rem',
              borderTopLeftRadius: msg.role === 'user' ? '1.25rem' : '0.25rem',
            }}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="var(--primary)" />
            </div>
            <div className="card" style={{ padding: '0.5rem 1rem', marginBottom: 0 }}>
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
      </div>

      <form 
        onSubmit={handleSend}
        style={{ 
          marginTop: '1rem', 
          display: 'flex', 
          gap: '0.5rem', 
          background: 'var(--card)', 
          padding: '0.5rem', 
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}
      >
        <input 
          className="input" 
          style={{ marginBottom: 0, border: 'none', background: 'transparent' }} 
          placeholder="Ask me anything..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
          <Send size={20} />
        </button>
      </form>

      <nav className="nav">
        <Link href="/scan" className="nav-item">
          <Camera size={24} />
          <span>Scan</span>
        </Link>
        <Link href="/diet-plan" className="nav-item">
          <Calendar size={24} />
          <span>Diet</span>
        </Link>
        <Link href="/chat" className="nav-item active">
          <MessageSquare size={24} />
          <span>AI Chat</span>
        </Link>
      </nav>
    </div>
  );
}
