import React from 'react';
import Badge from './ui/Badge';
import { PRIORIDADE_LABELS } from '../utils/constants';

const PRIORIDADE_VARIANT = {
  BAIXA: 'neutral',
  MEDIA: 'warning',
  ALTA: 'error',
};

export default function PrioridadeBadge({ prioridade, size = 'md' }) {
  const variant = PRIORIDADE_VARIANT[prioridade] || 'neutral';
  const label = PRIORIDADE_LABELS[prioridade] || prioridade;

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}
