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
    backgroundColor: '#F6F3EF',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#1B1F23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B1C2E',
    fontFamily: Platform.select({
      ios: 'AvenirNext-DemiBold',
      android: 'serif',
    }),
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
  },
  fieldGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  helper: {
    marginTop: 6,
    fontSize: 11,
    color: '#94A3B8',
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#0B1C2E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
  },
  statusText: {
    marginTop: 10,
    color: '#1E5FBF',
    fontSize: 12,
  },
  summaryCard: {
    marginTop: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 14,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 12,
    color: '#9A3412',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: '#64748B',
    fontSize: 14,
  },
});

export default ProfileScreen;
