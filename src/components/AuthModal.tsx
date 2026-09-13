import { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { signIn, signUp, loading, clearError } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setEmail('');
      setPassword('');
      setLocalError(null);
      clearError();
    }
  }, [isOpen, defaultMode, clearError]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]') ?? []);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const res = mode === 'login' 
      ? await signIn(email, password)
      : await signUp(email, password);

    if (res.error) {
      setLocalError(res.error);
    } else {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div ref={dialogRef} className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div className="modal-header">
          <div>
            <h2 id="auth-modal-title" className="modal-title">{mode === 'login' ? 'Acessar Conta' : 'Criar Conta'}</h2>
            <p className="modal-subtitle">
              {mode === 'login' 
                ? 'Entre para salvar seu ranking e sua coleção' 
                : 'Crie sua conta para organizar seus relógios'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            type="button" 
            className={`modal-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setLocalError(null); }}
          >
            Entrar
          </button>
          <button 
            type="button" 
            className={`modal-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setLocalError(null); }}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {localError && (
            <div className="modal-alert" role="alert">
              {localError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">E-mail</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Senha</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
