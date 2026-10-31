import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = () => {
    if (!email.trim() || !email.includes('@')) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? COLORS.dark.text : COLORS.light.text}
          />
        </TouchableOpacity>

        <Text style={[styles.title, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
          Reset Password
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
          ]}
        >
          Enter your email address and we'll send you instructions to reset your account password.
        </Text>

        {submitted ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={40} color={COLORS.accent} />
            <Text style={[styles.successTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              Check Your Inbox
            </Text>
            <Text
              style={[
                styles.successDesc,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              We sent password recovery instructions to {email}. Follow the link provided to set a new password.
            </Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.doneBtnText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: isDark ? COLORS.dark.inputBg : COLORS.light.inputBg,
                  borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
              />
              <TextInput
                style={[styles.input, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}
                placeholder="Enter your registered email"
                placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleReset}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  backBtn: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: SPACING.xl,
  },
  form: {
    gap: SPACING.md,
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
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: RADIUS.lg,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    padding: SPACING.lg,
    gap: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  successDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  doneBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
