'use client';

import { Badge } from "@/components/ui/badge";
import { StatoPost, STATO_POST_LABELS } from "@/types/post";
import { StatoValidazione, STATO_VALIDAZIONE_LABELS } from "@/types/material";

export function PostStatoChip({ stato }: { stato: StatoPost }) {
  // Stili ad alta visibilità per Light Mode
  const styles: Record<string, string> = {
    bozza: 'bg-slate-100 text-slate-600 border-slate-200',
    revisione_interna: 'bg-blue-50 text-blue-700 border-blue-100',
    da_approvare: 'bg-amber-50 text-amber-700 border-amber-100',
    revisione: 'bg-red-50 text-red-700 border-red-100',
    approvato: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    programmato: 'bg-purple-50 text-purple-700 border-purple-100',
    pubblicato: 'bg-indigo-600 text-white border-transparent',
  };

  const label = STATO_POST_LABELS[stato] || stato;

  return (
    <Badge variant="outline" className={`${styles[stato] || styles.bozza} px-2.5 py-0.5 border font-bold text-[10px] uppercase tracking-wider`}>
      {label}
    </Badge>
  );
}

export function MaterialeStatoChip({ stato }: { stato: StatoValidazione }) {
  const styles: Record<string, string> = {
    in_attesa: 'bg-amber-50 text-amber-700 border-amber-100',
    validato: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rifiutato: 'bg-red-50 text-red-700 border-red-100',
  };

  const label = STATO_VALIDAZIONE_LABELS[stato] || stato;

  return (
    <Badge variant="outline" className={`${styles[stato] || styles.in_attesa} px-2.5 py-0.5 border font-bold text-[10px] uppercase tracking-wider`}>
      {label}
    </Badge>
  );
}
