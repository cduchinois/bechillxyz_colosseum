import {
  ConnectionProvider,
  RPC_ENDPOINT,
} from './src/components/providers/ConnectionProvider';
import {clusterApiUrl} from '@solana/web3.js';
import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, View, Text} from 'react-native';
import {AuthorizationProvider} from './src/components/providers/AuthorizationProvider';
import AssetsScreen from './src/screens/AssetsScreen';
import MainScreen from './src/screens/MainScreen';
import InfoScreen from './src/screens/InfoScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import WalletStoryScreen from './src/screens/WalletStoryScreen';
import BottomBar from './src/components/BottomBar';
import {useAuthorization} from './src/components/providers/AuthorizationProvider';

// Composants de placeholder pour les nouveaux écrans
const StrategyScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderTitle}>Stratégie d'Investissement</Text>
    <Text style={styles.placeholderText}>
      Créez une stratégie personnalisée avec notre IA pour atteindre vos
      objectifs financiers sur Solana. Définissez des étapes claires et suivez
      votre progression.
    </Text>
    <View style={styles.comingSoonBadge}>
      <Text style={styles.comingSoonText}>Bientôt disponible</Text>
    </View>
  </View>
);

const ActionsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderTitle}>Actions Recommandées</Text>
    <Text style={styles.placeholderText}>
      Vos transactions recommandées et DCA planifiés apparaîtront ici. Autorisez
      Privy pour des signatures automatisées et suivez vos habitudes
      d'investissement.
    </Text>
    <View style={styles.comingSoonBadge}>
      <Text style={styles.comingSoonText}>Bientôt disponible</Text>
    </View>
  </View>
);

// Composant de navigation personnalisé qui utilise le context d'autorisation
const NavigationContent = () => {
  const [activeScreen, setActiveScreen] = useState('wallet');
  const {selectedAccount} = useAuthorization();
  const isConnected = !!selectedAccount;

  // États pour gérer le flux d'onboarding
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false); // Modifié pour commencer par le MainScreen
  const [showWalletStory, setShowWalletStory] = useState(false);
  const [hasCompletedWalletConnect, setHasCompletedWalletConnect] =
    useState(false);

  // Réinitialiser à l'écran wallet quand l'utilisateur se connecte/déconnecte
  useEffect(() => {
    setActiveScreen('wallet');

    // Si l'utilisateur se connecte, marquer qu'il a complété la connexion du wallet
    if (isConnected && isFirstTime) {
      setHasCompletedWalletConnect(true);

      // Si c'est la première fois, montrer l'écran d'onboarding après la connexion
      if (!showOnboarding && !showWalletStory) {
        setShowOnboarding(true);
      }
    }
  }, [isConnected, isFirstTime, showOnboarding, showWalletStory]);

  // Fonction pour naviguer entre les écrans d'onboarding
  const navigateOnboarding = (screen: string) => {
    if (screen === 'wallet_story') {
      setShowOnboarding(false);
      setShowWalletStory(true);
    } else if (screen === 'main') {
      setShowOnboarding(false);
      setShowWalletStory(false);
      setIsFirstTime(false);
    }
  };

  // Si l'utilisateur est connecté et que c'est sa première fois (et qu'il a déjà connecté son wallet)
  if (isConnected && isFirstTime && hasCompletedWalletConnect) {
    if (showOnboarding) {
      return <OnboardingScreen onNavigate={navigateOnboarding} />;
    }
    if (showWalletStory) {
      return (
        <WalletStoryScreen onComplete={() => navigateOnboarding('main')} />
      );
    }
  }

  // Si non connecté ou si c'est la première interaction
  if (!isConnected) {
    return <MainScreen />;
  }

  // Sélection de l'écran actif
  // Sélection de l'écran actif
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'assets':
        return (
          <AssetsScreen
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        );
      case 'objectives':
        return <InfoScreen />;
      case 'chillbot':
        return <StrategyScreen />;
      case 'history':
        return <ActionsScreen />;
      case 'profile':
        return <MainScreen />;
      default:
        return <MainScreen />;
    }
  };

  // Si connecté, afficher l'écran actif et la barre de navigation
  return (
    <View style={styles.navigationContainer}>
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      <BottomBar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
    </View>
  );
};

// Composant principal App
export default function App() {
  return (
    <ConnectionProvider
      config={{commitment: 'processed'}}
      endpoint={clusterApiUrl(RPC_ENDPOINT)}>
      <AuthorizationProvider>
        <SafeAreaView style={styles.shell}>
          <NavigationContent />
        </SafeAreaView>
      </AuthorizationProvider>
    </ConnectionProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: '100%',
  },
  navigationContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  screenContainer: {
    flex: 1,
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginBottom: 20,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    color: '#444',
  },
  comingSoonBadge: {
    backgroundColor: '#FFC107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  comingSoonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
