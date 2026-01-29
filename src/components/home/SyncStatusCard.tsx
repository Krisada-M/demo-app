import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { tokens } from '../../ui/tokens';

interface SyncStatusCardProps {
  statusLabel: string;
  lastSynced: string;
  onSync: () => void;
  onMock?: () => void;
  isSyncing: boolean;
}

const SyncStatusCard: React.FC<SyncStatusCardProps> = ({
  statusLabel,
  lastSynced,
  onSync,
  onMock,
  isSyncing,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Health Connect</Text>
          <Text style={styles.subtitle}>Status: {statusLabel}</Text>
        </View>
        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
          onPress={onSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.syncButtonText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.lastSyncedText}>Last updated {lastSynced}</Text>
        {onMock && (
          <TouchableOpacity onPress={onMock} style={styles.mockButton}>
            <Text style={styles.mockButtonText}>Inject Mock Data</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginTop: tokens.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...tokens.typography.heading,
    fontSize: 16, // Refining heading size for card title
    color: tokens.colors.textPrimary,
  },
  subtitle: {
    ...tokens.typography.caption,
    fontWeight: '600',
    color: tokens.colors.textMuted,
    marginTop: 2,
  },
  syncButton: {
    backgroundColor: tokens.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    minWidth: 100,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    ...tokens.typography.body,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSyncedText: {
    ...tokens.typography.caption,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  mockButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: tokens.colors.accentSoft,
  },
  mockButtonText: {
    ...tokens.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.accent,
  },
});

export default SyncStatusCard;
