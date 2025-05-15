import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, Platform, Alert} from 'react-native';
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {useAuthorization} from './providers/AuthorizationProvider';

export default function DisconnectButton({title = 'DISCONNECT'}) {
  const {deauthorizeSession} = useAuthorization();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (isDisconnecting) {
      return;
    }

    try {
      setIsDisconnecting(true);

      if (Platform.OS === 'android' && !__DEV__) {
        await deauthorizeSession(null);
        console.log('Manually disconnected (bypassing wallet protocol)');
      } else {
        await transact(async wallet => {
          await deauthorizeSession(wallet);
        });
        console.log('Successfully disconnected via protocol');
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      if (Platform.OS === 'android') {
        try {
          await deauthorizeSession(null);
          console.log('Forced disconnect after error');
        } catch (secondError) {
          console.error('Even forced disconnect failed:', secondError);
          Alert.alert(
            'Disconnect Error',
            'Unable to disconnect. Please close and reopen the app.',
            [{text: 'OK'}],
          );
        }
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Pressable
      onPress={handleDisconnect}
      disabled={isDisconnecting}
      style={({pressed}) => [
        styles.button,
        pressed && {opacity: 0.8},
        isDisconnecting && {opacity: 0.5},
      ]}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8C53E7',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFF4F',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 14,
  },
});
