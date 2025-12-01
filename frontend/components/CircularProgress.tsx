import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0-100
  remainingMinutes: number;
  totalMinutes: number;
  color?: string;
  backgroundColor?: string;
}

export default function CircularProgress({
  size = 120,
  strokeWidth = 10,
  progress,
  remainingMinutes,
  totalMinutes,
  color = '#4CAF50',
  backgroundColor = 'rgba(255, 255, 255, 0.3)',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    return {
      strokeDashoffset: withTiming(strokeDashoffset, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    };
  });

  const formatTime = (minutes: number): string => {
    if (minutes < 0) minutes = 0;
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (progress >= 100) return '#4CAF50'; // Yeşil - Tamamlandı
    if (progress >= 75) return '#8BC34A'; // Açık yeşil
    if (progress >= 50) return '#FFC107'; // Sarı
    if (progress >= 25) return '#FF9800'; // Turuncu
    return '#FF5722'; // Kırmızı - Başlangıç
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color || getProgressColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={styles.timeText}>{formatTime(remainingMinutes)}</Text>
        <Text style={styles.labelText}>kalan</Text>
        <Text style={styles.percentText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  labelText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
});
