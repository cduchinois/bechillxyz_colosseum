import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'BeChill - Your Personal Asset Manager',
  description: 'Take control of your digital assets with our AI-powered manager powered by Solana',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}