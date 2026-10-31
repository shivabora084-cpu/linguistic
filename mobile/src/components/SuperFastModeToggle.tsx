import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export const SuperFastModeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { speedMode, toggleSpeedMode, theme } = useSettings();
  const isDark = theme === 'dark';
  const isFast = speedMode === 'fast';

  if (compact) {
    return (
      <TouchableOpacity
        onPress={toggleSpeedMode}
        activeOpacity={0.8}
        style={[
          styles.compactPill,
          {
            backgroundColor: isFast ? '#F59E0B22' : isDark ? COLORS.dark.card : COLORS.light.card,
            borderColor: isFast ? COLORS.warning : isDark ? COLORS.dark.border : COLORS.light.border,
          },
        ]}
      >
        <Ionicons
          name={isFast ? 'flash' : 'flash-outline'}
          size={14}
          color={isFast ? COLORS.warning : isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
        />
        <Text
          style={[
            styles.compactText,
            { color: isFast ? COLORS.warning : isDark ? COLORS.dark.text : COLORS.light.text },
          ]}
        >
          {isFast ? 'FAST' : 'BALANCED'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={toggleSpeedMode}
      activeOpacity={0.85}
      style={[
        styles.container,
        {
          backgroundColor: isFast ? '#F59E0B1A' : isDark ? COLORS.dark.card : COLORS.light.card,
          borderColor: isFast ? COLORS.warning : isDark ? COLORS.dark.border : COLORS.light.border,
        },
      ]}
    >
      <View style={styles.leftRow}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: isFast ? COLORS.warning : isDark ? '#1E293B' : '#E2E8F0' },
          ]}
        >
          <Ionicons name="flash" size={16} color={isFast ? '#000000' : '#64748B'} />
        </View>
        <View style={styles.textWrap}>
          <View style={styles.badgeRow}>
            <Text
              style={[
                styles.title,
                { color: isDark ? COLORS.dark.text : COLORS.light.text },
              ]}
            >
              Super Fast Mode
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isFast ? '#10B98122' : '#64748B22' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isFast ? COLORS.accent : isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
                ]}
              >
                {isFast ? 'ACTIVE' : 'OFF'}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
            ]}
          >
            {isFast
              ? 'Ultra-low latency direct Gemini translation'
              : 'Context-rich translation with idioms & explanation'}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.switchTrack,
          { backgroundColor: isFast ? COLORS.warning : isDark ? '#334155' : '#CBD5E1' },
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            isFast ? styles.switchThumbActive : styles.switchThumbInactive,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    marginVertical: SPACING.xs,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  textWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    alignSelf: 'flex-start',
  },
  compactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 4,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
