
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useMemoFirebase, useCollection, useDoc, useUser, useAuth } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, serverTimestamp, deleteDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS, Post } from '@/types/post';
import { Material } from '@/types/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  Sparkles, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  Plus,
  Briefcase,
  Zap,
  Clock,
  Timer,
  Settings,
  KeyRound,
  Download,
  Loader2,
  Fingerprint,
  Printer,
  FileSignature,
  DownloadCloud
} from 'lucide-react';
import { useState } from 'react';
import { GeneraBozzaModal } from '@/components/admin/genera-bozza-modal';
import { CreaPostManualeModal } from '@/components/admin/crea-post-manuale-modal';
import { ModificaPostModal } from '@/components/admin/modifica-post-modal';
import { ModificaPianoModal } from '@/components/admin/modifica-piano-modal';
import { CaricaMaterialeModal } from '@/components/admin/carica-materiale-modal';
import { CommentiSidebar } from '@/components/commenti-sidebar';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { CalendarioVisuale } from '@/components/admin/calendario-visuale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TRANSIZIONI_PERMESSE: Record<StatoPost, StatoPost[]> = {
  bozza: ["da_approvare"],
  revisione_interna: ["da_approvare"],
  da_approvare: ["approvato", "revisione"],
  revisione: ["da_approvare"],
  approvato: ["programmato", "pubblicato"],
  programmato: ["pubblicato"],
  pubblicato: []
};

export default function ClienteDettaglio() {
  const { clienteId } = useParams() as { clienteId: string };
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const [isGeneraOpen, setIsGeneraOpen] = useState(false);
  const [isCreaManualeOpen, setIsCreaManualeOpen] = useState(false);
  const [isCaricaMaterialeOpen, setIsCaricaMaterialeOpen] = useState(false);
  const [isPianoOpen, setIsPianoOpen] = useState(false);
  const [postDaModificare, setPostDaModificare] = useState<Post | null>(null);
  const [postPerCommenti, setPostPerCommenti] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const clientDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'clienti', clienteId);
  }, [db, clienteId, user]);
  const { data: client, isLoading: isClientLoading } = useDoc<any>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'clienti', clienteId, 'post'), orderBy('creato_il', 'desc'));
  }, [db, clienteId, user]);
  const { data: posts } = useCollection<Post>(postsQuery);

  const materialsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'clienti', clienteId, 'materiali'), orderBy('creato_il', 'desc'));
  }, [db, clienteId, user]);
  const { data: materials } = useCollection<Material>(materialsQuery);

  const handleTransizione = (post: Post, nuovoStato: StatoPost) => {
    if (!user) return;
    const postRef = doc(db, 'clienti', clienteId, 'post', post.id);
    
    const updateData: any = { 
      stato: nuovoStato, 
      aggiornato_il: serverTimestamp(),
      storico_stati: arrayUnion({
        stato: nuovoStato,
        autore_uid: user.uid,
        timestamp: Timestamp.now(),
        nota: `Spostato in ${STATO_POST_LABELS[nuovoStato]}`
      })
    };

    if (nuovoStato === 'da_approvare') {
      const scadenza = new Date();
      scadenza.setHours(scadenza.getHours() + 24);
      updateData.scadenza_approvazione = Timestamp.fromDate(scadenza);
    }

    updateDoc(postRef, updateData).catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postRef.path, operation: 'update' })));
    toast({ title: "Stato Aggiornato", description: `Post ora in ${STATO_POST_LABELS[nuovoStato]}` });
  };

  const handleResetPassword = async () => {
    if (!client?.email_riferimento) return;
    try {
      await sendPasswordResetEmail(auth, client.email_riferimento);
      toast({ title: "Email inviata", description: `Inviata email di reset a ${client.email_riferimento}` });
    } catch (e) {
      toast({ variant: 'destructive', title: "Errore", description: "Impossibile inviare email di reset." });
    }
  };

  const handleDeleteClient = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'clienti', clienteId));
      toast({ title: "Cliente eliminato", description: "Il tenant è stato rimosso con successo." });
      router.push('/admin/clienti');
    } catch (e) {
      toast({ variant: 'destructive', title: "Errore", description: "Impossibile eliminare il cliente." });
    } finally {
      setLoading(false);
      setIsDeleting(false);
    }
  };

  const handleDownloadAll = () => {
    if (!posts || !client) return;
    
    const content = posts.map(p => `--- ${p.titolo} ---\nStato: ${STATO_POST_LABELS[p.stato]}\nTesto: ${p.testo}\nCreato il: ${p.creato_il?.toDate().toLocaleString()}\n`).join('\n\n');
    const blob = new Blob([`REPORT NEXUS PRO - ${client.nome_azienda}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${client.nome_azienda.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Download avviato", description: "Il report del cliente è in fase di scaricamento." });
  };

  if (isClientLoading) return <div className="p-8"><Skeleton className="h-64"/></div>;
  if (!client) return <div className="p-8">Cliente non trovato.</div>;

  const usagePercent = (client.post_usati / (client.post_totali || 1)) * 100;
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
            {client.logo_url ? <img src={client.logo_url} className="w-full h-full object-cover" /> : <Briefcase className="w-8 h-8 text-indigo-200" />}
          </div>
          <div>
            <h1 className="text-4xl font-headline font-bold text-slate-900">{client.nome_azienda}</h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{client.settore} • Hub Master</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold text-slate-600 border-slate-200">
                <Settings className="w-4 h-4" /> Gestione Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100 p-2">
              <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 p-2">Opzioni Tenant</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleResetPassword} className="rounded-lg gap-3 p-3 cursor-pointer">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-700">Reset Password</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadAll} className="rounded-lg gap-3 p-3 cursor-pointer">
                <Download className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-700">Scarica Tutto</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex w-full items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-bold">Elimina Cliente</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-headline font-bold text-slate-900">Sei assolutamente sicuro?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 font-medium">
                      Questa azione è irreversibile. Eliminerai i dati del cliente <span className="font-bold text-slate-900">{client.nome_azienda}</span> e tutti i post associati.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="rounded-xl font-bold">Annulla</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteClient}
                      className="bg-red-600 hover:bg-red-700 rounded-xl font-bold px-8"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Elimina Definitivamente'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={() => setIsCaricaMaterialeOpen(true)} className="h-11 border-slate-200 text-slate-700 rounded-xl font-bold px-6 hover:bg-slate-50"><FolderOpen className="w-4 h-4 mr-2"/> Carica Asset</Button>
          <Button variant="outline" onClick={() => setIsCreaManualeOpen(true)} className="h-11 border-indigo-600 text-indigo-700 rounded-xl font-bold px-6 hover:bg-indigo-50"><Plus className="w-4 h-4 mr-2"/> Nuovo Post</Button>
          <Button onClick={() => setIsGeneraOpen(true)} className="h-11 gradient-primary shadow-lg shadow-indigo-500/20 rounded-xl font-bold px-6"><Sparkles className="w-4 h-4 mr-2"/> Genera AI</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Tabs defaultValue="list">
            <TabsList className="bg-transparent border-b border-slate-100 rounded-none h-14 w-full justify-start p-0 mb-6 gap-8">
              <TabsTrigger value="list" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none px-2 h-full font-bold text-slate-400">Workflow Post</TabsTrigger>
              <TabsTrigger value="assets" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none px-2 h-full font-bold text-slate-400">Brand & Offline Assets</TabsTrigger>
              <TabsTrigger value="visual" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none px-2 h-full font-bold text-slate-400">Calendario Visuale</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
               {posts?.map(post => (
                 <Card key={post.id} className={`glass-card border-none rounded-3xl overflow-hidden hover:shadow-lg transition-all ${post.stato === 'da_approvare' ? 'ring-2 ring-amber-400/30' : ''}`}>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between p-6">
                      <div className="flex items-center gap-3">
                        <Badge className={`${STATO_POST_COLORS[post.stato].bg} ${STATO_POST_COLORS[post.stato].text} border-none text-[10px] font-black uppercase tracking-widest px-3 py-1`}>
                          {STATO_POST_LABELS[post.stato]}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                          {post.tipo_pianificazione === 'immediata' ? <Zap className="w-3 h-3 text-amber-500" /> : <Clock className="w-3 h-3" />}
                          {post.tipo_pianificazione === 'immediata' ? 'Immediata' : 'Programmata'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={() => setPostPerCommenti(post.id)}><MessageSquare className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={() => setPostDaModificare(post)}><Edit3 className="w-4 h-4"/></Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <h4 className="text-lg font-bold text-slate-900">{post.titolo}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">{post.testo}</p>
                    </CardContent>
                    <CardFooter className="bg-slate-50/80 px-6 py-4 flex justify-between items-center border-t border-slate-100">
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         {post.stato === 'da_approvare' && post.scadenza_approvazione && (
                           <span className="text-amber-600 flex items-center gap-1.5">
                             <Timer className="w-3.5 h-3.5" /> Scade: {post.scadenza_approvazione.toDate().toLocaleString('it-IT')}
                           </span>
                         )}
                       </div>
                       <div className="flex gap-2">
                         {TRANSIZIONI_PERMESSE[post.stato].map(next => (
                           <Button 
                             key={next} 
                             size="sm" 
                             onClick={() => handleTransizione(post, next)} 
                             className={`h-9 text-[10px] font-black uppercase tracking-widest ${STATO_POST_COLORS[next].bg} ${STATO_POST_COLORS[next].text} border-none hover:opacity-80 rounded-lg px-4`}
                           >
                             Muovi in {STATO_POST_LABELS[next]}
                           </Button>
                         ))}
                       </div>
                    </CardFooter>
                 </Card>
               ))}
            </TabsContent>

            <TabsContent value="assets" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Identity Section */}
                <Card className="glass-card rounded-[2rem] border-none shadow-sm overflow-hidden">
                  <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                      <Fingerprint className="w-4 h-4" /> Visual Identity (Loghi)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {materials?.filter(m => m.destinazione === 'visual_identity').map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg border border-slate-200"><Fingerprint className="w-4 h-4 text-indigo-600" /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{m.nome_file}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{m.creato_il?.toDate().toLocaleDateString('it-IT')}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DownloadCloud className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {materials?.filter(m => m.destinazione === 'visual_identity').length === 0 && (
                      <p className="text-center py-6 text-xs font-bold text-slate-400 uppercase italic">Nessun logo caricato</p>
                    )}
                  </CardContent>
                </Card>

                {/* Contratto Section */}
                <Card className="glass-card rounded-[2rem] border-none shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-900 border-b border-slate-800">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                      <FileSignature className="w-4 h-4" /> Contratto & Accordi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {materials?.filter(m => m.destinazione === 'contratto').map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg border border-slate-200"><FileSignature className="w-4 h-4 text-slate-900" /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{m.nome_file}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{m.creato_il?.toDate().toLocaleDateString('it-IT')}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-900 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DownloadCloud className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {materials?.filter(m => m.destinazione === 'contratto').length === 0 && (
                      <p className="text-center py-6 text-xs font-bold text-slate-400 uppercase italic">Nessun contratto presente</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Offline Graphics Section */}
              <Card className="glass-card rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-emerald-50 border-b border-emerald-100 p-8">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-headline font-bold text-emerald-900 flex items-center gap-3">
                      <Printer className="w-6 h-6 text-emerald-600" /> Archivio Grafiche Offline
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1 text-[10px] font-black uppercase tracking-widest">Premium Assets</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['brochure', 'volantino', 'bigliettini', 'gadget', '6x3', '3x6', 'altro'].map(type => {
                      const typeMaterials = materials?.filter(m => m.destinazione === 'offline' && m.tipo_offline === type);
                      return (
                        <div key={type} className="space-y-3">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">{type}</h5>
                          <div className="space-y-2">
                            {typeMaterials?.map(m => (
                              <div key={m.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 transition-all group shadow-sm">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 truncate" title={m.nome_file}>{m.nome_file}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">{m.creato_il?.toDate().toLocaleDateString('it-IT')}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DownloadCloud className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            {(!typeMaterials || typeMaterials.length === 0) && (
                              <p className="text-[9px] font-bold text-slate-300 uppercase italic pl-1">Vuoto</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visual">
              <div className="glass-card p-6 rounded-[2.5rem] border-none shadow-sm">
                {posts && <CalendarioVisuale clienteId={clienteId} posts={posts} onAddPost={() => setIsCreaManualeOpen(true)} />}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden shadow-sm">
            <CardHeader className="bg-indigo-600 p-8">
              <CardTitle className="text-white text-lg font-headline flex items-center gap-2">
                <Zap className="w-5 h-5 fill-white" /> Crediti Piano
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Post Residui</span>
                <div className="text-6xl font-black text-slate-900 mt-2 tracking-tighter">
                  {Math.max(0, (client.post_totali || 0) - (client.post_usati || 0))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Utilizzo</span>
                  <span className="text-sm font-black text-slate-900">{client.post_usati} / {client.post_totali}</span>
                </div>
                <Progress value={usagePercent} className="h-2.5 bg-slate-100 rounded-full" />
              </div>
              <Button variant="outline" className="w-full h-12 rounded-xl text-indigo-600 border-indigo-100 font-bold hover:bg-indigo-50" onClick={() => setIsPianoOpen(true)}>
                Gestisci Limiti & Moduli
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <GeneraBozzaModal isOpen={isGeneraOpen} onClose={() => setIsGeneraOpen(false)} clienteId={clienteId} clienteNome={client.nome_azienda} clienteSettore={client.settore || ''} />
      <CreaPostManualeModal isOpen={isCreaManualeOpen} onClose={() => setIsCreaManualeOpen(false)} clienteId={clienteId} />
      <CaricaMaterialeModal isOpen={isCaricaMaterialeOpen} onClose={() => setIsCaricaMaterialeOpen(false)} clienteId={clienteId} />
      <ModificaPostModal isOpen={!!postDaModificare} onClose={() => setPostDaModificare(null)} clienteId={clienteId} post={postDaModificare} />
      <ModificaPianoModal 
        isOpen={isPianoOpen} 
        onClose={() => setIsPianoOpen(false)} 
        clienteId={clienteId} 
        postTotaliAttuali={client.post_totali} 
        includeContratto={client.include_contratto}
        includeVisualIdentity={client.include_visual_identity}
        includeOffline={client.include_offline}
      />
      {postPerCommenti && <CommentiSidebar clienteId={clienteId} postId={postPerCommenti} isOpen={!!postPerCommenti} onClose={() => setPostPerCommenti(null)} />}
    </div>
  );
}
