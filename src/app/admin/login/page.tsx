'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, KeyRound, Mail, Shield, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (emailToUse?: string, passToUse?: string) => {
    setError('');
    setLoading(true);

    const loginEmail = emailToUse || email;
    const loginPass = passToUse || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPass,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (data: any) => {
    if (data && data.user && data.token) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      if (data.user.role === 'ADMIN' || data.user.role === 'GERENTE' || data.user.role === 'ATENDENTE') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative font-sans">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" /> Voltar à Loja Virtual
      </Link>

      <div className="w-full max-w-sm bg-white text-slate-900 border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl mx-auto flex items-center justify-center font-bold">
            <Store className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Painel Administrativo RBAC
          </h1>
          <p className="text-xs text-slate-500">
            Informe suas credenciais ou continue com o Google
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 stroke-[1.5]" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Botão do Google OAuth */}
        <div className="space-y-2">
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
            turnstileToken={turnstileToken}
          />
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              ou com e-mail corporativo
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </div>

        {/* 2. Formulário com E-mail e Senha */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Corporativo</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@petcostelinha.com.br"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha de Acesso</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
            </div>
          </div>

          {/* 3. Widget Anti-Bot do Cloudflare Turnstile */}
          <TurnstileWidget
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken('')}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors text-xs uppercase tracking-wider"
          >
            {loading ? 'Autenticando...' : 'Acessar Sistema'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 text-center uppercase tracking-wider">
            Acesso Rápido para Avaliação (1-Clique)
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleLogin('admin@petcostelinha.com.br', '123456')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-colors text-center flex flex-col items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-slate-700 stroke-[1.5]" /> ADMIN
            </button>

            <button
              onClick={() => handleLogin('gerente@petcostelinha.com.br', '123456')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-colors text-center flex flex-col items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-700 stroke-[1.5]" /> GERENTE
            </button>

            <button
              onClick={() => handleLogin('atendente@petcostelinha.com.br', '123456')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-colors text-center flex flex-col items-center gap-1"
            >
              <Store className="w-3.5 h-3.5 text-slate-700 stroke-[1.5]" /> ATENDENTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
