
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, writeBatch, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Clock, MessageSquare, FileText, AlertTriangle, ChevronRight, Calendar } from 'lucide-react';
import { Notifica, TipoNotifica } from '@/types/notifica';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function AdminNotifichePage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'notifiche'),
      orderBy('creato_il', 'desc')
    );
  }, [db, user]);

  const { data: notifications, isLoading } = useCollection<Notifica>(notificationsQuery);

  const markAllAsRead = async () => {
    if (!user || !notifications) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.letta).forEach(n => {
      const ref = doc(db, 'users', user.uid, 'notifiche', n.id);
      batch.update(ref, { letta: true, letta_il: serverTimestamp() });
    });
    await batch.commit();
  };

  const handleNotificationClick = async (n: Notifica) => {
    if (!user) return;
    if (!n.letta) {
      await updateDoc(doc(db, 'users', user.uid, 'notifiche', n.id), {
        letta: true,
        letta_il: serverTimestamp()
      });
    }

    if (n.riferimento_tipo === 'post' && n.cliente_id) {
      router.push(`/admin/clienti/${n.cliente_id}?postId=${n.riferimento_id}`);
    }
  };

  const getIcon = (tipo: TipoNotifica) => {
    switch (tipo) {
      case 'commento_nuovo': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'post_da_approvare': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'post_approvato': return <CheckCheck className="w-5 h-5 text-emerald-500" />;
      case 'post_revisione': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'materiale_caricato': return <FileText className="w-5 h-5 text-indigo-500" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-1/4"/><Skeleton className="h-64 w-full"/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900">Centro Notifiche</h1>
          <p className="text-slate-500 text-sm">Monitora l'attività dei clienti e i feedback sui post.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl">
          <CheckCheck className="w-4 h-4" /> Segna tutte come lette
        </Button>
      </div>

      <div className="space-y-2">
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`hover:shadow-sm transition-all cursor-pointer border-l-4 rounded-2xl ${!n.letta ? 'border-l-indigo-500 bg-white shadow-sm' : 'border-l-transparent bg-white opacity-60'}`}
              onClick={() => handleNotificationClick(n)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-0.5 p-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                  {getIcon(n.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm ${!n.letta ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                      {n.messaggio}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap ml-4 shrink-0">
                      <Calendar className="w-3 h-3" /> {n.creato_il?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {formatDistanceToNow(n.creato_il?.toDate(), { addSuffix: true, locale: it })}
                    </p>
                    {n.riferimento_tipo === 'post' && (
                      <Badge className="text-[8px] font-bold py-0 h-4 bg-indigo-50 text-indigo-600 border-none">VEDI POST</Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 self-center shrink-0" />
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 italic">Nessuna notifica presente nello storico.</p>
          </div>
        )}
      </div>
    </div>
  );
}
