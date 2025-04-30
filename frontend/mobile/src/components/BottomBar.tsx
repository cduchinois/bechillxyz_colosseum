import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

/**
 * Barre de navigation complète pour l'app BeChill
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.activeScreen - L'écran actif
 * @param {Function} props.onScreenChange - Fonction appelée lors d'un changement d'écran
 */
const BottomBar = ({activeScreen, onScreenChange}) => {
  // Définir les onglets disponibles
  const tabs = [
    {id: 'wallet', label: 'Wallet', icon: '💰'},
    {id: 'profile', label: 'Profil', icon: '👤'},
    {id: 'strategy', label: 'Stratégie', icon: '📈'},
    {id: 'actions', label: 'Actions', icon: '🚀'},
    {id: 'learn', label: 'Apprendre', icon: '📚'},
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, activeScreen === tab.id && styles.activeTab]}
          onPress={() => onScreenChange(tab.id)}>
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text
            style={[
              styles.tabText,
              activeScreen === tab.id && styles.activeText,
            ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeText: {
    color: '#8A2BE2',
    fontWeight: 'bold',
  },
});

export default BottomBar;
