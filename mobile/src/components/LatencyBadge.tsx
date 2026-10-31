import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

interface LatencyBadgeProps {
  latencyMs?: number | null;
  cached?: boolean;
  speedMode?: 'fast' | 'balanced';
}

export const LatencyBadge: React.FC<LatencyBadgeProps> = ({
  latencyMs,
  cached = false,
  speedMode = 'fast',
}) => {
  if (latencyMs === undefined || latencyMs === null) return null;

  const isUltraFast = cached || latencyMs < 500;
  const isModerate = latencyMs >= 500 && latencyMs < 1500;

  const badgeColor = isUltraFast
    ? COLORS.accent
    : isModerate
    ? COLORS.warning
    : COLORS.primary;

  const badgeBg = isUltraFast
    ? '#10B98120'
    : isModerate
    ? '#F59E0B20'
    : '#4F46E520';

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeColor }]}>
      <Ionicons
        name={cached ? 'flash' : speedMode === 'fast' ? 'speedometer' : 'time-outline'}
        size={12}
        color={badgeColor}
      />
      <Text style={[styles.text, { color: badgeColor }]}>
        {cached ? `⚡ CACHED (${latencyMs}ms)` : `${latencyMs}ms (${speedMode.toUpperCase()})`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

