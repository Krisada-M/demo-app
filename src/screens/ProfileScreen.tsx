import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HealthLayer } from '../health/HealthLayer';
import type { UserProfile } from '../health/userProfile';
import { tokens } from '../ui/tokens';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [strideMeters, setStrideMeters] = useState('');
  const [statusText, setStatusText] = useState('');

  const loadProfile = async () => {
    const data = HealthLayer.getUserProfile();
    setProfile(data);
    if (data.weightKg) setWeightKg(String(data.weightKg));
    if (data.heightCm) setHeightCm(String(data.heightCm));
    if (data.strideLengthMeters)
      setStrideMeters(String(data.strideLengthMeters));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const parseNumber = (value: string) => {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleSave = () => {
    const weight = parseNumber(weightKg);
    const height = parseNumber(heightCm);
    const stride = parseNumber(strideMeters);
    HealthLayer.setUserProfile({
      weightKg: weight || undefined,
      heightCm: height || undefined,
      strideLengthMeters: stride || undefined,
    });
    setStatusText('Profile saved. Estimates updated.');
  };

  const handleReset = () => {
    HealthLayer.setUserProfile({
      weightKg: undefined,
      heightCm: undefined,
      strideLengthMeters: undefined,
      sex: undefined,
    });
    setStatusText('Using defaults (60kg, stride from height or 0.75m).');
    loadProfile();
  };

  if (Platform.OS !== 'android') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.messageText}>
            Profile settings are used for fallback estimates only.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Profile & Estimates</Text>
          <Text style={styles.subtitle}>
            Weight affects calories. Stride length affects distance. Set your
            profile to improve estimates.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
              placeholder="70"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
              placeholder="170"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Stride length (m)</Text>
            <TextInput
              value={strideMeters}
              onChangeText={setStrideMeters}
              keyboardType="numeric"
              placeholder="0.7"
              style={styles.input}
            />
            <Text style={styles.helper}>
              Leave blank to estimate from height (0.414 x height).
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleReset}
          >
            <Text style={styles.secondaryButtonText}>Reset to defaults</Text>
          </TouchableOpacity>

          {statusText ? (
            <Text style={styles.statusText}>{statusText}</Text>
          ) : null}
        </View>

        {profile ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Current defaults</Text>
            <Text style={styles.summaryText}>
              Weight: {profile.weightKg} kg
            </Text>
            <Text style={styles.summaryText}>
              Stride:{' '}
              {profile.strideLengthMeters
                ? profile.strideLengthMeters.toFixed(2)
                : '0.75'}{' '}
              m
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  content: {
    padding: tokens.spacing.md,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    ...tokens.shadows.medium,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: tokens.colors.textMuted,
    lineHeight: 20,
  },
  fieldGroup: {
    marginTop: tokens.spacing.lg,
  },
  label: {
    fontSize: 13,
    color: tokens.colors.textPrimary,
    marginBottom: 8,
    fontWeight: '700',
  },
  input: {
    backgroundColor: tokens.colors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    color: tokens.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    color: tokens.colors.textMuted,
  },
  primaryButton: {
    marginTop: tokens.spacing.xl,
    backgroundColor: tokens.colors.textPrimary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    ...tokens.shadows.soft,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    marginTop: tokens.spacing.sm,
    backgroundColor: tokens.colors.background,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  secondaryButtonText: {
    color: tokens.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    marginTop: 16,
    color: tokens.colors.accent,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryCard: {
    marginTop: tokens.spacing.lg,
    backgroundColor: tokens.colors.accentSoft,
    borderRadius: tokens.radius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: tokens.colors.accent + '20',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: tokens.colors.accent,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 14,
    color: tokens.colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: tokens.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;
