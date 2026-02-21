
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Recupera il profilo utente per verificare il ruolo
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.ruolo;

        if (role === 'admin') {
          toast({ title: "Bentornato Admin", description: "Accesso all'area gestionale effettuato." });
          router.push('/admin');
        } else if (role === 'cliente') {
          toast({ title: "Area Cliente", description: `Benvenuto, ${userData.nomeAzienda || 'Cliente'}` });
          router.push('/cliente');
        } else {
          throw new Error('Ruolo non autorizzato.');
        }
      } else {
        // Se il documento non esiste, l'utente non è censito nel database gestionale
        await auth.signOut();
        throw new Error('Utente non censito nel sistema. Contatta l\'assistenza.');
      }
    } catch (error: any) {
      let message = 'Errore imprevisto. Riprova più tardi.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Credenziali non valide. Controlla email e password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Troppi tentativi falliti. Riprova tra qualche minuto.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast({ 
        variant: 'destructive', 
        title: 'Accesso negato', 
        description: message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md shadow-2xl border-indigo-100 rounded-xl overflow-hidden">
        <CardHeader className="space-y-1 bg-white border-b border-gray-100 p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-center text-gray-900">Nexus Agency</CardTitle>
          <CardDescription className="text-center text-gray-500 font-medium">Area Riservata Gestionale</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="nome@agenzia.it"
                className="rounded-lg border-gray-200 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" size="sm" className="text-sm font-semibold text-gray-700">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="rounded-lg border-gray-200 focus:ring-indigo-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-bold transition-all shadow-lg shadow-indigo-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Accesso in corso...</>
              ) : (
                'Entra nell\'area'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
