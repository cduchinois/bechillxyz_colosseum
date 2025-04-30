import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

/**
 * Écran d'informations avec défilement
 */
function InfoScreen() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.title}>Solana Mobile</Text>
      <Text style={styles.subtitle}>BeChill App</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>À propos de cette application</Text>
        <Text style={styles.infoText}>
          Cette application est construite avec React Native pour les appareils
          Solana Mobile. Elle permet aux utilisateurs de se connecter à leur
          portefeuille Solana et de visualiser leurs informations de compte.
        </Text>

        <Text style={styles.infoTitle}>Fonctionnalités</Text>
        <Text style={styles.infoText}>
          • Connexion au portefeuille via Mobile Wallet Adapter{'\n'}• Affichage
          du solde de compte{'\n'}• Connexion alternative via Privy{'\n'}•
          Navigation simple entre les écrans
        </Text>

        <Text style={styles.infoTitle}>Pourquoi Solana?</Text>
        <Text style={styles.infoText}>
          Solana offre des transactions rapides et à faible coût, ce qui en fait
          une plateforme idéale pour les applications décentralisées. Solana
          Mobile apporte cette technologie directement sur votre appareil
          Android, permettant une interaction fluide avec la blockchain.
        </Text>

        <Text style={styles.infoTitle}>Comment utiliser cette app</Text>
        <Text style={styles.infoText}>
          1. Connectez-vous avec votre portefeuille Solana{'\n'}
          2. Consultez votre solde et vos informations{'\n'}
          3. Explorez les différentes fonctionnalités{'\n'}
          4. Déconnectez-vous en toute sécurité quand vous avez terminé
        </Text>

        <Text style={styles.version}>Version 0.0.1</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 80, // Espace supplémentaire en bas pour la BottomBar
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#8A2BE2', // Violet
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 30,
    color: '#666',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 16,
  },
  version: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default InfoScreen;
