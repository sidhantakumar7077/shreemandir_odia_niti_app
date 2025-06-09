import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const Index = () => {
  return (
    <View style={styles.container}>
      <Feather name="wifi-off" size={100} color="#999" />
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.message}>
        Please check your connection and try again.
      </Text>

      <View style={styles.button}>
        <Text style={styles.buttonText}>Try Again</Text>
      </View>
    </View>
  )
}

export default Index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#051b65',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
