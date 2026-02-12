import React, { useState } from 'react';
import { View, TextInput, Text, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../themes/spacing';
import { typography } from '../../themes/typography';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType,
  autoCapitalize = 'sentences',
  style,
  inputStyle,
  editable = true,
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.borderFocus : colors.border;

  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {label && (
        <Text style={{
          ...typography.captionMedium,
          color: error ? colors.error : colors.textSecondary,
          marginBottom: spacing.xs + 2,
        }}>
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            color: colors.textPrimary,
            borderWidth: 1,
            borderColor,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 4,
            fontSize: 15,
            minHeight: multiline ? numberOfLines * 24 + 24 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          Platform.OS === 'web' && {
            outlineStyle: 'none',
            transition: 'border-color 0.2s ease',
          },
          !editable && { opacity: 0.5 },
          inputStyle,
        ]}
      />
      {(error || helper || maxLength) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
          <Text style={{
            ...typography.caption,
            color: error ? colors.error : colors.textTertiary,
            flex: 1,
          }}>
            {error || helper || ''}
          </Text>
          {maxLength && (
            <Text style={{
              ...typography.caption,
              color: (value?.length || 0) >= maxLength ? colors.error : colors.textTertiary,
            }}>
              {value?.length || 0}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
