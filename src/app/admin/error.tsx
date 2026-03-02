
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, ShieldAlert } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Area Error:', error);
  }, [error]);

  const isIndexError = error.message?.includes('index');

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
        <ShieldAlert className="w-10 h-10" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-headline font-bold text-white">Ops! Errore Hub Admin</h2>
        <p className="text-slate-400 text-sm">
          {isIndexError 
            ? "Sembra che manchi un indice su Firestore per questa query. Controlla la console del browser per il link di creazione."
            : "Si è verificato un problema durante il caricamento dei dati amministrativi."}
        </p>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/admin'}
          className="border-white/10 text-white"
        >
          Torna alla Dashboard
        </Button>
        <Button 
          onClick={() => reset()}
          className="gradient-primary"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Riprova
        </Button>
      </div>
      
      {error.digest && (
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">ID: {error.digest}</p>
      )}
    </div>
  );
}
