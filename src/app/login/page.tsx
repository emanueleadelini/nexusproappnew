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
        if (ruolo === 'super_admin' || ruolo === 'operatore' || ruolo === 'admin') {
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-white mb-2">
            AD next lab <span className="text-indigo-500">Pro</span>
          </h1>
          <p className="text-slate-400">Accedi al tuo Hub Digitale</p>
        </div>

        <div className="glass-card rounded-3xl p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@azienda.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" size="sm" className="text-slate-300 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl pr-10 focus:border-indigo-500 focus:ring-indigo-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary h-12 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Accedi'
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-white/5">
            <Link href="/" className="text-slate-500 hover:text-indigo-400 text-sm font-medium transition-colors">
              ← Torna al sito
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          Problemi di accesso? Contatta il supporto tecnico
        </p>
      </div>
    </div>
  );
}