import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = mode === 'in'
        ? await signIn(email, password)
        : await signUp(email, password, displayName || undefined);
      if (result.error) {
        setError(result.error.message);
      } else {
        onOpenChange(false);
        setEmail('');
        setPassword('');
        setDisplayName('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <DialogPrimitive.Content
          className={clsx(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-white/10 bg-[var(--bg-panel)] p-6 shadow-2xl',
            'text-[var(--text-primary)]'
          )}
        >
          <DialogPrimitive.Title className="text-lg font-bold">
            {mode === 'in' ? 'Sign in' : 'Sign up'} to sync progress
          </DialogPrimitive.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {mode === 'up' && (
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50"
              >
                {mode === 'in' ? 'Sign in' : 'Sign up'}
              </button>
              <button
                type="button"
                onClick={() => setMode(mode === 'in' ? 'up' : 'in')}
                className="rounded-lg border border-white/20 px-3 py-2 text-xs font-medium hover:bg-white/10"
              >
                {mode === 'in' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </form>
          <DialogPrimitive.Close className="absolute right-3 top-3 rounded p-1 text-neutral-400 hover:bg-white/10 hover:text-white">
            <span aria-hidden>×</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
