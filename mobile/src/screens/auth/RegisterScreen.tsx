import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { LanguagePickerModal } from '../../components/LanguagePickerModal';
import { getLanguageByCode } from '../../constants/languages';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState('en');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLanguage = getLanguageByCode(preferredLang);

  const handleRegister = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        preferredLanguage: preferredLang,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try a different email.');
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? COLORS.dark.text : COLORS.light.text}
            />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              Create Account
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              Join LinguaMate AI to unlock high-speed multilingual translations and context memory.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }]}>
                Full Name
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: isDark ? COLORS.dark.inputBg : COLORS.light.inputBg,
                    borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
                  },
                ]}
              >
                <Ionicons name="person-outline" size={18} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
                <TextInput
                  style={[styles.input, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}
                  placeholder="e.g. Jane Doe"
                  placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    setError(null);
                  }}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }]}>
                Email Address
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: isDark ? COLORS.dark.inputBg : COLORS.light.inputBg,
                    borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
                <TextInput
                  style={[styles.input, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setError(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }]}>
                Password (min 6 chars)
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: isDark ? COLORS.dark.inputBg : COLORS.light.inputBg,
                    borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
                <TextInput
                  style={[styles.input, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}
                  placeholder="Create a password"
                  placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setError(null);
                  }}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Preferred Language */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }]}>
                Primary Language
              </Text>
              <TouchableOpacity
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: isDark ? COLORS.dark.inputBg : COLORS.light.inputBg,
                    borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
                    justifyContent: 'space-between',
                  },
                ]}
                onPress={() => setShowPicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>{selectedLanguage.flag}</Text>
                  <Text style={{ fontSize: 15, color: isDark ? COLORS.dark.text : COLORS.light.text }}>
                    {selectedLanguage.name} ({selectedLanguage.nativeName})
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }]}>
              Already registered?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkText, { color: COLORS.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Language Picker Modal */}
          <LanguagePickerModal
            visible={showPicker}
            onClose={() => setShowPicker(false)}
            onSelect={(l) => setPreferredLang(l.code)}
            selectedCode={preferredLang}
            allowAuto={false}
            title="Select Primary Language"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444415',
    borderWidth: 1,
    borderColor: COLORS.danger,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 13,
  },
  form: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

