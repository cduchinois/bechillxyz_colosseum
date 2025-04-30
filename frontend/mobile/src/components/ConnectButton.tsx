import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, {useState, useCallback} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {useAuthorization} from './providers/AuthorizationProvider';
import {alertAndLog} from '../../src/utils/alertAndLog';
import {Colors, Fonts} from '../constants/GlobalStyles';

type Props = {
  title: string;
};

export default function ConnectButton({title}: Props) {
  const {authorizeSession} = useAuthorization();
  const [authorizationInProgress, setAuthorizationInProgress] = useState(false);

  const handleConnectPress = useCallback(async () => {
    try {
      if (authorizationInProgress) {
        return;
      }
      setAuthorizationInProgress(true);
      await transact(async wallet => {
        await authorizeSession(wallet);
      });
    } catch (err: any) {
      alertAndLog(
        'Error during connect',
        err instanceof Error ? err.message : err,
      );
    } finally {
      setAuthorizationInProgress(false);
    }
  }, [authorizationInProgress, authorizeSession]);

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleConnectPress}
        disabled={authorizationInProgress}>
        <Text style={styles.buttonText}>
          {authorizationInProgress ? 'Loading...' : title}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: Colors.primary, // violet #540CCC
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.secondary, // jaune #FFFF4F
    fontFamily: Fonts.Monument,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
