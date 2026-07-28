'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Check, QrCode, Copy, MessageSquare, RefreshCw, CheckCircle2, ShieldCheck, PhoneCall, MapPin, Search } from 'lucide-react';
import { CartItem } from './CartDrawer';
import { validateCPF } from '@/lib/cpf';
import { maskCPF, maskPhone, maskCEP, formatCurrency } from '@/lib/masks';
import { TurnstileWidget } from './TurnstileWidget';
import { LgpdConsentCheckbox } from './LgpdConsentCheckbox';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onClearCart: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onClearCart,
  onShowToast,
}) => {
  const [step, setStep] = useState<'FORM' | 'PIX_SCREEN' | 'SUCCESS'>('FORM');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'WHATSAPP'>('PIX');

  // Dados do Comprador
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');

  // Estrutura de Endereço Detalhada
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  const [loadingCep, setLoadingCep] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [lgpdAccepted, setLgpdAccepted] = useState(true);

  const [cpfError, setCpfError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reference para foco automático no campo Número
  const numeroInputRef = useRef<HTMLInputElement>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('');
  }, []);

  // Estado React dedicado para os dados dinâmicos do PIX
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeBase64: string;
    paymentId?: string;
  } | null>(null);

  // Armazena a resposta da API de pedidos
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    total: number;
    pix?: { qrCode: string; qrCodeBase64: string; paymentId: string } | null;
  } | null>(null);

  // Snapshot permanente dos dados do pedido
  const [purchasedSnapshot, setPurchasedSnapshot] = useState<{
    orderId: string;
    total: number;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    endereco: string;
    items: CartItem[];
  } | null>(null);

  const [copiedPix, setCopiedPix] = useState(false);

  // Pré-preenchimento automático para usuários autenticados
  useEffect(() => {
    if (isOpen) {
      fetch('/api/user/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((userData) => {
          if (userData && userData.email) {
            if (userData.nome) setNome(userData.nome);
            if (userData.email) setEmail(userData.email);
            if (userData.cpf) setCpf(maskCPF(userData.cpf));
            if (userData.telefone) setTelefone(maskPhone(userData.telefone));

            const primaryAddr = userData.addresses?.find((a: any) => a.principal) || userData.addresses?.[0];
            if (primaryAddr) {
              if (primaryAddr.cep) setCep(maskCEP(primaryAddr.cep));
              if (primaryAddr.logradouro) setLogradouro(primaryAddr.logradouro);
              if (primaryAddr.numero) setNumero(primaryAddr.numero);
              if (primaryAddr.complemento) setComplemento(primaryAddr.complemento);
              if (primaryAddr.bairro) setBairro(primaryAddr.bairro);
              if (primaryAddr.cidade) setCidade(primaryAddr.cidade);
              if (primaryAddr.estado) setEstado(primaryAddr.estado);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Consulta Automática ViaCEP ao digitar 8 números
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const masked = maskCEP(rawValue);
    setCep(masked);

    const clean = rawValue.replace(/\D/g, '');
    if (clean.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setLogradouro(data.logradouro || '');
            setBairro(data.bairro || '');
            setCidade(data.localidade || '');
            setEstado(data.uf || '');
            onShowToast('Endereço localizado via CEP!', 'success');
            setTimeout(() => {
              numeroInputRef.current?.focus();
            }, 100);
          } else {
            onShowToast('CEP não encontrado. Por favor, preencha o endereço manualmente.', 'info');
          }
        }
      } catch (err) {
        console.error('Erro na consulta ViaCEP:', err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Polling automático (a cada 3s) para verificar confirmação de pagamento via Webhook
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (step === 'PIX_SCREEN' && orderResult?.orderId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${orderResult.orderId}`);
          if (res.ok) {
            const data = await res.json();
            const currentStatus = (data.status || '').toUpperCase();
            if (currentStatus === 'PAID' || currentStatus === 'APPROVED') {
              clearInterval(intervalId);
              setStep('SUCCESS');
              onClearCart();
              onShowToast('🎉 Pagamento Confirmado com Sucesso via Mercado Pago!', 'success');
            }
          }
        } catch (err) {
          console.error('Erro no polling de verificação do PIX:', err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step, orderResult, onClearCart, onShowToast]);

  if (!isOpen) return null;

  const totalValor = cart.reduce((acc, item) => {
    const price = typeof item.product.preco_venda === 'string' ? parseFloat(item.product.preco_venda) : item.product.preco_venda;
    return acc + price * item.quantity;
  }, 0);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setCpf(masked);
    if (masked.length === 14) {
      if (!validateCPF(masked)) {
        setCpfError('Por favor, informe os 11 dígitos corretos do CPF.');
      } else {
        setCpfError('');
      }
    } else {
      setCpfError('');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lgpdAccepted) {
      onShowToast('É necessário aceitar os Termos e Política de Privacidade (LGPD) para efetuar o pedido.', 'error');
      return;
    }

    if (!validateCPF(cpf)) {
      setCpfError('CPF com formato ou dígitos verificadores inválidos.');
      onShowToast('Verifique os dígitos do CPF informado.', 'error');
      return;
    }

    if (!logradouro || !numero || !bairro || !cidade || !estado) {
      onShowToast('Por favor, preencha todos os campos do endereço de entrega (Rua, Número, Bairro, Cidade e Estado).', 'error');
      return;
    }

    if (totalValor < 1.00) {
      onShowToast('O valor mínimo total para pagamento via PIX é de R$ 1,00.', 'error');
      return;
    }

    setLoading(true);

    const fullEnderecoText = `${logradouro}, ${numero}${complemento ? ` (${complemento})` : ''} - ${bairro}, ${cidade}/${estado} - CEP: ${cep}`;

    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id,
        quantidade: item.quantity,
      }));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNome: nome,
          clienteEmail: email,
          clienteCpf: cpf,
          clienteTelefone: telefone,
          enderecoEntrega: fullEnderecoText,
          metodoPagamento: paymentMethod,
          items: itemsPayload,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        console.error("FALHA AO GERAR PIX:", data.error || data);
        throw new Error(data.error || 'Erro ao processar o checkout.');
      }

      const snapshot = {
        orderId: data.orderId,
        total: data.total,
        nome,
        email,
        cpf,
        telefone,
        endereco: fullEnderecoText,
        items: [...cart],
      };

      setOrderResult(data);
      setPurchasedSnapshot(snapshot);

      if (data.pix && (data.pix.qrCode || data.pix.qrCodeBase64)) {
        setPixData({
          qrCode: data.pix.qrCode,
          qrCodeBase64: data.pix.qrCodeBase64,
          paymentId: data.pix.paymentId,
        });
      } else {
        setPixData(null);
      }

      if (paymentMethod === 'PIX') {
        if (data.pix?.qrCode) {
          onShowToast('Código PIX do Mercado Pago gerado com sucesso!', 'success');
        } else {
          onShowToast('Pedido registrado com sucesso! Chave PIX oficial exibida abaixo.', 'info');
        }
        setStep('PIX_SCREEN');
      } else {
        handleOpenWhatsAppWithSnapshot(snapshot, false);
        setStep('SUCCESS');
        onClearCart();
        onShowToast('Pedido enviado para o WhatsApp comercial.', 'success');
      }
    } catch (err: any) {
      console.error("FALHA AO GERAR PIX:", err.message || err);
      let msg = err.message || 'Erro de conexão com o servidor. Tente novamente.';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        msg = 'Falha de comunicação com o servidor. Tente novamente.';
      }
      onShowToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const codeToCopy = pixData?.qrCode || '11982441326';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(codeToCopy);
    setCopiedPix(true);
    onShowToast('Código PIX copiado com sucesso!', 'success');
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleOpenWhatsAppWithSnapshot = (
    snap: typeof purchasedSnapshot,
    isPaid: boolean = false
  ) => {
    const finalOrderId = snap?.orderId || orderResult?.orderId || '000000';
    const finalNome = snap?.nome || nome || 'Cliente';
    const finalCpf = snap?.cpf || cpf || '';
    const finalTelefone = snap?.telefone || telefone || '';
    const finalEndereco = snap?.endereco || `${logradouro}, ${numero} - ${bairro}`;
    const finalTotal = snap?.total || orderResult?.total || totalValor;
    const itemsArray = snap?.items && snap.items.length > 0 ? snap.items : cart;

    const itemsText = itemsArray.length > 0
      ? itemsArray.map((i) => `• ${i.quantity}x ${i.product.nome} (${formatCurrency((typeof i.product.preco_venda === 'string' ? parseFloat(i.product.preco_venda) : i.product.preco_venda) * i.quantity)})`).join('\n')
      : '• Produtos do Pedido';

    let text = '';
    if (isPaid) {
      text = `*PEDIDO PAGO COM SUCESSO - PET COSTELINHA*\n\n` +
        `*Pedido:* #${finalOrderId.slice(0, 8)}\n` +
        `*Cliente:* ${finalNome}\n` +
        `*CPF:* ${finalCpf}\n` +
        `*Telefone:* ${finalTelefone}\n` +
        `*Endereço de Entrega:* ${finalEndereco}\n` +
        `*Status:* ✅ PAGO VIA PIX (Mercado Pago)\n\n` +
        `*Itens Comprados:*\n${itemsText}\n\n` +
        `*Total Pago:* ${formatCurrency(finalTotal)}\n\n` +
        `_Olá! Realizei o pagamento do meu pedido no site via PIX Mercado Pago e gostaria de acompanhar a entrega!_`;
    } else {
      text = `*SOLICITAÇÃO DE PEDIDO - PET COSTELINHA*\n\n` +
        `*Pedido:* #${finalOrderId.slice(0, 8)}\n` +
        `*Cliente:* ${finalNome}\n` +
        `*CPF:* ${finalCpf}\n` +
        `*Telefone:* ${finalTelefone}\n` +
        `*Endereço:* ${finalEndereco}\n\n` +
        `*Itens:*\n${itemsText}\n\n` +
        `*Total:* ${formatCurrency(finalTotal)}`;
    }

    const encodedMsg = encodeURIComponent(text);
    window.open(`https://wa.me/551151971916?text=${encodedMsg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 box-border">
      {/* Backdrop clicavel para fechar */}
      <div
        className="absolute inset-0 bg-transparent cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <div className="bg-white w-full max-w-lg max-h-[92vh] rounded-2xl shadow-2xl overflow-y-auto border border-slate-200 relative my-auto font-sans box-border max-w-full z-10">
        {/* Header Fixo com Botao X de Alta Visibilidade no Canto Superior Direito */}
        <div className="bg-slate-900 text-white p-3.5 pr-14 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Finalizar Pedido de Compra</h2>
            <p className="text-[10px] text-slate-400">Identificação para nota fiscal e entrega</p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2.5 right-2.5 bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer border-2 border-white flex items-center justify-center z-50"
            aria-label="Fechar Modal"
            title="Fechar"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Body Fluido com Scroll Interno Garantido */}
        <div className="p-4 sm:p-5 space-y-3 max-w-full">
          {step === 'FORM' && (
            <form onSubmit={handleSubmitOrder} className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">
                  Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} itens)
                </span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(totalValor)}</span>
              </div>

              {/* 1. Dados do Comprador */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  1. Dados do Comprador
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="nome@exemplo.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">CPF *</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      maxLength={14}
                      value={cpf}
                      onChange={handleCpfChange}
                      className={`w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 text-xs font-medium focus:bg-white focus:outline-none ${
                        cpfError ? 'border-rose-400 text-rose-900' : 'border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-400'
                      }`}
                    />
                    {cpfError && <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{cpfError}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Telefone / Celular *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 98765-4321"
                      value={telefone}
                      onChange={(e) => setTelefone(maskPhone(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Endereço de Entrega Detalhado com ViaCEP */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    2. Endereço de Entrega
                  </h3>
                  {loadingCep && (
                    <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Buscando CEP...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5 flex items-center justify-between">
                      <span>CEP *</span>
                      <span className="text-[9px] text-slate-400 font-normal">ViaCEP</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={9}
                        placeholder="00000-000"
                        value={cep}
                        onChange={handleCepChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Rua / Logradouro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rua Benigno Nogueira Franco"
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Número *</label>
                    <input
                      ref={numeroInputRef}
                      type="text"
                      required
                      placeholder="Ex: 367"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Complemento (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Apto, Bloco, Casa 2"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Bairro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Cidade *</label>
                    <input
                      type="text"
                      required
                      placeholder="Cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">UF (Estado) *</label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      placeholder="SP"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 uppercase font-semibold text-center focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Método de Pagamento */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  3. Como você prefere pagar?
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'PIX'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <QrCode className="w-4 h-4 stroke-[1.5]" />
                      <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                        Instantâneo
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-bold text-xs">PIX Mercado Pago</h4>
                      <p className="text-[10px] opacity-80">QR Code oficial</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WHATSAPP')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'WHATSAPP'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                      <span className="text-[9px] font-semibold bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded">
                        Atendimento
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-bold text-xs">WhatsApp</h4>
                      <p className="text-[10px] opacity-80">Pedido direto</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Aceite LGPD */}
              <div className="pt-0.5">
                <LgpdConsentCheckbox
                  checked={lgpdAccepted}
                  onChange={(c) => setLgpdAccepted(c)}
                  required
                />
              </div>

              {/* Turnstile Anti-Bot */}
              <TurnstileWidget
                onVerify={handleTurnstileVerify}
                onExpire={handleTurnstileExpire}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin stroke-[1.5]" /> Processando Checkout...
                  </>
                ) : (
                  <>Finalizar e Pagar {formatCurrency(totalValor)}</>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: PIX SCREEN */}
          {step === 'PIX_SCREEN' && (
            <div className="space-y-4 text-center">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-left flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 font-medium">
                    Pedido #{orderResult?.orderId ? orderResult.orderId.slice(0, 8) : '000000'}
                  </p>
                  <p className="font-bold text-slate-900 text-sm">
                    {formatCurrency(orderResult?.total || totalValor)}
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-700 stroke-[2]" />
                  Aguardando Pagamento...
                </span>
              </div>

              {/* QR Code Dinâmico ou Fallback de Celular */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm inline-block">
                  {pixData?.qrCodeBase64 ? (
                    <img
                      src={pixData.qrCodeBase64}
                      alt="QR Code Pix Mercado Pago"
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 bg-orange-50/50 border border-dashed border-orange-300 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1.5">
                      <QrCode className="w-10 h-10 text-orange-600 stroke-[1.5]" />
                      <span className="text-[11px] font-extrabold text-slate-900">Chave PIX (Celular)</span>
                      <span className="text-xs text-orange-600 font-mono font-bold">11982441326</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 max-w-xs leading-relaxed">
                  {pixData?.qrCodeBase64
                    ? 'Abra o aplicativo do seu banco e escaneie o código QR acima para pagamento instantâneo.'
                    : 'Copie a chave PIX (Celular) abaixo e realize a transferência pelo app do seu banco.'}
                </p>
              </div>

              {/* Input do Copia e Cola */}
              <div className="space-y-1.5 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  {pixData?.qrCode ? 'Código PIX Copia e Cola Oficial:' : 'Chave PIX Oficial (Celular):'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={codeToCopy}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-700 truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                      copiedPix
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 stroke-[1.5]" /> Copiar PIX
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div className="text-left space-y-0.5">
                  <span className="font-bold text-emerald-950 text-[11px]">Enviar comprovante pelo WhatsApp</span>
                  <p className="text-[10px] text-emerald-800">Acelere a liberação do seu pedido</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppWithSnapshot(purchasedSnapshot, false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> WhatsApp
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 stroke-[1.5]" />
                Verificando confirmação em tempo real...
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-3 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7 stroke-[2]" />
              </div>

              <div className="space-y-0.5">
                <h3 className="text-base font-black text-slate-900">Pagamento Confirmado com Sucesso!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Sua compra foi aprovada e gravada no sistema! A nota fiscal foi enviada para <strong>{purchasedSnapshot?.email || email}</strong>.
                </p>
              </div>

              {/* Resumo do Pedido */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">CÓDIGO DO PEDIDO</span>
                    <p className="font-extrabold text-slate-900 text-xs">
                      #{purchasedSnapshot?.orderId ? purchasedSnapshot.orderId.slice(0, 8) : (orderResult?.orderId ? orderResult.orderId.slice(0, 8) : '000000')}
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    PAID / PAGO VIA PIX
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Itens Comprados:</span>
                  {(purchasedSnapshot?.items || cart).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700">
                      <span className="truncate pr-2">• {item.quantity}x {item.product.nome}</span>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {formatCurrency((typeof item.product.preco_venda === 'string' ? parseFloat(item.product.preco_venda) : item.product.preco_venda) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-1.5 border-t border-slate-200 space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-600 stroke-[1.5]" /> Endereço de Entrega:
                  </span>
                  <p className="text-[11px] text-slate-800 font-medium">{purchasedSnapshot?.endereco || `${logradouro}, ${numero}`}</p>
                </div>

                <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Total Pago:</span>
                  <span className="text-sm font-black text-emerald-600">
                    {formatCurrency(purchasedSnapshot?.total || orderResult?.total || totalValor)}
                  </span>
                </div>
              </div>

              {/* Botão de Envio WhatsApp */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-2">
                <p className="text-xs text-emerald-950 font-medium text-left">
                  Quer enviar o comprovante com todos os dados da compra no WhatsApp da loja?
                </p>

                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppWithSnapshot(purchasedSnapshot, true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 stroke-[1.5]" />
                  Enviar Comprovante pelo WhatsApp
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    onClose();
                    setStep('FORM');
                  }}
                  className="bg-slate-900 text-white hover:bg-slate-800 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                >
                  Concluir e Retornar à Loja
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
