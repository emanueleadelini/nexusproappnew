'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc, addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { StatoPost, STATO_POST_LABELS, STATO_POST_COLORS } from '@/types/post';
import { StatoValidazione, STATO_VALIDAZIONE_LABELS, STATO_VALIDAZIONE_COLORS, getFileTypeInfo, Material, DestinazioneAsset, DESTINAZIONE_LABELS, DESTINAZIONE_ICONS } from '@/types/material';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Upload, ArrowUpRight, Check, Loader2, UploadCloud, X, FileIcon, CalendarDays, Clock, Filter, PieChart, Info, Send, MessageSquare, Share2, Image as ImageIcon, Link as LinkIcon, ExternalLink, Plus, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function ClienteDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [externalLink, setExternalLink] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [destinazione, setDestinazione] = useState<DestinazioneAsset>('social');
  const [isUploading, setIsUploading] = useState(false);
  const [isRequestingUpgrade, setIsRequestingUpgrade] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [destFilter, setDestFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) setClienteId(userDoc.data().cliente_id);
      };
      fetchProfile();
    }
  }, [user, db]);

  const clientDocRef = useMemoFirebase(() => clienteId ? doc(db, 'clienti', clienteId) : null, [db, clienteId]);
  const { data: client, isLoading: isClientLoading } = useDoc<any>(clientDocRef);

  const postsQuery = useMemoFirebase(() => {
    return clienteId ? query(collection(db, 'clienti', clienteId, 'post'), orderBy('creato_il', 'desc')) : null;
  }, [db, clienteId]);
  const { data: posts, isLoading: isPostsLoading } = useCollection<any>(postsQuery);

  const materialsQuery = useMemoFirebase(() => {
    return clienteId ? query(collection(db, 'clienti', clienteId, 'materiali'), orderBy('creato_il', 'desc')) : null;
  }, [db, clienteId]);
  const { data: materials, isLoading: isMaterialsLoading } = useCollection<Material>(materialsQuery);

  const approvePost = (postId: string) => {
    if (!clienteId) return;
    const ref = doc(db, 'clienti', clienteId, 'post', postId);
    updateDoc(ref, { 
      stato: 'approvato', 
      aggiornato_il: serverTimestamp() 
    }).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'update' }));
    });
    toast({ title: "Post approvato!", description: "L'agenzia procederà alla pubblicazione." });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
      
      if (oversizedFiles.length > 0) {
        toast({
          variant: 'destructive',
          title: 'File troppo grande',
          description: `Uno o più file superano il limite di 50MB. Per favore, usa l'opzione "Link" per questi file.`,
        });
        const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);
        setSelectedFiles(prev => [...prev, ...validFiles]);
      } else {
        setSelectedFiles(prev => [...prev, ...files]);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!clienteId || !user) return;
    
    if (uploadType === 'file' && selectedFiles.length === 0) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Seleziona almeno un file.' });
      return;
    }
    if (uploadType === 'link' && !externalLink) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Inserisci un link.' });
      return;
    }

    setIsUploading(true);
    const matColRef = collection(db, 'clienti', clienteId, 'materiali');
    
    try {
      if (uploadType === 'file') {
        const promises = selectedFiles.map(file => 
          addDoc(matColRef, {
            nome_file: file.name,
            url_storage: null,
            caricato_da: user.uid,
            ruolo_caricatore: 'cliente',
            destinazione: destinazione,
            stato_validazione: 'in_attesa',
            note_rifiuto: null,
            creato_il: serverTimestamp()
          })
        );
        await Promise.all(promises);
      } else {
        await addDoc(matColRef, {
          nome_file: 'Link Esterno Inviato dal Cliente',
          url_storage: null,
          link_esterno: externalLink,
          caricato_da: user.uid,
          ruolo_caricatore: 'cliente',
          destinazione: destinazione,
          stato_validazione: 'in_attesa',
          note_rifiuto: null,
          creato_il: serverTimestamp()
        });
      }
      
      resetUploadForm();
      toast({ title: "Materiale inviato!", description: "Il team Nexus lo validerà a breve." });
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: matColRef.path, operation: 'create' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpgradeRequest = () => {
    if (!clienteId) return;
    setIsRequestingUpgrade(true);
    const clientRef = doc(db, 'clienti', clienteId);
    updateDoc(clientRef, { 
      richiesta_upgrade: true,
      aggiornato_il: serverTimestamp()
    })
    .then(() => toast({ title: "Richiesta inviata!", description: "L'agenzia è stata notificata." }))
    .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: clientRef.path, operation: 'update' })))
    .finally(() => setIsRequestingUpgrade(false));
  };

  const resetUploadForm = () => {
    setSelectedFiles([]);
    setExternalLink('');
    setDestinazione('social');
    setUploadType('file');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isClientLoading || !clienteId) return <div className="space-y-6 p-8"><Skeleton className="h-32 w-full" /><Skeleton className="h-64" /></div>;
  if (!client) return <div className="p-8">Errore caricamento dati cliente.</div>;

  const postTotali = client.post_totali || 0;
  const postUsati = posts?.length || 0;
  const postRimanenti = Math.max(0, postTotali - postUsati);
  const usagePercent = postTotali > 0 ? (postUsati / postTotali) * 100 : 0;

  const postsOnSelectedDate = posts?.filter((post: any) => {
    if (!post.data_pubblicazione || !selectedDate || typeof post.data_pubblicazione.toDate !== 'function') return false;
    const pubDate = post.data_pubblicazione.toDate();
    return pubDate.toDateString() === selectedDate.toDateString();
  }) || [];

  const daysWithPosts = posts?.filter((p: any) => p.data_pubblicazione && typeof p.data_pubblicazione.toDate === 'function').map((p: any) => p.data_pubblicazione.toDate().toDateString()) || [];

  const filteredMaterials = materials?.filter(mat => {
    const typeInfo = getFileTypeInfo(mat.nome_file, !!mat.link_esterno);
    const matchesTipo = tipoFilter === 'all' || typeInfo.type === tipoFilter;
    const matchesDest = destFilter === 'all' || mat.destinazione === destFilter;
    return matchesTipo && matchesDest;
  }) || [];

  const agencyMaterials = filteredMaterials.filter(m => m.ruolo_caricatore === 'admin');
  const clientMaterials = filteredMaterials.filter(m => m.ruolo_caricatore === 'cliente');

  const getGrouped = (mats: Material[]) => {
    return mats.reduce((acc: any, mat: Material) => {
      let date = 'Data non disponibile';
      if (mat.creato_il && typeof mat.creato_il.toDate === 'function') {
        date = mat.creato_il.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      if (!acc[date]) acc[date] = [];
      acc[date].push(mat);
      return acc;
    }, {});
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-gray-900">Ciao, {client.nome_azienda}</h1>
          <p className="text-muted-foreground">Ecco la situazione aggiornata delle tue attività.</p>
        </div>
        <Dialog onOpenChange={(open) => { if (!open) resetUploadForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 w-full md:w-auto h-12">
              <Upload className="w-4 h-4" /> Invia nuovo Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invia materiale all'agenzia</DialogTitle>
              <DialogDescription>Invia file multipli (max 50MB) o link per video pesanti.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <Tabs value={uploadType} onValueChange={(v: any) => setUploadType(v)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">File Locale</TabsTrigger>
                  <TabsTrigger value="link">Link Esterno</TabsTrigger>
                </TabsList>
                <TabsContent value="file" className="pt-4 space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${selectedFiles.length > 0 ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300'}`}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                    {selectedFiles.length > 0 ? (
                      <div className="w-full space-y-2">
                        {selectedFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-2 rounded border text-xs">
                            <span className="truncate flex-1 mr-2">{f.name}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); removeFile(i); }}><X className="w-3 h-3" /></Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-gray-300" />
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500">Trascina i tuoi file qui</p>
                          <p className="text-[10px] text-gray-400 mt-1">Limite 50MB per file.</p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="link" className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Link WeTransfer/Drive</Label>
                    <Input value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://..." />
                    <div className="flex items-start gap-2 bg-amber-50 p-2 rounded border border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-amber-700 leading-tight">Obbligatorio per video &gt; 50MB o file pesanti per non sovraccaricare la piattaforma.</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="space-y-2">
                <Label>Destinazione</Label>
                <Select value={destinazione} onValueChange={(val: any) => setDestinazione(val)}>
                  <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">📱 Social</SelectItem>
                    <SelectItem value="sito">🌐 Sito</SelectItem>
                    <SelectItem value="offline">🖨️ Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpload} disabled={isUploading} className="w-full bg-indigo-600">
                {isUploading ? <Loader2 className="animate-spin" /> : 'Invia Materiale'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="rounded-xl border-gray-200/50 shadow-md overflow-hidden">
            <CardHeader className="bg-indigo-600 text-white pb-6">
              <CardTitle className="text-xl font-headline flex items-center gap-2"><PieChart className="w-5 h-5" /> Stato Account</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Post Rimanenti</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-bold font-headline ${postRimanenti <= 1 ? 'text-red-600' : 'text-gray-900'}`}>{postRimanenti}</span>
                  <span className="text-gray-400 font-medium">/ {postTotali}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span className="text-gray-400">Utilizzo</span>
                  <span className={usagePercent > 80 ? 'text-red-600' : 'text-indigo-600'}>{postUsati} / {postTotali}</span>
                </div>
                <Progress value={usagePercent} className={`h-2 ${usagePercent > 80 ? '[&>div]:bg-red-500' : '[&>div]:bg-indigo-600'}`} />
              </div>
              {client.richiesta_upgrade ? (
                <div className="bg-indigo-50 text-indigo-700 text-[10px] font-bold p-3 rounded-lg flex items-center justify-center gap-2 border border-indigo-100 italic">Richiesta inviata</div>
              ) : (
                <Button variant="link" onClick={handleUpgradeRequest} disabled={isRequestingUpgrade} className="w-full text-indigo-600 p-0 font-bold">
                  {isRequestingUpgrade ? <Loader2 className="animate-spin" /> : <>Richiedi Post Extra <ArrowUpRight className="w-4 h-4" /></>}
                </Button>
              )}
            </CardContent>
          </Card>
          <Card className="p-4 border-gray-200/50 shadow-sm hidden lg:block">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              modifiers={{ hasPost: (date) => daysWithPosts.includes(date.toDateString()) }}
              modifiersClassNames={{ hasPost: "bg-indigo-100 text-indigo-900 font-bold border-b-2 border-indigo-600 rounded-none" }}
            />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <h2 className="text-xl font-headline font-bold">Piano Editoriale (PED)</h2>
            {isPostsLoading ? <Skeleton className="h-48" /> : postsOnSelectedDate.length > 0 ? (
              <div className="space-y-6">
                {postsOnSelectedDate.map((post: any) => {
                  const materialAssociato = materials?.find(m => m.id === post.materiale_id);
                  const typeInfo = materialAssociato ? getFileTypeInfo(materialAssociato.nome_file, !!materialAssociato.link_esterno) : null;
                  return (
                    <Card key={post.id} className="rounded-xl border-gray-200/60 overflow-hidden shadow-sm bg-white">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10"><AvatarFallback className="bg-indigo-600 text-white font-bold">{client.nome_azienda.charAt(0)}</AvatarFallback></Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm">{client.nome_azienda}</h3>
                              <Badge className={`${STATO_POST_COLORS[post.stato as StatoPost].bg} ${STATO_POST_COLORS[post.stato as StatoPost].text} border-none text-[9px]`}>{STATO_POST_LABELS[post.stato as StatoPost]}</Badge>
                            </div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Pianificato: {post.data_pubblicazione?.toDate().toLocaleString('it-IT')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-3 text-sm text-gray-700 whitespace-pre-wrap">{post.testo}</div>
                      {materialAssociato && (
                        <div className="relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                          {materialAssociato.link_esterno ? (
                            <div className="flex flex-col items-center bg-blue-50 w-full h-full justify-center">
                              <LinkIcon className="w-10 h-10 text-blue-400 mb-2" />
                              <a href={materialAssociato.link_esterno} target="_blank" className="text-xs bg-blue-600 text-white px-4 py-1 rounded">Scarica Asset</a>
                            </div>
                          ) : (
                            <div className="bg-gray-50 w-full h-full flex flex-col items-center justify-center">
                              {typeInfo?.icon && <typeInfo.icon className="w-12 h-12 text-gray-300" />}
                              <span className="text-[10px] px-4 truncate">{materialAssociato.nome_file}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-2 px-4 flex items-center justify-end border-t">
                        {post.stato === 'da_approvare' && (
                          <Button className="h-8 text-[10px] font-bold bg-emerald-600 gap-2" onClick={() => approvePost(post.id)}><Check className="w-4 h-4" /> Approva</Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : <div className="text-center py-10 bg-gray-50 rounded-xl">Nessun post per questa data.</div>}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-headline font-bold">Archivio Asset</h2>
            <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-xl border mb-6">
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[140px] text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti Tipi</SelectItem>
                  <SelectItem value="foto">📸 Foto</SelectItem>
                  <SelectItem value="video">🎥 Video</SelectItem>
                  <SelectItem value="grafica">🎨 Grafiche</SelectItem>
                  <SelectItem value="link">🔗 Link</SelectItem>
                </SelectContent>
              </Select>
              <Select value={destFilter} onValueChange={setDestFilter}>
                <SelectTrigger className="w-[140px] text-xs"><SelectValue placeholder="Dest." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte Dest.</SelectItem>
                  <SelectItem value="social">📱 Social</SelectItem>
                  <SelectItem value="sito">🌐 Sito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="nexus">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="nexus" className="flex-1">Inviati da Nexus (Agenzia)</TabsTrigger>
                <TabsTrigger value="client" className="flex-1">Inviati da Voi</TabsTrigger>
              </TabsList>

              {[
                { val: 'nexus', data: agencyMaterials },
                { val: 'client', data: clientMaterials }
              ].map(section => (
                <TabsContent key={section.val} value={section.val} className="space-y-6">
                  {Object.keys(getGrouped(section.data)).length > 0 ? (
                    Object.keys(getGrouped(section.data)).map(date => (
                      <div key={date} className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{date}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {getGrouped(section.data)[date].map((mat: Material) => {
                            const typeInfo = getFileTypeInfo(mat.nome_file, !!mat.link_esterno);
                            return (
                              <Card key={mat.id} className="p-4 flex flex-col gap-2 hover:border-indigo-200 transition-colors">
                                <div className="flex justify-between items-start">
                                  <div className={`p-2 ${typeInfo.bg} rounded`}><typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} /></div>
                                  <MaterialeStatoChip stato={mat.stato_validazione} />
                                </div>
                                <p className="font-bold text-xs truncate" title={mat.nome_file}>{mat.nome_file}</p>
                                {mat.link_esterno && <a href={mat.link_esterno} target="_blank" className="text-[10px] text-blue-600 underline font-bold">Apri Link</a>}
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : <div className="text-center py-10 text-gray-400 text-sm">Nessun asset trovato.</div>}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialeStatoChip({ stato }: { stato: StatoValidazione }) {
  return <Badge className={`${STATO_VALIDAZIONE_COLORS[stato].bg} ${STATO_VALIDAZIONE_COLORS[stato].text} border-none text-[9px]`}>{STATO_VALIDAZIONE_LABELS[stato]}</Badge>;
}
