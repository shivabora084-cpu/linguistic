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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useSettings } from '../../context/SettingsContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { getLanguageByCode } from '../../constants/languages';
import { translationApi } from '../../api/translationApi';
import { SuperFastModeToggle } from '../../components/SuperFastModeToggle';
import { LatencyBadge } from '../../components/LatencyBadge';
import { LanguagePickerModal } from '../../components/LanguagePickerModal';

export const VoiceTranslationScreen: React.FC = () => {
  const {
    theme,
    speedMode,
    targetLanguage,
    setTargetLanguage,
    speechRate,
    setSpeechRate,
    lastLatencyMs,
    recordLatency,
  } = useSettings();

  const isDark = theme === 'dark';

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const targetLangObj = getLanguageByCode(targetLanguage);

  // Pre-configured voice samples for demonstration
  const sampleVoicePrompts = [
    'வணக்கம், இன்று உங்கள் நாள் எப்படி இருக்கிறது?',
    'Good morning, I would like to know the ticket prices.',
    'कल सुबह दस बजे हम स्टेशन पर मिल सकते हैं क्या?',
    'Sir, admission fees evlo and last date eppo?',
  ];

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulate real-time audio turn capture with realistic voice text
      setTimeout(() => {
        const randomSample = sampleVoicePrompts[Math.floor(Math.random() * sampleVoicePrompts.length)];
        setTranscript(randomSample);
        setIsRecording(false);
      }, 1800);
    }
  };

  const handleTranslateVoice = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setTranslatedText(null);

    const t0 = Date.now();
    try {
      const res = await translationApi.translate({
        text: transcript.trim(),
        targetLanguage,
        speedMode,
      });

      const latency = res.latencyMs || Date.now() - t0;
      recordLatency(latency);
      setTranslatedText(res.data?.translatedText || '');
      setCached(Boolean(res.cached));

      // Auto play speech in Super Fast Mode if enabled
      if (res.data?.translatedText) {
        Speech.speak(res.data.translatedText, {
          language: targetLangObj.speechLocale,
          rate: speechRate,
        });
      }
    } catch (err: any) {
      setTranslatedText('Translation Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (!translatedText) return;
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    Speech.speak(translatedText, {
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
        {/* Top Control Bar */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[
              styles.langPill,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={{ fontSize: 16 }}>{targetLangObj.flag}</Text>
            <Text
              style={[
                styles.langPillText,
                { color: isDark ? COLORS.dark.text : COLORS.light.text },
              ]}
            >
              Translate to: {targetLangObj.name}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
            />
          </TouchableOpacity>

          <LatencyBadge latencyMs={lastLatencyMs} cached={cached} speedMode={speedMode} />
        </View>

        <SuperFastModeToggle compact />

        {/* Big Microphone Card */}
        <View
          style={[
            styles.micCard,
            {
              backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
              borderColor: isRecording
                ? COLORS.danger
                : isDark
                ? COLORS.dark.border
                : COLORS.light.border,
            },
          ]}
        >
          <Text
            style={[
              styles.micStatus,
              {
                color: isRecording
                  ? COLORS.danger
                  : isDark
                  ? COLORS.dark.textSecondary
                  : COLORS.light.textSecondary,
              },
            ]}
          >
            {isRecording
              ? '🎙️ Listening... Speak naturally in any language'
              : 'Tap the microphone to speak'}
          </Text>

          <TouchableOpacity
            style={[
              styles.micButton,
              { backgroundColor: isRecording ? COLORS.danger : COLORS.primary },
            ]}
            onPress={handleToggleRecord}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={36}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.micHint,
              { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted },
            ]}
          >
            Supports mixed languages (Tanglish, Hinglish) & auto-detection
          </Text>
        </View>

        {/* Editable Transcript Card */}
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
            <Text
              style={[
                styles.cardTitle,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              Spoken Transcript (Editable):
            </Text>
            {transcript.length > 0 && (
              <TouchableOpacity onPress={() => setTranscript('')}>
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
              styles.transcriptInput,
              { color: isDark ? COLORS.dark.text : COLORS.light.text },
            ]}
            placeholder="Your voice transcription will appear here. You can also edit it before translating..."
            placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
            value={transcript}
            onChangeText={setTranscript}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.translateBtn,
              (!transcript.trim() || loading) && { opacity: 0.6 },
            ]}
            onPress={handleTranslateVoice}
            disabled={!transcript.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                <Text style={styles.translateBtnText}>
                  {speedMode === 'fast' ? 'Super Fast Translate' : 'Translate'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Voice Translation Result Card */}
        {translatedText && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                borderColor: COLORS.primary,
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultHeaderTag}>
                {targetLangObj.name.toUpperCase()} TRANSLATION
              </Text>
              <TouchableOpacity style={styles.ttsBtn} onPress={handlePlayAudio}>
                <Ionicons
                  name={isPlaying ? 'pause-circle' : 'volume-high'}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.ttsBtnText}>{isPlaying ? 'Stop' : 'Listen'}</Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.resultText,
                { color: isDark ? COLORS.dark.text : COLORS.light.text },
              ]}
            >
              {translatedText}
            </Text>

            {/* Speech Rate Controls */}
            <View style={styles.speedControlRow}>
              <Text
                style={[
                  styles.speedLabel,
                  { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted },
                ]}
              >
                Speed:
              </Text>
              {[0.75, 1.0, 1.25].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.speedPill,
                    speechRate === rate && { backgroundColor: COLORS.primary },
                  ]}
                  onPress={() => setSpeechRate(rate)}
                >
                  <Text
                    style={[
                      styles.speedPillText,
                      { color: speechRate === rate ? '#FFFFFF' : isDark ? COLORS.dark.text : COLORS.light.text },
                    ]}
                  >
                    {rate}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <LanguagePickerModal
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onSelect={(lang) => setTargetLanguage(lang.code)}
          selectedCode={targetLanguage}
          title="Select Voice Target Language"
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  micCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    gap: SPACING.md,
  },
  micStatus: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  micHint: {
    fontSize: 11,
    textAlign: 'center',
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
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  transcriptInput: {
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 6,
    marginTop: 4,
  },
  translateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  resultCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    gap: SPACING.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultHeaderTag: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  ttsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ttsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  speedControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  speedLabel: {
    fontSize: 12,
  },
  speedPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: '#33415533',
  },
  speedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
