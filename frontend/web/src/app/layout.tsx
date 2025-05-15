import './globals.css';
import Providers from '@/components/common/Providers';
import ConvexRootProvider from '@/components/common/ConvexRootProvider';

export const metadata = {
  title: 'BeChill - Your Personal Asset Manager',
  description: 'Take control of your digital assets with our AI-powered manager powered by Solana',
};

// Composant pour charger les Google Fonts
const GoogleFonts = () => {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,100..1000;1,100..1000&family=DM+Serif+Text:ital@0;1&family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </>
  );
};

// Script pour désactiver la restauration automatique du scroll
const ScrollRestorationScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          history.scrollRestoration = 'manual';
          window.addEventListener('load', function () {
            window.scrollTo(0, 0);
          });
        `,
      }}
    />
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <GoogleFonts />
        <ScrollRestorationScript />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          <ConvexRootProvider>{children}</ConvexRootProvider>
        </Providers>
      </body>
    </html>
  );
}
