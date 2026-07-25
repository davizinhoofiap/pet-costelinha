import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pet Costelinha - Tudo para o seu melhor amigo!',
  description: 'Rações para cães, gatos, pássaros, medicamentos, vermífugos, sementes e banho & tosa com entregas rápidas.',
  keywords: ['Petshop', 'Pet Costelinha', 'Rações', 'Medicamentos Pets', 'Vermífugos', 'Pássaros', 'Banho e Tosa'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
