import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What is a mutual fund?',
  'How do I earn XP?',
  'Explain SIP investing',
  'What is Nifty 50?',
  'How does the simulator work?',
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greeted, setGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { userProfile } = useUser();

  useEffect(() => {
    if (open && !greeted) {
      setGreeted(true);
      const name = userProfile?.displayName?.split(' ')[0];
      const greeting = name
        ? `Hey ${name}! 👋 I'm your InvesEd AI assistant. Ask me anything about investing, your modules, or how the platform works!`
        : `Hey there! 👋 I'm your InvesEd AI assistant. I can help you understand stocks, mutual funds, SIPs, and guide you through the platform. What would you like to learn?`;
      setMessages([{ id: 'greeting', role: 'assistant', content: greeting }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history
            .filter(m => m.id !== 'greeting')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'api-error');

      setMessages(prev => [...prev, {
        id: `${Date.now()}-a`,
        role: 'assistant',
        content: data.reply,
      }]);
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 brand-gradient rounded-full shadow-xl flex items-center justify-center text-white"
            aria-label="Open AI assistant"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
            style={{ width: '360px', maxWidth: 'calc(100vw - 24px)', height: '520px' }}
          >
            {/* Header */}
            <div className="brand-gradient px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm flex items-center gap-1">
                  InvesEd AI Assistant
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </div>
                <div className="text-white/70 text-xs">Your investment learning guide</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'assistant' ? 'brand-gradient' : 'bg-secondary/20'}`}>
                    {msg.role === 'assistant'
                      ? <Bot className="w-3.5 h-3.5 text-white" />
                      : <User className="w-3.5 h-3.5 text-secondary" />}
                  </div>
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-white border border-border text-foreground rounded-tl-sm shadow-sm'
                      : 'brand-gradient text-white rounded-tr-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full brand-gradient flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm">
                    <div className="flex items-center gap-1">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 text-center">
                  {error}
                </div>
              )}

              {/* Quick suggestions — only right after greeting */}
              {messages.length === 1 && !loading && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="text-xs px-2.5 py-1.5 bg-white border border-border rounded-full text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-white flex-shrink-0">
              <div className="flex gap-2 items-center bg-slate-50 border border-border rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-ring transition-shadow">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask anything about investing…"
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 min-w-0"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 brand-gradient rounded-lg flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                >
                  {loading
                    ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    : <Send className="w-3.5 h-3.5 text-white" />}
                </motion.button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-1.5">For learning only · Not financial advice</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
