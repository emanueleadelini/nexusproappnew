'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { query, collection, where, orderBy, doc, getDoc, updateDoc, serverTimestamp, arrayUnion, Timestamp, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  Zap,
  Loader2,
  Fingerprint,
  Printer,
  FileSignature,
  DownloadCloud,
  AlertCircle,
  Briefcase,
  Calendar,
  LayoutGrid,
  History,
  MessageSquare,
  Clock,
  Timer,
  ArrowUpRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { FeedInstagramPreview } from '@/components/feed-instagram-preview';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Material } from '@/types/material';
import { CalendarioVisuale } from '@/components/admin/calendario-visuale';
import { Post, STATO_POST_LABELS, STATO_POST_COLORS } from '@/types/post';
import { CommentiSidebar } from '@/components/commenti-sidebar';

export default function ClienteFeedPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const highlightPostId = searchParams.get('postId');

  const [userData, setUserData] = useState<any>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsUserDataLoading(false); return; }
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setUserData(snap.data());
      setIsUserDataLoading(false);
    }).catch(() => setIsUserDataLoading(false));
  }, [user, db]);

  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [noteModifica, setNoteModifica] = useState('');
  const [loading, setLoading] = useState(false);
  const [postPerCommenti, setPostPerCommenti] = useState<string | null>(null);
  const [materialUrlsMap, setMaterialUrlsMap] = useState<Record<string, string[]>>({});

  // FONDAMENTALE: Usa il cliente_id dal profilo caricato
  const clienteId = userData?.cliente_id;
  const isIdValid = !!clienteId && clienteId !== 'unknown';

  const clientDocRef = useMemoFirebase(() => {
    if (!isIdValid) return null;
    return doc(db, 'clienti', clienteId!);
  }, [db, clienteId, isIdValid]);
  const { data: clientData, isLoading: isClientLoading } = useDoc<any>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    if (!isIdValid) return null;
    return query(
      collection(db, 'clienti', clienteId!, 'post'),
      orderBy('creato_il', 'desc')
    );
  }, [db, clienteId, isIdValid]);
  const { data: posts, isLoading: isPostsLoading } = useCollection<Post>(postsQuery);

  const materialsQuery = useMemoFirebase(() => {
    if (!isIdValid) return null;
    return query(collection(db, 'clienti', clienteId!, 'materiali'), orderBy('creato_il', 'desc'));
  }, [db, clienteId, isIdValid]);
  const { data: materials } = useCollection<Material>(materialsQuery);

  useEffect(() => {
    if (!posts || !isIdValid) return;

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
  }, [posts, isIdValid]);

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

  const handleRequestUpgrade = async () => {
    if (!clienteId || !user) return;
    try {
      await updateDoc(doc(db, 'clienti', clienteId), { richiesta_upgrade: true });
      toast({ title: "Richiesta Inviata", description: "Il tuo consulente ti contatterà a breve." });
    } catch (e) {
      toast({ variant: 'destructive', title: "Errore", description: "Impossibile inviare la richiesta." });
    }
  };

  if (isUserDataLoading || isClientLoading || isPostsLoading) {
    return (
      <div className="p-10 space-y-8">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3"><Skeleton className="h-[600px] w-full rounded-[2rem]" /></div>
          <div><Skeleton className="h-[400px] w-full rounded-[2rem]" /></div>
        </div>
      </div>
    );
  }

  if (userData && !clienteId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-bold text-slate-900">Configurazione Incompleta</h2>
          <p className="text-slate-500 max-w-sm mx-auto">Il tuo account non è ancora collegato a un'azienda. Contatta l'agenzia per attivare il tuo Hub.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl border-slate-200 font-bold">Aggiorna Pagina</Button>
      </div>
    );
  }

  const usagePercent = (clientData?.post_usati / (clientData?.post_totali || 1)) * 100;
  
  return (
    <div className="space-y-10 py-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm p-1">
            {clientData?.logo_url ? <img src={clientData.logo_url} className="w-full h-full object-contain" /> : <Briefcase className="w-8 h-8 text-indigo-200" />}
          </div>
          <div>
            <h1 className="text-4xl font-headline font-bold text-slate-900 leading-tight">{clientData?.nome_azienda}</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Area Riservata &bull; AD next lab Hub</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-xl border-slate-200 text-slate-900 bg-white font-bold px-6 hover:bg-slate-50"><History className="w-4 h-4 mr-2"/> Storico</Button>
          <Button onClick={handleRequestUpgrade} className="h-12 gradient-primary shadow-lg shadow-indigo-500/20 rounded-xl font-bold px-6">Post Extra</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Tabs defaultValue="feed">
            <TabsList className="bg-transparent border-b border-slate-100 rounded-none h-14 w-full justify-start p-0 mb-8 gap-8 overflow-x-auto overflow-y-hidden">
              <TabsTrigger value="feed" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none px-2 h-full font-bold text-slate-400">Workflow Post</TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none px-2 h-full font-bold text-slate-400">Calendario Visuale</TabsTrigger>
              <TabsTrigger value="assets" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none px-2 h-full font-bold text-slate-400">Brand & Offline Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-12 outline-none">
              <div className="max-w-lg mx-auto space-y-12">
                <div className="flex justify-center">
                  <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <Zap className="w-3 h-3 mr-1.5 fill-current" /> Silenzio Assenso Attivo (24h)
                  </Badge>
                </div>

                {posts?.filter(p => !['bozza', 'revisione_interna'].includes(p.stato)).map((post) => (
                  <div key={post.id} id={`post-${post.id}`} className={post.id === highlightPostId ? 'ring-2 ring-indigo-600 rounded-[2rem] p-2 bg-indigo-50' : ''}>
                    <FeedInstagramPreview
                      post={post}
                      clienteNome={clientData?.nome_azienda || 'La tua Azienda'}
                      clienteLogo={clientData?.logo_url}
                      showActions={post.stato === 'da_approvare'}
                      onApprove={() => handleApprova(post)}
                      onReject={() => setSelectedPost(post)}
                      onComment={() => setPostPerCommenti(post.id)}
                      materialUrls={materialUrlsMap[post.id] || []}
                    />
                  </div>
                ))}

                {(!posts || posts.length === 0) && (
                  <Card className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-200 border-dashed shadow-sm">
                    <CardContent className="space-y-4">
                      <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center"><Check className="w-10 h-10 text-emerald-500" /></div>
                      <div className="space-y-1">
                        <h3 className="text-slate-900 font-bold text-lg">In fase di produzione</h3>
                        <p className="text-slate-400 text-sm">Il team sta preparando i tuoi prossimi contenuti.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <div className="glass-card p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-slate-900">Programmazione Mensile</h3>
                    <p className="text-sm text-slate-500 font-medium">Visione d'insieme di tutti i post approvati e programmati.</p>
                  </div>
                  <Badge variant="outline" className="border-indigo-100 text-indigo-600 bg-indigo-50/50 uppercase font-black text-[9px] px-3 py-1">SOLO CONSULTAZIONE</Badge>
                </div>
                {posts && <CalendarioVisuale clienteId={clienteId!} posts={posts} readOnly={true} />}
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-8 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clientData?.include_contratto && (
                  <Card className="glass-card rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-slate-900 p-6">
                      <CardTitle className="text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileSignature className="w-4 h-4" /> Il Tuo Contratto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {materials?.filter(m => m.destinazione === 'contratto').map(m => (
                        <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl shadow-sm"><FileSignature className="w-5 h-5 text-slate-900" /></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">{m.nome_file}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Firmato il {m.creato_il?.toDate().toLocaleDateString('it-IT')}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="icon" className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm" onClick={() => m.link_esterno && window.open(m.link_esterno, '_blank')}>
                            <DownloadCloud className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {materials?.filter(m => m.destinazione === 'contratto').length === 0 && (
                        <p className="text-center py-8 text-[10px] font-bold text-slate-400 uppercase italic">Nessun contratto archiviato.</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {clientData?.include_visual_identity && (
                  <Card className="glass-card rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-indigo-50 p-6">
                      <CardTitle className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Fingerprint className="w-4 h-4" /> Visual Identity (Loghi)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {materials?.filter(m => m.destinazione === 'visual_identity').map(m => (
                        <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl shadow-sm"><Fingerprint className="w-5 h-5 text-indigo-600" /></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">{m.nome_file}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{m.creato_il?.toDate().toLocaleDateString('it-IT')}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="icon" className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm">
                            <DownloadCloud className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {materials?.filter(m => m.destinazione === 'visual_identity').length === 0 && (
                        <p className="text-center py-8 text-[10px] font-bold text-slate-400 uppercase italic">Asset in fase di caricamento.</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {clientData?.include_offline && (
                <Card className="glass-card rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                  <CardHeader className="bg-emerald-50 p-8 border-b border-emerald-100">
                    <CardTitle className="text-emerald-900 font-headline font-bold flex items-center gap-3">
                      <Printer className="w-6 h-6 text-emerald-600" /> Grafiche & Materiali Offline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                <p className="text-[9px] font-bold text-slate-300 uppercase italic">Nessun asset caricato</p>
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
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden shadow-sm bg-white">
            <CardHeader className="bg-indigo-600 p-8"><CardTitle className="text-white text-lg font-headline flex items-center gap-2"><Zap className="w-5 h-5 fill-white" /> Piano Mensile</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Post Residui</span>
                <div className="text-6xl font-black text-slate-900 mt-2 tracking-tighter">{Math.max(0, (clientData?.post_totali || 0) - (clientData?.post_usati || 0))}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end"><span className="text-[10px] font-black text-slate-400 uppercase">Utilizzo</span><span className="text-sm font-black text-slate-900">{clientData?.post_usati} / {clientData?.post_totali}</span></div>
                <Progress value={usagePercent} className="h-2.5 bg-slate-100 rounded-full" />
              </div>
              
              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Performance Hub</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Servizio attivo al 100%</p>
                  </div>
                </div>
                <Button onClick={handleRequestUpgrade} variant="outline" className="w-full h-12 rounded-xl text-indigo-600 border-indigo-100 font-bold hover:bg-indigo-50">Richiedi Post Extra</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none rounded-[2.5rem] p-8 bg-indigo-50/30 border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-indigo-600" /> Supporto Dedicato</h4>
            <p className="text-xs text-indigo-700/70 leading-relaxed mb-4">Hai bisogno di assistenza o vuoi discutere una nuova strategia?</p>
            <Button variant="link" className="p-0 h-auto text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              Contatta Team Nexus <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-3xl max-w-sm sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-bold text-slate-900">Richiesta Modifiche</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">Indica le variazioni desiderate per questo contenuto.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Le tue note</label>
              <Textarea value={noteModifica} onChange={(e) => setNoteModifica(e.target.value)} placeholder="Es: Vorrei cambiare l'immagine o il tono della caption..." className="bg-slate-50 border-slate-200 min-h-[120px] rounded-2xl resize-none" />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setSelectedPost(null)} className="text-slate-500 font-bold">Annulla</Button>
            <Button onClick={handleRifiuta} disabled={!noteModifica.trim() || loading} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-red-200">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invia Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {postPerCommenti && (
        <CommentiSidebar 
          clienteId={clienteId!} 
          postId={postPerCommenti} 
          isOpen={!!postPerCommenti} 
          onClose={() => setPostPerCommenti(null)} 
        />
      )}
    </div>
  );
}
