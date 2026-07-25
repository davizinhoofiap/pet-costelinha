import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pet Costelinha - Loja Comercial de Rações, Areia, Gaiolas e Acessórios Pet',
  description: 'Rações Magnus, Special Dog, areias higiênicas, tapetes, gaiolas de madeira, petiscos e medicamentos com tele-entrega expressa.',
  keywords: ['Petshop', 'Pet Costelinha', 'Rações', 'Medicamentos Pets', 'Areia Higiênica', 'Gaiolas', 'Tele-Entrega'],
  verification: {
    google: 'asNcd7ayg1Scs9F2gYvZjsX_xEY7Vyk-uScRwtg6-Yc',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="google-site-verification" content="asNcd7ayg1Scs9F2gYvZjsX_xEY7Vyk-uScRwtg6-Yc" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
