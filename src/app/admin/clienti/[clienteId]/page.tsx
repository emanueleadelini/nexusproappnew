'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, serverTimestamp, deleteDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS, Post, PIATTAFORMA_LABELS } from '@/types/post';
import { StatoValidazione, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS, getFileTypeInfo, Material, DESTINAZIONE_LABELS } from '@/types/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, FolderOpen, Clock, Sparkles, Plus, ChevronLeft, UploadCloud, Edit3, Image as ImageIcon, Trash2, MessageSquare, History, LayoutGrid, List, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GeneraBozzaModal } from '@/components/admin/genera-bozza-modal';
import { CreaPostManualeModal } from '@/components/admin/crea-post-manuale-modal';
import { ModificaPostModal } from '@/components/admin/modifica-post-modal';
import { ModificaPianoModal } from '@/components/admin/modifica-piano-modal';
import { CaricaMaterialeModal } from '@/components/admin/carica-materiale-modal';
import { CommentiSidebar } from '@/components/commenti-sidebar';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { usePermessi } from '@/hooks/use-permessi';
import { useUser } from '@/firebase';
import { CalendarioVisuale } from '@/components/admin/calendario-visuale';

const TRANSIZIONI_PERMESSE: Record<StatoPost, StatoPost[]> = {
  bozza: ["revisione_interna", "da_approvare"],
  revisione_interna: ["bozza", "da_approvare"],
  da_approvare: ["approvato", "revisione"],
  revisione: ["da_approvare"],
  approvato: ["programmato"],
  programmato: ["pubblicato"],
  pubblicato: []
};

export default function ClienteDettaglio() {
  const { clienteId } = useParams() as { clienteId: string };
  const searchParams = useSearchParams();
  const postIdFromUrl = searchParams.get('postId');
  
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { haPermesso } = usePermessi();

  const [isGeneraOpen, setIsGeneraOpen] = useState(false);
  const [isManualeOpen, setIsManualeOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPianoOpen, setIsPianoOpen] = useState(false);
  const [postDaModificare, setPostDaModificare] = useState<Post | null>(null);
  const [postPerCommenti, setPostPerCommenti] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const clientDocRef = useMemoFirebase(() => doc(db, 'clienti', clienteId), [db, clienteId]);
  const { data: client, isLoading: isClientLoading } = useDoc<any>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    return query(collection(db, 'clienti', clienteId, 'post'), orderBy('creato_il', 'desc'));
  }, [db, clienteId]);
  const { data: posts, isLoading: isPostsLoading } = useCollection<Post>(postsQuery);

  const materialsQuery = useMemoFirebase(() => {
    return query(collection(db, 'clienti', clienteId, 'materiali'), orderBy('creato_il', 'desc'));
  }, [db, clienteId]);
  const { data: materials, isLoading: isMaterialsLoading } = useCollection<Material>(materialsQuery);

  const handleTransizione = (post: Post, nuovoStato: StatoPost) => {
    if (!user) return;
    const postRef = doc(db, 'clienti', clienteId, 'post', post.id);
    const nota = nuovoStato === 'revisione' ? window.prompt("Note per il cliente:") : "";
    
    updateDoc(postRef, { 
      stato: nuovoStato, 
      aggiornato_il: serverTimestamp(),
      storico_stati: arrayUnion({
        stato: nuovoStato,
        autore_uid: user.uid,
        timestamp: Timestamp.now(),
        nota: nota || ""
      })
    }).catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postRef.path, operation: 'update' })));
    toast({ title: "Stato aggiornato", description: `Post in ${STATO_POST_LABELS[nuovoStato]}` });
  };

  const handleValidazioneAsset = (materialId: string, validato: boolean) => {
    const matRef = doc(db, 'clienti', clienteId, 'materiali', materialId);
    const nota = !validato ? window.prompt("Motivo del rifiuto:") : null;
    
    if (!validato && !nota) return;

    updateDoc(matRef, {
      stato_validazione: validato ? 'validato' : 'rifiutato',
      note_rifiuto: nota,
      aggiornato_il: serverTimestamp()
    }).catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: matRef.path, operation: 'update' })));
    
    toast({ 
      title: validato ? "Asset Validato" : "Asset Rifiutato", 
      description: validato ? "L'asset è ora pronto per essere usato nei post." : "Il cliente riceverà una notifica."
    });
  };

  const deletePost = (postId: string) => {
    if (!window.confirm("Eliminare definitivamente e riaccreditare?")) return;
    deleteDoc(doc(db, 'clienti', clienteId, 'post', postId));
    updateDoc(doc(db, 'clienti', clienteId), { post_usati: increment(-1) });
    toast({ title: "Post eliminato" });
  };

  if (isClientLoading) return <div className="p-8 space-y-4"><Skeleton className="h-12 w-1/3"/><Skeleton className="h-64"/></div>;
  if (!client) return <div className="p-8 text-center">Cliente non trovato.</div>;

  const postUsati = posts?.length || 0;
  const usagePercent = (postUsati / (client.post_totali || 1)) * 100;
  const pendingAssets = materials?.filter(m => m.stato_validazione === 'in_attesa') || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end gap-4">
        <div>
          <Link href="/admin" className="text-indigo-600 hover:underline text-sm flex items-center gap-1 mb-2">
            <ChevronLeft className="w-4 h-4"/> Elenco Clienti
          </Link>
          <h1 className="text-4xl font-headline font-bold">{client.nome_azienda}</h1>
          <p className="text-muted-foreground">{client.settore} • {client.email_riferimento}</p>
        </div>
        <div className="flex gap-2">
          {haPermesso('upload_materiali') && (
            <Button variant="outline" onClick={() => setIsUploadOpen(true)} className="border-indigo-200 text-indigo-700">
              <UploadCloud className="w-4 h-4 mr-2"/> Carica Asset
            </Button>
          )}
          {haPermesso('uso_ai') && (
            <Button onClick={() => setIsGeneraOpen(true)} className="bg-violet-600 hover:bg-violet-700 shadow-violet-100 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2"/> Genera Post AI
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Tabs defaultValue="visual">
            <TabsList className="bg-transparent border-b rounded-none h-12 w-full justify-start p-0 mb-6">
              <TabsTrigger value="visual" className="data-[state=active]:border-b-2 border-indigo-600 rounded-none h-full px-6">
                <LayoutGrid className="w-4 h-4 mr-2"/> Calendario Visuale
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:border-b-2 border-indigo-600 rounded-none h-full px-6">
                <List className="w-4 h-4 mr-2"/> Elenco Post
              </TabsTrigger>
              <TabsTrigger value="assets" className="data-[state=active]:border-b-2 border-indigo-600 rounded-none h-full px-6">
                <FolderOpen className="w-4 h-4 mr-2"/> Archivio Asset 
                {pendingAssets.length > 0 && <Badge className="ml-2 bg-amber-500">{pendingAssets.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual">
              {posts && <CalendarioVisuale clienteId={clienteId} posts={posts} />}
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
               {posts?.map(post => (
                 <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${STATO_POST_COLORS[post.stato].bg} ${STATO_POST_COLORS[post.stato].text} border-none`}>
                          {STATO_POST_LABELS[post.stato]}
                        </Badge>
                        <span className="text-xs text-gray-400">Pianificato: {post.data_pubblicazione?.toDate().toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setPostPerCommenti(post.id)}><MessageSquare className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => setPostDaModificare(post)}><Edit3 className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon" className="text-red-400" onClick={() => deletePost(post.id)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-bold mb-1">{post.titolo}</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{post.testo}</p>
                    </CardContent>
                    <CardFooter className="bg-gray-50/50 p-3 flex justify-end gap-2">
                       {TRANSIZIONI_PERMESSE[post.stato].map(next => (
                         <Button key={next} size="sm" onClick={() => handleTransizione(post, next)} className={`h-8 text-[10px] font-bold uppercase ${STATO_POST_COLORS[next].bg} ${STATO_POST_COLORS[next].text} border-none`}>
                           Sposta in {STATO_POST_LABELS[next]}
                         </Button>
                       ))}
                    </CardFooter>
                 </Card>
               ))}
            </TabsContent>

            <TabsContent value="assets">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {materials?.map(mat => {
                  const type = getFileTypeInfo(mat.nome_file, !!mat.link_esterno);
                  return (
                    <Card key={mat.id} className="overflow-hidden group">
                      <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center relative">
                        <type.icon className={`w-10 h-10 ${type.color} opacity-40`}/>
                        <span className="text-[10px] mt-2 font-bold uppercase text-gray-400 px-4 text-center truncate w-full">{mat.nome_file}</span>
                        
                        {mat.stato_validazione === 'in_attesa' && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <Button size="icon" variant="secondary" className="bg-green-500 hover:bg-green-600 border-none" onClick={() => handleValidazioneAsset(mat.id, true)}><CheckCircle2 className="text-white"/></Button>
                            <Button size="icon" variant="secondary" className="bg-red-500 hover:bg-red-600 border-none" onClick={() => handleValidazioneAsset(mat.id, false)}><XCircle className="text-white"/></Button>
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-3">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-[9px] uppercase">{DESTINAZIONE_LABELS[mat.destinazione]}</Badge>
                          <Badge className={`${STATO_VALIDAZIONE_COLORS[mat.stato_validazione].bg} ${STATO_VALIDAZIONE_COLORS[mat.stato_validazione].text} text-[9px]`}>
                            {STATO_VALIDAZIONE_LABELS[mat.stato_validazione]}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl shadow-md border-indigo-100 sticky top-24">
            <CardHeader className="bg-indigo-600 text-white rounded-t-xl">
              <CardTitle className="text-lg font-headline">Stato Piano Post</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Residui Mensili</span>
                <div className="text-5xl font-bold font-headline mt-1">{client.post_totali - postUsati}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Utilizzo</span>
                  <span className={usagePercent > 80 ? 'text-red-600' : 'text-indigo-600'}>{postUsati} / {client.post_totali}</span>
                </div>
                <Progress value={usagePercent} className={`h-2 ${usagePercent > 80 ? '[&>div]:bg-red-500' : '[&>div]:bg-indigo-600'}`} />
              </div>
              <Button variant="outline" className="w-full text-indigo-600 border-indigo-200" onClick={() => setIsPianoOpen(true)}>Gestisci Crediti</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <GeneraBozzaModal isOpen={isGeneraOpen} onClose={() => setIsGeneraOpen(false)} clienteId={clienteId} clienteNome={client.nome_azienda} clienteSettore={client.settore || ''} />
      <CreaPostManualeModal isOpen={isManualeOpen} onClose={() => setIsManualeOpen(false)} clienteId={clienteId} />
      <ModificaPostModal isOpen={!!postDaModificare} onClose={() => setPostDaModificare(null)} clienteId={clienteId} post={postDaModificare} />
      <ModificaPianoModal isOpen={isPianoOpen} onClose={() => setIsPianoOpen(false)} clienteId={clienteId} postTotaliAttuali={client.post_totali} />
      <CaricaMaterialeModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} clienteId={clienteId} />
      {postPerCommenti && <CommentiSidebar clienteId={clienteId} postId={postPerCommenti} isOpen={!!postPerCommenti} onClose={() => setPostPerCommenti(null)} />}
    </div>
  );
}