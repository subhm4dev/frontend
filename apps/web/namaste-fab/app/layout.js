import { Inter } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/lib/react-query';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Namaste Fab',
  description: 'Beautiful Indian dresses and fabrics',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}