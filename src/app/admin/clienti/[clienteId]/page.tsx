
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, serverTimestamp, deleteDoc, increment } from 'firebase/firestore';
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS, Post } from '@/types/post';
import { StatoValidazione, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS, getFileTypeInfo, Material, DestinazioneAsset, DESTINAZIONE_LABELS, DESTINAZIONE_ICONS } from '@/types/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, FolderOpen, Send, Clock, Sparkles, Plus, ChevronLeft, UploadCloud, Edit3, Image as ImageIcon, Filter, PieChart, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { GeneraBozzaModal } from '@/components/admin/genera-bozza-modal';
import { CreaPostManualeModal } from '@/components/admin/crea-post-manuale-modal';
import { ModificaPostModal } from '@/components/admin/modifica-post-modal';
import { ModificaPianoModal } from '@/components/admin/modifica-piano-modal';
import { CaricaMaterialeModal } from '@/components/admin/carica-materiale-modal';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ClienteDettaglio() {
  const { clienteId } = useParams() as { clienteId: string };
  const db = useFirestore();
  const { toast } = useToast();
  const [isGeneraOpen, setIsGeneraOpen] = useState(false);
  const [isManualeOpen, setIsManualeOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPianoOpen, setIsPianoOpen] = useState(false);
  const [postDaModificare, setPostDaModificare] = useState<Post | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [destFilter, setDestFilter] = useState<string>('all');

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

  const updatePostState = (postId: string, newState: string) => {
    const ref = doc(db, 'clienti', clienteId, 'post', postId);
    updateDoc(ref, { 
      stato: newState, 
      aggiornato_il: serverTimestamp() 
    }).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'update' }));
    });
    toast({ title: "Stato aggiornato", description: `Il post è ora in stato: ${newState}` });
  };

  const deletePost = (postId: string) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo post? Il credito verrà riaccreditato.")) return;
    
    const postRef = doc(db, 'clienti', clienteId, 'post', postId);
    const clientRef = doc(db, 'clienti', clienteId);

    deleteDoc(postRef).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postRef.path, operation: 'delete' }));
    });

    updateDoc(clientRef, {
      post_usati: increment(-1)
    }).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: clientRef.path, operation: 'update' }));
    });

    toast({ title: "Post eliminato", description: "Calendario e crediti aggiornati." });
  };

  const validateMaterial = (materialId: string, status: 'validato' | 'rifiutato') => {
    const ref = doc(db, 'clienti', clienteId, 'materiali', materialId);
    let notes = null;
    if (status === 'rifiutato') {
      notes = window.prompt("Motivo del rifiuto:");
      if (notes === null) return;
    }
    updateDoc(ref, { 
      stato_validazione: status, 
      note_rifiuto: notes,
      aggiornato_il: serverTimestamp()
    }).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'update' }));
    });
    toast({ title: "Materiale aggiornato", description: `Stato: ${status}` });
  };

  if (isClientLoading) return <div className="space-y-4 p-8"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-64" /></div>;
  if (!client) return <div className="p-8 text-center">Cliente non trovato.</div>;

  const filteredMaterials = materials?.filter(mat => {
    const typeInfo = getFileTypeInfo(mat.nome_file);
    const matchesTipo = tipoFilter === 'all' || typeInfo.type === tipoFilter;
    const matchesDest = destFilter === 'all' || mat.destinazione === destFilter;
    return matchesTipo && matchesDest;
  }) || [];

  const groupedMaterials = filteredMaterials.reduce((acc: any, mat: any) => {
    let date = 'Data non disponibile';
    if (mat.creato_il && typeof mat.creato_il.toDate === 'function') {
      date = mat.creato_il.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (!acc[date]) acc[date] = [];
    acc[date].push(mat);
    return acc;
  }, {});

  const postsOnSelectedDate = posts?.filter(post => {
    if (!post.data_pubblicazione || !selectedDate || typeof post.data_pubblicazione.toDate !== 'function') return false;
    const pubDate = post.data_pubblicazione.toDate();
    return pubDate.toDateString() === selectedDate.toDateString();
  }) || [];

  const daysWithPosts = posts?.filter(p => p.data_pubblicazione && typeof p.data_pubblicazione.toDate === 'function').map(p => p.data_pubblicazione.toDate().toDateString()) || [];

  // Calcolo crediti collegato DIRETTAMENTE al calendario (numero di post in collezione)
  const postTotali = client.post_totali || 0;
  const postUsati = posts?.length || 0; 
  const postRimanenti = Math.max(0, postTotali - postUsati);
  const usagePercent = postTotali > 0 ? (postUsati / postTotali) * 100 : 0;

  return (
    <div className="space-y-8 p-4 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-2">
            <ChevronLeft className="w-4 h-4" /> Torna ai Clienti
          </Link>
          <h1 className="text-4xl font-headline font-bold text-gray-900">{client.nome_azienda}</h1>
          <p className="text-muted-foreground">{client.settore || 'Settore non specificato'} • {client.email_riferimento}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={() => setIsUploadOpen(true)} variant="outline" className="flex-1 md:flex-none gap-2 border-indigo-200 text-indigo-700">
            <UploadCloud className="w-4 h-4" /> Carica Asset
          </Button>
          <Button onClick={() => setIsGeneraOpen(true)} className="flex-1 md:flex-none gap-2 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200">
            <Sparkles className="w-4 h-4" /> Genera con AI
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {client.richiesta_upgrade && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-600 w-5 h-5" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Richiesta di Upgrade</p>
                  <p className="text-xs text-amber-700">Il cliente ha richiesto l'aggiunta di post extra al piano.</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setIsPianoOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white border-none">
                Gestisci Piano
              </Button>
            </div>
          )}

          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="bg-white border-b border-gray-200 p-0 h-12 w-full justify-start rounded-none mb-6">
              <TabsTrigger value="calendar" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-8 text-sm font-medium">
                <CalendarDays className="w-4 h-4 mr-2" /> Calendario Editoriale
              </TabsTrigger>
              <TabsTrigger value="materials" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-full px-8 text-sm font-medium">
                <FolderOpen className="w-4 h-4 mr-2" /> Archivio Asset
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <Card className="p-4 h-fit border-indigo-100 shadow-sm w-full lg:w-80">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                    modifiers={{
                      hasPost: (date) => daysWithPosts.includes(date.toDateString())
                    }}
                    modifiersClassNames={{
                      hasPost: "bg-indigo-100 text-indigo-900 font-bold border-b-2 border-indigo-600 rounded-none"
                    }}
                  />
                </Card>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-headline font-bold">
                      {selectedDate ? `Post per il ${selectedDate.toLocaleDateString('it-IT')}` : 'Tutti i post'}
                    </h2>
                    <Button size="sm" onClick={() => setIsManualeOpen(true)} className="bg-indigo-600"><Plus className="w-4 h-4 mr-2"/> Aggiungi Post</Button>
                  </div>

                  {isPostsLoading ? <Skeleton className="h-48" /> : postsOnSelectedDate.length > 0 ? (
                    <div className="grid gap-4">
                      {postsOnSelectedDate.map(post => {
                        const materialAssociato = materials?.find(m => m.id === post.materiale_id);
                        return (
                          <Card key={post.id} className="rounded-xl border-gray-200/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-headline font-semibold text-lg">{post.titolo}</h3>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => setPostDaModificare(post)}>
                                        <Edit3 className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => deletePost(post.id)}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-400">
                                        {post.data_pubblicazione && typeof post.data_pubblicazione.toDate === 'function' ? post.data_pubblicazione.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : 'Orario non pianificato'}
                                      </span>
                                    </div>
                                    {materialAssociato && (
                                      <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium">
                                        <ImageIcon className="w-3 h-3" /> Asset: {materialAssociato.nome_file}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Badge className={`${STATO_POST_COLORS[post.stato as StatoPost].bg} ${STATO_POST_COLORS[post.stato as StatoPost].text} border-none font-medium`}>
                                  {STATO_POST_LABELS[post.stato as StatoPost]}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 italic border-l-2 border-indigo-100 pl-4 bg-indigo-50/30 p-2 rounded-r">
                                "{post.testo}"
                              </p>
                            </div>
                            <CardFooter className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-end gap-2">
                              {post.stato === 'bozza' && (
                                <Button size="sm" onClick={() => updatePostState(post.id, 'da_approvare')} className="bg-orange-600 hover:bg-orange-700">
                                  <Send className="w-3 h-3 mr-2" /> Invia per approvazione
                                </Button>
                              )}
                              {post.stato === 'da_approvare' && (
                                <Button size="sm" onClick={() => updatePostState(post.id, 'approvato')} className="bg-blue-600 hover:bg-blue-700">Approva</Button>
                              )}
                              {post.stato === 'approvato' && (
                                <Button size="sm" onClick={() => updatePostState(post.id, 'pubblicato')} className="bg-green-600 hover:bg-green-700">Segna pubblicato</Button>
                              )}
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-100">
                      <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Nessun post programmato per questa data.</p>
                      <Button variant="link" onClick={() => setSelectedDate(undefined)} className="text-indigo-600 mt-2">Mostra tutti i post</Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-tight">Filtra per:</span>
                </div>
                
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Tipologia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="grafica">🎨 Grafiche</SelectItem>
                    <SelectItem value="foto">📸 Foto</SelectItem>
                    <SelectItem value="video">🎥 Video</SelectItem>
                    <SelectItem value="documento">📄 Documenti</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={destFilter} onValueChange={setDestFilter}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Destinazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le destinazioni</SelectItem>
                    <SelectItem value="social">📱 Social Media</SelectItem>
                    <SelectItem value="sito">🌐 Sito Web</SelectItem>
                    <SelectItem value="offline">🖨️ Grafiche Offline</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="sm" onClick={() => {setTipoFilter('all'); setDestFilter('all');}} className="text-xs text-gray-400 hover:text-indigo-600">
                  Reset Filtri
                </Button>
              </div>

              {isMaterialsLoading ? <Skeleton className="h-64" /> : Object.keys(groupedMaterials).length > 0 ? (
                Object.keys(groupedMaterials).map(date => (
                  <div key={date} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-1 rounded-full border shadow-sm">{date}</h3>
                      <div className="h-px bg-gray-100 flex-1" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedMaterials[date].map((mat: Material) => {
                        const typeInfo = getFileTypeInfo(mat.nome_file);
                        const DestIcon = DESTINAZIONE_ICONS[mat.destinazione] || FolderOpen;
                        const timeStr = mat.creato_il && typeof mat.creato_il.toDate === 'function' ? mat.creato_il.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';

                        return (
                          <Card key={mat.id} className="rounded-xl border-gray-200/50 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
                            <div className="p-4 flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div className={`p-3 ${typeInfo.bg} rounded-xl`}>
                                  <typeInfo.icon className={`w-6 h-6 ${typeInfo.color}`} />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 flex gap-1 items-center bg-gray-50">
                                    <DestIcon className="w-2 h-2" /> {DESTINAZIONE_LABELS[mat.destinazione]}
                                  </Badge>
                                  <MaterialeStatoChip stato={mat.stato_validazione} />
                                </div>
                              </div>
                              <p className="font-semibold text-sm truncate mb-1" title={mat.nome_file}>{mat.nome_file}</p>
                              {timeStr && <p className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-2 h-2"/> Caricato alle {timeStr}</p>}
                            </div>
                            {mat.stato_validazione === 'in_attesa' && (
                              <div className="p-3 bg-gray-50 border-t flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-100" onClick={() => validateMaterial(mat.id, 'rifiutato')}>Rifiuta</Button>
                                <Button size="sm" className="flex-1 bg-green-600" onClick={() => validateMaterial(mat.id, 'validato')}>Valida</Button>
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-100">
                  <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-muted-foreground">Nessun asset trovato con i filtri selezionati.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border-gray-200/50 shadow-md overflow-hidden sticky top-24">
            <CardHeader className="bg-indigo-600 text-white pb-6">
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <PieChart className="w-5 h-5" /> Crediti Piano
              </CardTitle>
              <CardDescription className="text-indigo-100 text-xs">
                Monitoraggio abbonamento cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Post Rimanenti</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-bold font-headline ${postRimanenti <= 1 ? 'text-red-600' : 'text-gray-900'}`}>
                    {postRimanenti}
                  </span>
                  <span className="text-gray-400 font-medium">/ {postTotali}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span className="text-gray-400">Utilizzo Calendario</span>
                  <span className={usagePercent > 80 ? 'text-red-600' : 'text-indigo-600'}>
                    {postUsati} / {postTotali}
                  </span>
                </div>
                <Progress 
                  value={usagePercent} 
                  className={`h-2 ${usagePercent > 80 ? '[&>div]:bg-red-500' : '[&>div]:bg-indigo-600'}`} 
                />
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 flex gap-3 items-start">
                <Info className="w-4 h-4 text-indigo-500 mt-0.5" />
                <p className="text-[10px] text-indigo-700 leading-relaxed">
                  I crediti sono collegati direttamente al numero di post inseriti nel Calendario Editoriale.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50/50 p-4">
               <Button onClick={() => setIsPianoOpen(true)} variant="outline" className="w-full text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                 Modifica Piano Abbonamento
               </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <GeneraBozzaModal isOpen={isGeneraOpen} onClose={() => setIsGeneraOpen(false)} clienteId={clienteId} clienteNome={client.nome_azienda} clienteSettore={client.settore || ''} />
      <CreaPostManualeModal isOpen={isManualeOpen} onClose={() => setIsManualeOpen(false)} clienteId={clienteId} />
      <ModificaPostModal isOpen={!!postDaModificare} onClose={() => setPostDaModificare(null)} clienteId={clienteId} post={postDaModificare} />
      <ModificaPianoModal isOpen={isPianoOpen} onClose={() => setIsPianoOpen(false)} clienteId={clienteId} postTotaliAttuali={postTotali} />
      <CaricaMaterialeModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} clienteId={clienteId} />
    </div>
  );
}

function MaterialeStatoChip({ stato }: { stato: StatoValidazione }) {
  return (
    <Badge className={`${STATO_VALIDAZIONE_COLORS[stato].bg} ${STATO_VALIDAZIONE_COLORS[stato].text} border-none text-[9px] py-0`}>
      {STATO_VALIDAZIONE_LABELS[stato]}
    </Badge>
  );
}
