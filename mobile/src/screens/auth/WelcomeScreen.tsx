import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        {/* Logo / Badge */}
        <View style={styles.logoWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubbles" size={48} color="#FFFFFF" />
          </View>
          <View style={styles.speedPill}>
            <Ionicons name="flash" size={12} color="#000000" />
            <Text style={styles.speedPillText}>SUPER FAST MODE</Text>
          </View>
        </View>

        {/* Hero Title */}
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
            LinguaMate AI
          </Text>
          <Text style={[styles.subtitle, { color: COLORS.primary }]}>
            Beyond Translation. Understand Every Conversation.
          </Text>
          <Text
            style={[
              styles.description,
              { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
            ]}
          >
            Real-time multi-lingual AI with mixed-language intelligence, cultural context, voice translation, and ultra-low latency Super Fast Mode.
          </Text>
        </View>

        {/* Feature Pills */}
        <View style={styles.featureRow}>
          <View style={[styles.featurePill, { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }]}>
            <Ionicons name="flash" size={14} color={COLORS.warning} />
            <Text style={[styles.featureText, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              Sub-800ms
            </Text>
          </View>
          <View style={[styles.featurePill, { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }]}>
            <Ionicons name="globe-outline" size={14} color={COLORS.secondary} />
            <Text style={[styles.featureText, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              16 Languages
            </Text>
          </View>
          <View style={[styles.featurePill, { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }]}>
            <Ionicons name="mic-outline" size={14} color={COLORS.accent} />
            <Text style={[styles.featureText, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              Two-Person
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryBtnText}>Get Started (Login)</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              { borderColor: isDark ? COLORS.dark.border : COLORS.light.border },
            ]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Register')}
          >
            <Text
              style={[
                styles.secondaryBtnText,
                { color: isDark ? COLORS.dark.text : COLORS.light.text },
              ]}
            >
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: -12,
    gap: 4,
  },
  speedPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  textBlock: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
