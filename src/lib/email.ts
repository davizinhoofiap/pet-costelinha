import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export interface OrderEmailPayload {
  orderId: string;
  clienteNome: string;
  clienteEmail: string;
  clienteCpf: string;
  enderecoEntrega: string;
  totalValor: number;
  items: { nome: string; quantidade: number; precoUnitario: number }[];
  status: string;
}

/**
 * Envia E-mail de Confirmação para o Cliente
 */
export async function sendCustomerOrderConfirmation(payload: OrderEmailPayload) {
  const itemsHtml = payload.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.nome}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantidade}x</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.precoUnitario.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #F3F4F6; borderRadius: 12px; overflow: hidden;">
      <div style="background: #F59E0B; padding: 20px; text-align: center; color: #18181B;">
        <h1 style="margin: 0; font-size: 24px;">🐾 Pet Costelinha</h1>
        <p style="margin: 5px 0 0 0; font-weight: bold;">Tudo que seu melhor amigo merece!</p>
      </div>
      
      <div style="padding: 24px;">
        <h2 style="color: #18181B; margin-top: 0;">Pedido Recebido com Sucesso! 🎉</h2>
        <p>Olá <strong>${payload.clienteNome}</strong>, recebemos o seu pedido <strong>#${payload.orderId.slice(0, 8)}</strong>.</p>
        
        <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400E;">Status do Pagamento: ${payload.status === 'PAID' ? '✅ Pago' : '⏳ Aguardando Pagamento (PIX)'}</p>
        </div>

        <h3>Resumo dos Itens</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #F8FAFC;">
              <th style="padding: 10px; text-align: left;">Produto</th>
              <th style="padding: 10px; text-align: center;">Qtd</th>
              <th style="padding: 10px; text-align: right;">Preço</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; font-size: 18px; font-weight: bold; color: #18181B; margin-bottom: 20px;">
          Total: R$ ${payload.totalValor.toFixed(2)}
        </div>

        <div style="background: #F8FAFC; padding: 16px; border-radius: 8px;">
          <h4 style="margin-top: 0; color: #475569;">Endereço de Entrega:</h4>
          <p style="margin: 0; color: #334155;">${payload.enderecoEntrega}</p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E2E8F0;" />

        <p style="text-align: center; color: #64748B; font-size: 14px;">
          Dúvidas? Fale conosco no WhatsApp: <strong>(11) 5197-1916</strong> ou Instagram: <strong>@petcostelinha</strong>
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Pet Costelinha" <${process.env.EMAIL_FROM || 'contato@petcostelinha.com.br'}>`,
      to: payload.clienteEmail,
      subject: `🐾 Confirmação do Pedido #${payload.orderId.slice(0, 8)} - Pet Costelinha`,
      html,
    });
    console.log('📧 E-mail de confirmação enviado para cliente:', info.messageId);
    return info;
  } catch (err) {
    console.warn('⚠️ Não foi possível enviar e-mail (modo simulado/dev):', err);
    return null;
  }
}

/**
 * Envia E-mail de Notificação para a Equipe do Petshop
 */
export async function sendAdminOrderNotification(payload: OrderEmailPayload) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #F59E0B; padding: 20px; border-radius: 12px;">
      <h2 style="color: #D97706; margin-top: 0;">🚨 NOVO PEDIDO RECEBIDO - PET COSTELINHA</h2>
      <p><strong>Pedido ID:</strong> #${payload.orderId}</p>
      <p><strong>Cliente:</strong> ${payload.clienteNome} (${payload.clienteEmail})</p>
      <p><strong>CPF:</strong> ${payload.clienteCpf}</p>
      <p><strong>Total:</strong> R$ ${payload.totalValor.toFixed(2)}</p>
      <p><strong>Endereço:</strong> ${payload.enderecoEntrega}</p>
      <p><strong>Status:</strong> ${payload.status}</p>
      <p style="margin-top: 20px;"><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders" style="background: #F59E0B; color: #18181B; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Acessar Painel de Pedidos</a></p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Sistema Pet Costelinha" <${process.env.EMAIL_FROM || 'sistema@petcostelinha.com.br'}>`,
      to: process.env.EMAIL_ADMIN || 'pedidos@petcostelinha.com.br',
      subject: `🚨 [NOVA VENDA] Pedido #${payload.orderId.slice(0, 8)} - R$ ${payload.totalValor.toFixed(2)}`,
      html,
    });
    console.log('📧 E-mail de notificação enviado para equipe:', info.messageId);
    return info;
  } catch (err) {
    console.warn('⚠️ Falha ao notificar admin via e-mail:', err);
    return null;
  }
}
