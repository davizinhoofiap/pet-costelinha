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
  clienteTelefone?: string;
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden;">
      <div style="background: #F59E0B; padding: 20px; text-align: center; color: #18181B;">
        <h1 style="margin: 0; font-size: 24px;">🐾 Pet Costelinha</h1>
        <p style="margin: 5px 0 0 0; font-weight: bold;">Tudo que seu melhor amigo merece!</p>
      </div>
      
      <div style="padding: 24px;">
        <h2 style="color: #18181B; margin-top: 0;">Pedido Recebido com Sucesso! 🎉</h2>
        <p>Olá <strong>${payload.clienteNome}</strong>, recebemos o seu pedido <strong>#${payload.orderId.slice(0, 8)}</strong>.</p>
        
        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #065F46;">Status do Pagamento: ${payload.status === 'PAID' ? '✅ Pago via PIX Mercado Pago' : '⏳ Aguardando Pagamento'}</p>
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
 * Envia E-mail de Notificação de Novo Pedido Pago para a Equipe (Gerente/Atendentes)
 * Suporta múltiplos e-mails separados por vírgula em process.env.MANAGER_EMAIL
 */
export async function sendAdminOrderNotification(payload: OrderEmailPayload) {
  const rawManagerEmails = 
    process.env.MANAGER_EMAIL || 
    process.env.EMAIL_ADMIN || 
    'pedidos@petcostelinha.com.br, gerente@petcostelinha.com.br';

  const recipientList = rawManagerEmails
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  const itemsHtml = payload.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px;">${item.nome}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; text-align: center;">${item.quantidade}x</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; text-align: right; font-weight: bold;">R$ ${item.precoUnitario.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pet-costelinha.vercel.app'}/admin/orders`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #10B981; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: #064E3B; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 900;">🎉 Novo Pedido Pago! - Pedido #${payload.orderId.slice(0, 8)}</h1>
        <p style="margin: 6px 0 0 0; color: #A7F3D0; font-size: 13px;">Notificação Automática de Expedição - Pet Costelinha</p>
      </div>

      <div style="padding: 24px;">
        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
          <p style="margin: 0; color: #065F46; font-size: 13px; font-weight: bold;">
            ✅ Pagamento Aprovado Instantaneamente via PIX Mercado Pago!
          </p>
        </div>

        <h3 style="color: #0F172A; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">1. Dados do Cliente</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748B;">Nome Completo:</td>
            <td style="padding: 6px 0; color: #0F172A; font-weight: bold; text-align: right;">${payload.clienteNome}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B;">CPF:</td>
            <td style="padding: 6px 0; color: #0F172A; font-weight: bold; text-align: right;">${payload.clienteCpf}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B;">Telefone / WhatsApp:</td>
            <td style="padding: 6px 0; color: #059669; font-weight: bold; text-align: right;">${payload.clienteTelefone || 'Não Informado'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B;">E-mail:</td>
            <td style="padding: 6px 0; color: #0F172A; text-align: right;">${payload.clienteEmail}</td>
          </tr>
        </table>

        <h3 style="color: #0F172A; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">2. Endereço Completo de Entrega</h3>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 10px; font-size: 13px; color: #334155; line-height: 1.5; margin-bottom: 20px;">
          <strong>${payload.enderecoEntrega}</strong>
        </div>

        <h3 style="color: #0F172A; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">3. Itens do Pedido</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #F1F5F9; color: #475569; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 8px 12px; text-align: left;">Produto</th>
              <th style="padding: 8px 12px; text-align: center;">Qtd</th>
              <th style="padding: 8px 12px; text-align: right;">Preço</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background: #0F172A; color: #ffffff; padding: 16px; border-radius: 12px; text-align: right; margin-bottom: 24px;">
          <span style="font-size: 12px; color: #94A3B8; text-transform: uppercase;">Valor Total Pago:</span>
          <div style="font-size: 22px; font-weight: 900; color: #34D399; margin-top: 2px;">
            R$ ${payload.totalValor.toFixed(2)}
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${adminUrl}" style="background: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);">
            🚀 Acessar Pedido no Painel Admin
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Sistema Pet Costelinha" <${process.env.EMAIL_FROM || 'sistema@petcostelinha.com.br'}>`,
      to: recipientList,
      subject: `🎉 Novo Pedido Pago! - Pedido #${payload.orderId.slice(0, 8)}`,
      html,
    });
    console.log(`📧 E-mail de notificação de novo pedido enviado para equipe (${recipientList.join(', ')}):`, info.messageId);
    return info;
  } catch (err) {
    console.warn('⚠️ Falha ao notificar gerência/equipe via e-mail:', err);
    return null;
  }
}
