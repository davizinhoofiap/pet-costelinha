'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, QrCode, Copy, MessageSquare, RefreshCw, CheckCircle2, ShieldCheck, PhoneCall, MapPin, AlertCircle } from 'lucide-react';
import { CartItem } from './CartDrawer';
import { validateCPF } from '@/lib/cpf';
import { maskCPF, maskPhone, formatCurrency } from '@/lib/masks';
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

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [lgpdAccepted, setLgpdAccepted] = useState(true);

  const [cpfError, setCpfError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('');
  }, []);

  // Armazena a resposta da API do Mercado Pago
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

    if (totalValor < 1.00) {
      onShowToast('O valor mínimo total para pagamento via PIX é de R$ 1,00.', 'error');
      return;
    }

    setLoading(true);

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
          enderecoEntrega: endereco,
          metodoPagamento: paymentMethod,
          items: itemsPayload,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar o checkout.');
      }

      const snapshot = {
        orderId: data.orderId,
        total: data.total,
        nome,
        email,
        cpf,
        telefone,
        endereco,
        items: [...cart],
      };

      setOrderResult(data);
      setPurchasedSnapshot(snapshot);

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
      console.error('❌ Erro no submit do CheckoutModal:', err);
      let msg = err.message || 'Erro de conexão com o servidor. Tente novamente.';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        msg = 'Falha de comunicação com o servidor. Tente novamente.';
      }
      onShowToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const pixCodeToCopy = orderResult?.pix?.qrCode || 'petcostelinha2021@gmail.com';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCodeToCopy);
    setCopiedPix(true);
    onShowToast('Chave PIX copiada com sucesso!', 'success');
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
    const finalEndereco = snap?.endereco || endereco || 'Endereço informado no checkout';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative my-6 font-sans">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">Finalizar Pedido de Compra</h2>
            <p className="text-[11px] text-slate-400">Identificação para nota fiscal e entrega</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'FORM' && (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">
                  Subtotal do Pedido ({cart.reduce((a, b) => a + b.quantity, 0)} itens)
                </span>
                <span className="font-bold text-slate-900">{formatCurrency(totalValor)}</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Dados do Comprador
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail (para envio do comprovante) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nome@exemplo.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CPF (Apenas números para emissão da nota) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      maxLength={14}
                      value={cpf}
                      onChange={handleCpfChange}
                      className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none ${
                        cpfError ? 'border-rose-400 text-rose-900' : 'border-slate-200 text-slate-900 focus:ring-slate-400'
                      }`}
                    />
                    {cpfError && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-0.5">{cpfError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone / Celular *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 98765-4321"
                      value={telefone}
                      onChange={(e) => setTelefone(maskPhone(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endereço Completo de Entrega *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rua, Número, Bairro, Cidade, CEP"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Payment selector */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Como você prefere pagar?
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      paymentMethod === 'PIX'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <QrCode className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                        Aprovação Instantânea
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-bold text-xs">PIX Mercado Pago</h4>
                      <p className="text-[11px] opacity-80">QR Code oficial + Copia e Cola</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WHATSAPP')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      paymentMethod === 'WHATSAPP'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <MessageSquare className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-[10px] font-semibold bg-slate-700 text-slate-200 px-2 py-0.5 rounded">
                        Atendimento Direto
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-bold text-xs">Finalizar via WhatsApp</h4>
                      <p className="text-[11px] opacity-80">Envia o resumo diretamente ao vendedor</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Checkbox de Aceite LGPD */}
              <div className="pt-1">
                <LgpdConsentCheckbox
                  checked={lgpdAccepted}
                  onChange={(c) => setLgpdAccepted(c)}
                  required
                />
              </div>

              {/* Widget Anti-Bot do Cloudflare Turnstile isolado */}
              <TurnstileWidget
                onVerify={handleTurnstileVerify}
                onExpire={handleTurnstileExpire}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-xs transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin stroke-[1.5]" /> Gerando PIX Mercado Pago...
                  </>
                ) : (
                  <>Finalizar e Pagar {formatCurrency(totalValor)}</>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: PIX SCREEN (Resiliente e Sem Tela Branca) */}
          {step === 'PIX_SCREEN' && (
            <div className="space-y-5 text-center">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-left flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 font-medium">
                    Pedido #{orderResult?.orderId ? orderResult.orderId.slice(0, 8) : '000000'}
                  </p>
                  <p className="font-bold text-slate-900 text-sm">
                    {formatCurrency(orderResult?.total || totalValor)}
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold px-3 py-1 rounded-md flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-700 stroke-[2]" />
                  Aguardando Pagamento...
                </span>
              </div>

              {/* Exibição do QR Code se disponível ou Fallback Oficial */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3.5 bg-white border-2 border-slate-200 rounded-2xl shadow-sm inline-block">
                  {orderResult?.pix?.qrCodeBase64 ? (
                    <img
                      src={orderResult.pix.qrCodeBase64}
                      alt="QR Code PIX Mercado Pago"
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-2">
                      <QrCode className="w-12 h-12 text-orange-600 stroke-[1.5]" />
                      <span className="text-[11px] font-bold text-slate-800">Chave PIX Oficial Pet Costelinha</span>
                      <span className="text-[10px] text-slate-500 font-mono">petcostelinha2021@gmail.com</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Abra o aplicativo do seu banco e escaneie o código QR acima ou copie a chave oficial abaixo.
                </p>
              </div>

              {/* Chave Copia e Cola */}
              <div className="space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  {orderResult?.pix?.qrCode ? 'Código PIX Copia e Cola Oficial:' : 'Chave PIX Oficial da Loja:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixCodeToCopy}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs active:scale-98 cursor-pointer ${
                      copiedPix
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-4 h-4 text-white stroke-[2.5]" /> Código Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 stroke-[1.5]" /> Copiar PIX
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="text-left space-y-0.5">
                  <span className="font-bold text-emerald-950">Enviar comprovante pelo WhatsApp</span>
                  <p className="text-[11px] text-emerald-800">Acelere o envio do seu pedido</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppWithSnapshot(purchasedSnapshot, false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> WhatsApp
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[1.5]" />
                Verificando confirmação em tempo real...
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Pagamento Confirmado com Sucesso!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Sua compra foi aprovada e gravada no sistema! A nota fiscal foi enviada para <strong>{purchasedSnapshot?.email || email}</strong>.
                </p>
              </div>

              {/* CARD DE RESUMO REAIS DO PEDIDO */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left space-y-3">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">CÓDIGO DO PEDIDO</span>
                    <p className="font-extrabold text-slate-900 text-xs">
                      #{purchasedSnapshot?.orderId ? purchasedSnapshot.orderId.slice(0, 8) : (orderResult?.orderId ? orderResult.orderId.slice(0, 8) : '000000')}
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-md">
                    PAID / PAGO VIA PIX
                  </span>
                </div>

                {/* Lista de Itens */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Itens Comprados:</span>
                  {(purchasedSnapshot?.items || cart).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700">
                      <span className="truncate pr-2">• {item.quantity}x {item.product.nome}</span>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {formatCurrency((typeof item.product.preco_venda === 'string' ? parseFloat(item.product.preco_venda) : item.product.preco_venda) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Endereço de Entrega */}
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-600 stroke-[1.5]" /> Endereço de Entrega:
                  </span>
                  <p className="text-xs text-slate-800 font-medium">{purchasedSnapshot?.endereco || endereco}</p>
                </div>

                {/* Valor Total */}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Total Pago:</span>
                  <span className="text-base font-black text-emerald-600">
                    {formatCurrency(purchasedSnapshot?.total || orderResult?.total || totalValor)}
                  </span>
                </div>
              </div>

              {/* Botão de Envio WhatsApp com Resumo dos Dados Reais */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
                <div className="text-left space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                    [ NOTIFICAÇÃO DA LOJA ]
                  </span>
                  <p className="text-xs text-emerald-950 font-medium">
                    Quer enviar o comprovante com todos os dados da compra no WhatsApp da loja?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppWithSnapshot(purchasedSnapshot, true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 stroke-[1.5]" />
                  Enviar Comprovante pelo WhatsApp
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    setStep('FORM');
                  }}
                  className="bg-slate-900 text-white hover:bg-slate-800 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
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
