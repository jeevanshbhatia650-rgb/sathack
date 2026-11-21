import type { Metadata } from 'next';
import './globals.css';
import { InkBleedFilter } from '../src/components/layout/InkBleedFilter';

export const metadata: Metadata = {
  title: 'WebWink Protocol — Autonomous Agency Engine & 2026 Commercial Rate Card',
  description:
    'WebWink builds autonomous voice agents, WhatsApp workflows, and high-ticket 3D web applications with predictable sprint delivery and zero vendor lock-in.',
  icons: {
    icon: '/brand/webwink-logo-mark.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen antialiased selection:bg-[#E2C870] selection:text-[#111111] transition-colors">
        <InkBleedFilter />
        {children}
      </body>
    </html>
  );
}
