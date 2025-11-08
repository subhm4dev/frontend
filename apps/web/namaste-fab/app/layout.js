import { Inter } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/lib/react-query';
import { AuthInitializer } from '@/components/AuthInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Namaste Fab - Beautiful Odia Sarees & Indian Textiles',
  description: 'Discover the timeless elegance of Sambalpuri Ikat, Bomkai, and traditional Odia textiles. Handcrafted sarees with authentic Odisha patterns.',
  icons: {
    icon: '/namastefab.png',
    shortcut: '/namastefab.png',
    apple: '/namastefab.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AuthInitializer />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}