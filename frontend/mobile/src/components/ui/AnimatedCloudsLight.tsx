import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Easing,
  Image,
} from 'react-native';

interface CloudProps {
  id: number;
  startX: number;
  y: number;
  size: number;
  speed: number;
  direction: 'ltr' | 'rtl';
  zIndex: number;
  opacity?: number;
}

const CloudComponent = ({
  cloud,
  screenWidth,
}: {
  cloud: CloudProps;
  screenWidth: number;
}) => {
  const cloudWidth = 200 * cloud.size;
  const xPosition = useRef(new Animated.Value(cloud.startX)).current;

  useEffect(() => {
    const animateCloud = () => {
      const toValue =
        cloud.direction === 'ltr' ? screenWidth + cloudWidth : -cloudWidth;

      const duration = ((screenWidth + cloudWidth * 2) / cloud.speed) * 60;

      Animated.timing(xPosition, {
        toValue,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          xPosition.setValue(
            cloud.direction === 'ltr' ? -cloudWidth : screenWidth,
          );
          animateCloud();
        }
      });
    };

    animateCloud();
    return () => xPosition.stopAnimation();
  }, [cloud.direction, cloud.speed, cloudWidth, screenWidth, xPosition]);

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
      <Image
        source={require('../../../assets/img/cloud.png')}
        style={[
          styles.cloudImage,
          {
            width: cloudWidth,
            height: cloudWidth * 0.6,
            opacity: cloud.opacity || 0.6,
          },
        ]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const AnimatedCloudsLight = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get('window').height,
  );

  const clouds: CloudProps[] = [
    {
      id: 1,
      startX: -130,
      y: screenHeight * 0.67, // 🔼 un peu plus haut que 0.75
      size: 1.5,
      speed: 0.1,
      direction: 'ltr',
      zIndex: -10,
      opacity: 0.45,
    },
    {
      id: 2,
      startX: screenWidth,
      y: screenHeight * 0.5, // 🔼 beaucoup plus haut
      size: 0.8,
      speed: 0.2,
      direction: 'rtl',
      zIndex: -9,
      opacity: 0.35,
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

export default AnimatedCloudsLight;
