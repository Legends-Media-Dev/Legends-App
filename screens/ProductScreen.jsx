import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const ProductScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Set the background color to white
  },
  title: {
    fontSize: 25,
    fontFamily: 'Futura-Medium', // Use your Futura-Medium font
    color: '#000', // Text color black
    textAlign: 'center',
  },
});

export default ProductScreen;
