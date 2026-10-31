import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useSettings } from '../../context/SettingsContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { getLanguageByCode } from '../../constants/languages';
import { translationApi } from '../../api/translationApi';
import { LanguagePickerModal } from '../../components/LanguagePickerModal';
import { LatencyBadge } from '../../components/LatencyBadge';

interface Turn {
  id: string;
  speaker: 'Person A' | 'Person B';
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
}

export const TwoPersonConversationScreen: React.FC = () => {
  const { theme, speedMode, speechRate, recordLatency, lastLatencyMs } = useSettings();
  const isDark = theme === 'dark';

  // Person A settings (e.g. English)
  const [personALang, setPersonALang] = useState('en');
  const [personAInput, setPersonAInput] = useState('');
  const [isRecordingA, setIsRecordingA] = useState(false);

  // Person B settings (e.g. Tamil)
  const [personBLang, setPersonBLang] = useState('ta');
  const [personBInput, setPersonBInput] = useState('');
  const [isRecordingB, setIsRecordingB] = useState(false);

  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 'demo-1',
      speaker: 'Person A',
      originalText: 'Hello! Welcome to our university campus.',
      translatedText: 'வணக்கம்! எங்களது பல்கலைக்கழக வளாகத்திற்கு நல்வரவு.',
      sourceLang: 'en',
      targetLang: 'ta',
      timestamp: '10:00 AM',
    },
    {
      id: 'demo-2',
      speaker: 'Person B',
      originalText: 'நன்றி! கணினி அறிவியல் துறை எங்கு உள்ளது?',
      translatedText: 'Thank you! Where is the Computer Science department located?',
      sourceLang: 'ta',
      targetLang: 'en',
      timestamp: '10:01 AM',
    },
  ]);

  const [loadingSpeaker, setLoadingSpeaker] = useState<'A' | 'B' | null>(null);
  const [pickerFor, setPickerFor] = useState<'A' | 'B' | null>(null);

  const langObjA = getLanguageByCode(personALang);
  const langObjB = getLanguageByCode(personBLang);

  const handleSpeakerSubmit = async (speaker: 'A' | 'B') => {
    const isA = speaker === 'A';
    const text = (isA ? personAInput : personBInput).trim();
    if (!text) return;

    const sourceLanguage = isA ? personALang : personBLang;
    const targetLanguage = isA ? personBLang : personALang;

    setLoadingSpeaker(speaker);
    const t0 = Date.now();

    try {
      const res = await translationApi.translate({
        text,
        sourceLanguage,
        targetLanguage,
        speedMode,
      });

      const latency = res.latencyMs || Date.now() - t0;
      recordLatency(latency);

      const translated = res.data?.translatedText || '';

      const newTurn: Turn = {
        id: 'turn-' + Date.now(),
        speaker: isA ? 'Person A' : 'Person B',
        originalText: text,
        translatedText: translated,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTurns((prev) => [newTurn, ...prev]);

      if (isA) {
        setPersonAInput('');
      } else {
        setPersonBInput('');
      }

      // Audio playback in target speaker's language
      const targetLocale = (isA ? langObjB : langObjA).speechLocale;
      Speech.speak(translated, { language: targetLocale, rate: speechRate });
    } catch (err: any) {
      alert('Translation Error: ' + err.message);
    } finally {
      setLoadingSpeaker(null);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      {/* Top Controls: Two Person Header */}
      <View style={styles.topControlRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="people" size={20} color={COLORS.secondary} />
          <Text style={[styles.screenTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
            Two-Person Mode
          </Text>
        </View>
        <LatencyBadge latencyMs={lastLatencyMs} speedMode={speedMode} />
      </View>

      {/* Person A Panel (Top) */}
      <View
        style={[
          styles.speakerCard,
          {
            backgroundColor: isDark ? '#1E1B4B44' : '#EEF2FF',
            borderColor: COLORS.primary,
          },
        ]}
      >
        <View style={styles.speakerHeader}>
          <View style={styles.speakerBadge}>
            <Text style={styles.speakerBadgeText}>PERSON A</Text>
          </View>
          <TouchableOpacity
            style={styles.langSelectorBtn}
            onPress={() => setPickerFor('A')}
          >
            <Text>{langObjA.flag}</Text>
            <Text style={[styles.langSelectorText, { color: COLORS.primary }]}>
              {langObjA.name}
            </Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}
          placeholder={`Speak or type in ${langObjA.name}...`}
          placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
          value={personAInput}
          onChangeText={setPersonAInput}
          multiline
        />

        <View style={styles.speakerActionRow}>
          <TouchableOpacity
            style={[
              styles.micQuickBtn,
              isRecordingA && { backgroundColor: COLORS.danger },
            ]}
            onPress={() => {
              if (isRecordingA) {
                setIsRecordingA(false);
              } else {
                setIsRecordingA(true);
                setTimeout(() => {
                  setPersonAInput('Can you help me with the admission procedure?');
                  setIsRecordingA(false);
                }, 1200);
              }
            }}
          >
            <Ionicons name={isRecordingA ? 'stop' : 'mic'} size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendTurnBtn,
              (!personAInput.trim() || loadingSpeaker === 'A') && { opacity: 0.6 },
            ]}
            onPress={() => handleSpeakerSubmit('A')}
            disabled={!personAInput.trim() || loadingSpeaker === 'A'}
          >
            {loadingSpeaker === 'A' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.sendTurnBtnText}>Speak to B</Text>
                <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Shared Live Dialogue History Feed */}
      <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
        {turns.map((turn) => {
          const isFromA = turn.speaker === 'Person A';
          return (
            <View
              key={turn.id}
              style={[
                styles.turnBubble,
                isFromA
                  ? [styles.bubbleA, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]
                  : [styles.bubbleB, { backgroundColor: isDark ? '#064E3B44' : '#ECFDF5' }],
                { borderColor: isFromA ? '#4F46E544' : '#10B98144' },
              ]}
            >
              <View style={styles.bubbleHeader}>
                <Text
                  style={[
                    styles.bubbleSpeaker,
                    { color: isFromA ? COLORS.primary : COLORS.accent },
                  ]}
                >
                  {turn.speaker} ({turn.sourceLang.toUpperCase()} → {turn.targetLang.toUpperCase()})
                </Text>
                <Text style={styles.bubbleTime}>{turn.timestamp}</Text>
              </View>

              <Text style={[styles.originalText, { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted }]}>
                "{turn.originalText}"
              </Text>

              <Text style={[styles.translatedDialogue, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
                {turn.translatedText}
              </Text>

              <TouchableOpacity
                style={styles.replayBtn}
                onPress={() => {
                  const loc = (isFromA ? langObjB : langObjA).speechLocale;
                  Speech.speak(turn.translatedText, { language: loc, rate: speechRate });
                }}
              >
                <Ionicons name="volume-medium-outline" size={16} color={isFromA ? COLORS.primary : COLORS.accent} />
                <Text style={{ fontSize: 11, color: isFromA ? COLORS.primary : COLORS.accent }}>Replay Voice</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Person B Panel (Bottom) */}
      <View
        style={[
          styles.speakerCard,
          {
            backgroundColor: isDark ? '#064E3B22' : '#F0FDF4',
            borderColor: COLORS.accent,
          },
        ]}
      >
        <View style={styles.speakerHeader}>
          <View style={[styles.speakerBadge, { backgroundColor: COLORS.accent }]}>
            <Text style={styles.speakerBadgeText}>PERSON B</Text>
          </View>
          <TouchableOpacity
            style={styles.langSelectorBtn}
            onPress={() => setPickerFor('B')}
          >
            <Text>{langObjB.flag}</Text>
            <Text style={[styles.langSelectorText, { color: COLORS.accent }]}>
              {langObjB.name}
            </Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}
          placeholder={`Speak or type in ${langObjB.name}...`}
          placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
          value={personBInput}
          onChangeText={setPersonBInput}
          multiline
        />

        <View style={styles.speakerActionRow}>
          <TouchableOpacity
            style={[
              styles.micQuickBtn,
              { backgroundColor: COLORS.accent },
              isRecordingB && { backgroundColor: COLORS.danger },
            ]}
            onPress={() => {
              if (isRecordingB) {
                setIsRecordingB(false);
              } else {
                setIsRecordingB(true);
                setTimeout(() => {
                  setPersonBInput('கண்டிப்பாக! நீங்கள் நிர்வாக அலுவலகத்திற்கு செல்ல வேண்டும்.');
                  setIsRecordingB(false);
                }, 1200);
              }
            }}
          >
            <Ionicons name={isRecordingB ? 'stop' : 'mic'} size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendTurnBtn,
              { backgroundColor: COLORS.accent },
              (!personBInput.trim() || loadingSpeaker === 'B') && { opacity: 0.6 },
            ]}
            onPress={() => handleSpeakerSubmit('B')}
            disabled={!personBInput.trim() || loadingSpeaker === 'B'}
          >
            {loadingSpeaker === 'B' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.sendTurnBtnText}>Speak to A</Text>
                <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Picker Modal */}
      <LanguagePickerModal
        visible={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={(l) => {
          if (pickerFor === 'A') setPersonALang(l.code);
          if (pickerFor === 'B') setPersonBLang(l.code);
        }}
        selectedCode={pickerFor === 'A' ? personALang : personBLang}
        title={`Select Language for Person ${pickerFor}`}
        allowAuto={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  speakerCard: {
    padding: SPACING.sm + 4,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    gap: 8,
  },
  speakerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speakerBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  speakerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  langSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langSelectorText: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 44,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  speakerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  micQuickBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendTurnBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 36,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  sendTurnBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  feed: {
    flex: 1,
    marginVertical: SPACING.xs,
  },
  feedContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  turnBubble: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 4,
  },
  bubbleA: {
    borderLeftWidth: 3,
  },
  bubbleB: {
    borderLeftWidth: 3,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bubbleSpeaker: {
    fontSize: 11,
    fontWeight: '800',
  },
  bubbleTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  originalText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  translatedDialogue: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});
