import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { useSettings } from '../../context/SettingsContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { LanguagePickerModal } from '../../components/LanguagePickerModal';
import { getLanguageByCode } from '../../constants/languages';
import { translationApi, TranslationResult } from '../../api/translationApi';
import { SuperFastModeToggle } from '../../components/SuperFastModeToggle';
import { LatencyBadge } from '../../components/LatencyBadge';

export const TranslationScreen: React.FC = () => {
  const {
    theme,
    speedMode,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    speechRate,
    recordLatency,
    lastLatencyMs,
  } = useSettings();

  const isDark = theme === 'dark';

  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modals
  const [pickerType, setPickerType] = useState<'source' | 'target' | null>(null);

  const sourceLangObj = getLanguageByCode(sourceLanguage);
  const targetLangObj = getLanguageByCode(targetLanguage);

  const handleSwap = () => {
    if (sourceLanguage === 'auto') return;
    const oldSrc = sourceLanguage;
    const oldTgt = targetLanguage;
    setSourceLanguage(oldTgt);
    setTargetLanguage(oldSrc);
    if (result?.translatedText) {
      setInputText(result.translatedText);
      setResult(null);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setCopied(false);

    const t0 = Date.now();
    try {
      const res = await translationApi.translate({
        text: inputText.trim(),
        sourceLanguage,
        targetLanguage,
        speedMode,
      });

      const latency = res.latencyMs || Date.now() - t0;
      recordLatency(latency);
      setResult(res.data);
      setCached(Boolean(res.cached));
    } catch (err: any) {
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.translatedText) return;
    await Clipboard.setStringAsync(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!result?.translatedText) return;
    try {
      await Share.share({
        message: `${result.translatedText}\n\n— Translated with LinguaMate AI`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleSpeak = async () => {
    if (!result?.translatedText) return;
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    Speech.speak(result.translatedText, {
      language: targetLangObj.speechLocale,
      rate: speechRate,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Language Selection Bar */}
        <View
          style={[
            styles.langBar,
            {
              backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
              borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
            },
          ]}
        >
          {/* Source Lang */}
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setPickerType('source')}
            activeOpacity={0.7}
          >
            <Text style={styles.langFlag}>{sourceLangObj.flag}</Text>
            <Text
              style={[
                styles.langName,
                { color: isDark ? COLORS.dark.text : COLORS.light.text },
              ]}
              numberOfLines={1}
            >
              {sourceLangObj.name}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
            />
          </TouchableOpacity>

          {/* Swap Button */}
          <TouchableOpacity
            style={[
              styles.swapBtn,
              sourceLanguage === 'auto' && { opacity: 0.4 },
            ]}
            onPress={handleSwap}
            disabled={sourceLanguage === 'auto'}
          >
            <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Target Lang */}
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setPickerType('target')}
            activeOpacity={0.7}
          >
            <Text style={styles.langFlag}>{targetLangObj.flag}</Text>
            <Text
              style={[
                styles.langName,
                { color: isDark ? COLORS.dark.text : COLORS.light.text },
              ]}
              numberOfLines={1}
            >
              {targetLangObj.name}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Speed Mode Control Header */}
        <View style={styles.speedRow}>
          <SuperFastModeToggle compact />
          <LatencyBadge latencyMs={lastLatencyMs} cached={cached} speedMode={speedMode} />
        </View>

        {/* Input Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
              borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
            },
          ]}
        >
          <View style={styles.inputHeader}>
            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              Enter text or mixed language (Tanglish, Hinglish):
            </Text>
            {inputText.length > 0 && (
              <TouchableOpacity onPress={() => setInputText('')}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={[
              styles.textArea,
              { color: isDark ? COLORS.dark.text : COLORS.light.text },
            ]}
            placeholder="Type anything (e.g., 'Sir, admission fees evlo and last date eppo?')..."
            placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />

          <View style={styles.inputFooter}>
            <Text
              style={[
                styles.charCount,
                { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted },
              ]}
            >
              {inputText.length}/1000
            </Text>

            <TouchableOpacity
              style={[
                styles.translateActionBtn,
                (!inputText.trim() || loading) && { opacity: 0.6 },
              ]}
              onPress={handleTranslate}
              disabled={!inputText.trim() || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                  <Text style={styles.translateActionText}>
                    {speedMode === 'fast' ? 'Super Fast Translate' : 'Translate'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Box */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Translation Output Card */}
        {result && (
          <View
            style={[
              styles.outputCard,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? '#4F46E566' : '#C7D2FE',
              },
            ]}
          >
            <View style={styles.outputHeader}>
              <View style={styles.outputTag}>
                <Text style={styles.outputTagText}>{targetLangObj.name.toUpperCase()}</Text>
                {cached && <Text style={styles.cachedTag}>⚡ CACHED</Text>}
              </View>

              <View style={styles.toolActions}>
                <TouchableOpacity style={styles.actionIconBtn} onPress={handleSpeak}>
                  <Ionicons
                    name={isPlaying ? 'pause-circle' : 'volume-high-outline'}
                    size={22}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionIconBtn} onPress={handleCopy}>
                  <Ionicons
                    name={copied ? 'checkmark-circle' : 'copy-outline'}
                    size={20}
                    color={copied ? COLORS.accent : isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionIconBtn} onPress={handleShare}>
                  <Ionicons
                    name="share-social-outline"
                    size={20}
                    color={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.translatedText, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              {result.translatedText}
            </Text>

            {/* Cultural Context / Idiom Insights (Balanced mode or detailed result) */}
            {result.culturalContext && result.culturalContext.length > 0 && result.culturalContext !== 'Super Fast Mode' && (
              <View
                style={[
                  styles.contextBox,
                  { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                ]}
              >
                <View style={styles.contextHeader}>
                  <Ionicons name="bulb-outline" size={16} color={COLORS.warning} />
                  <Text style={[styles.contextTitle, { color: COLORS.warning }]}>
                    Cultural & Contextual Insight
                  </Text>
                </View>
                <Text
                  style={[
                    styles.contextText,
                    { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
                  ]}
                >
                  {result.culturalContext}
                </Text>
                {result.intendedMeaning && (
                  <Text
                    style={[
                      styles.intendedText,
                      { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted },
                    ]}
                  >
                    Intent: {result.intendedMeaning}
                  </Text>
                )}
              </View>
            )}

            {/* Alternative Phrasings */}
            {result.alternativePhrases && result.alternativePhrases.length > 0 && (
              <View style={styles.altBox}>
                <Text
                  style={[
                    styles.altTitle,
                    { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
                  ]}
                >
                  Alternative Expressions:
                </Text>
                <View style={styles.altChips}>
                  {result.alternativePhrases.map((alt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.altChip, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                      onPress={() => {
                        Clipboard.setStringAsync(alt.text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      <Text style={[styles.altChipText, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
                        {alt.text} ({alt.tone})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Language Picker Modals */}
        <LanguagePickerModal
          visible={pickerType === 'source'}
          onClose={() => setPickerType(null)}
          onSelect={(lang) => setSourceLanguage(lang.code)}
          selectedCode={sourceLanguage}
          title="Select Source Language"
          allowAuto={true}
        />

        <LanguagePickerModal
          visible={pickerType === 'target'}
          onClose={() => setPickerType(null)}
          onSelect={(lang) => setTargetLanguage(lang.code)}
          selectedCode={targetLanguage}
          title="Select Target Language"
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
  langBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  langBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  langFlag: {
    fontSize: 20,
  },
  langName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E515',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 110,
    fontSize: 16,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#33415533',
    paddingTop: 8,
  },
  charCount: {
    fontSize: 11,
  },
  translateActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  translateActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444415',
    borderWidth: 1,
    borderColor: COLORS.danger,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 13,
  },
  outputCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    gap: SPACING.sm,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outputTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outputTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  cachedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.accent,
  },
  toolActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBtn: {
    padding: 4,
  },
  translatedText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  contextBox: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    gap: 4,
    marginTop: 4,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contextTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  contextText: {
    fontSize: 12,
    lineHeight: 18,
  },
  intendedText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  altBox: {
    marginTop: 4,
    gap: 6,
  },
  altTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  altChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  altChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  altChipText: {
    fontSize: 12,
  },
});

