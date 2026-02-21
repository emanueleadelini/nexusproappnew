
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
import { Upload, ArrowUpRight, Check, Loader2, UploadCloud, X, FileIcon, CalendarDays, Clock, Filter, PieChart, Info, Send, MessageSquare, Share2, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ClienteDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!clienteId || !selectedFile || !user) return;
    setIsUploading(true);
    
    const matColRef = collection(db, 'clienti', clienteId, 'materiali');
    const matData = {
      nome_file: selectedFile.name,
      url_storage: null,
      caricato_da: user.uid,
      destinazione: destinazione,
      stato_validazione: 'in_attesa',
      note_rifiuto: null,
      creato_il: serverTimestamp()
    };

    addDoc(matColRef, matData)
      .then(() => {
        resetUploadForm();
        toast({ title: "Materiale inviato!", description: "Il team Nexus lo validerà a breve." });
      })
      .catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: matColRef.path, operation: 'create', requestResourceData: matData }));
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const handleUpgradeRequest = () => {
    if (!clienteId) return;
    setIsRequestingUpgrade(true);
    
    const clientRef = doc(db, 'clienti', clienteId);
    updateDoc(clientRef, { 
      richiesta_upgrade: true,
      aggiornato_il: serverTimestamp()
    })
    .then(() => {
      toast({ title: "Richiesta inviata!", description: "L'agenzia è stata notificata." });
    })
    .catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: clientRef.path, operation: 'update' }));
    })
    .finally(() => {
      setIsRequestingUpgrade(false);
    });
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setDestinazione('social');
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
    const typeInfo = getFileTypeInfo(mat.nome_file);
    const matchesTipo = tipoFilter === 'all' || typeInfo.type === tipoFilter;
    const matchesDest = destFilter === 'all' || mat.destinazione === destFilter;
    return matchesTipo && matchesDest;
  }) || [];

  const groupedMaterials = filteredMaterials.reduce((acc: any, mat: Material) => {
    let date = 'Data non disponibile';
    if (mat.creato_il && typeof mat.creato_il.toDate === 'function') {
      date = mat.creato_il.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (!acc[date]) acc[date] = [];
    acc[date].push(mat);
    return acc;
  }, {});

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invia materiale all'agenzia</DialogTitle>
              <DialogDescription>La data di invio verrà registrata automaticamente dal sistema.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>File da caricare</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${selectedFile ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  {selectedFile ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-indigo-600 p-2 rounded-lg mb-2"><FileIcon className="w-6 h-6 text-white" /></div>
                      <span className="text-sm font-semibold text-gray-900 truncate max-w-[250px]">{selectedFile.name}</span>
                      <Button type="button" variant="ghost" size="sm" className="mt-2 text-red-500 hover:text-red-600 h-7" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                        <X className="w-3 h-3 mr-1" /> Rimuovi
                      </Button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-gray-300" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Seleziona un file per l'invio</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Destinazione d'uso prevista</Label>
                <Select value={destinazione} onValueChange={(val: DestinazioneAsset) => setDestinazione(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona destinazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">📱 Social Media</SelectItem>
                    <SelectItem value="sito">🌐 Sito Web</SelectItem>
                    <SelectItem value="offline">🖨️ Grafiche Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full bg-indigo-600 h-11">
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
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <PieChart className="w-5 h-5" /> Stato Account
              </CardTitle>
              <CardDescription className="text-indigo-100 text-xs">
                Contatore crediti Piano Editoriale
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Post Rimanenti nel Mese</span>
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
                  I crediti sono calcolati in tempo reale in base ai post inseriti nel calendario editoriale.
                </p>
              </div>

              {client.richiesta_upgrade ? (
                <div className="bg-indigo-50 text-indigo-700 text-[10px] font-bold p-3 rounded-lg flex items-center justify-center gap-2 border border-indigo-100 italic">
                  <Send className="w-3 h-3" /> Richiesta inviata all'agenzia
                </div>
              ) : (
                <Button 
                  variant="link" 
                  onClick={handleUpgradeRequest}
                  disabled={isRequestingUpgrade}
                  className="w-full text-indigo-600 p-0 flex items-center justify-center gap-1 font-bold"
                >
                  {isRequestingUpgrade ? <Loader2 className="animate-spin w-4 h-4" /> : <>Richiedi Post Extra <ArrowUpRight className="w-4 h-4" /></>}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="p-4 border-gray-200/50 shadow-sm hidden lg:block">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Calendario PED</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-none"
              modifiers={{
                hasPost: (date) => daysWithPosts.includes(date.toDateString())
              }}
              modifiersClassNames={{
                hasPost: "bg-indigo-100 text-indigo-900 font-bold border-b-2 border-indigo-600 rounded-none"
              }}
            />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                Piano Editoriale (PED)
                {selectedDate && <span className="text-sm font-normal text-gray-400"> - {selectedDate.toLocaleDateString('it-IT')}</span>}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)} className="text-indigo-600">Vedi tutti</Button>
            </div>

            <div className="lg:hidden mb-4">
              <Card className="p-4 border-gray-200/50">
                 <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md mx-auto"
                />
              </Card>
            </div>

            {isPostsLoading ? <Skeleton className="h-48" /> : postsOnSelectedDate.length > 0 ? (
              <div className="space-y-6">
                {postsOnSelectedDate.map((post: any) => {
                  const materialAssociato = materials?.find(m => m.id === post.materiale_id);
                  const typeInfo = materialAssociato ? getFileTypeInfo(materialAssociato.nome_file) : null;

                  return (
                    <Card key={post.id} className="rounded-xl border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                      {/* Social Header */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-gray-100">
                            <AvatarFallback className="bg-indigo-600 text-white font-bold">
                              {client.nome_azienda.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-gray-900">{client.nome_azienda}</h3>
                              <Badge className={`${STATO_POST_COLORS[post.stato as StatoPost].bg} ${STATO_POST_COLORS[post.stato as StatoPost].text} border-none font-medium text-[9px] py-0 px-1.5`}>
                                {STATO_POST_LABELS[post.stato as StatoPost]}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              Pianificato: {post.data_pubblicazione && typeof post.data_pubblicazione.toDate === 'function' ? post.data_pubblicazione.toDate().toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Orario non pianificato'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300">
                           <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Social Copy */}
                      <div className="px-4 pb-3">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {post.testo}
                        </p>
                      </div>

                      {/* Social Media Area */}
                      {materialAssociato ? (
                        <div className="relative aspect-video bg-gray-100 border-y border-gray-50 flex flex-col items-center justify-center overflow-hidden">
                           {typeInfo?.type === 'foto' || typeInfo?.type === 'grafica' ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-300">
                                <ImageIcon className="w-12 h-12 mb-2" />
                                <span className="text-[10px] font-medium px-4 text-center truncate w-full">{materialAssociato.nome_file}</span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                                <typeInfo?.icon className="w-12 h-12 mb-2" />
                                <span className="text-[10px] font-medium px-4 text-center truncate w-full">{materialAssociato.nome_file}</span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                               <Badge variant="secondary" className="bg-white/90 backdrop-blur shadow-sm text-[9px] uppercase font-bold">
                                 {typeInfo?.label}
                               </Badge>
                            </div>
                        </div>
                      ) : (
                        <div className="h-px bg-gray-100" />
                      )}

                      {/* Social Actions */}
                      <div className="p-2 px-4 flex items-center justify-between border-t border-gray-50">
                          <div className="flex gap-4 text-gray-400">
                             <div className="flex items-center gap-1 text-[10px] font-bold uppercase"><MessageSquare className="w-3.5 h-3.5" /> Commenti</div>
                             <div className="flex items-center gap-1 text-[10px] font-bold uppercase"><Share2 className="w-3.5 h-3.5" /> Condividi</div>
                          </div>
                          {post.stato === 'da_approvare' && (
                            <Button className="h-8 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 uppercase tracking-tighter gap-2" onClick={() => approvePost(post.id)}>
                              <Check className="w-4 h-4" /> Approva Post
                            </Button>
                          )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50/50 rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground text-sm">Nessun post programmato per questa data.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-headline font-bold flex items-center gap-2">Archivio Asset</h2>
            <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
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
            </div>

            {isMaterialsLoading ? <Skeleton className="h-64" /> : Object.keys(groupedMaterials).length > 0 ? (
              Object.keys(groupedMaterials).map(date => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border">{date}</h3>
                    <div className="h-px bg-gray-100 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groupedMaterials[date].map((mat: Material) => {
                      const typeInfo = getFileTypeInfo(mat.nome_file);
                      const DestIcon = DESTINAZIONE_ICONS[mat.destinazione] || FolderOpen;
                      const timeStr = mat.creato_il && typeof mat.creato_il.toDate === 'function' ? mat.creato_il.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
                      
                      return (
                        <Card key={mat.id} className="rounded-xl border-gray-200/50 shadow-sm hover:border-indigo-200 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2 ${typeInfo.bg} rounded-lg`}><typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} /></div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge variant="outline" className="text-[8px] font-bold uppercase py-0 px-2 flex gap-1 items-center bg-gray-50">
                                  <DestIcon className="w-2 h-2" /> {DESTINAZIONE_LABELS[mat.destinazione]}
                                </Badge>
                                <Badge className={`${STATO_VALIDAZIONE_COLORS[mat.stato_validazione].bg} ${STATO_VALIDAZIONE_COLORS[mat.stato_validazione].text} border-none text-[9px] py-0`}>
                                  {STATO_VALIDAZIONE_LABELS[mat.stato_validazione]}
                                </Badge>
                              </div>
                            </div>
                            <p className="font-semibold text-sm truncate mb-1" title={mat.nome_file}>{mat.nome_file}</p>
                            {timeStr && <p className="text-[9px] text-gray-400 flex items-center gap-1"><Clock className="w-2 h-2"/> Inviato alle {timeStr}</p>}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50/50 rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground text-sm">Nessun materiale trovato.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
