'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Wind, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError('E-mail ou senha inválidos. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#135bec] text-white shadow-xl shadow-[#135bec]/20">
            <Wind size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">HVAC Pro</h1>
          <p className="mt-2 text-slate-500 font-medium">Bem-vindo de volta! Por favor, insira seus dados.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Endereço de E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm transition-all focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10"
                  placeholder="nome@empresa.com.br"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Senha</label>
                <a href="#" className="text-xs font-bold text-[#135bec] hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-12 text-sm transition-all focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border-slate-300 text-[#135bec] focus:ring-[#135bec]" />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600">Lembrar por 30 dias</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#135bec] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#135bec]/20 transition-all hover:bg-[#135bec]/90 hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Não tem uma conta?{' '}
              <a href="#" className="font-bold text-[#135bec] hover:underline">Contatar Administrador</a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          &copy; 2024 HVAC Pro ERP. Todos os direitos reservados.
        </div>
      </motion.div>
    </div>
  );
}
