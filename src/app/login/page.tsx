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
import { Loader2 } from 'lucide-react';

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
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const role = userDoc.data().ruolo;
        if (role === 'admin') router.push('/admin');
        else if (role === 'cliente') router.push('/cliente');
        else throw new Error('Ruolo non autorizzato');
      } else {
        throw new Error('Profilo utente non trovato');
      }
    } catch (error: any) {
      let message = 'Errore imprevisto. Riprova più tardi.';
      switch (error.code) {
        case 'auth/user-not-found': message = 'Nessun account associato a questa email.'; break;
        case 'auth/wrong-password': message = 'Password errata. Riprova.'; break;
        case 'auth/invalid-credential': message = 'Credenziali non valide. Controlla email e password.'; break;
        case 'auth/invalid-email': message = 'Il formato dell\'email non è valido.'; break;
        case 'auth/user-disabled': message = 'Questo account è stato disabilitato. Contatta l\'agenzia.'; break;
        case 'auth/too-many-requests': message = 'Troppi tentativi. Riprova tra qualche minuto.'; break;
        case 'auth/network-request-failed': message = 'Errore di rete. Controlla la connessione.'; break;
      }
      toast({ variant: 'destructive', title: 'Errore Login', description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md shadow-xl border-gray-200/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-headline text-center">Nexus Agency</CardTitle>
          <CardDescription className="text-center">Accedi alla tua area riservata</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="latua@email.it" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Accedi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
