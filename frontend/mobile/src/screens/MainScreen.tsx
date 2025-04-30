// Vérifiez que le fichier MainScreen.js exporte correctement le composant
// Assurez-vous que la dernière ligne est:
// export default MainScreen;

import React, {useCallback, useEffect, useState} from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';

import PrivyConnectScreen from './PrivyConnectScreen';

import ConnectButton from '../../src/components/ConnectButton';
import AccountInfo from '../../src/components/AccountInfo';
import {
  useAuthorization,
  Account,
} from '../components/providers/AuthorizationProvider';
import {useConnection} from '../components/providers/ConnectionProvider';
import {Colors, Fonts} from '../constants/GlobalStyles';

const background = require('../../assets/img/BeChill_landing_bg.png');
const logo = require('../../assets/img/bechill-head1.png');

// Définition avec function plutôt que const arrow function
function MainScreen() {
  const {connection} = useConnection();
  const {selectedAccount} = useAuthorization();
  const [balance, setBalance] = useState(null);
  const [showWebView, setShowWebView] = useState(false);

  const fetchAndUpdateBalance = useCallback(
    async account => {
      console.log('Fetching balance for: ' + account.publicKey);
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
    fetchAndUpdateBalance(selectedAccount);
  }, [fetchAndUpdateBalance, selectedAccount]);

  if (showWebView) {
    return <PrivyConnectScreen onDone={() => setShowWebView(false)} />;
  }

  return (
    <ImageBackground
      source={background}
      style={styles.mainContainer}
      resizeMode="cover">
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

            <View style={styles.privyButton}>
              <Button
                title="Connect with Privy"
                onPress={() => setShowWebView(true)}
                color="#000000"
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Selected cluster: {connection.rpcEndpoint}
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  privyButton: {
    marginTop: 15,
    width: '70%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
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
