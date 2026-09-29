import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const JobSkeleton: React.FC = () => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  return (
    <View style={styles.container}>
      {[1, 2, 3].map((key) => (
        <Animated.View key={key} style={[styles.card, { opacity: animatedValue }]}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.titleLine} />
              <View style={styles.subtitleLine} />
            </View>
            <View style={styles.logoBox} />
          </View>

          <View style={styles.salaryBox} />

          <View style={styles.metaGrid}>
            <View style={styles.metaItem} />
            <View style={styles.metaItem} />
            <View style={styles.metaItem} />
            <View style={styles.metaItem} />
          </View>

          <View style={styles.footerRow}>
            <View style={styles.saveBtn} />
            <View style={styles.applyBtn} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  titleLine: {
    height: 18,
    backgroundColor: '#cbd5e1',
    borderRadius: 6,
    width: '85%',
    marginBottom: 8,
  },
  subtitleLine: {
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    width: '40%',
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  salaryBox: {
    height: 28,
    width: '65%',
    backgroundColor: '#cbd5e1',
    borderRadius: 8,
    marginBottom: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  metaItem: {
    height: 28,
    width: '48.5%',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  saveBtn: {
    height: 34,
    width: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  applyBtn: {
    height: 36,
    width: 120,
    backgroundColor: '#cbd5e1',
    borderRadius: 10,
  },
});
