import React, {useCallback, useEffect, useState} from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {PublicKey} from '@solana/web3.js';

import PrivyConnectScreen from './PrivyConnectScreen';
import AnimatedClouds from '../components/ui/AnimatedClouds';

import ConnectButton from '../components/ConnectButton';
import AccountInfo from '../components/AccountInfo';
import {useAuthorization} from '../components/providers/AuthorizationProvider';
import {useConnection} from '../components/providers/ConnectionProvider';
import {Colors, Fonts} from '../constants/GlobalStyles';

const background = require('../../assets/img/BeChill_landing_bg.png');
const logo = require('../../assets/img/bechill-head1.png');

// Interface pour les props de MainScreen
interface MainScreenProps {
  onStartOnboarding?: () => void;
  onConnectDirect?: () => void;
}

// Définition avec function plutôt que const arrow function
function MainScreen({onStartOnboarding, onConnectDirect}: MainScreenProps) {
  const {connection} = useConnection();
  const {selectedAccount} = useAuthorization();
  const [balance, setBalance] = useState<number | null>(null);
  const [showWebView, setShowWebView] = useState(false);

  // Logs pour le débogage des props
  console.log('MainScreen Props:', {
    hasOnStartOnboarding: !!onStartOnboarding,
    hasOnConnectDirect: !!onConnectDirect,
  });

  // Enregistrer l'effet de la connexion
  useEffect(() => {
    if (selectedAccount && onConnectDirect) {
      console.log('Account selected, calling onConnectDirect');
      onConnectDirect();
    }
  }, [selectedAccount, onConnectDirect]);

  const fetchAndUpdateBalance = useCallback(
    async (account: {publicKey: PublicKey}) => {
      const fetchedBalance = await connection.getBalance(account.publicKey);
      console.log('Balance fetched: ' + fetchedBalance);
      setBalance(fetchedBalance);
    },
    [connection],
  );

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }
    fetchAndUpdateBalance({publicKey: selectedAccount.publicKey});
  }, [fetchAndUpdateBalance, selectedAccount]);

  // Fonction de débogage pour le bouton Get Started
  const handleGetStarted = () => {
    console.log('Get Started button pressed');
    if (onStartOnboarding) {
      console.log('Calling onStartOnboarding function');
      onStartOnboarding();
    } else {
      console.log('onStartOnboarding function is not defined');
    }
  };

  if (showWebView) {
    return <PrivyConnectScreen onDone={() => setShowWebView(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Arrière-plan avec image */}
      <ImageBackground
        source={background}
        style={styles.mainContainer}
        resizeMode="cover">
        {/* Ajouter les nuages animés en arrière-plan */}
        <AnimatedClouds />

        <View style={styles.contentContainer}>
          {selectedAccount ? (
            <View style={styles.accountContainer}>
              <AccountInfo
                selectedAccount={selectedAccount}
                balance={balance}
                fetchAndUpdateBalance={fetchAndUpdateBalance}
              />
            </View>
          ) : (
            <View style={styles.connectContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />

              <Text style={styles.subTitle}>
                Chill{'\n'}your personal asset manager powered by Solana
              </Text>

              <View style={styles.connectButtonContainer}>
                <ConnectButton title="Connect wallet" />
              </View>

              {/* Bouton Get Started pour l'onboarding */}
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}>
                <Text style={styles.getStartedButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Selected cluster: {connection.rpcEndpoint}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 10, // S'assurer que le contenu est au-dessus des nuages
  },
  connectContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%', // Garde le logo responsive en largeur
    height: 130, // Augmente la hauteur (était 100)
    maxWidth: 300, // Ajoute une largeur maximale pour contrôler la taille
    marginBottom: 24,
    alignSelf: 'center',
  },
  accountContainer: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectButtonContainer: {
    marginVertical: 10,
    borderRadius: 25,
    overflow: 'hidden',
    width: '70%',
  },
  // Style pour le bouton Get Started
  getStartedButton: {
    marginTop: 4,
    width: '70%',
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Fonts.DMSerif,
  },
  privyButton: {
    marginTop: 15,
    width: '70%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    zIndex: 10, // S'assurer que le footer est au-dessus des nuages
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  subTitle: {
    fontFamily: Fonts.DMSerif,
    fontSize: 46,
    textAlign: 'center',
    color: Colors.primary,
    marginBottom: 24,
    paddingHorizontal: 12,
    lineHeight: 48,
  },
});

export default MainScreen;
