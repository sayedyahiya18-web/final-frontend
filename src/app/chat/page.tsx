'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/user-context';
import { chatWithAI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Camera, Calendar, MessageSquare, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

const markdownStyles = `
  .markdown-content p { margin-bottom: 0.75rem; }
  .markdown-content p:last-child { margin-bottom: 0; }
  .markdown-content ul, .markdown-content ol { padding-left: 1.25rem; margin-bottom: 0.75rem; }
  .markdown-content li { margin-bottom: 0.4rem; }
  .markdown-content strong { font-weight: 700; }
  .markdown-content h1, .markdown-content h2, .markdown-content h3 { font-size: 1rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; }
`;

export default function ChatPage() {
  const { preferences } = useUser();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: "Hello. I'm your NutriScan AI assistant. How can I help you with your nutrition goals today?" }
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <style>{markdownStyles}</style>
      
      {/* Header */}
      <header style={{ 
        padding: '1.25rem 1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--background)',
        zIndex: 10
      }}>
        <Link href="/" style={{ color: 'var(--muted)', background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>AI Assistant</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, margin: 0 }}>Active Now</p>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem',
          padding: '1.5rem',
          paddingBottom: '2rem'
        }}
      >
        {messages.map((msg, i) => (
          <div 
            key={i}
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '0.5rem'
            }}
          >
            <div style={{ 
              maxWidth: '85%', 
              padding: '1rem 1.25rem', 
              borderRadius: '1.25rem',
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)',
              color: msg.role === 'user' ? 'var(--primary-foreground)' : 'var(--foreground)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              border: 'none',
              borderBottomRightRadius: msg.role === 'user' ? '0.25rem' : '1.25rem',
              borderBottomLeftRadius: msg.role === 'user' ? '1.25rem' : '0.25rem',
              boxShadow: 'none'
            }}>
              {msg.role === 'user' ? msg.content : <div className="markdown-content"><ReactMarkdown>{msg.content}</ReactMarkdown></div>}
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--muted)', fontWeight: 500, margin: '0 0.5rem' }}>
              {msg.role === 'user' ? 'You' : 'NutriScan AI'}
            </span>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ padding: '0.875rem 1.25rem', background: 'var(--secondary)', borderRadius: '1.25rem', borderBottomLeftRadius: '0.25rem' }}>
              <span className="animate-pulse">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ 
        padding: '1.25rem 1.5rem', 
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))', 
        background: 'var(--background)',
        borderTop: '1px solid var(--border)'
      }}>
        <form 
          onSubmit={handleSend}
          style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            background: 'var(--secondary)', 
            padding: '0.5rem', 
            paddingLeft: '1.25rem',
            borderRadius: '2rem'
          }}
        >
          <input 
            style={{ 
              flex: 1, 
              border: 'none', 
              background: 'transparent', 
              fontSize: '0.9375rem', 
              color: 'var(--foreground)',
              outline: 'none',
              padding: '0.5rem 0'
            }} 
            placeholder="Type your question..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            style={{ 
              width: '42px', 
              height: '42px', 
              padding: 0, 
              borderRadius: '50%', 
              background: 'var(--primary)', 
              color: 'var(--primary-foreground)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: !input.trim() ? 0.5 : 1
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
