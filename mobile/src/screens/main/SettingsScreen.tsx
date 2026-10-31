import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { SuperFastModeToggle } from '../../components/SuperFastModeToggle';
import { API_BASE_URL } from '../../api/client';
import { LanguagePickerModal } from '../../components/LanguagePickerModal';
import { getLanguageByCode } from '../../constants/languages';

export const SettingsScreen: React.FC<{ navigation: any }> = () => {
  const { user, logout } = useAuth();
  const {
    theme,
    setTheme,
    speechRate,
    setSpeechRate,
    targetLanguage,
    setTargetLanguage,
    speedMode,
    lastLatencyMs,
  } = useSettings();

  const isDark = theme === 'dark';
  const [pickerVisible, setPickerVisible] = useState(false);
  const targetLangObj = getLanguageByCode(targetLanguage);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of LinguaMate AI?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
            Preferences & Settings
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
            ]}
          >
            Configure Super Fast Mode, speech synthesis, and account
          </Text>
        </View>

        {/* 1. Super Fast Mode Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
            Engine Speed & AI Pipeline
          </Text>
          <SuperFastModeToggle />

          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Ionicons name="speedometer-outline" size={18} color={COLORS.warning} />
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
                ]}
              >
                Current Speed Mode:
              </Text>
              <Text style={[styles.infoValue, { color: COLORS.warning }]}>
                {speedMode.toUpperCase()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={COLORS.accent} />
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
                ]}
              >
                Last Measured Latency:
              </Text>
              <Text style={[styles.infoValue, { color: COLORS.accent }]}>
                {lastLatencyMs ? `${lastLatencyMs} ms` : 'Ready'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="hardware-chip-outline" size={18} color={COLORS.secondary} />
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
                ]}
              >
                AI Model Engine:
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
                Google Gemini 2.5/3.5 Flash
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Translation & Speech Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
            Language & Speech
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
          >
            {/* Preferred Target Language */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setPickerVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
                <View>
                  <Text style={[styles.settingItemTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
                    Default Target Language
                  </Text>
                  <Text style={[styles.settingItemSubtitle, { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }]}>
                    {targetLangObj.flag} {targetLangObj.name} ({targetLangObj.code.toUpperCase()})
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
            </TouchableOpacity>

            {/* Speech Rate Controls */}
            <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="volume-medium-outline" size={20} color={COLORS.accent} />
                <View>
                  <Text style={[styles.settingItemTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
                    TTS Speech Rate
                  </Text>
                  <Text style={[styles.settingItemSubtitle, { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }]}>
                    Playback speed for spoken translations
                  </Text>
                </View>
              </View>

              <View style={styles.rateButtons}>
                {[0.75, 1.0, 1.25].map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.rateBtn,
                      speechRate === rate && { backgroundColor: COLORS.primary },
                    ]}
                    onPress={() => setSpeechRate(rate)}
                  >
                    <Text
                      style={[
                        styles.rateBtnText,
                        { color: speechRate === rate ? '#FFFFFF' : isDark ? COLORS.dark.text : COLORS.light.text },
                      ]}
                    >
                      {rate}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* 3. Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
            Appearance
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => setTheme(isDark ? 'light' : 'dark')}
            >
              <View style={styles.settingItemLeft}>
                <Ionicons
                  name={isDark ? 'moon-outline' : 'sunny-outline'}
                  size={20}
                  color={COLORS.warning}
                />
                <View>
                  <Text style={[styles.settingItemTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
                    Color Theme
                  </Text>
                  <Text style={[styles.settingItemSubtitle, { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }]}>
                    {isDark ? 'Dark Mode (Midnight Blue)' : 'Light Mode (Clean Slate)'}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={isDark ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Account & Backend */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
            Account & Infrastructure
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
          >
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                <View>
                  <Text style={[styles.settingItemTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
                    {user?.fullName || 'Demo User'}
                  </Text>
                  <Text style={[styles.settingItemSubtitle, { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }]}>
                    {user?.email || 'demo@linguamate.ai'} • Role: {user?.role || 'user'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="server-outline" size={20} color={COLORS.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingItemTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
                    Backend Endpoint
                  </Text>
                  <Text
                    style={[styles.settingItemSubtitle, { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }]}
                    numberOfLines={1}
                  >
                    {API_BASE_URL}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutBtnText}>Sign Out of LinguaMate AI</Text>
        </TouchableOpacity>

        {/* Language Picker Modal */}
        <LanguagePickerModal
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onSelect={(lang) => setTargetLanguage(lang.code)}
          selectedCode={targetLanguage}
          title="Select Default Target Language"
          allowAuto={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  header: {
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#33415522',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rateButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  rateBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: '#33415533',
  },
  rateBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    gap: 8,
    marginTop: SPACING.sm,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
