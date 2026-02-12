import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { typography } from '../themes/typography';
import { spacing, radius } from '../themes/spacing';
import { STATUS_OPTIONS, PRIORIDADE_OPTIONS } from '../utils/constants';

export default function FilterBar({ filters, onFilterChange }) {
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const [search, setSearch] = useState(filters.busca || '');

  function handleStatusFilter(value) {
    onFilterChange({ ...filters, status: filters.status === value ? '' : value });
  }

  function handlePrioridadeFilter(value) {
    onFilterChange({ ...filters, prioridade: filters.prioridade === value ? '' : value });
  }

  function handleSearch() {
    onFilterChange({ ...filters, busca: search });
  }

  const chipStyle = (active) => ({
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.full,
    backgroundColor: active ? colors.primaryBg : colors.surfaceElevated,
    borderWidth: 1,
    borderColor: active ? colors.primaryBorder : colors.border,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.15s ease' } : {}),
  });

  const chipText = (active) => ({
    ...typography.caption,
    fontWeight: active ? '600' : '400',
    color: active ? colors.primary : colors.textSecondary,
  });

  return (
    <View style={{
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.sm + 4,
    }}>
      {/* Search */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceElevated,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.sm + 4,
      }}>
        <Text style={{ color: colors.textTertiary, marginRight: spacing.sm }}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          placeholder="Buscar chamados..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={[
            {
              flex: 1,
              paddingVertical: spacing.sm,
              color: colors.textPrimary,
              fontSize: 14,
            },
            Platform.OS === 'web' && { outlineStyle: 'none' },
          ]}
        />
        {search ? (
          <TouchableOpacity onPress={() => { setSearch(''); onFilterChange({ ...filters, busca: '' }); }}>
            <Text style={{ color: colors.textTertiary, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        alignItems: 'center',
      }}>
        <Text style={{ ...typography.caption, color: colors.textTertiary, marginRight: spacing.xs }}>
          Status:
        </Text>
        {STATUS_OPTIONS.filter(o => o.value).map(option => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleStatusFilter(option.value)}
            style={chipStyle(filters.status === option.value)}
          >
            <Text style={chipText(filters.status === option.value)}>{option.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ width: spacing.sm }} />

        <Text style={{ ...typography.caption, color: colors.textTertiary, marginRight: spacing.xs }}>
          Prioridade:
        </Text>
        {PRIORIDADE_OPTIONS.filter(o => o.value).map(option => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handlePrioridadeFilter(option.value)}
            style={chipStyle(filters.prioridade === option.value)}
          >
            <Text style={chipText(filters.prioridade === option.value)}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
