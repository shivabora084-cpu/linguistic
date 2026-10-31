import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SUPPORTED_LANGUAGES, Language } from '../constants/languages';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (lang: Language) => void;
  selectedCode: string;
  title?: string;
  allowAuto?: boolean;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCode,
  title = 'Select Language',
  allowAuto = true,
}) => {
  const { theme } = useSettings();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((item) => {
    if (!allowAuto && item.code === 'auto') return false;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.nativeName.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView
        style={[
          styles.overlay,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? COLORS.dark.inputBg : COLORS.light.inputBg,
                borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
            />
            <TextInput
              style={[
                styles.searchInput,
                { color: isDark ? COLORS.dark.text : COLORS.light.text },
              ]}
              placeholder="Search by name or code..."
              placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.dark.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Language List */}
          <FlatList
            data={filteredLanguages}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item.code.toLowerCase() === selectedCode.toLowerCase();
              return (
                <TouchableOpacity
                  style={[
                    styles.langItem,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? '#4F46E522'
                          : '#4F46E510'
                        : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <View style={styles.langTextWrap}>
                    <Text
                      style={[
                        styles.langName,
                        {
                          color: isSelected
                            ? COLORS.primary
                            : isDark
                            ? COLORS.dark.text
                            : COLORS.light.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.nativeName,
                        {
                          color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted,
                        },
                      ]}
                    >
                      {item.nativeName} ({item.code.toUpperCase()})
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  flag: {
    fontSize: 22,
    marginRight: SPACING.sm + 4,
  },
  langTextWrap: {
    flex: 1,
  },
  langName: {
    fontSize: 15,
  },
  nativeName: {
    fontSize: 12,
    marginTop: 2,
  },
});

