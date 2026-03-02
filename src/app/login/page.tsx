'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const ruolo = userDoc.data().ruolo;
        if (['super_admin', 'operatore', 'admin'].includes(ruolo)) {
          router.push('/admin');
        } else {
          router.push('/cliente');
        }
      } else {
        router.push('/cliente');
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Accesso negato',
        description: 'Email o password non validi. Riprova.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6 shadow-xl">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 mb-2">
            AD next lab <span className="text-indigo-600">Pro</span>
          </h1>
          <p className="text-slate-500 font-medium">Accedi al tuo Hub Digitale</p>
        </div>

        <div className="bg-white rounded-3xl p-8 space-y-6 shadow-xl border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@azienda.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 rounded-xl focus:ring-indigo-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" size="sm" className="text-slate-700 font-bold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 rounded-xl pr-10 focus:ring-indigo-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary h-12 rounded-xl font-bold text-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Accedi'
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100">
            <Link href="/" className="text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">
              ← Torna al sito
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          Problemi di accesso? Contatta il supporto tecnico
        </p>
      </div>
    </div>
  );
}
