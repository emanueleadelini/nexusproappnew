'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Users, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#22c55e', '#ef4444'];

export default function AnalyticsPage() {
  const db = useFirestore();
  
  const clientsQuery = useMemoFirebase(() => {
    return query(collection(db, 'clienti'), orderBy('nome_azienda'));
  }, [db]);

  const { data: clients, isLoading: isClientsLoading } = useCollection<any>(clientsQuery);

  // Calcolo statistiche aggregate dai dati dei clienti
  const stats = useMemoFirebase(() => {
    if (!clients) return null;

    const totalClients = clients.length;
    const totalUsed = clients.reduce((acc, c) => acc + (c.post_usati || 0), 0);
    const totalBudget = clients.reduce((acc, c) => acc + (c.post_totali || 0), 0);
    const upgradeRequests = clients.filter(c => c.richiesta_upgrade).length;
    const avgUsage = totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0;

    // Dati per il grafico dei crediti (Top 6 per leggibilità)
    const creditData = clients.slice(0, 6).map(c => ({
      name: c.nome_azienda,
      usati: c.post_usati || 0,
      totali: c.post_totali || 0,
    }));

    return { totalClients, totalUsed, totalBudget, upgradeRequests, avgUsage, creditData };
  }, [clients]);

  const chartConfig = {
    usati: { label: "Post Usati", color: "hsl(var(--primary))" },
    totali: { label: "Budget Totale", color: "hsl(var(--muted))" },
  };

  if (isClientsLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold">Reportistica Nexus</h2>
        <p className="text-muted-foreground">Monitoraggio real-time di crediti e produzione contenuti.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border-gray-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-400">Clienti Attivi</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Aziende in gestione</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-gray-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-400">Post Prodotti</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsed}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Totale post creati nel mese</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-gray-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-gray-400">Utilizzo Crediti</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgUsage.toFixed(1)}%</div>
            <p className="text-[10px] text-muted-foreground mt-1">Media saturazione piani</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-amber-200 bg-amber-50/30 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-amber-600">Richieste Upgrade</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{stats?.upgradeRequests}</div>
            <p className="text-[10px] text-amber-600 mt-1">Clienti che chiedono post extra</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-xl border-gray-200/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Utilizzo Crediti per Cliente
            </CardTitle>
            <CardDescription>Confronto tra post utilizzati e budget totale (Top 6).</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={stats?.creditData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="usati" fill="var(--color-usati)" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="totali" fill="var(--color-totali)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-200/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-600" /> Saturazione Risorse
            </CardTitle>
            <CardDescription>Ripartizione tra crediti impegnati e residui globali.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Usati', value: stats?.totalUsed },
                    { name: 'Rimanenti', value: (stats?.totalBudget || 0) - (stats?.totalUsed || 0) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{stats?.avgUsage.toFixed(0)}%</span>
                <span className="text-[8px] uppercase font-bold text-gray-400">Media</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-gray-200/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-indigo-600 text-white">
          <CardTitle className="text-sm font-bold uppercase tracking-widest">Focus Clienti Critici</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {clients?.filter(c => (c.post_usati / c.post_totali) > 0.8).map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                    {c.nome_azienda.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{c.nome_azienda}</h4>
                    <p className="text-[10px] text-gray-400">{c.settore}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">{c.post_usati} / {c.post_totali}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Post Esauriti</div>
                </div>
              </div>
            ))}
            {clients?.filter(c => (c.post_usati / c.post_totali) > 0.8).length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm italic">Nessun cliente in soglia critica di crediti.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
