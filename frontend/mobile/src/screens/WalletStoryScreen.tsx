import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import {Fonts} from '../constants/GlobalStyles';

// Définir le type pour une page de la story
interface StoryPage {
  id: string;
  title: string;
  description: string;
  value: string;
  backgroundColor: string;
  icon?: string;
}

// Props pour l'écran WalletStory
interface WalletStoryScreenProps {
  onComplete?: () => void;
}

const WalletStoryScreen = ({onComplete}: WalletStoryScreenProps) => {
  // Données factices pour la story (dans un cas réel, elles viendraient d'une API)
  const storyPages: StoryPage[] = [
    {
      id: '1',
      title: 'Your Monthly Return',
      description: 'Overall performance',
      value: '+5.8%',
      backgroundColor: '#7B4EFF',
      icon: '📈',
    },
    {
      id: '2',
      title: 'Portfolio Value',
      description: 'Growth over 30 days',
      value: '$9,420 → $9,966',
      backgroundColor: '#FF6B6B',
      icon: '💰',
    },
    {
      id: '3',
      title: 'Top Performer',
      description: '$JUP token pumped',
      value: '+24.4%',
      backgroundColor: '#4CAF50',
      icon: '🚀',
    },
    {
      id: '4',
      title: 'Steady Anchor',
      description: 'Your $SOL holdings',
      value: '+7.8%',
      backgroundColor: '#1E88E5',
      icon: '⚓',
    },
    {
      id: '5',
      title: 'Investment Strategy',
      description: 'Your approach is working',
      value: 'CHILL & GROW',
      backgroundColor: '#9C27B0',
      icon: '🌱',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const {width} = Dimensions.get('window');

  // Valeurs d'animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const titleSlideAnim = useRef(new Animated.Value(-100)).current;
  const valueSlideAnim = useRef(new Animated.Value(100)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Lancer l'animation quand la page change
  useEffect(() => {
    // Réinitialiser les animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    titleSlideAnim.setValue(-50);
    valueSlideAnim.setValue(50);
    iconScaleAnim.setValue(0);

    // Animation de progression
    progressAnim.setValue(currentIndex / (storyPages.length - 1));

    // Séquence d'animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(titleSlideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(valueSlideAnim, {
        toValue: 0,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
        delay: 200,
      }),
      Animated.timing(progressAnim, {
        toValue: (currentIndex + 1) / storyPages.length,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [
    currentIndex,
    fadeAnim,
    scaleAnim,
    titleSlideAnim,
    valueSlideAnim,
    iconScaleAnim,
    progressAnim,
    storyPages.length,
  ]);

  // Gérer le clic pour passer à la page suivante
  const goToNextPage = () => {
    if (currentIndex < storyPages.length - 1) {
      setCurrentIndex(currentIndex + 1);
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Si c'est la dernière page, terminer la story
      if (onComplete) {
        onComplete();
      }
    }
  };

  // Gérer le clic pour revenir à la page précédente
  const goToPrevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  // Rendu d'une page individuelle de la story
  const renderStoryPage = ({item, index}: {item: StoryPage; index: number}) => {
    // Seulement animer la page actuelle
    const isCurrentPage = index === currentIndex;

    return (
      <View
        style={[
          styles.storyPageContainer,
          {width, backgroundColor: item.backgroundColor},
        ]}>
        {/* Contenu animé */}
        {isCurrentPage ? (
          <Animated.View
            style={[
              styles.storyContentContainer,
              {
                opacity: fadeAnim,
                transform: [{scale: scaleAnim}],
              },
            ]}>
            {/* Icône animée */}
            {item.icon && (
              <Animated.Text
                style={[
                  styles.storyIcon,
                  {
                    transform: [{scale: iconScaleAnim}],
                  },
                ]}>
                {item.icon}
              </Animated.Text>
            )}

            {/* Titre animé */}
            <Animated.Text
              style={[
                styles.storyTitle,
                {
                  transform: [{translateX: titleSlideAnim}],
                },
              ]}>
              {item.title}
            </Animated.Text>

            <Text style={styles.storyDescription}>{item.description}</Text>

            {/* Valeur animée */}
            <Animated.Text
              style={[
                styles.storyValue,
                {
                  transform: [{translateX: valueSlideAnim}],
                },
              ]}>
              {item.value}
            </Animated.Text>
          </Animated.View>
        ) : (
          // Version non animée pour les autres pages
          <View style={styles.storyContentContainer}>
            {item.icon && <Text style={styles.storyIcon}>{item.icon}</Text>}
            <Text style={styles.storyTitle}>{item.title}</Text>
            <Text style={styles.storyDescription}>{item.description}</Text>
            <Text style={styles.storyValue}>{item.value}</Text>
          </View>
        )}
      </View>
    );
  };

  // Animation de progression personnalisée
  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Barre de progression animée */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[styles.progressBarFill, {width: progressBarWidth}]}
          />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={storyPages}
        renderItem={renderStoryPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={item => item.id}
      />

      {/* Indicateur de page */}
      <View style={styles.pageIndicator}>
        <Text style={styles.pageIndicatorText}>
          {currentIndex + 1}/{storyPages.length}
        </Text>
      </View>

      {/* Zones tactiles pour naviguer */}
      <TouchableOpacity
        style={[styles.navTouchArea, styles.leftTouchArea]}
        onPress={goToPrevPage}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={[styles.navTouchArea, styles.rightTouchArea]}
        onPress={goToNextPage}
        activeOpacity={1}
      />

      {/* Bouton de fermeture */}
      <TouchableOpacity style={styles.closeButton} onPress={onComplete}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Instructions d'utilisation */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Tap to continue • Swipe for details
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  storyPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 10,
    width: '100%',
    zIndex: 10,
    paddingHorizontal: 15,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  storyContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '90%',
  },
  storyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  storyTitle: {
    fontFamily: Fonts.Monument,
    fontSize: 32,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  storyDescription: {
    fontFamily: Fonts.DMSerif,
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
  storyValue: {
    fontFamily: Fonts.Monument,
    fontSize: 48,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  pageIndicator: {
    position: 'absolute',
    top: 20,
    right: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  pageIndicatorText: {
    color: 'white',
    fontSize: 12,
  },
  navTouchArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
  },
  leftTouchArea: {
    left: 0,
  },
  rightTouchArea: {
    right: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  instructionsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: Fonts.DMSerif,
  },
});

export default WalletStoryScreen;
