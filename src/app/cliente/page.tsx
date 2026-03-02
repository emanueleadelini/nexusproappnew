
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { query, collection, where, orderBy, doc, updateDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  Zap,
  Loader2,
  Fingerprint,
  Printer,
  FileSignature,
  DownloadCloud
} from 'lucide-react';
import { FeedInstagramPreview } from '@/components/feed-instagram-preview';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Material } from '@/types/material';

export default function ClienteFeedPage() {
  const { user, userData, isCliente } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const highlightPostId = searchParams.get('postId');
  
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [noteModifica, setNoteModifica] = useState('');
  const [loading, setLoading] = useState(false);
  const [materialUrlsMap, setMaterialUrlsMap] = useState<Record<string, string[]>>({});

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

  const materialsQuery = useMemoFirebase(() => {
    if (!clienteId) return null;
    return query(collection(db, 'clienti', clienteId, 'materiali'), orderBy('creato_il', 'desc'));
  }, [db, clienteId]);
  const { data: materials } = useCollection<Material>(materialsQuery);

  // Caricamento asincrono degli asset per ogni post
  useEffect(() => {
    if (!posts || !clienteId) return;

    const fetchAssets = async () => {
      const newUrlsMap: Record<string, string[]> = {};
      for (const post of posts) {
        const assetIds = post.materiali_ids || (post.materiale_id ? [post.materiale_id] : []);
        if (assetIds.length === 0) continue;
        const urls: string[] = [];
        for (const id of assetIds) {
          urls.push(`https://picsum.photos/seed/${id}/800/800`);
        }
        newUrlsMap[post.id] = urls;
      }
      setMaterialUrlsMap(newUrlsMap);
    };
    fetchAssets();
  }, [posts, clienteId]);

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
      await updateDoc(doc(db, 'clienti', clienteId), { richiesta_attenzione: true });
      setSelectedPost(null);
      setNoteModifica('');
      toast({ title: "Richiesta inviata", description: "L'agenzia prenderà in carico le modifiche." });
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
          </div>
        ))}
      </div>
    );
  }

  // Verifica se almeno una sezione brand è attiva
  const hasBrandDocSections = clientData?.include_contratto || clientData?.include_visual_identity || clientData?.include_offline;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 relative pb-24">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-headline font-bold text-slate-900">Il Tuo Hub Pro</h2>
          <p className="text-slate-500 font-bold">Gestione Strategica & Assets</p>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className={`grid w-full ${hasBrandDocSections ? 'grid-cols-2' : 'grid-cols-1'} max-w-md mx-auto bg-white border border-slate-200 h-12 p-1 rounded-2xl mb-8 shadow-sm`}>
            <TabsTrigger value="feed" className="rounded-xl font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Feed & Approvazioni</TabsTrigger>
            {hasBrandDocSections && (
              <TabsTrigger value="brand" className="rounded-xl font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Brand & Documenti</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="feed" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-lg mx-auto space-y-12">
              <div className="pt-4 flex justify-center">
                <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-100 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <Zap className="w-3 h-3 mr-1.5 fill-current" /> Silenzio Assenso Attivo (24h)
                </Badge>
              </div>

              {posts?.map((post) => (
                <div key={post.id} id={`post-${post.id}`} className={post.id === highlightPostId ? 'ring-2 ring-indigo-600 rounded-[2rem] p-2 bg-indigo-50' : ''}>
                  <FeedInstagramPreview
                    post={post}
                    clienteNome={clientData?.nome_azienda || 'La tua Azienda'}
                    clienteLogo={clientData?.logo_url}
                    showActions={post.stato === 'da_approvare'}
                    onApprove={() => handleApprova(post)}
                    onReject={() => setSelectedPost(post)}
                    onComment={() => setSelectedPost(post)}
                    materialUrls={materialUrlsMap[post.id] || []}
                  />
                </div>
              ))}

              {(!posts || posts.length === 0) && (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-50 rounded-full flex items-center justify-center"><Check className="w-10 h-10 text-emerald-500" /></div>
                  <h3 className="text-slate-900 font-bold text-lg">Tutto approvato!</h3>
                </div>
              )}
            </div>
          </TabsContent>

          {hasBrandDocSections && (
            <TabsContent value="brand" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sezione Contratto Cliente */}
                {clientData?.include_contratto && (
                  <Card className="glass-card rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-slate-900 p-6">
                      <CardTitle className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <FileSignature className="w-4 h-4" /> Il Tuo Contratto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {materials?.filter(m => m.destinazione === 'contratto').map(m => (
                        <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl shadow-sm"><FileSignature className="w-5 h-5 text-slate-900" /></div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{m.nome_file}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Caricato il {m.creato_il?.toDate().toLocaleDateString('it-IT')}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="icon" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900">
                            <DownloadCloud className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {materials?.filter(m => m.destinazione === 'contratto').length === 0 && (
                        <p className="text-center py-8 text-xs font-bold text-slate-400 uppercase italic">Documento in fase di caricamento...</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Visual Identity / Loghi */}
                {clientData?.include_visual_identity && (
                  <Card className="glass-card rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-indigo-50 p-6">
                      <CardTitle className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Fingerprint className="w-4 h-4" /> Visual Identity (Loghi)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {materials?.filter(m => m.destinazione === 'visual_identity').map(m => (
                        <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl shadow-sm"><Fingerprint className="w-5 h-5 text-indigo-600" /></div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{m.nome_file}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{m.creato_il?.toDate().toLocaleDateString('it-IT')}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="icon" className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                            <DownloadCloud className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sezione Offline Graphics */}
              {clientData?.include_offline && (
                <Card className="glass-card rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                  <CardHeader className="bg-emerald-50 p-8 border-b border-emerald-100">
                    <CardTitle className="text-emerald-900 font-headline font-bold flex items-center gap-3">
                      <Printer className="w-6 h-6 text-emerald-600" /> Grafiche & Materiali Offline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {['brochure', 'volantino', 'bigliettini', 'gadget', '6x3', '3x6', 'altro'].map(type => {
                        const typeMaterials = materials?.filter(m => m.destinazione === 'offline' && m.tipo_offline === type);
                        return (
                          <div key={type} className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">{type}</h5>
                            <div className="space-y-3">
                              {typeMaterials?.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-900 truncate">{m.nome_file}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{m.creato_il?.toDate().toLocaleDateString('it-IT')}</p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-100 rounded-lg">
                                    <DownloadCloud className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              {(!typeMaterials || typeMaterials.length === 0) && (
                                <p className="text-[9px] font-bold text-slate-300 uppercase italic">Nessun asset {type}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-3xl max-w-sm sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-bold text-slate-900">Feedback Strategico</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">Indica le modifiche desiderate per questo post.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Le tue note</label>
              <Textarea value={noteModifica} onChange={(e) => setNoteModifica(e.target.value)} placeholder="Es: Cambia il tono della call-to-action..." className="bg-slate-50 border-slate-200 min-h-[120px] rounded-2xl" />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setSelectedPost(null)} className="text-slate-500 font-bold">Annulla</Button>
            <Button onClick={handleRifiuta} disabled={!noteModifica.trim() || loading} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-8">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invia Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
