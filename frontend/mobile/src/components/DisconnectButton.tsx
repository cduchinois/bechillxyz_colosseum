import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, {ComponentProps, useState} from 'react';
import {Button, StyleSheet, View, Platform, Alert} from 'react-native';

import {useAuthorization} from './providers/AuthorizationProvider';

type Props = Readonly<ComponentProps<typeof Button>>;

export default function DisconnectButton(props: Props) {
  const {deauthorizeSession} = useAuthorization();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (isDisconnecting) {
      return;
    }

    try {
      setIsDisconnecting(true);

      // Sur les appareils physiques, effectuez une déconnexion manuelle
      if (Platform.OS === 'android' && !__DEV__) {
        // Forcer la déconnexion en réinitialisant l'état d'autorisation
        // sans appeler transact qui peut échouer sur les appareils physiques
        await deauthorizeSession(null);
        console.log('Manually disconnected (bypassing wallet protocol)');
      } else {
        // Sur les émulateurs ou en développement, utiliser transact normalement
        await transact(async wallet => {
          await deauthorizeSession(wallet);
        });
        console.log('Successfully disconnected via protocol');
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);

      // Forcer la déconnexion même si l'erreur se produit
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
    <View style={styles.buttonContainer}>
      <Button
        {...props}
        color="#FF6666"
        disabled={isDisconnecting}
        onPress={handleDisconnect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    minWidth: 120,
  },
});
