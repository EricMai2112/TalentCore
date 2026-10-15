import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AuthFooter: React.FC = () => {
  return (
    <View style={styles.container}>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
});
