import React from 'react';
import {View, TouchableOpacity, Image, Text, StyleSheet} from 'react-native';
import {Colors} from '../constants/GlobalStyles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
    /*
    {
      id: 'assets',
      iconPath: require('../../assets/img/assets.png'),
      label: 'Assets',
    },
    */
    {
      id: 'onboarding',
      iconName: 'sms',
      activeIconName: 'sms',
      label: 'Chat',
    },
    {
      id: 'chillspace',
      icon: require('../../assets/img/chillspace.png'),
      activeIcon: null, // même icône active/inactive
      label: 'ChillSpace',
    },
    {
      id: 'settings',
      iconName: 'settings',
      activeIconName: 'settings',
      label: 'Settings',
    },
    /*
    {
      id: 'history',
      iconPath: require('../../assets/img/history.png'),
      label: 'History',
    },
    */
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeScreen === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onScreenChange(tab.id)}>
            {tab.iconName ? (
              <MaterialIcons
                name={isActive ? tab.activeIconName : tab.iconName}
                size={24}
                color={isActive ? Colors.primary : '#bbbbbb'}
              />
            ) : (
              <Image
                source={tab.icon}
                style={[
                  styles.tabIcon,
                  isActive ? styles.activeIcon : styles.inactiveIcon,
                ]}
                resizeMode="contain"
              />
            )}

            <Text
              style={[
                styles.tabText,
                isActive ? styles.activeText : styles.inactiveText,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
    tintColor: Colors.primary, // Couleur violette pour l'icône active
  },
  inactiveIcon: {
    tintColor: '#bbbbbb', // Couleur grise pour les icônes inactives
  },
  tabText: {
    fontSize: 12,
  },
  activeText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#bbbbbb', // Couleur grise pour le texte inactif
  },
});

export default BottomBar;
