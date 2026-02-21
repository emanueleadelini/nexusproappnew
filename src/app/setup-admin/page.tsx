'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function SetupAdminPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const auth = useAuth();
  const db = useFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSetup = async () => {
    setStatus('loading');
    const email = 'emanueleadelini@gmail.com';
    const pass = 'Angela25!'; // Password corretta: Angela25!

    try {
      let user = currentUser;

      // Se non siamo loggati con l'account corretto, proviamo a crearlo o loggarlo
      if (!user || user.email !== email) {
        try {
          const res = await createUserWithEmailAndPassword(auth, email, pass);
          user = res.user;
        } catch (authError: any) {
          // Se l'utente esiste già, proviamo a fare il login per ottenere l'UID
          if (authError.code === 'auth/email-already-in-use') {
            try {
              const res = await signInWithEmailAndPassword(auth, email, pass);
              user = res.user;
            } catch (signInError: any) {
              if (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/wrong-password') {
                throw new Error("L'utente esiste già ma la password nel codice non corrisponde a quella su Firebase. Per sicurezza, vai nella console Firebase (Authentication), elimina l'utente " + email + " e riprova questo setup.");
              }
              throw signInError;
            }
          } else {
            throw authError;
          }
        }
      }

      if (user) {
        // Crea o aggiorna il profilo admin in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          ruolo: 'admin',
          nomeAzienda: 'Nexus Agency',
          creatoIl: serverTimestamp()
        });

        setStatus('success');
        setMessage('Configurazione completata! L\'account ' + user.email + ' è ora Amministratore.');
      }
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setMessage(error.message || 'Errore durante la configurazione.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md shadow-xl border-indigo-100">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Configurazione Admin</CardTitle>
          <CardDescription>
            Imposta <strong>emanueleadelini@gmail.com</strong> come amministratore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'idle' && (
            <div className="space-y-4">
              <Button onClick={handleSetup} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-bold">
                Configura Admin Ora
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm text-gray-500 font-medium">Verifica in corso...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <p className="text-green-700 font-medium leading-relaxed">{message}</p>
              <Link href="/login" className="block w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-11">Vai al Login</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-xs text-red-700 font-medium leading-relaxed">{message}</p>
              </div>
              <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">Riprova</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
