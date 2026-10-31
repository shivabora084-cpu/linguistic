import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { SuperFastModeToggle } from '../../components/SuperFastModeToggle';
import { LatencyBadge } from '../../components/LatencyBadge';
import { translationApi } from '../../api/translationApi';
import { getLanguageByCode } from '../../constants/languages';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, speedMode, targetLanguage, lastLatencyMs, recordLatency } = useSettings();
  const isDark = theme === 'dark';

  const [quickInput, setQuickInput] = useState('');
  const [quickOutput, setQuickOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);

  const targetLangObj = getLanguageByCode(targetLanguage);

  const handleQuickTranslate = async () => {
    if (!quickInput.trim()) return;
    setLoading(true);
    setQuickOutput(null);

    const t0 = Date.now();
    try {
      const res = await translationApi.translate({
        text: quickInput.trim(),
        targetLanguage,
        speedMode,
      });

      const latency = res.latencyMs || Date.now() - t0;
      recordLatency(latency);
      setQuickOutput(res.data?.translatedText || '');
      setCached(Boolean(res.cached));
    } catch (err: any) {
      setQuickOutput('Error: ' + (err.message || 'Translation failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.greeting,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              {user?.fullName || 'LinguaMate User'} 👋
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.avatarBtn,
              { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card },
            ]}
            onPress={() => navigation.navigate('SettingsTab')}
          >
            <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Super Fast Mode Banner */}
        <SuperFastModeToggle />

        {/* Quick Instant Translation Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
              borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="flash" size={16} color={COLORS.warning} />
              <Text
                style={[styles.cardTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}
              >
                Instant Quick Translation
              </Text>
            </View>
            <LatencyBadge latencyMs={lastLatencyMs} cached={cached} speedMode={speedMode} />
          </View>

          <TextInput
            style={[
              styles.quickInput,
              {
                backgroundColor: isDark ? COLORS.dark.inputBg : COLORS.light.inputBg,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
                color: isDark ? COLORS.dark.text : COLORS.light.text,
              },
            ]}
            placeholder={`Type in any language -> ${targetLangObj.name}...`}
            placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
            value={quickInput}
            onChangeText={setQuickInput}
            multiline
            maxLength={300}
          />

          <View style={styles.quickActionRow}>
            <Text
              style={[
                styles.targetLangIndicator,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              Translating to: <Text style={{ fontWeight: '700' }}>{targetLangObj.flag} {targetLangObj.name}</Text>
            </Text>

            <TouchableOpacity
              style={[
                styles.quickTranslateBtn,
                (!quickInput.trim() || loading) && { opacity: 0.6 },
              ]}
              onPress={handleQuickTranslate}
              disabled={!quickInput.trim() || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.quickTranslateBtnText}>Translate</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Output */}
          {quickOutput && (
            <View
              style={[
                styles.quickOutputBox,
                { backgroundColor: isDark ? '#1E293B88' : '#F1F5F9' },
              ]}
            >
              <Text
                style={[
                  styles.quickOutputText,
                  { color: isDark ? COLORS.dark.text : COLORS.light.text },
                ]}
              >
                {quickOutput}
              </Text>
            </View>
          )}
        </View>

        {/* Feature Navigation Grid */}
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? COLORS.dark.text : COLORS.light.text },
          ]}
        >
          Core Capabilities
        </Text>

        <View style={styles.grid}>
          {/* 1. Full Translation Screen */}
          <TouchableOpacity
            style={[
              styles.gridItem,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
            onPress={() => navigation.navigate('TranslateTab')}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIcon, { backgroundColor: '#4F46E520' }]}>
              <Ionicons name="language" size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.gridItemTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              Rich Translation
            </Text>
            <Text
              style={[
                styles.gridItemDesc,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              16 languages, cultural context, alternative idioms & TTS playback.
            </Text>
          </TouchableOpacity>

          {/* 2. Voice Translation */}
          <TouchableOpacity
            style={[
              styles.gridItem,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
            onPress={() => navigation.navigate('VoiceTab')}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="mic" size={24} color={COLORS.accent} />
            </View>
            <Text style={[styles.gridItemTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              Voice Assistant
            </Text>
            <Text
              style={[
                styles.gridItemDesc,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              Turn-based microphone speech recognition and natural pronunciation.
            </Text>
          </TouchableOpacity>

          {/* 3. Two-Person Conversation Mode */}
          <TouchableOpacity
            style={[
              styles.gridItem,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
            onPress={() => navigation.navigate('TwoPersonTab')}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIcon, { backgroundColor: '#06B6D420' }]}>
              <Ionicons name="people" size={24} color={COLORS.secondary} />
            </View>
            <Text style={[styles.gridItemTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              Two-Person Mode
            </Text>
            <Text
              style={[
                styles.gridItemDesc,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              Face-to-face split interface for real-time bilingual dialogue.
            </Text>
          </TouchableOpacity>

          {/* 4. Conversation History */}
          <TouchableOpacity
            style={[
              styles.gridItem,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
            onPress={() => navigation.navigate('HistoryTab')}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="time" size={24} color={COLORS.warning} />
            </View>
            <Text style={[styles.gridItemTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              Persistent Memory
            </Text>
            <Text
              style={[
                styles.gridItemDesc,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              Browse saved conversations, search transcripts, and review turns.
            </Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  greeting: {
    fontSize: 13,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    minHeight: 70,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetLangIndicator: {
    fontSize: 12,
  },
  quickTranslateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  quickTranslateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  quickOutputBox: {
    marginTop: SPACING.xs,
    padding: SPACING.sm + 4,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  quickOutputText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  gridItem: {
    width: '48.5%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    gap: 6,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  gridItemDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
});

