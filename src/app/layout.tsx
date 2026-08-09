import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ClientDrawerProvider } from '@/components/client/ClientDrawerContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Executive CRM | High-Converting Sales Funnel Platform',
  description: 'A sleek modern Next.js CRM workspace featuring customizable colors, Poppins font throughout, and professional sidebar navigation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${poppins.className} h-full antialiased`}>
      <body className={`${poppins.className} min-h-full flex flex-col font-sans bg-[#F5F6F8] text-[#111827]`}>
        <ThemeProvider>
          <ClientDrawerProvider>
            {children}
          </ClientDrawerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
