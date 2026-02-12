import React from 'react';
import Badge from './ui/Badge';
import { useTheme } from '../contexts/ThemeContext';
import { STATUS_LABELS } from '../utils/constants';

const STATUS_VARIANT = {
  ABERTO: 'info',
  EM_ANDAMENTO: 'warning',
  RESOLVIDO: 'success',
};

export default function StatusBadge({ status, size = 'md' }) {
  const variant = STATUS_VARIANT[status] || 'neutral';
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge variant={variant} size={size} showDot>
      {label}
    </Badge>
  );
}
