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
import AnimatedClouds from '../components/ui/AnimatedClouds';
import Header from '../components/Header';
import ConnectButton from '../components/ConnectButton';
import AccountInfo from '../components/AccountInfo';
import {useAuthorization} from '../components/providers/AuthorizationProvider';
import {useConnection} from '../components/providers/ConnectionProvider';
import {Colors, Fonts} from '../constants/GlobalStyles';

// Composant pour une barre de progression
interface ProgressBarProps {
  progress: number;
  color: string;
  backgroundColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  backgroundColor = '#E0E0FF',
}) => (
  <View style={[styles.progressBarContainer, {backgroundColor}]}>
    <View
      style={[
        styles.progressBar,
        {width: `${progress}%`, backgroundColor: color},
      ]}
    />
  </View>
);

// Composant pour une carte d'information
interface InfoCardProps {
  icon: string;
  title: string;
  progress: number;
  color: string;
  value: string;
  additionalInfo?: {
    leftText?: string;
    rightText?: string;
  };
  showInfoButton?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  progress,
  color,
  value,
  additionalInfo,
  showInfoButton = true,
}) => (
  <View style={styles.infoCard}>
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {showInfoButton && (
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoButtonText}>ⓘ</Text>
        </TouchableOpacity>
      )}
    </View>

    <ProgressBar progress={progress} color={color} />

    <View style={styles.valueContainer}>
      <Text style={styles.valueText}>{value}</Text>
    </View>

    {additionalInfo && (
      <View style={styles.additionalInfoContainer}>
        {additionalInfo.leftText && (
          <Text style={styles.additionalInfoText}>
            {additionalInfo.leftText}
          </Text>
        )}
        {additionalInfo.rightText && (
          <Text style={styles.additionalInfoText}>
            {additionalInfo.rightText}
          </Text>
        )}
      </View>
    )}
  </View>
);

// Écran principal du profil
interface ProfileScreenProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = _props => {
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
        <AnimatedClouds />
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <Text style={styles.screenTitle}>Profile</Text>

        {/* Ajout du composant AccountInfo */}
        <View style={styles.accountContainer}>
          <AccountInfo
            selectedAccount={selectedAccount}
            balance={balance}
            fetchAndUpdateBalance={fetchAndUpdateBalance}
          />
        </View>

        <Text style={styles.profileType}>Moderate investor</Text>
        <Text style={styles.profileDescription}>
          You are a stable and goal-oriented investor who strives for a
          harmonized investment strategy that balances risk and reward.
        </Text>

        <InfoCard
          icon="😎"
          title="Chill score"
          progress={78}
          color="#FFFF00"
          value="78%"
          showInfoButton={true}
        />

        <InfoCard
          icon="⚠️"
          title="Risk score"
          progress={25}
          color="#8A2BE2"
          value="25%"
          showInfoButton={true}
        />

        <InfoCard
          icon="👆"
          title="Bucket split"
          progress={70}
          color="#FFFF00"
          value=""
          additionalInfo={{
            leftText: '30% speculative',
            rightText: '70% steady',
          }}
          showInfoButton={true}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0ff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8A2BE2',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  profileType: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8A2BE2',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  profileDescription: {
    fontSize: 16,
    color: '#333',
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
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
});

export default ProfileScreen;
