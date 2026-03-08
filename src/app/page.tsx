"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, ArrowRight, Sparkles, Zap,
  Users, CheckCircle2,
  Lock, Mail, Play, FileText,
  Bell, RefreshCw, Calculator, MessageSquare,
  TrendingUp, Clock, Award, Star, ArrowUpRight,
  Building2, UtensilsCrossed, Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ProdottoLead, TipoLead } from '@/types/lead';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [provaOpen, setProvaOpen] = useState<ProdottoLead | null>(null);
  const [provaForm, setProvaForm] = useState({ nome: '', email: '', telefono: '', azienda: '', messaggio: '' });
  const [provaLoading, setProvaLoading] = useState(false);
  const [demoForm, setDemoForm] = useState({ nome: '', email: '', azienda: '', prodotto: '' as ProdottoLead | '', messaggio: '' });
  const [demoLoading, setDemoLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoLoading(true);
    try {
      await addDoc(collection(db, 'leads'), {
        ...demoForm,
        prodotto: demoForm.prodotto || 'altro',
        tipo: 'demo' as TipoLead,
        stato: 'nuovo',
        creato_il: serverTimestamp(),
      });
      toast.success('Richiesta inviata! Ti contatteremo entro 24 ore.');
      setContactOpen(false);
      setDemoForm({ nome: '', email: '', azienda: '', prodotto: '', messaggio: '' });
    } catch {
      toast.error('Errore nell\'invio. Riprova tra poco.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleProvaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvaLoading(true);
    try {
      await addDoc(collection(db, 'leads'), {
        ...provaForm,
        prodotto: provaOpen,
        tipo: 'prova' as TipoLead,
        stato: 'nuovo',
        creato_il: serverTimestamp(),
      });
      toast.success('Richiesta inviata! Ti contatteremo presto.');
      setProvaOpen(null);
      setProvaForm({ nome: '', email: '', telefono: '', azienda: '', messaggio: '' });
    } catch {
      toast.error('Errore nell\'invio. Riprova tra poco.');
    } finally {
      setProvaLoading(false);
    }
  };

  const products = [
    {
      id: 'nexuspro',
      name: 'Nexus Pro',
      tagline: 'Per Agenzie di Comunicazione',
      description: 'Hub digitale completo per gestire clienti, contenuti e workflow di approvazione. Silenzio assenso in 24h.',
      icon: Megaphone,
      color: 'from-violet-600 to-purple-600',
      bgGlow: 'bg-violet-500/20',
      stats: [
        { value: '150+', label: 'Agenzie' },
        { value: '2M+', label: 'Contenuti' },
        { value: '98%', label: 'Approvazione' }
      ],
      features: ['Workflow Silenzio Assenso', 'Dashboard Clienti', 'Analytics Real-time', 'AI Content Assistant'],
      cta: 'Prova Nexus Pro',
      demo: 'Guarda Demo',
      href: '/nexuspro'
    },
    {
      id: 'placeat',
      name: 'Placeat',
      tagline: 'Per Ristoranti, Pizzerie, Bar & Agriturismi',
      description: 'Gestione tavoli interattiva con piantina personalizzata e sistema automatico di raccolta recensioni Google.',
      icon: UtensilsCrossed,
      color: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/20',
      stats: [
        { value: '300%', label: '+ Recensioni' },
        { value: '10min', label: 'Setup' },
        { value: '4.8★', label: 'Media' }
      ],
      features: ['Editor Piantina Interattivo', 'QR Code Recensioni', 'Prenotazioni Online', 'ReviewFlow Automatico'],
      cta: 'Prova Placeat',
      demo: 'Guarda Demo',
      href: '/placeat'
    }
  ];

  const professionalTools = [
    {
      id: 'fatturaparse',
      name: 'FatturaParse',
      tagline: 'Estrazione Automatica Fatture',
      description: 'Estrazione dati da fatture elettroniche XML (FatturaPA) e PDF. Zero data entry, 100% accuratezza su XML.',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      badge: 'ROI in 2 settimane',
      specs: [
        { label: 'XML', value: '17 Campi' },
        { label: 'Accuracy', value: '100%' },
        { label: 'Speed', value: '0.3s/doc' }
      ],
      features: [
        'FatturaPA XML: estrazione deterministica',
        'PDF: regex + AI fallback (gpt-4.1-mini)',
        'Output Google Sheets con dedup',
        '17 campi estratti per fattura'
      ],
      value: '€3.000',
      price: 'da €49/mese',
      cta: 'Richiedi Demo',
      demo: 'Guarda Demo'
    },
    {
      id: 'normaguard',
      name: 'NormaGuard',
      tagline: 'Monitoraggio Normativa Fiscale',
      description: 'Monitoraggio automatico normativa fiscale e professionale. Gazzetta Ufficiale, Agenzia delle Entrate, CNDCEC.',
      icon: Bell,
      color: 'from-amber-500 to-orange-500',
      badge: 'Risparmio 5h/settimana',
      specs: [
        { label: 'Fonti', value: '3' },
        { label: 'Classificazione', value: 'AI' },
        { label: 'Bollettino', value: 'Daily' }
      ],
      features: [
        'RSS da GU, AdE, CNDCEC',
        'Classificazione per rilevanza',
        'Categorizzazione: fiscale, lavoro, società',
        'Bollettino su Google Sheets'
      ],
      value: '€1.000',
      price: 'da €49/mese',
      cta: 'Richiedi Demo',
      demo: 'Guarda Demo'
    },
    {
      id: 'fatturamatch',
      name: 'FatturaMatch',
      tagline: 'Riconciliazione Automatica',
      description: 'Riconciliazione automatica fatture emesse vs ricevute. Importa CSV, trova discrepanze, genera report.',
      icon: RefreshCw,
      color: 'from-pink-500 to-rose-500',
      badge: 'Da 30min a 3sec',
      specs: [
        { label: 'Matched', value: '247' },
        { label: 'Warning', value: '3' },
        { label: 'Accuracy', value: '98.4%' }
      ],
      features: [
        'Import CSV con rilevamento colonne',
        'Matching fuzzy numero fattura',
        'Tolleranza importo configurabile',
        'Report per severità'
      ],
      value: '€1.500',
      price: 'da €49/mese',
      cta: 'Richiedi Demo',
      demo: 'Guarda Demo'
    },
    {
      id: 'fiscoauto',
      name: 'FiscoAuto',
      tagline: 'Automazione Dichiarazioni Fiscali',
      description: 'Automazione dichiarazioni fiscali e liquidazioni IVA. Calcola IVA dovuta, ritenute, genera bozze F24.',
      icon: Calculator,
      color: 'from-indigo-500 to-blue-600',
      badge: 'Da 4h a 3sec',
      specs: [
        { label: 'IVA', value: '4 Aliquote' },
        { label: 'F24', value: 'Auto' },
        { label: 'Breakdown', value: 'Full' }
      ],
      features: [
        'Liquidazione IVA automatica',
        'Bozza F24 codici tributo corretti',
        'Breakdown per aliquota IVA',
        'Input da CSV o Google Sheets'
      ],
      value: '€2.000',
      price: 'da €49/mese',
      cta: 'Richiedi Demo',
      demo: 'Guarda Demo'
    },
    {
      id: 'studioflow',
      name: 'StudioFlow',
      tagline: 'CRM per Studi Professionali',
      description: 'CRM automatizzato per studi professionali. Promemoria scadenze, follow-up clienti, raccolta documenti.',
      icon: MessageSquare,
      color: 'from-emerald-500 to-green-600',
      badge: 'Zero scadenze perse',
      specs: [
        { label: 'Scadenze', value: '2026' },
        { label: 'Promemoria', value: 'Auto' },
        { label: 'Follow-up', value: 'Smart' }
      ],
      features: [
        'Calendario scadenze fiscali 2026',
        'Promemoria automatici',
        'Follow-up clienti inattivi',
        'Bozze Gmail con labels'
      ],
      value: '€1.500',
      price: 'da €49/mese',
      cta: 'Richiedi Demo',
      demo: 'Guarda Demo'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl blur-sm" />
                <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  AD Next Lab
                </span>
                <span className="hidden sm:block text-xs text-slate-500">Innovation Studio</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: 'Prodotti', id: 'prodotti' },
                { label: 'Tool Professionali', id: 'tools' },
                { label: 'Processo', id: 'processo' },
                { label: 'Contatti', id: 'contatti' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                <Lock className="w-4 h-4" />
                Area Clienti
              </a>
              <Button
                onClick={() => setContactOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-indigo-500/25"
              >
                Inizia Ora
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950/98 backdrop-blur-xl border-b border-slate-800">
            <div className="px-4 py-6 space-y-2">
              {[
                { label: 'Prodotti', id: 'prodotti' },
                { label: 'Tool Professionali', id: 'tools' },
                { label: 'Processo', id: 'processo' },
                { label: 'Contatti', id: 'contatti' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <a href="/login" className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg">
                <Lock className="w-4 h-4" />
                Area Clienti
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION - IMPACTANTE */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-slate-950">
          {/* Gradient Orbs */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-1000 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
              left: `${mousePosition.x * 30}%`,
              top: `${mousePosition.y * 30}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
              right: `${(1 - mousePosition.x) * 20}%`,
              bottom: `${(1 - mousePosition.y) * 20}%`,
              transform: 'translate(50%, 50%)'
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
              left: '20%',
              bottom: '10%'
            }}
          />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-indigo-500/40 rounded-full animate-pulse"
              style={{
                left: `${(i * 17) % 100}%`,
                top: `${(i * 23) % 100}%`,
                animationDelay: `${(i * 0.3) % 3}s`,
                animationDuration: `${2 + ((i * 0.5) % 3)}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-sm text-indigo-300">⚡ Automazione • Strategia • Formazione Finanziata</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                <span className="block text-white">Smetti di rincorrere</span>
                <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  il mercato. Inizia ad automatizzarlo.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Dimentica i software generici. In AD Next Lab uniamo <strong>strumenti AI proprietari</strong>, consulenza strategica e <span className="text-emerald-400">formazione a costo zero</span> per trasformare la tua PMI in una macchina autonoma.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Button
                  size="lg"
                  onClick={() => scrollToSection('prodotti')}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 px-8 h-14 text-lg shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                >
                  Esplora i Software
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setContactOpen(true)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 h-14 text-lg"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Scopri il Metodo Lab
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Setup in 10 minuti</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Nessun contratto</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Supporto dedicato</span>
                </div>
              </div>
            </div>

            {/* Right Content - Product Cards Stack */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-emerald-500/20 rounded-3xl blur-3xl" />

                {/* Floating Cards */}
                <div className="absolute top-0 right-0 w-64 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Nexus Pro</div>
                        <div className="text-xs text-slate-400">Agenzie</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">98%</div>
                    <div className="text-xs text-slate-500">Tasso approvazione</div>
                  </div>
                </div>

                <div className="absolute top-24 left-0 w-64 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Placeat</div>
                        <div className="text-xs text-slate-400">Ristoranti</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">+300%</div>
                    <div className="text-xs text-slate-500">Recensioni Google</div>
                  </div>
                </div>

                <div className="absolute bottom-12 right-8 w-64 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">FatturaParse</div>
                        <div className="text-xs text-slate-400">Commercialisti</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">0.3s</div>
                    <div className="text-xs text-slate-500">Per fattura</div>
                  </div>
                </div>

                {/* Center Stats */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-2xl">
                    <div className="text-4xl font-bold text-white mb-1">5</div>
                    <div className="text-sm text-indigo-200">Tool Pronti</div>
                    <div className="mt-3 flex items-center gap-1 text-xs text-indigo-300">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Testati & Verificati</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 pt-8 border-t border-slate-800/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: '150+', label: 'Clienti Attivi', icon: Users },
                { value: '5', label: 'Tool Pronti', icon: Zap },
                { value: '2M+', label: 'Processi Automatizzati', icon: TrendingUp },
                { value: '24h', label: 'Supporto Dedicato', icon: Clock }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="prodotti" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              I Nostri Prodotti
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Soluzioni per Ogni Settore
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Software specializzati, pronti all'uso, con risultati garantiti dal primo giorno.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="group bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2">
                    {/* Left - Visual */}
                    <div className={`relative p-8 bg-gradient-to-br ${product.color} overflow-hidden`}>
                      <div className={`absolute inset-0 ${product.bgGlow} blur-3xl`} />
                      <div className="relative">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                          <product.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                        <p className="text-white/80 text-sm">{product.tagline}</p>

                        {/* Stats */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                          {product.stats.map((stat, i) => (
                            <div key={i} className="text-center">
                              <div className="text-xl font-bold text-white">{stat.value}</div>
                              <div className="text-xs text-white/60">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right - Content */}
                    <div className="p-8">
                      <p className="text-slate-400 mb-6">{product.description}</p>

                      <ul className="space-y-3 mb-8">
                        {product.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="flex gap-3">
                        <Button
                          className={`flex-1 bg-gradient-to-r ${product.color} hover:opacity-90 text-white border-0`}
                          onClick={() => setProvaOpen(product.id as ProdottoLead)}
                        >
                          {product.cta}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROFESSIONAL TOOLS SECTION */}
      <section id="tools" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/2 left-0 w-1/2 h-1/2 bg-indigo-600/5 blur-[150px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Suite Professionale
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              5 Tool per Studi Professionali
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Automazione completa per commercialisti, consulenti e studi professionali.
              <span className="text-emerald-400"> Testati, pronti, risultati dal giorno 1.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionalTools.map((tool) => (
              <Card key={tool.id} className="group bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-slate-800 text-slate-300 border-slate-700">
                      {tool.badge}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{tool.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{tool.tagline}</p>
                  <p className="text-slate-400 text-sm mb-6">{tool.description}</p>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {tool.specs.map((spec, i) => (
                      <div key={i} className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <div className="text-lg font-bold text-white">{spec.value}</div>
                        <div className="text-xs text-slate-500">{spec.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {tool.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div>
                      <div className="text-xs text-slate-500 line-through">{tool.value}</div>
                      <div className="text-lg font-bold text-emerald-400">{tool.price}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setContactOpen(true)}
                        className={`bg-gradient-to-r ${tool.color} hover:opacity-90 text-white border-0`}
                      >
                        {tool.cta}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bundle CTA */}
          <div className="mt-12 text-center">
            <Card className="inline-block bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border-indigo-500/30">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="text-left">
                  <div className="text-lg font-bold text-white mb-1">Bundle Completo</div>
                  <div className="text-sm text-slate-400">Tutti i 5 tool a €199/mese invece di €245</div>
                </div>
                <Button
                  onClick={() => setContactOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white whitespace-nowrap"
                >
                  Richiedi Offerta Bundle
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="processo" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/20">
              Come Funziona
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Setup Rapido, Zero Rischi
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Inizia a usare i nostri tool in 3 semplici passaggi.
              Nessun contratto, cancelli quando vuoi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Scegli il Tool',
                description: 'Seleziona il software più adatto alle tue esigenze. Prova la demo gratuita.',
                icon: Zap
              },
              {
                step: '02',
                title: 'Setup in 10 Minuti',
                description: 'Configurazione guidata, importazione dati e formazione inclusa.',
                icon: Clock
              },
              {
                step: '03',
                title: 'Risultati Immediati',
                description: 'Inizia a risparmiare tempo e ottimizzare i processi dal giorno 1.',
                icon: TrendingUp
              }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-5xl font-bold text-slate-800 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/20">
              Testimonianze
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Cosa Dicono i Nostri Clienti
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "FatturaParse ci ha fatto risparmiare 15 ore a settimana. L'estrazione delle fatture è istantanea.",
                author: "Dott. Marco Rossi",
                role: "Commercialista, Milano",
                tool: "FatturaParse"
              },
              {
                quote: "Nexus Pro ha rivoluzionato il nostro workflow. I clienti approvano i contenuti in tempo record.",
                author: "Laura Bianchi",
                role: "CEO, AdLab Agency",
                tool: "Nexus Pro"
              },
              {
                quote: "Placeat ci ha fatto passare da 20 a 150 recensioni in 3 mesi. I tavoli si riempiono da soli.",
                author: "Giuseppe Verdi",
                role: "Ristoratore, Roma",
                tool: "Placeat"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{testimonial.author}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                    <Badge className="bg-slate-800 text-slate-400">
                      {testimonial.tool}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="contatti" className="py-24 lg:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">5 Tool Pronti • Setup 10min • Zero Rischi</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Pronto a{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Automatizzare?
            </span>
          </h2>

          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Scegli il tool più adatto alle tue esigenze. Setup in 10 minuti,
            risultati dal giorno 1. Nessun contratto, cancelli quando vuoi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setContactOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 px-8 h-14 text-lg shadow-xl shadow-indigo-500/25"
            >
              <Mail className="mr-2 w-5 h-5" />
              Richiedi Demo Gratuita
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection('tools')}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 h-14 text-lg"
            >
              Esplora i Tool
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl blur-sm" />
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">AD Next Lab</span>
                  <span className="block text-xs text-slate-500">Innovation Studio</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm max-w-sm mb-4">
                Software specializzati per agenzie, ristoranti e studi professionali.
                Testati, pronti, risultati dal giorno 1.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Building2 className="w-4 h-4" />
                <span>P.IVA: IT12345678901</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Prodotti</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/nexuspro" className="text-slate-400 hover:text-white">Nexus Pro</a></li>
                <li><a href="/placeat" className="text-slate-400 hover:text-white">Placeat</a></li>
                <li><button onClick={() => scrollToSection('tools')} className="text-slate-400 hover:text-white">Tool Professionali</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Area Clienti</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/login" className="flex items-center gap-2 text-slate-400 hover:text-white">
                    <Lock className="w-4 h-4" />
                    Accedi
                  </a>
                </li>
                <li>
                  <a href="/register" className="text-slate-400 hover:text-white">
                    Registrati
                  </a>
                </li>
                <li>
                  <button onClick={() => setContactOpen(true)} className="text-slate-400 hover:text-white">
                    Supporto
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 AD Next Lab. Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <a href="/privacy-policy" className="hover:text-white">Privacy Policy</a>
              <a href="/termini-di-servizio" className="hover:text-white">Termini di Servizio</a>
              <a href="/cookie-policy" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Prova Dialog (Nexus Pro / Placeat) */}
      <Dialog open={!!provaOpen} onOpenChange={(open) => { if (!open) setProvaOpen(null); }}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Prova {provaOpen === 'nexuspro' ? 'Nexus Pro' : 'Placeat'} Gratis
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {provaOpen === 'nexuspro'
                ? 'Lascia i tuoi dati e ti attiviamo un accesso di prova per la tua agenzia.'
                : 'Lascia i tuoi dati e ti attiviamo un accesso di prova per il tuo locale.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProvaSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Nome e Cognome *</label>
              <Input
                placeholder="Mario Rossi"
                className="bg-slate-800 border-slate-700 text-white"
                required
                value={provaForm.nome}
                onChange={(e) => setProvaForm(f => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email *</label>
              <Input
                type="email"
                placeholder="mario@azienda.it"
                className="bg-slate-800 border-slate-700 text-white"
                required
                value={provaForm.email}
                onChange={(e) => setProvaForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Telefono</label>
              <Input
                type="tel"
                placeholder="+39 333 1234567"
                className="bg-slate-800 border-slate-700 text-white"
                value={provaForm.telefono}
                onChange={(e) => setProvaForm(f => ({ ...f, telefono: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                {provaOpen === 'nexuspro' ? 'Nome Agenzia' : 'Nome Locale'}
              </label>
              <Input
                placeholder={provaOpen === 'nexuspro' ? 'Nome agenzia' : 'Ristorante / Bar / Pizzeria'}
                className="bg-slate-800 border-slate-700 text-white"
                value={provaForm.azienda}
                onChange={(e) => setProvaForm(f => ({ ...f, azienda: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Messaggio (opzionale)</label>
              <Textarea
                placeholder="Raccontaci la tua situazione..."
                className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
                value={provaForm.messaggio}
                onChange={(e) => setProvaForm(f => ({ ...f, messaggio: e.target.value }))}
              />
            </div>
            <Button
              type="submit"
              disabled={provaLoading}
              className={`w-full text-white ${provaOpen === 'nexuspro' ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500'}`}
            >
              {provaLoading ? 'Invio in corso...' : 'Richiedi Accesso di Prova'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Richiedi Demo</DialogTitle>
            <DialogDescription className="text-slate-400">
              Compila il form e ti contatteremo entro 24 ore per una demo personalizzata.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Nome e Cognome *</label>
              <Input
                placeholder="Mario Rossi"
                className="bg-slate-800 border-slate-700 text-white"
                required
                value={demoForm.nome}
                onChange={(e) => setDemoForm(f => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email *</label>
              <Input
                type="email"
                placeholder="mario@azienda.it"
                className="bg-slate-800 border-slate-700 text-white"
                required
                value={demoForm.email}
                onChange={(e) => setDemoForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Azienda</label>
              <Input
                placeholder="Nome azienda"
                className="bg-slate-800 border-slate-700 text-white"
                value={demoForm.azienda}
                onChange={(e) => setDemoForm(f => ({ ...f, azienda: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Tool di Interesse</label>
              <select
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                value={demoForm.prodotto}
                onChange={(e) => setDemoForm(f => ({ ...f, prodotto: e.target.value as ProdottoLead | '' }))}
              >
                <option value="">Seleziona un tool...</option>
                <option value="nexuspro">Nexus Pro (Agenzie)</option>
                <option value="placeat">Placeat (Ristoranti)</option>
                <option value="fatturaparse">FatturaParse</option>
                <option value="normaguard">NormaGuard</option>
                <option value="fatturamatch">FatturaMatch</option>
                <option value="fiscoauto">FiscoAuto</option>
                <option value="studioflow">StudioFlow</option>
                <option value="bundle">Bundle Completo</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Messaggio</label>
              <Textarea
                placeholder="Descrivi le tue esigenze..."
                className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                value={demoForm.messaggio}
                onChange={(e) => setDemoForm(f => ({ ...f, messaggio: e.target.value }))}
              />
            </div>
            <Button
              type="submit"
              disabled={demoLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white"
            >
              {demoLoading ? 'Invio in corso...' : 'Invia Richiesta'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
