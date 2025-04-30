import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

type Props = {
  onDone: () => void;
};

export default function PrivyConnectScreen({onDone}: Props) {
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      const walletAddress = data.walletAddress;
      if (walletAddress) {
        console.log('✅ Adresse reçue depuis Privy :', walletAddress);
        onDone(); // ✅ Ferme la WebView une fois connecté
      }
    } catch (err) {
      console.error('❌ Erreur parsing message Privy:', err);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{uri: 'https://privy-web-login.vercel.app'}}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  webview: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
});
