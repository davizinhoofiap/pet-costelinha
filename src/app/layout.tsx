import './globals.css';
import { Metadata } from 'next';
import { CookieBanner } from '@/components/CookieBanner';

export const metadata: Metadata = {
  title: 'Pet Costelinha - Loja Comercial de Rações, Areia, Gaiolas e Acessórios Pet',
  description: 'Rações Magnus, Special Dog, areias higiênicas, tapetes, gaiolas de madeira, petiscos e medicamentos com tele-entrega expressa.',
  keywords: ['Petshop', 'Pet Costelinha', 'Rações', 'Medicamentos Pets', 'Areia Higiênica', 'Gaiolas', 'Tele-Entrega'],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="google-site-verification" content="asNcd7ayg1Scs9F2gYvZjsX_xEY7Vyk-uScRwtg6-Yc" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen relative">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
