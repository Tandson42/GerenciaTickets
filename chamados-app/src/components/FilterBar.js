import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { STATUS_OPTIONS, PRIORIDADE_OPTIONS } from '../utils/constants';

function PickerSelect({ label, options, value, onChange }) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || label;

  return (
    <>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setVisible(true)}>
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

  const handleSearch = () => {
    onFilterChange({ ...filters, busca: searchText });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título ou descrição..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
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
        {(filters.status || filters.prioridade || filters.busca) && (
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  filtersRow: {
    flexDirection: 'row',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  pickerText: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 4,
  },
  pickerTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  pickerArrow: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  clearButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalOptionActive: {
    backgroundColor: '#EEF2FF',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#4B5563',
  },
  modalOptionTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
});
