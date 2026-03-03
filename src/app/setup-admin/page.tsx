'use client';

import { useState } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2, CheckCircle, AlertCircle, Lock, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { PERMESSI_DEFAULT } from '@/types/user';

export default function SetupAdminPage() {
  const { user } = useUser();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const db = useFirestore();

  const handleSetup = async () => {
    if (setupKey !== 'nexus2024') {
      setStatus('error');
      setMessage('Master Key non valida. Contatta il dev team.');
      return;
    }

    if (!user) {
      setStatus('error');
      setMessage('Per attivare i privilegi devi prima aver effettuato il login con la tua email. Vai alla pagina di login, entra, e poi torna qui.');
      return;
    }

    setStatus('loading');

    try {
      const batch = writeBatch(db);
      
      // Crea o aggiorna il profilo utente con ruolo super_admin
      batch.set(doc(db, 'users', user.uid), {
        email: user.email,
        ruolo: 'super_admin',
        nomeAzienda: 'AD next lab',
        permessi: PERMESSI_DEFAULT['super_admin'],
        creatoIl: serverTimestamp(),
        ultimo_accesso: serverTimestamp()
      }, { merge: true });

      // Crea il marker critico per le Security Rules
      batch.set(doc(db, 'admins', user.uid), {
        active: true,
        updatedAt: serverTimestamp(),
        email: user.email
      });

      await batch.commit();
      
      setStatus('success');
      setMessage(`Privilegi attivati per ${user.email}. Ora il sistema ti riconosce come Amministratore Master.`);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md shadow-2xl border-indigo-100 bg-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline font-bold text-slate-900">Attivazione Hub Admin</CardTitle>
          <CardDescription className="text-slate-500">Configura i tuoi permessi di Amministratore Master</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!user && status === 'idle' && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-3">
              <p className="text-xs text-amber-700 font-medium">Attenzione: non risulti loggato. Effettua prima l'accesso per poter promuovere il tuo account ad Admin.</p>
              <Link href="/login?entry=admin" className="block">
                <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-100 font-bold">Vai al Login</Button>
              </Link>
            </div>
          )}

          {status === 'idle' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Lock className="w-3 h-3" /> Master Activation Key
                </div>
                <Input 
                  type="password" 
                  value={setupKey} 
                  onChange={(e) => setSetupKey(e.target.value)} 
                  placeholder="Inserisci la chiave di licenza" 
                  className="bg-slate-50 h-12 rounded-xl border-slate-200"
                />
              </div>
              <Button onClick={handleSetup} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-bold shadow-lg rounded-xl transition-all">
                Promuovi a Super Admin
              </Button>
              {user && (
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase">L'account attivo è: {user.email}</p>
              )}
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-sm text-slate-500 font-bold animate-pulse">Sincronizzazione privilegi master...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6 text-center animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-900 font-bold">{message}</p>
                <p className="text-sm text-slate-500 font-medium">Ora puoi accedere a tutte le funzioni dell'Hub.</p>
              </div>
              <Link href="/admin" className="block w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold shadow-xl shadow-indigo-200">Entra nell'Area Admin</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-red-700 font-bold text-sm">{message}</p>
              <Button onClick={() => setStatus('idle')} variant="outline" className="w-full h-12 rounded-xl font-bold">Riprova</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
