// Components/Header.tsx
import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/img/bechill-head2.png')}
          style={styles.logo}
        />
        <Text style={styles.logoText}>beChill</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginLeft: 10,
  },
});

export default Header;
