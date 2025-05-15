import React from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';

const Close = ({onClose}: {onClose?: () => void}) => {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/img/bechill-head2.png')}
            style={styles.logo}
          />
        </View>

        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </View>

      {/* Ligne blanche */}
      <View style={styles.underline} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  closeButton: {
    padding: 10,
  },
  closeIcon: {
    fontSize: 32,
    color: 'white',
    marginRight: 10,
  },
  underline: {
    marginTop: 10,
    height: 1,
    backgroundColor: '#8C53E7',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 1,
  },
});

export default Close;
