import QRCode from 'qrcode';

export interface PixPaymentResponse {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  status: string;
}

/**
 * Gera Cobrança PIX Real via API de Pagamentos do Mercado Pago (https://api.mercadopago.com/v1/payments)
 */
export async function createPixPayment(
  orderId: string,
  amount: number,
  customerEmail: string,
  customerName: string,
  customerCpf: string
): Promise<PixPaymentResponse> {
  // Suporte a ambas as nomenclaturas de variável de ambiente (com ou sem underscore)
  const token = (process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN)
    ?.trim()
    .replace(/^["']|["']$/g, '');

  if (!token) {
    console.error('❌ ERRO CRÍTICO: MERCADO_PAGO_ACCESS_TOKEN / MERCADOPAGO_ACCESS_TOKEN ausente nas variáveis de ambiente.');
    throw new Error('Chave de integração do Mercado Pago não configurada no servidor.');
  }

  // 1. Tratamento do valor total (mínimo de R$ 1.00 exigido pelo Mercado Pago)
  const numericAmount = Number(amount);
  const formattedAmount = Math.max(1.00, Number(isNaN(numericAmount) ? 1.00 : numericAmount.toFixed(2)));

  // 2. Tratamento do CPF (apenas números limpos sem pontos, traços ou espaços)
  const cleanCpf = (customerCpf || '').replace(/\D/g, '');

  // 3. Tratamento do e-mail do pagador
  const cleanEmail = customerEmail && customerEmail.includes('@') ? customerEmail.trim() : 'cliente@petcostelinha.com.br';

  // 4. Header X-Idempotency-Key dinâmico usando crypto.randomUUID()
  const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `pix-${orderId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const payload = {
    transaction_amount: formattedAmount,
    description: `Pedido Pet Costelinha #${orderId.slice(0, 8)}`,
    payment_method_id: 'pix',
    external_reference: orderId,
    payer: {
      email: cleanEmail,
      first_name: customerName.split(' ')[0] || 'Cliente',
      last_name: customerName.split(' ').slice(1).join(' ') || 'Pet',
      identification: {
        type: 'CPF',
        number: cleanCpf || '11144477735',
      },
    },
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pet-costelinha.vercel.app'}/api/webhooks/pix`,
  };

  console.log('📦 Solicitando cobrança PIX ao Mercado Pago (/v1/payments)...');

  try {
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (mpResponse.status !== 200 && mpResponse.status !== 201) {
      let mpError: any = {};
      try {
        mpError = await mpResponse.json();
      } catch (e) {
        mpError = { message: await mpResponse.text() };
      }
      console.error('❌ Erro Recusado pela API Mercado Pago:', mpResponse.status, JSON.stringify(mpError, null, 2));

      const firstCause = mpError.cause && mpError.cause[0] ? mpError.cause[0].description : null;
      const detailMessage = firstCause || mpError.message || 'Dados de pagamento recusados pelo gateway.';
      throw new Error(`Mercado Pago (${mpResponse.status}): ${detailMessage}`);
    }

    const data = await mpResponse.json();
    const transactionData = data.point_of_interaction?.transaction_data;

    if (!transactionData) {
      console.error('❌ Resposta do Mercado Pago sem o bloco transaction_data:', JSON.stringify(data, null, 2));
      throw new Error('Resposta do Mercado Pago não contém o bloco point_of_interaction.transaction_data.');
    }

    const qrCode = transactionData.qr_code || '';
    let qrCodeBase64 = transactionData.qr_code_base64 || '';

    // Garantir prefixo data:image/png;base64, para exibição direta em tags <img> no browser/mobile
    if (qrCodeBase64 && !qrCodeBase64.startsWith('data:image')) {
      qrCodeBase64 = `data:image/png;base64,${qrCodeBase64}`;
    } else if (!qrCodeBase64 && qrCode) {
      qrCodeBase64 = await QRCode.toDataURL(qrCode, { margin: 1, width: 300 });
    }

    console.log(`✅ PIX Mercado Pago gerado com sucesso. ID: ${data.id}, Valor: R$ ${formattedAmount}, QR Base64: ${qrCodeBase64 ? 'OK' : 'FALHOU'}`);

    return {
      paymentId: String(data.id),
      qrCode,
      qrCodeBase64,
      status: data.status || 'pending',
    };
  } catch (error: any) {
    console.error('❌ Erro na integração Mercado Pago:', error);
    throw error;
  }
}
