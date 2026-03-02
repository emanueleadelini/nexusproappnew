
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Users, CheckCircle2, AlertCircle, PieChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo, useState, useEffect } from 'react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#22c55e', '#ef4444'];

export default function AnalyticsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  // Evitiamo problemi di idratazione per Recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'clienti'), orderBy('nome_azienda'));
  }, [db, user]);

  const { data: clients, isLoading: isClientsLoading } = useCollection<any>(clientsQuery);

  // Calcolo statistiche aggregate (uso useMemo standard, non useMemoFirebase)
  const stats = useMemo(() => {
    if (!clients) return null;

    const totalClients = clients.length;
    const totalUsed = clients.reduce((acc, c) => acc + (c.post_usati || 0), 0);
    const totalBudget = clients.reduce((acc, c) => acc + (c.post_totali || 0), 0);
    const upgradeRequests = clients.filter(c => c.richiesta_upgrade).length;
    const avgUsage = totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0;

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

  if (isClientsLoading || !user || !isMounted) {
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-headline font-bold text-white">Analytics Hub</h2>
        <p className="text-slate-400 text-sm">Indicatori di performance e saturazione risorse.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Clienti Hub</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalClients}</div>
            <p className="text-[10px] text-slate-500 mt-1">Aziende attive nel sistema</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Output Mensile</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalUsed}</div>
            <p className="text-[10px] text-slate-500 mt-1">Post generati questo mese</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Saturazione</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.avgUsage.toFixed(1)}%</div>
            <p className="text-[10px] text-slate-500 mt-1">Media utilizzo crediti post</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-amber-500">Upgrades</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats?.upgradeRequests}</div>
            <p className="text-[10px] text-amber-600 mt-1">Richieste espansione piano</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Distribuzione Carico
            </CardTitle>
            <CardDescription className="text-slate-500">Confronto tra post usati e budget totale per cliente.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={stats?.creditData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="usati" fill="var(--color-usati)" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="totali" fill="var(--color-totali)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-white">
              <PieChart className="w-5 h-5 text-indigo-400" /> Risorse Globali
            </CardTitle>
            <CardDescription className="text-slate-500">Ripartizione crediti impegnati vs residui.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
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
                  <Cell fill="#6366f1" stroke="none" />
                  <Cell fill="rgba(255,255,255,0.05)" stroke="none" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white">{stats?.avgUsage.toFixed(0)}%</span>
                <span className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Capacità</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
