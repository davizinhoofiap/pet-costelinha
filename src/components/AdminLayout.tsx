'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  LogOut, 
  Settings, 
  Store, 
  Bell, 
  Check, 
  CheckCircle2,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/masks';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // Estado da Sidebar Retrátil (Collapsible)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Central de Notificações
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isBellOpen, setIsBellOpen] = useState<boolean>(false);
  const [toastAlert, setToastAlert] = useState<{ id: string; cliente: string; total: number } | null>(null);

  const prevNotificationCount = useRef<number>(0);

  // Carregar preferência da sidebar salva no localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('admin_sidebar_collapsed');
    if (savedCollapsed === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Som de Notificação de Vendas (Web Audio API sem assets externos)
  const playSalesChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio context playback ignored:', e);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/admin/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  // Polling a cada 5s na rota de notificações
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/admin/orders/notifications');
        if (res.ok) {
          const data = await res.json();
          const list = data.notifications || [];
          const count = data.unreadCount !== undefined ? data.unreadCount : list.length;
          setNotifications(list);

          // Se houver novos pedidos pagos em relação ao ciclo anterior
          if (count > prevNotificationCount.current && prevNotificationCount.current !== 0) {
            const latest = list[0];
            if (latest) {
              setToastAlert({
                id: latest.id,
                cliente: latest.cliente_nome,
                total: Number(latest.total_valor),
              });
              playSalesChime();
              setTimeout(() => setToastAlert(null), 5000);
            }
          }

          if (prevNotificationCount.current === 0) {
            prevNotificationCount.current = count;
          } else if (count > prevNotificationCount.current) {
            prevNotificationCount.current = count;
          }

          setUnreadCount(count);
        }
      } catch (err) {
        console.error('Erro no polling de notificações admin:', err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin/login');
  };

  const handleMarkAllRead = async () => {
    setUnreadCount(0);
    setNotifications([]);
    setIsBellOpen(false);
    try {
      await fetch('/api/admin/orders/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (err) {
      console.error('Erro ao marcar notificações como lidas no banco:', err);
    }
  };

  const handleMarkSingleRead = async (orderId: string) => {
    setIsBellOpen(false);
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotifications((prev) => prev.filter((n) => n.id !== orderId));
    try {
      await fetch('/api/admin/orders/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
    } catch (err) {
      console.error('Erro ao marcar notificação individual como lida:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans relative">
      {/* TOAST ALERTA FLUTUANTE DE NOVO PEDIDO PAGO */}
      {toastAlert && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 text-white border-2 border-emerald-500 px-4 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-9 h-9 bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              🎉 NOVO PEDIDO PAGO (PIX Mercado Pago)
            </span>
            <p className="text-xs font-bold text-white">
              {toastAlert.cliente} • {formatCurrency(toastAlert.total)}
            </p>
          </div>
          <button onClick={() => setToastAlert(null)} className="text-slate-400 hover:text-white p-1 ml-2">
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      )}

      {/* SIDEBAR RETRÁTIL (COLLAPSIBLE SIDEBAR) */}
      <aside 
        className={`bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-2xs transition-all duration-300 ${
          isCollapsed ? 'w-full md:w-16' : 'w-full md:w-56'
        }`}
      >
        <div>
          {/* Header Sidebar com Botão de Retrair/Expandir */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold shrink-0">
                <Store className="w-3.5 h-3.5 stroke-[1.5]" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-extrabold text-xs text-slate-900 block leading-tight">
                    Pet Costelinha
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">Painel de Controle</span>
                </div>
              )}
            </div>

            {/* Botão de Retrair/Expandir Sidebar */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              ) : (
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              )}
            </button>
          </div>

          {/* User Info Compacto */}
          <div className={`p-2.5 m-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 ${isCollapsed ? 'justify-center p-2 m-1' : ''}`}>
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
              {user.nome.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] font-bold text-slate-900 truncate">{user.nome}</p>
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  {user.role}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links Compactos com Suporte a Ícones Centralizados no Modo Retraído */}
          <nav className="p-2 space-y-1">
            <Link
              href="/admin/dashboard"
              title="Visão Geral"
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                isCollapsed ? 'justify-center px-0' : ''
              } ${
                pathname === '/admin/dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[1.5] shrink-0" />
              {!isCollapsed && <span>Visão Geral</span>}
            </Link>

            <Link
              href="/admin/orders"
              title="Expedição"
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                isCollapsed ? 'justify-center px-0 relative' : ''
              } ${
                pathname === '/admin/orders'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 stroke-[1.5] shrink-0" />
                {!isCollapsed && <span>Expedição</span>}
              </div>
              {unreadCount > 0 && (
                <span
                  className={`bg-emerald-500 text-white font-mono font-bold ${
                    isCollapsed
                      ? 'absolute -top-1 -right-1 text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white'
                      : 'text-[9px] px-1.5 py-0.5 rounded-full'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </Link>

            {(user.role === 'ADMIN' || user.role === 'GERENTE') && (
              <Link
                href="/admin/products"
                title="Produtos"
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isCollapsed ? 'justify-center px-0' : ''
                } ${
                  pathname === '/admin/products'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4 stroke-[1.5] shrink-0" />
                {!isCollapsed && <span>Produtos</span>}
              </Link>
            )}

            {user.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin/users"
                  title="Equipe"
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    pathname === '/admin/users'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 stroke-[1.5] shrink-0" />
                  {!isCollapsed && <span>Equipe</span>}
                </Link>

                <Link
                  href="/admin/settings"
                  title="Ajustes"
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    pathname === '/admin/settings'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4 stroke-[1.5] shrink-0" />
                  {!isCollapsed && <span>Ajustes</span>}
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Footer Sidebar (Fixos Permanentemente no Rodapé em Todas as Rotas) */}
        <div className="p-2 border-t border-slate-100 space-y-0.5">
          <Link
            href="/"
            title="Voltar à Loja"
            className={`w-full text-left text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <Store className="w-3.5 h-3.5 stroke-[1.5] shrink-0" />
            {!isCollapsed && <span>← Voltar à Loja</span>}
          </Link>

          <button
            onClick={handleLogout}
            title="Sair da Conta"
            className={`w-full text-left text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut className="w-3.5 h-3.5 stroke-[1.5] shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Area Principal Ampliada */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar com Sininho de Notificações */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="text-xs font-bold text-slate-600">
            Painel da Loja Pet Costelinha
          </div>

          <div className="relative">
            <button
              onClick={() => setIsBellOpen(!isBellOpen)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 relative transition-colors cursor-pointer"
              title="Central de Notificações de Vendas"
            >
              <Bell className="w-4 h-4 stroke-[1.5]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {isBellOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
                  <h3 className="text-xs font-bold flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" /> Novos Pedidos Pagos
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3 text-emerald-400 stroke-[2]" /> Marcar lidos
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Nenhuma nova notificação de venda no momento.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <Link
                        key={item.id}
                        href="/admin/orders"
                        onClick={() => handleMarkSingleRead(item.id)}
                        className="p-3 hover:bg-slate-50 block transition-colors text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-900">{item.cliente_nome}</p>
                          <span className="text-emerald-700 font-mono font-bold">
                            {formatCurrency(Number(item.total_valor))}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">Pedido #{item.id.slice(0, 8)}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(item.created_at).toLocaleString('pt-BR')}
                        </span>
                      </Link>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <Link
                    href="/admin/orders"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-slate-900 hover:underline flex items-center justify-center gap-1"
                  >
                    Ver Todos os Pedidos no Painel <ExternalLink className="w-3 h-3 stroke-[1.5]" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Conteúdo da Página Totalmente Amplo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
