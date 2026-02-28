'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { PERMESSI_DEFAULT } from '@/types/user';

export default function SetupAdminPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const auth = useAuth();
  const db = useFirestore();

  const handleSetup = async () => {
    // NEXUS PRO: Protezione Master Key
    if (setupKey !== 'nexus2024') {
      setStatus('error');
      setMessage('Master Key non valida. Contatta il dev team.');
      return;
    }

    setStatus('loading');
    const email = 'emanueleadelini@gmail.com';
    const pass = 'Angela25!';

    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass).catch(async (e) => {
        if (e.code === 'auth/email-already-in-use') {
          return await signInWithEmailAndPassword(auth, email, pass);
        }
        throw e;
      });

      if (res.user) {
        await setDoc(doc(db, 'users', res.user.uid), {
          email: res.user.email,
          ruolo: 'super_admin',
          nomeAzienda: 'AD next lab',
          permessi: PERMESSI_DEFAULT['super_admin'],
          creatoIl: serverTimestamp()
        });
        setStatus('success');
        setMessage('Nexus Pro inizializzato con successo.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-body">
      <Card className="w-full max-w-md shadow-2xl border-indigo-100">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Inizializzazione SaaS</CardTitle>
          <CardDescription>Configura il primo account Super Admin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <Lock className="w-3 h-3" /> Master Activation Key
                </div>
                <Input 
                  type="password" 
                  value={setupKey} 
                  onChange={(e) => setSetupKey(e.target.value)} 
                  placeholder="Inserisci chiave di licenza" 
                  className="bg-gray-50"
                />
              </div>
              <Button onClick={handleSetup} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-bold shadow-lg">
                Attiva Nexus Pro
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm text-gray-500">Configurazione in corso...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-green-700 font-medium">{message}</p>
              <Link href="/login" className="block w-full">
                <Button className="w-full bg-indigo-600">Vai al Login</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-red-700 text-sm">{message}</p>
              <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">Riprova</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
