'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1200);
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 animate-in fade-in duration-300">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">Đăng ký thành công! Cảm ơn bạn đã kết nối.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative mt-4 flex items-center w-full">
      <input
        type="email"
        required
        placeholder="Nhập email của bạn"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'loading'}
        className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="absolute right-1.5 top-1.5 w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white disabled:opacity-50 transition-colors"
        aria-label="Subscribe"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
