'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { query, collection, where, orderBy, doc, updateDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Check, 
  Zap,
  Info,
  Loader2
} from 'lucide-react';
import { FeedInstagramPreview } from '@/components/feed-instagram-preview';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

export default function ClienteFeedPage() {
  const { user, userData, isCliente } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const highlightPostId = searchParams.get('postId');
  
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [noteModifica, setNoteModifica] = useState('');
  const [loading, setLoading] = useState(false);

  const clienteId = userData?.cliente_id;

  const clientDocRef = useMemoFirebase(() => {
    if (!clienteId) return null;
    return doc(db, 'clienti', clienteId);
  }, [db, clienteId]);
  const { data: clientData, isLoading: isClientLoading } = useDoc<any>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    if (!clienteId || !isCliente) return null;
    return query(
      collection(db, 'clienti', clienteId, 'post'),
      where('stato', 'in', ['da_approvare', 'approvato', 'programmato', 'pubblicato']),
      orderBy('creato_il', 'desc')
    );
  }, [db, clienteId, isCliente]);

  const { data: posts, isLoading: isPostsLoading } = useCollection<any>(postsQuery);

  useEffect(() => {
    if (highlightPostId && posts) {
      setTimeout(() => {
        const element = document.getElementById(`post-${highlightPostId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [highlightPostId, posts]);

  const handleApprova = async (post: any) => {
    if (!clienteId || !user) return;
    setLoading(true);
    try {
      const postRef = doc(db, 'clienti', clienteId, 'post', post.id);
      await updateDoc(postRef, {
        stato: 'approvato',
        aggiornato_il: serverTimestamp(),
        storico_stati: arrayUnion({
          stato: 'approvato',
          timestamp: Timestamp.now(),
          autore_uid: user.uid,
          nota: 'Approvato dal cliente nel feed'
        })
      });
      toast({ title: "Post Approvato!", description: "Il team procederà con la programmazione." });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRifiuta = async () => {
    if (!selectedPost || !noteModifica.trim() || !clienteId || !user) return;
    setLoading(true);
    try {
      const postRef = doc(db, 'clienti', clienteId, 'post', selectedPost.id);
      await updateDoc(postRef, {
        stato: 'revisione',
        aggiornato_il: serverTimestamp(),
        storico_stati: arrayUnion({
          stato: 'revisione',
          timestamp: Timestamp.now(),
          autore_uid: user.uid,
          nota: noteModifica
        })
      });
      
      await updateDoc(doc(db, 'clienti', clienteId), {
        richiesta_attenzione: true
      });

      setSelectedPost(null);
      setNoteModifica('');
      toast({ title: "Richiesta inviata", description: "L'agenzia prenderà in carico le modifiche." });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (isClientLoading || isPostsLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-8 pt-8 px-4">
        {[1, 2].map(i => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl bg-slate-100" />
            <Skeleton className="aspect-square w-full rounded-2xl bg-slate-100" />
            <Skeleton className="h-24 w-full rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 relative">
      <div className="max-w-lg mx-auto space-y-10">
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="text-3xl font-headline font-bold text-slate-900">Hub Contenuti</h2>
          <p className="text-slate-500 font-bold">Strategia & Approvazione Real-time</p>
          <div className="pt-4 flex justify-center">
            <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-100 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              <Zap className="w-3 h-3 mr-1.5 fill-current" /> Silenzio Assenso Attivo (24h)
            </Badge>
          </div>
        </div>

        <div className="space-y-12 pb-20">
          {posts?.map((post) => (
            <div 
              key={post.id} 
              id={`post-${post.id}`}
              className={`animate-in fade-in slide-in-from-bottom-6 duration-1000 transition-all ${post.id === highlightPostId ? 'ring-2 ring-indigo-600 rounded-[2rem] p-2 bg-indigo-50' : ''}`}
            >
              <FeedInstagramPreview
                post={post}
                clienteNome={clientData?.nome_azienda || 'La tua Azienda'}
                clienteLogo={clientData?.logo_url}
                showActions={post.stato === 'da_approvare'}
                onApprove={() => handleApprova(post)}
                onReject={() => setSelectedPost(post)}
                onComment={() => setSelectedPost(post)}
              />
            </div>
          ))}

          {(!posts || posts.length === 0) && (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">Tutto approvato!</h3>
              <p className="text-slate-500 font-medium mt-2">Nessun nuovo contenuto in attesa di revisione.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-3xl max-w-sm sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-bold text-slate-900">Feedback Strategico</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Indica chiaramente quali modifiche desideri apportare al post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Le tue note</label>
              <Textarea
                value={noteModifica}
                onChange={(e) => setNoteModifica(e.target.value)}
                placeholder="Es: Cambia il tono della call-to-action..."
                className="bg-slate-50 border-slate-200 text-slate-900 min-h-[120px] rounded-2xl focus:ring-indigo-500/20"
              />
            </div>
            
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Inviando questa richiesta, il post tornerà in stato di <span className="font-bold">Revisione</span>.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="ghost" onClick={() => setSelectedPost(null)} className="text-slate-500 font-bold hover:text-slate-900">
              Annulla
            </Button>
            <Button 
              onClick={handleRifiuta}
              disabled={!noteModifica.trim() || loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-8"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invia Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
