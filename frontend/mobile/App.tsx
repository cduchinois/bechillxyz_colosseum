import {
  ConnectionProvider,
  RPC_ENDPOINT,
} from './src/components/providers/ConnectionProvider';
import {clusterApiUrl} from '@solana/web3.js';
import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {AuthorizationProvider} from './src/components/providers/AuthorizationProvider';
import AssetsScreen from './src/screens/AssetsScreen';
import ObjectivesScreen from './src/screens/ObjectivesScreen';
import HistoryScreen from './src/screens/HistoryScreen';
<<<<<<< HEAD
import ProfileScreen from './src/screens/ProfileScreen';
=======
import SettingsScreen from './src/screens/SettingsScreen';
>>>>>>> web
import MainScreen from './src/screens/MainScreen';
// import InfoScreen from './src/screens/InfoScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import WalletStoryScreen from './src/screens/WalletStoryScreen';
import BottomBar from './src/components/BottomBar';
import {useAuthorization} from './src/components/providers/AuthorizationProvider';
<<<<<<< HEAD
=======
import ChillSpaceScreen from './src/screens/ChillSpaceScreen';
>>>>>>> web

// Composant de navigation personnalisé qui utilise le context d'autorisation
const NavigationContent = () => {
  const [activeScreen, setActiveScreen] = useState('assets');
  const {selectedAccount} = useAuthorization();
  const isConnected = !!selectedAccount;
  const hideBottomBarScreens = ['settings', 'onboarding'];

  // États pour gérer le flux de navigation
  const [currentView, setCurrentView] = useState<
    'main' | 'onboarding' | 'walletStory' | 'dashboard'
  >('main');
  const [skipOnboarding, setSkipOnboarding] = useState(true); // Mettre à true par défaut

  // Gérer la connexion du compte
  useEffect(() => {
    if (isConnected && currentView === 'main') {
      // Aller directement au dashboard quand skipOnboarding est true (défaut)
      if (skipOnboarding) {
        setCurrentView('dashboard');
      } else {
        // Option laissée pour l'onboarding si nécessaire dans le futur
        setCurrentView('onboarding');
      }
    }
  }, [isConnected, skipOnboarding, currentView]);

  // Fonction pour démarrer l'onboarding
  const handleStartOnboarding = () => {
    console.log(
      'handleStartOnboarding called, setting currentView to onboarding',
    );
    setSkipOnboarding(false); // Désactiver le saut d'onboarding si l'utilisateur clique sur Get Started
    setCurrentView('onboarding');
  };

  // Fonction pour sauter l'onboarding et aller directement au tableau de bord après connexion
  const handleDirectConnect = () => {
    console.log('handleDirectConnect called, setting skipOnboarding to true');
    setSkipOnboarding(true);
  };

  // Fonction pour naviguer entre les écrans d'onboarding
  const navigateOnboarding = (screen: string) => {
    console.log('navigateOnboarding called with:', screen);
    if (screen === 'wallet_story') {
      setCurrentView('walletStory');
    } else if (screen === 'main') {
<<<<<<< HEAD
      setCurrentView('dashboard');
    } else if (screen === 'assets') {
      // Ajouter ce cas pour la redirection après les stories
      setCurrentView('dashboard');
=======
      setCurrentView('dashboard'); // ← le dashboard "wrappe" les screens comme assets/settings/etc
      setActiveScreen('settings');
    } else if (screen === 'assets') {
      // Ajouter ce cas pour la redirection après les stories

>>>>>>> web
      setActiveScreen('assets');
    }
  };

  // Fonction pour gérer la complétion de WalletStoryScreen
  const handleWalletStoryComplete = (destination?: string) => {
    console.log(
      'handleWalletStoryComplete called with destination:',
      destination,
    );

    if (destination === 'assets') {
      // Si l'utilisateur a demandé à aller sur assets, le rediriger correctement
      setCurrentView('dashboard');
      setActiveScreen('assets');
    } else {
      // Comportement par défaut pour la compatibilité
      navigateOnboarding('main');
    }
  };

  // Rendu basé sur l'état actuel de navigation
  if (currentView === 'onboarding') {
    console.log('Rendering OnboardingScreen');
    return <OnboardingScreen onNavigate={navigateOnboarding} />;
  }

  if (currentView === 'walletStory') {
    console.log('Rendering WalletStoryScreen');
    return <WalletStoryScreen onComplete={handleWalletStoryComplete} />;
  }

  if (!isConnected) {
    console.log('User not connected, rendering MainScreen');
    return (
      <MainScreen
        onStartOnboarding={handleStartOnboarding}
        onConnectDirect={handleDirectConnect}
      />
    );
  }

  // Sélection de l'écran actif pour le tableau de bord
  console.log('Rendering dashboard with activeScreen:', activeScreen);

  const renderActiveScreen = () => {
    switch (activeScreen) {
<<<<<<< HEAD
=======
      case 'onboarding':
        return <OnboardingScreen onNavigate={navigateOnboarding} />;

>>>>>>> web
      case 'assets':
        return (
          <AssetsScreen
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        );
      case 'objectives':
        return (
          <ObjectivesScreen
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        );
<<<<<<< HEAD
      case 'chillbot':
        return <InfoScreen />;
=======
      case 'chillspace':
        return <ChillSpaceScreen />;
>>>>>>> web
      case 'history':
        return (
          <HistoryScreen
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        );
<<<<<<< HEAD
      case 'profile':
        return (
          <ProfileScreen
=======
      case 'settings':
        return (
          <SettingsScreen
>>>>>>> web
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        );
      default:
        return (
          <AssetsScreen
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        );
    }
  };

  // Affichage du tableau de bord avec la barre de navigation
  return (
    <View style={styles.navigationContainer}>
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      {!hideBottomBarScreens.includes(activeScreen) && (
        <BottomBar
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
        />
      )}
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
});
