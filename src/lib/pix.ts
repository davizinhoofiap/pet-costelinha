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
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token || token.trim() === '') {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN não está configurado no servidor.');
  }

  const formattedAmount = Number(amount.toFixed(2));
  const cleanCpf = customerCpf.replace(/\D/g, '');
  const cleanEmail = customerEmail && customerEmail.includes('@') ? customerEmail.trim() : 'cliente@petcostelinha.com.br';

  const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Idempotency-Key': `pix-${orderId}-${Date.now()}`,
    },
    body: JSON.stringify({
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
          number: cleanCpf,
        },
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pet-costelinha.vercel.app'}/api/webhooks/pix`,
    }),
  });

  if (!mpResponse.ok) {
    const errorBody = await mpResponse.text();
    console.error('❌ Erro na API do Mercado Pago:', mpResponse.status, errorBody);
    throw new Error(`Erro na API Mercado Pago (${mpResponse.status}): ${errorBody}`);
  }

  const data = await mpResponse.json();
  const transactionData = data.point_of_interaction?.transaction_data;

  if (!transactionData) {
    throw new Error('Resposta do Mercado Pago não contém os dados do PIX (transaction_data).');
  }

  const qrCode = transactionData.qr_code || '';
  let qrCodeBase64 = transactionData.qr_code_base64 || '';

  if (qrCodeBase64 && !qrCodeBase64.startsWith('data:image')) {
    qrCodeBase64 = `data:image/png;base64,${qrCodeBase64}`;
  } else if (!qrCodeBase64 && qrCode) {
    qrCodeBase64 = await QRCode.toDataURL(qrCode, { margin: 1, width: 300 });
  }

  console.log(`✅ PIX Oficial do Mercado Pago gerado com sucesso. ID: ${data.id}`);

  return {
    paymentId: String(data.id),
    qrCode,
    qrCodeBase64,
    status: data.status || 'pending',
  };
}
