import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../../themes/colors';
import { typography } from '../../themes/typography';
import { spacing, radius } from '../../themes/spacing';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  maxLength,
  minLength,
  multiline = false,
  numberOfLines = 1,
  keyboardType,
  secureTextEntry = false,
  autoCapitalize,
  autoCorrect,
  required = false,
  style,
  inputStyle,
  onSubmitEditing,
  returnKeyType,
}) {
  const [focused, setFocused] = useState(false);
  const showCounter = maxLength || minLength;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          multiline && { minHeight: numberOfLines * 24 + 24, textAlignVertical: 'top' },
          focused && styles.inputFocused,
          error && styles.inputError,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
      />

      <View style={styles.bottomRow}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : helper ? (
          <Text style={styles.helper}>{helper}</Text>
        ) : (
          <View />
        )}
        {showCounter && (
          <Text style={[styles.counter, error && { color: colors.error }]}>
            {value?.length || 0}
            {maxLength ? `/${maxLength}` : ''}
            {minLength ? ` (mín. ${minLength})` : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.smallMedium,
    color: colors.gray700,
    marginBottom: spacing.xs + 2,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.gray50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  helper: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
  },
  counter: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'right',
  },
});
