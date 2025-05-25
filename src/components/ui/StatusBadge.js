import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function StatusBadge({ status, text, size = 'medium' }) {
  const statusColors = {
    active: theme.colors.error,
    warning: theme.colors.warning,
    safe: theme.colors.success,
    info: theme.colors.info,
  };

  return (
    <View style={[
      styles.badge,
      styles[size],
      { backgroundColor: statusColors[status] || theme.colors.info }
    ]}>
      <View style={[styles.indicator, { backgroundColor: '#FFFFFF' }]} />
      <Text style={[styles.text, styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`]]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  small: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  medium: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  large: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.sm,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textSmall: {
    ...theme.typography.labelSmall,
  },
  textMedium: {
    ...theme.typography.labelMedium,
  },
  textLarge: {
    ...theme.typography.labelLarge,
  },
});
