import React from 'react';
import {View, TouchableOpacity, Image, Text, StyleSheet} from 'react-native';

/**
 * Barre de navigation complète pour l'app BeChill
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.activeScreen - L'écran actif
 * @param {Function} props.onScreenChange - Fonction appelée lors d'un changement d'écran
 */
interface BottomBarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
}

const BottomBar: React.FC<BottomBarProps> = ({
  activeScreen,
  onScreenChange,
}) => {
  // Définir les onglets disponibles avec leurs icônes et leurs labels
  const tabs = [
    {
      id: 'assets',
      iconPath: require('../../assets/img/assets.png'),
      label: 'Assets',
    },
    {
      id: 'objectives',
      iconPath: require('../../assets/img/objectives.png'),
      label: 'Objectives',
    },
    {
      id: 'chillbot',
      iconPath: require('../../assets/img/chillbot.png'),
      label: 'Chillbot',
    },
    {
      id: 'history',
      iconPath: require('../../assets/img/history.png'),
      label: 'History',
    },
    {
      id: 'profile',
      iconPath: require('../../assets/img/profile.png'),
      label: 'Profile',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={() => onScreenChange(tab.id)}>
          <Image
            source={tab.iconPath}
            style={[
              styles.tabIcon,
              activeScreen === tab.id ? styles.activeIcon : styles.inactiveIcon,
            ]}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.tabText,
              activeScreen === tab.id ? styles.activeText : styles.inactiveText,
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
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 3,
  },
  activeIcon: {
    tintColor: '#8A2BE2', // Couleur violette pour l'icône active
  },
  inactiveIcon: {
    tintColor: '#bbbbbb', // Couleur grise pour les icônes inactives
  },
  tabText: {
    fontSize: 12,
  },
  activeText: {
    color: '#8A2BE2', // Couleur violette pour le texte actif
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#bbbbbb', // Couleur grise pour le texte inactif
  },
});

export default BottomBar;
