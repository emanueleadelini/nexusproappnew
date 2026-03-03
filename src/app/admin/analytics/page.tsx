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
  const { user, isAdmin } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  // Evitiamo problemi di idratazione per Recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const clientsQuery = useMemoFirebase(() => {
    if (!user || !isAdmin) return null;
    return query(collection(db, 'clienti'), orderBy('nome_azienda'));
  }, [db, user, isAdmin]);

  const { data: clients, isLoading: isClientsLoading } = useCollection<any>(clientsQuery);

  // Calcolo statistiche aggregate
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

  if (isClientsLoading || !user || !isMounted || !isAdmin) {
    return (
      <div className="space-y-8 p-4">
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
        <h2 className="text-3xl font-headline font-bold text-slate-900">Analytics Hub</h2>
        <p className="text-slate-500 text-sm">Indicatori di performance e saturazione risorse.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Clienti Hub</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalClients}</div>
            <p className="text-[10px] text-slate-500 mt-1">Aziende attive nel sistema</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Output Mensile</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalUsed}</div>
            <p className="text-[10px] text-slate-500 mt-1">Post generati questo mese</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Saturazione</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.avgUsage.toFixed(1)}%</div>
            <p className="text-[10px] text-slate-500 mt-1">Media utilizzo crediti post</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-amber-600">Upgrades</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats?.upgradeRequests}</div>
            <p className="text-[10px] text-amber-600/70 mt-1">Richieste espansione piano</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-slate-900">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Distribuzione Carico
            </CardTitle>
            <CardDescription className="text-slate-500">Confronto tra post usati e budget totale per cliente.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={stats?.creditData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="usati" fill="var(--color-usati)" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="totali" fill="var(--color-totali)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-slate-900">
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
                  <Cell fill="#f1f5f9" stroke="none" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-900">{stats?.avgUsage.toFixed(0)}%</span>
                <span className="text-[8px] uppercase font-black text-slate-400 tracking-widest">Capacità</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
