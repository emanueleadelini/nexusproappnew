'use client';

import { Badge } from "@/components/ui/badge";
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS } from "@/types/post";
import { StatoValidazione, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS } from "@/types/material";

export function PostStatoChip({ stato }: { stato: StatoPost }) {
  const color = STATO_POST_COLORS[stato] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  const label = STATO_POST_LABELS[stato] || stato;

  return (
    <Badge variant="outline" className={`${color.bg} ${color.text} capitalize px-3 py-1 border-none font-bold text-[10px]`}>
      {label}
    </Badge>
  );
}

export function MaterialeStatoChip({ stato }: { stato: StatoValidazione }) {
  const color = STATO_VALIDAZIONE_COLORS[stato] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  const label = STATO_VALIDAZIONE_LABELS[stato] || stato;

  return (
    <Badge variant="outline" className={`${color.bg} ${color.text} capitalize px-3 py-1 border-none font-bold text-[10px]`}>
      {label}
    </Badge>
  );
}
