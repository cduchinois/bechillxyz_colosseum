'use client';
import { useEffect } from 'react';
import LandingPage from '@/components/layout/LandingPage';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export default function HomePage() {
  // Méthode simplifiée pour remonter la page uniquement au chargement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remonter la page tout en haut
      window.scrollTo(0, 0);
      
      // Version plus douce qui permet le défilement naturel par la suite
      const initialScrollHandler = () => {
        // Si nous sommes au tout début de la page (moins de 50px de scroll)
        // alors forcer le retour en haut
        if (window.scrollY < 50) {
          window.scrollTo(0, 0);
        }
        // Supprimer ce gestionnaire après qu'il ait été exécuté une fois
        window.removeEventListener('scroll', initialScrollHandler);
      };
      
      // Ajouter ce gestionnaire pour le premier scrolling uniquement
      window.addEventListener('scroll', initialScrollHandler, { once: true });
    }
  }, []);

  return (
    <>
      <LandingPage />
    </>
  )
}