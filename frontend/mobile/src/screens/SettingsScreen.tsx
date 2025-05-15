import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {PublicKey} from '@solana/web3.js';

import PrivyConnectScreen from './PrivyConnectScreen';
import AnimatedCloudsLight from '../components/ui/AnimatedCloudsLight';
import ConnectButton from '../components/ConnectButton';
import AccountInfo from '../components/AccountInfo';
import {useAuthorization} from '../components/providers/AuthorizationProvider';
import {useConnection} from '../components/providers/ConnectionProvider';
import {Colors, Fonts} from '../constants/GlobalStyles';
import Close from '../components/Close';
import Feather from 'react-native-vector-icons/Feather';

// Écran principal du profil
interface SettingsScreenProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = _props => {
  const {connection} = useConnection();
  const {selectedAccount} = useAuthorization();
  const [balance, setBalance] = useState<number | null>(null);
  const [showWebView, setShowWebView] = useState(false);

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

  if (showWebView) {
    return <PrivyConnectScreen onDone={() => setShowWebView(false)} />;
  }

  // Si l'utilisateur n'est pas connecté, afficher le MainScreen original
  if (!selectedAccount) {
    return (
      <View style={styles.container}>
        <AnimatedCloudsLight />
        <View style={styles.connectContainer}>
          <Image
            source={require('../../assets/img/bechill-head1.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.subTitle}>
            Chill{'\n'}your personal asset manager powered by Solana
          </Text>

          <View style={styles.connectButtonContainer}>
            <ConnectButton title="Connect wallet" />
          </View>

          <View style={styles.privyButton}>
            <TouchableOpacity
              style={styles.privyButtonContent}
              onPress={() => setShowWebView(true)}>
              <Text style={styles.privyButtonText}>Connect with Privy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Si l'utilisateur est connecté, afficher le profil
  return (
    <SafeAreaView style={styles.container}>
      <AnimatedCloudsLight />
      <Close
        onClose={() => {
          _props.setActiveScreen('chillspace');
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Ajout du composant AccountInfo */}
        <View style={styles.accountContainer}>
          <AccountInfo
            selectedAccount={selectedAccount}
            balance={balance}
            fetchAndUpdateBalance={fetchAndUpdateBalance}
          />
        </View>
        <View style={styles.fundButtonsContainer}>
          <TouchableOpacity style={styles.receiveButton}>
            <Text style={styles.receiveButtonText}>RECEIVE FUNDS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>SEND FUNDS</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.underline} />
        <Text style={styles.trackedWalletTitle}>Tracked wallets</Text>
        <View style={styles.walletCard}>
          <Image
            source={require('../../assets/img/walletlogo.png')}
            style={styles.walletLogo}
          />
          <View style={styles.walletInfo}>
            <Text style={styles.walletName}>Wallet1</Text>
            <Text style={styles.walletAddress}>6rW...TtrD</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addWalletRow}>
          <Text style={styles.addWalletText}>Add wallet</Text>
          <Feather name="plus-square" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.comingSoonText}>
          Coming soon: Track multiple wallets in your portfolio.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  addWalletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 30,
    marginBottom: 30,
  },

  addWalletText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  addWalletIcon: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#3C0891',
  },

  fundButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginTop: -15,
    marginBottom: 20,
    gap: 15,
  },

  receiveButton: {
    backgroundColor: '#560CCC',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
  },

  receiveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },

  sendButton: {
    backgroundColor: '#DDDAF6',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
  },

  sendButtonText: {
    color: '#560CCC',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 42,
    fontFamily: Fonts.DMSerif,
    color: Colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 15,
  },
  trackedWalletTitle: {
    fontSize: 28,
    fontFamily: Fonts.DMSerif,
    color: Colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 15,
  },
  comingSoonText: {
    width: '90%',
    marginLeft: 15,
    fontSize: 16,
    color: '#94ADC7',
    paddingHorizontal: 15,
    paddingBottom: 20,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 16,
    color: '#8A2BE2',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0FF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  valueContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  additionalInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  additionalInfoText: {
    fontSize: 14,
    color: '#666',
  },
  // Styles pour MainScreen
  connectContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: '100%',
    height: 130,
    maxWidth: 300,
    marginBottom: 24,
    alignSelf: 'center',
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
  connectButtonContainer: {
    marginVertical: 10,
    borderRadius: 25,
    overflow: 'hidden',
    width: '70%',
  },
  privyButton: {
    marginTop: 15,
    width: '70%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  privyButtonContent: {
    backgroundColor: '#000000',
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
  },
  privyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Style pour le conteneur d'AccountInfo
  accountContainer: {
    width: '95%',
    alignItems: 'center',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 15,
    marginBottom: 20,

    alignSelf: 'center',
  },

  underline: {
    marginTop: 10,
    height: 1,
    backgroundColor: '#8C53E7',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 1,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 20,
    padding: 16,
    marginHorizontal: 15,
    marginBottom: 12,
  },

  walletLogo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 15,
  },

  walletInfo: {
    flexDirection: 'column',
  },

  walletName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  walletAddress: {
    fontSize: 16,
    color: '#B8B8FF',
  },
});

export default SettingsScreen;
