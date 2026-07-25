import QRCode from 'qrcode';

export interface PixPaymentResponse {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  status: string;
}

/**
 * Gera Cobrança PIX Oficial via Mercado Pago Payment API v1
 */
export async function createPixPayment(
  orderId: string,
  amount: number,
  customerEmail: string,
  customerName: string,
  customerCpf: string
): Promise<PixPaymentResponse> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  // Se houver token válido do Mercado Pago, executamos a API oficial de produção
  if (token && !token.startsWith('APP_USR-0000000000000000')) {
    try {
      const formattedAmount = Number(amount.toFixed(2));
      const cleanCpf = customerCpf.replace(/\D/g, '');

      // Garantir formato de e-mail válido para a API
      const validEmail = customerEmail && customerEmail.includes('@') ? customerEmail : 'comprador@petcostelinha.com.br';

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
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
            email: validEmail,
            first_name: customerName.split(' ')[0] || 'Cliente',
            last_name: customerName.split(' ').slice(1).join(' ') || 'Pet',
            identification: {
              type: 'CPF',
              number: cleanCpf || '11144477735',
            },
          },
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pet-costelinha.vercel.app'}/api/webhooks/pix`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const qrCode = data.point_of_interaction?.transaction_data?.qr_code || '';
        let qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64 || '';

        if (qrCodeBase64 && !qrCodeBase64.startsWith('data:image')) {
          qrCodeBase64 = `data:image/png;base64,${qrCodeBase64}`;
        } else if (!qrCodeBase64 && qrCode) {
          qrCodeBase64 = await QRCode.toDataURL(qrCode, { margin: 1, width: 300 });
        }

        console.log(`✅ PIX Mercado Pago criado com sucesso para o Pedido ${orderId}. Payment ID: ${data.id}`);

        return {
          paymentId: String(data.id),
          qrCode,
          qrCodeBase64,
          status: data.status || 'PENDING',
        };
      } else {
        const errText = await response.text();
        console.error('❌ Erro na resposta da API Mercado Pago:', response.status, errText);
        throw new Error(`Mercado Pago API (${response.status}): ${errText}`);
      }
    } catch (error: any) {
      console.error('⚠️ Erro na integração Mercado Pago:', error);
      throw error;
    }
  }

  // GERADOR LOCAL DE TESTES (Fallback apenas para ambiente sem token configurado)
  const mockPaymentId = `MP-PIX-${Date.now()}`;
  const mockPixCopiaECola = `00020126580014BR.GOV.BCB.PIX0136petcostelinha2021@gmail.com520400005303986540${amount.toFixed(
    2
  ).length < 10 ? '0' + amount.toFixed(2).length : amount.toFixed(2).length}${amount.toFixed(
    2
  )}5802BR5915PET COSTELINHA6009SAO PAULO62070503***6304D1A2`;

  const qrCodeBase64 = await QRCode.toDataURL(mockPixCopiaECola, {
    margin: 1,
    width: 300,
    color: {
      dark: '#18181B',
      light: '#FFFFFF',
    },
  });

  return {
    paymentId: mockPaymentId,
    qrCode: mockPixCopiaECola,
    qrCodeBase64,
    status: 'PENDING',
  };
}
