
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Clock, MessageSquare, FileText, AlertTriangle, ChevronRight, Calendar } from 'lucide-react';
import { Notifica, TipoNotifica } from '@/types/notifica';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function ClienteNotifichePage() {
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
      router.push(`/cliente?postId=${n.riferimento_id}`);
    }
  };

  const getIcon = (tipo: TipoNotifica) => {
    switch (tipo) {
      case 'commento_nuovo': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'post_da_approvare': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'post_approvato': return <CheckCheck className="w-5 h-5 text-emerald-500" />;
      case 'post_revisione': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'materiale_validato': return <FileText className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) return <div className="space-y-4 p-8 md:p-12"><Skeleton className="h-12 w-1/4"/><Skeleton className="h-64 w-full"/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-gray-900">Le Tue Notifiche</h1>
          <p className="text-muted-foreground">Rimani aggiornato sulla produzione dei tuoi contenuti.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50">
          <CheckCheck className="w-4 h-4" /> Segna come lette
        </Button>
      </div>

      <div className="space-y-3">
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <Card 
              key={n.id} 
              className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${!n.letta ? 'border-l-indigo-600 bg-indigo-50/10' : 'border-l-transparent opacity-75'}`}
              onClick={() => handleNotificationClick(n)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1 p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                  {getIcon(n.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm ${!n.letta ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                      {n.messaggio}
                    </p>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 whitespace-nowrap ml-4">
                      <Calendar className="w-3 h-3" /> {n.creato_il?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {formatDistanceToNow(n.creato_il?.toDate(), { addSuffix: true, locale: it })}
                    </p>
                    {n.riferimento_tipo === 'post' && (
                      <Badge variant="outline" className="text-[8px] font-bold py-0 h-4 border-indigo-200 text-indigo-600 uppercase">Apri nel Feed</Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 self-center" />
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-16 text-center border-dashed border-gray-200 bg-gray-50/50">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">Tutto tranquillo</h3>
            <p className="text-gray-400 text-sm mt-1">Non hai ancora ricevuto notifiche dal tuo team dedicato.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
