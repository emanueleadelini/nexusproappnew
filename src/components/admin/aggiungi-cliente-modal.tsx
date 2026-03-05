
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth as getFirebaseAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, UserPlus, KeyRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PERMESSI_DEFAULT } from '@/types/user';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AggiungiClienteModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_azienda: '',
    settore: '',
    email_riferimento: '',
    post_totali: 6,
    user_email: '',
    user_password: ''
  });

  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome_azienda || !formData.user_email || !formData.user_password) {
      toast({ variant: 'destructive', title: 'Campi mancanti', description: 'Nome azienda, email login e password sono obbligatori.' });
      return;
    }

    setLoading(true);
    const secondaryAppName = `SecondaryAuth-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getFirebaseAuth(secondaryApp);

    try {
      // Creazione Tenant con moduli attivi di default
      // Attacchiamo il tenant all'agenzia (L'admin loggato)
      const currentUserUid = user?.uid ?? 'super_admin';
      const clientRef = await addDoc(collection(db, 'clienti'), {
        nome_azienda: formData.nome_azienda,
        settore: formData.settore,
        email_riferimento: formData.email_riferimento,
        post_totali: Number(formData.post_totali),
        post_usati: 0,
        include_contratto: true,
        include_visual_identity: true,
        include_offline: true,
        agenzia_id: currentUserUid,
        creato_il: serverTimestamp(),
        aggiornato_il: serverTimestamp()
      });

      const clienteId = clientRef.id;
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.user_email, formData.user_password);
      const newUid = userCredential.user.uid;

      // Creazione Profilo Utente collegato
      await setDoc(doc(db, 'users', newUid), {
        id: newUid,
        email: formData.user_email,
        ruolo: 'cliente_finale',
        cliente_id: clienteId,
        agenzia_id: currentUserUid,
        nomeAzienda: formData.nome_azienda,
        permessi: PERMESSI_DEFAULT['cliente_finale'],
        creatoIl: serverTimestamp()
      });

      toast({ title: 'Cliente creato!', description: `L'azienda ${formData.nome_azienda} è pronta con tutti i moduli attivi.` });
      setFormData({ nome_azienda: '', settore: '', email_riferimento: '', post_totali: 6, user_email: '', user_password: '' });
      onClose();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Errore', description: error.message });
    } finally {
      await deleteApp(secondaryApp);
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-600">
            <Building2 className="w-5 h-5" /> Nuovo Cliente & Account
          </DialogTitle>
          <DialogDescription>Configura l'azienda e il referente per AD next lab.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
              <Building2 className="w-4 h-4" /> Dati Aziendali
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nome">Nome Azienda *</Label>
                <Input id="nome" value={formData.nome_azienda} onChange={(e) => setFormData({ ...formData, nome_azienda: e.target.value })} placeholder="es. AD next lab S.r.l." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settore">Settore</Label>
                <Input id="settore" value={formData.settore} onChange={(e) => setFormData({ ...formData, settore: e.target.value })} placeholder="es. Ristorazione" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post">Post Totali (Piano)</Label>
                <Input id="post" type="number" min="1" value={formData.post_totali} onChange={(e) => setFormData({ ...formData, post_totali: Number(e.target.value) })} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-wider">
              <KeyRound className="w-4 h-4" /> Referente Cliente
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">Email Login *</Label>
                <Input id="user-email" type="email" value={formData.user_email} onChange={(e) => setFormData({ ...formData, user_email: e.target.value })} placeholder="cliente@email.it" required className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-pass">Password Login *</Label>
                <Input id="user-pass" type="password" value={formData.user_password} onChange={(e) => setFormData({ ...formData, user_password: e.target.value })} placeholder="Minimo 6 caratteri" required className="bg-white" />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <><UserPlus className="w-4 h-4 mr-2" /> Crea Cliente</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
