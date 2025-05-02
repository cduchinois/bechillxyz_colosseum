import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';

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
  // Définir les onglets disponibles avec leurs icônes
  const tabs = [
    {id: 'assets', iconPath: require('../../assets/img/assets.png')},
    {id: 'strategy', iconPath: require('../../assets/img/objectives.png')},
    {id: 'chillbot', iconPath: require('../../assets/img/chillbot.png')},
    {id: 'history', iconPath: require('../../assets/img/history.png')},
    {id: 'profile', iconPath: require('../../assets/img/profile.png')}, // Notez "profil" sans "e"
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
    paddingVertical: 10,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  activeIcon: {
    tintColor: '#8A2BE2', // Couleur violette pour l'icône active
  },
  inactiveIcon: {
    tintColor: '#bbbbbb', // Couleur grise pour les icônes inactives
  },
});

export default BottomBar;
