'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, QrCode, Copy, MessageSquare, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CartItem } from './CartDrawer';
import { validateCPF } from '@/lib/cpf';
import { maskCPF, maskPhone, formatCurrency } from '@/lib/masks';

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

  const [cpfError, setCpfError] = useState('');
  const [loading, setLoading] = useState(false);

  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    total: number;
    pix?: { qrCode: string; qrCodeBase64: string; paymentId: string };
  } | null>(null);

  const [copiedPix, setCopiedPix] = useState(false);

  // Polling automático para verificar a confirmação do pagamento via Webhook
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (step === 'PIX_SCREEN' && orderResult?.orderId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/checkout/status?orderId=${orderResult.orderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'PAID') {
              clearInterval(intervalId);
              setStep('SUCCESS');
              onClearCart();
              onShowToast('🎉 Pagamento Confirmado com Sucesso via Mercado Pago!', 'success');
            }
          }
        } catch (err) {
          console.error('Erro no polling de verificação do PIX:', err);
        }
      }, 3500);
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar o checkout.');
      }

      setOrderResult(data);

      if (paymentMethod === 'PIX') {
        setStep('PIX_SCREEN');
        onShowToast('Código PIX do Mercado Pago gerado com sucesso!', 'success');
      } else {
        handleOpenWhatsApp(data.orderId);
        setStep('SUCCESS');
        onClearCart();
        onShowToast('Pedido enviado para o WhatsApp comercial.', 'success');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Erro inesperado. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (orderResult?.pix?.qrCode) {
      navigator.clipboard.writeText(orderResult.pix.qrCode);
      setCopiedPix(true);
      onShowToast('Chave Copia e Cola do Mercado Pago copiada!', 'success');
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const handleOpenWhatsApp = (orderId?: string) => {
    const itemsList = cart.map((i) => `• ${i.quantity}x ${i.product.nome}`).join('%0A');
    const msg = `*SOLICITAÇÃO DE PEDIDO - PET COSTELINHA*%0A%0A*Pedido:* #${orderId || 'NOVO'}%0A*Cliente:* ${nome}%0A*CPF:* ${cpf}%0A*Telefone:* ${telefone}%0A*Endereço:* ${endereco}%0A%0A*Itens:*%0A${itemsList}%0A%0A*Total:* ${formatCurrency(
      totalValor
    )}`;

    window.open(`https://wa.me/551151971916?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative my-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-xs transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2"
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

          {/* STEP 2: PIX SCREEN (100% Automático via Webhook + Polling) */}
          {step === 'PIX_SCREEN' && orderResult?.pix && (
            <div className="space-y-5 text-center">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-left flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Pedido #{orderResult.orderId.slice(0, 8)}</p>
                  <p className="font-bold text-slate-900 text-sm">{formatCurrency(orderResult.total)}</p>
                </div>
                <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold px-3 py-1 rounded-md flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-700 stroke-[2]" />
                  Aguardando Pagamento...
                </span>
              </div>

              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3.5 bg-white border-2 border-slate-200 rounded-2xl shadow-sm inline-block">
                  <img
                    src={orderResult.pix.qrCodeBase64}
                    alt="QR Code PIX Mercado Pago"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Abra o app do seu banco e escaneie o código QR acima. A confirmação é <strong>automática e instantânea</strong>.
                </p>
              </div>

              <div className="space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Código PIX Copia e Cola Oficial:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={orderResult.pix.qrCode}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs active:scale-98 ${
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
                        <Copy className="w-4 h-4 stroke-[1.5]" /> Copiar Código PIX
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[1.5]" />
                Verificando confirmação do banco em tempo real...
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS (Confirmação Automática) */}
          {step === 'SUCCESS' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Pagamento Confirmado com Sucesso!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Sua transação foi aprovada pelo Mercado Pago. O comprovante e a nota fiscal foram enviados para o seu e-mail.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setStep('FORM');
                }}
                className="bg-slate-900 text-white hover:bg-slate-800 font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                Concluir e Retornar à Loja
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
