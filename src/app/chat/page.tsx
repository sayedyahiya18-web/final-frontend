'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { chatWithAI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Camera, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

const markdownStyles = `
  .markdown-content p { margin-bottom: 0.5rem; }
  .markdown-content p:last-child { margin-bottom: 0; }
  .markdown-content ul, .markdown-content ol { padding-left: 1.25rem; margin-bottom: 0.5rem; }
  .markdown-content li { margin-bottom: 0.25rem; }
  .markdown-content strong { font-weight: 700; }
`;

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
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

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
    <div style={{ 
      height: '100vh', 
      maxHeight: '100vh',
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--background)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{markdownStyles}</style>
      {/* Header */}
      <header style={{ 
        padding: '1.5rem', 
        paddingBottom: '0.5rem', 
        flexShrink: 0,
        borderBottom: '1px solid var(--border)',
        background: 'var(--background)'
      }}>
        <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Health Chat</h1>
        <p className="subtitle" style={{ fontSize: '0.875rem', marginBottom: '0' }}>Instant nutrition answers</p>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          padding: '1.5rem',
          paddingBottom: '2rem',
          scrollBehavior: 'smooth'
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              {msg.role === 'user' ? msg.content : <div className="markdown-content"><ReactMarkdown>{msg.content}</ReactMarkdown></div>}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="var(--primary)" />
            </div>
            <div style={{ padding: '0.5rem 1rem', background: 'var(--card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '1rem', 
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', 
        background: 'var(--background)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <form 
          onSubmit={handleSend}
          style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            background: 'var(--secondary)', 
            padding: '0.5rem', 
            borderRadius: '1.5rem',
            border: '1px solid var(--border)'
          }}
        >
          <input 
            className="input" 
            style={{ marginBottom: 0, border: 'none', background: 'transparent' }} 
            placeholder="Ask about your diet..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}>
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Navigation */}
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

