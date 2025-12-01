import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimerBadgeProps {
  startTime: Date;
  estimatedMinutes: number;
  isRunning: boolean;
  compact?: boolean;
}

export default function TimerBadge({
  startTime,
  estimatedMinutes,
  isRunning,
  compact = false,
}: TimerBadgeProps) {
  const [remainingMinutes, setRemainingMinutes] = useState(estimatedMinutes);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime.getTime()) / 1000 / 60; // dakika cinsinden
      const remaining = Math.max(0, estimatedMinutes - elapsed);
      setRemainingMinutes(remaining);
    }, 1000); // Her saniye güncelle

    return () => clearInterval(interval);
  }, [isRunning, startTime, estimatedMinutes]);

  const formatTime = (minutes: number): string => {
    if (minutes < 0) minutes = 0;
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    
    if (compact) {
      if (mins > 0) return `${mins}dk`;
      return `${secs}sn`;
    }
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBadgeColor = () => {
    const progress = ((estimatedMinutes - remainingMinutes) / estimatedMinutes) * 100;
    if (progress >= 100) return '#4CAF50'; // Yeşil - Tamamlandı
    if (progress >= 75) return '#8BC34A'; // Açık yeşil
    if (progress >= 50) return '#FFC107'; // Sarı
    if (progress >= 25) return '#FF9800'; // Turuncu
    return '#2196F3'; // Mavi - Başlangıç
  };

  if (!isRunning) {
    return (
      <View style={[styles.badge, styles.idleBadge, compact && styles.compactBadge]}>
        <Ionicons name="time-outline" size={compact ? 10 : 12} color="#fff" />
        <Text style={[styles.badgeText, compact && styles.compactText]}>
          ~{estimatedMinutes}dk
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: getBadgeColor() }, compact && styles.compactBadge]}>
      <Ionicons name="timer-outline" size={compact ? 10 : 12} color="#fff" />
      <Text style={[styles.badgeText, compact && styles.compactText]}>
        {formatTime(remainingMinutes)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  compactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  idleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  compactText: {
    fontSize: 9,
  },
});
