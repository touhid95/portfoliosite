import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'Mahfujul Kader Touhid — Portfolio',
  description:
    'Portfolio of Mahfujul Kader Touhid — Data Analyst, IBA-JU undergraduate. Projects, research, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/nav_photo_png/1.svg" />
      </head>
      <body>
        <main className="container">
          {children}
        </main>
        <ChatWidget />
      </body>
    </html>
  );
}
