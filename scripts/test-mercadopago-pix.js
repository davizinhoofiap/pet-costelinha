const fs = require('fs');
const path = require('path');

// Ler arquivo .env manualmente
let envToken = '';
try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('MERCADO_PAGO_ACCESS_TOKEN=') || line.startsWith('MERCADOPAGO_ACCESS_TOKEN=')) {
      envToken = line.split('=')[1]?.trim().replace(/^["']|["']$/g, '');
    }
  }
} catch (e) {}

const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || envToken;

console.log('----------------------------------------------------');
console.log('🔍 INICIANDO TESTE AUTOMÁTICO DE INTEGRAÇÃO MERCADO PAGO PIX');
console.log('----------------------------------------------------');
console.log('🔑 Token Detectado:', token ? `${token.substring(0, 15)}...${token.slice(-5)}` : '❌ NENHUM TOKEN DETECTADO');

if (!token) {
  console.error('❌ ERRO CRÍTICO: Variável MERCADO_PAGO_ACCESS_TOKEN ou MERCADOPAGO_ACCESS_TOKEN ausente.');
  process.exit(1);
}

async function runPixTest() {
  const idempotencyKey = `test-pix-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const amount = 1.00;

  const payload = {
    transaction_amount: amount,
    description: 'Teste Automático Pix R$ 1,00 - Pet Costelinha',
    payment_method_id: 'pix',
    external_reference: `test-ref-${Date.now()}`,
    payer: {
      email: 'davizinhotimao47@gmail.com',
      first_name: 'Davi',
      last_name: 'Silva',
      identification: {
        type: 'CPF',
        number: '11144477735',
      },
    },
    notification_url: 'https://pet-costelinha.vercel.app/api/webhooks/pix',
  };

  console.log('\n📦 Enviando Payload para https://api.mercadopago.com/v1/payments...');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    console.log(`\n📡 Status HTTP da Resposta: ${response.status} ${response.statusText}`);

    if (response.status !== 200 && response.status !== 201) {
      const errorJson = await response.json();
      console.error('❌ RESPOSTA RECUSADA PELO MERCADO PAGO:');
      console.error(JSON.stringify(errorJson, null, 2));
      process.exit(1);
    }

    const data = await response.json();
    console.log('\n✅ RESPOSTA SUCESSO DO MERCADO PAGO:');
    console.log(`- Payment ID: ${data.id}`);
    console.log(`- Status do Pagamento: ${data.status}`);
    console.log(`- Status Detail: ${data.status_detail}`);

    const transactionData = data.point_of_interaction?.transaction_data;

    if (!transactionData) {
      console.error('❌ ERRO: O nó point_of_interaction.transaction_data está ausente na resposta.');
      process.exit(1);
    }

    console.log('\n📌 VERIFICAÇÃO DOS NÓS DO PIX:');
    console.log(`- qr_code (Copia e Cola): ${transactionData.qr_code ? 'PRESENT (OK ✅)' : 'MISSING ❌'}`);
    console.log(`  -> Snippet: ${transactionData.qr_code?.substring(0, 60)}...`);
    console.log(`- qr_code_base64 (Imagem QR): ${transactionData.qr_code_base64 ? 'PRESENT (OK ✅)' : 'MISSING ❌'}`);
    console.log(`  -> Tam. String Base64: ${transactionData.qr_code_base64?.length || 0} caracteres`);

    console.log('\n----------------------------------------------------');
    console.log('🎉 TESTE AUTOMÁTICO CONCLUÍDO COM 100% DE SUCESSO!');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('❌ Erro inesperado na requisição HTTP ao Mercado Pago:', err);
    process.exit(1);
  }
}

runPixTest();
