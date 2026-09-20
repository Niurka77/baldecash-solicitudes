import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'BaldeCash - Solicitudes de Financiamiento',
  description: 'Módulo de solicitudes de financiamiento estudiantil',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="bg-white border-b border-slate-200">
          <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-6">
            <span className="font-bold text-lg text-slate-800">BaldeCash</span>
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              Nueva solicitud
            </Link>
            <Link
              href="/solicitudes"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Ver solicitudes
            </Link>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
