import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { STATUS_OPTIONS, PRIORIDADE_OPTIONS } from '../utils/constants';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../themes/colors';
import { typography } from '../themes/typography';
import { spacing, radius, shadows } from '../themes/spacing';

function PickerSelect({ label, options, value, onChange }) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || label;

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, value ? styles.pickerButtonActive : null]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.pickerText, value ? styles.pickerTextActive : null]}>
          {selectedLabel}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  value === option.value && styles.modalOptionActive,
                ]}
                onPress={() => {
                  onChange(option.value);
                  setVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    value === option.value && styles.modalOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function FilterBar({ filters, onFilterChange }) {
  const [searchText, setSearchText] = useState(filters.busca || '');
  const { isDesktop } = useResponsive();

  const handleSearch = () => {
    onFilterChange({ ...filters, busca: searchText });
  };

  const hasActiveFilters = filters.status || filters.prioridade || filters.busca;

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <View style={[styles.searchRow, isDesktop && styles.searchRowDesktop]}>
        <View style={[styles.searchInputWrapper, isDesktop && { maxWidth: 400 }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título ou descrição..."
            placeholderTextColor={colors.gray400}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        <View style={styles.filtersRow}>
          <PickerSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status || ''}
            onChange={(value) => onFilterChange({ ...filters, status: value })}
          />
          <PickerSelect
            label="Prioridade"
            options={PRIORIDADE_OPTIONS}
            value={filters.prioridade || ''}
            onChange={(value) => onFilterChange({ ...filters, prioridade: value })}
          />
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchText('');
                onFilterChange({});
              }}
            >
              <Text style={styles.clearButtonText}>✕ Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containerDesktop: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchRow: {},
  searchRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.small,
    color: colors.textPrimary,
    paddingVertical: spacing.sm + 2,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pickerButtonActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  pickerText: {
    ...typography.small,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  pickerTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  pickerArrow: {
    fontSize: 8,
    color: colors.textTertiary,
  },
  clearButton: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  clearButtonText: {
    ...typography.small,
    color: colors.error,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 340,
    ...shadows.xl,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  modalOptionActive: {
    backgroundColor: colors.primaryBg,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
