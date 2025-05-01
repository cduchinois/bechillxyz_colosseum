import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'BeChill - Your Personal Asset Manager',
  description: 'Take control of your digital assets with our AI-powered manager powered by Solana',
};

// Script simplifié pour la gestion du scroll
const ScrollRestorationScript = () => {
  return (
    <>
      <script dangerouslySetInnerHTML={{
        __html: `
          // Désactiver la restauration automatique du scroll
          history.scrollRestoration = 'manual';
          
          // Appliquer un scroll en haut au chargement initial
          window.addEventListener('load', function() {
            window.scrollTo(0, 0);
          });
        `
      }} />
    </>
  );
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <ScrollRestorationScript />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}