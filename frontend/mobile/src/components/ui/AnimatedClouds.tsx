import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Easing,
  Image,
} from 'react-native';

// Types pour les nuages
interface CloudProps {
  id: number;
  startX: number;
  y: number;
  size: number;
  speed: number;
  direction: 'ltr' | 'rtl'; // left-to-right ou right-to-left
  zIndex: number;
  opacity?: number; // Propriété d'opacité optionnelle
}

// Composant Cloud défini en dehors du composant principal
// pour éviter l'erreur "no-unstable-nested-components"
const CloudComponent = ({
  cloud,
  screenWidth,
}: {
  cloud: CloudProps;
  screenWidth: number;
}) => {
  const cloudWidth = 200 * cloud.size; // Largeur approximative de l'image du nuage avec taille
  const xPosition = useRef(new Animated.Value(cloud.startX)).current;

  // Configuration de l'animation
  useEffect(() => {
    const animateCloud = () => {
      const toValue =
        cloud.direction === 'ltr' ? screenWidth + cloudWidth : -cloudWidth;

      const duration =
        cloud.direction === 'ltr'
          ? ((screenWidth + cloudWidth * 2) / cloud.speed) * 60 // Réduit pour animation plus fluide
          : ((screenWidth + cloudWidth * 2) / cloud.speed) * 60;

      // Configurer l'animation
      Animated.timing(xPosition, {
        toValue: toValue,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true, // Meilleure performance
      }).start(({finished}) => {
        if (finished) {
          // Réinitialiser la position et recommencer
          xPosition.setValue(
            cloud.direction === 'ltr' ? -cloudWidth : screenWidth,
          );
          animateCloud();
        }
      });
    };

    animateCloud();

    // Nettoyage à la suppression du composant
    return () => {
      xPosition.stopAnimation();
    };
  }, [cloud.direction, cloud.speed, cloudWidth, screenWidth]);

  return (
    <Animated.View
      style={[
        styles.cloudContainer,
        {
          transform: [{translateX: xPosition}],
          top: cloud.y,
          zIndex: cloud.zIndex,
        },
      ]}>
      {/* Utiliser une image PNG */}
      <Image
        source={require('../../../assets/img/cloud.png')}
        style={[
          styles.cloudImage,
          {
            width: cloudWidth,
            height: cloudWidth * 0.6, // Proportion estimée
            opacity: cloud.opacity || 0.6, // Utilise l'opacité personnalisée ou une valeur par défaut
          },
        ]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const AnimatedClouds = () => {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width,
  );
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );

  // Créer les configurations des nuages avec opacité personnalisée
  const clouds: CloudProps[] = [
    // Nuage déjà partiellement visible en haut à gauche
    {
      id: 1,
      startX: -80, // Seulement partiellement hors écran
      y: screenHeight * 0.15,
      size: 0.7,
      speed: 0.25,
      direction: 'ltr',
      zIndex: -10,
      opacity: 0.5, // Nuage légèrement transparent
    },

    // Nuage déjà partiellement visible en haut à droite
    {
      id: 2,
      startX: screenWidth - 50, // Positionné pour être partiellement visible
      y: screenHeight * 0.25,
      size: 0.9,
      speed: 0.3,
      direction: 'rtl',
      zIndex: -9,
      opacity: 0.7,
    },

    // Petit nuage qui se déplace rapidement
    {
      id: 3,
      startX: -40, // À peine hors écran
      y: screenHeight * 0.45,
      size: 0.5,
      speed: 0.4,
      direction: 'ltr',
      zIndex: -10,
      opacity: 0.6,
    },

    // Nuage moyen visible à droite
    {
      id: 4,
      startX: screenWidth - 70,
      y: screenHeight * 0.6,
      size: 0.8,
      speed: 0.35,
      direction: 'rtl',
      zIndex: -9,
      opacity: 0.5,
    },

    // Nuage lent et large déjà visible
    {
      id: 5,
      startX: screenWidth * 0.3, // Positionné déjà dans l'écran
      y: screenHeight * 0.75,
      size: 1.1,
      speed: 0.2,
      direction: 'ltr',
      zIndex: -10,
      opacity: 0.4,
    },

    // Grand nuage lointain qui bouge lentement
    {
      id: 6,
      startX: -60,
      y: screenHeight * 0.05,
      size: 1.3,
      speed: 0.15,
      direction: 'ltr',
      zIndex: -11, // Plus en arrière
      opacity: 0.3, // Plus transparent pour donner un effet de profondeur
    },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {clouds.map(cloud => (
        <CloudComponent
          key={cloud.id}
          cloud={cloud}
          screenWidth={screenWidth}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  cloudContainer: {
    position: 'absolute',
  },
  cloudImage: {
    width: 200,
    height: 120,
  },
});

export default AnimatedClouds;
