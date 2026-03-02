
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ClienteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Client Area Error:', error);
  }, [error]);

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-headline font-bold text-white">Problema di connessione</h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Non siamo riusciti a caricare i tuoi contenuti. Verifica la tua connessione o riprova tra un istante.
        </p>
      </div>

      <Button 
        onClick={() => reset()}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        <RefreshCw className="w-4 h-4 mr-2" /> Ricarica Feed
      </Button>
    </div>
  );
}
