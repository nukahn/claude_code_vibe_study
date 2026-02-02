import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);
  const [scale] = useState(new Animated.Value(1));

  const handlePress = () => {
    setCount((prev) => prev + 1);

    // 애니메이션 효과
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>Counter</Text>
        <Text style={styles.subtitle}>화면을 터치하세요</Text>
      </View>

      {/* 카운터 영역 (터치 가능) */}
      <Pressable style={styles.counterArea} onPress={handlePress}>
        <Animated.View style={[styles.countWrapper, { transform: [{ scale }] }]}>
          <Text style={styles.count}>{count}</Text>
        </Animated.View>
        <Text style={styles.tapHint}>TAP ANYWHERE</Text>
      </Pressable>

      {/* 리셋 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  counterArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countWrapper: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#1a1a1a',
    borderWidth: 4,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  count: {
    fontSize: 80,
    fontWeight: '700',
    color: '#ffffff',
  },
  tapHint: {
    marginTop: 40,
    fontSize: 14,
    color: '#4a4a4a',
    letterSpacing: 4,
  },
  footer: {
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  resetButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    letterSpacing: 2,
  },
});
