import React, { useState, useEffect, useMemo } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  Link, 
  useParams,
  useSearchParams 
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardCheck, 
  FileText, 
  LogOut, 
  Building2, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  PieChart,
  Settings,
  User as UserIcon,
  TrendingUp,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { User, Company, Question, Answer, Assessment, MaturityScore } from './types';
import { generateMaturityReport } from './services/geminiService';

// --- API Helpers ---
const API_URL = "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// --- Components ---

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  if (!user) return null;
  return (
    <nav className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-1.5 rounded-lg">
          <TrendingUp className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-slate-900 text-lg tracking-tight">FinOps Maturity</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-600">
          <UserIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{user.email}</span>
          <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
            {user.role}
          </span>
        </div>
        <button 
          onClick={onLogout}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

const Sidebar = ({ user }: { user: User | null }) => {
  if (!user) return null;
  const links = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/companies", icon: Building2, label: "Empresas" },
    { to: "/assessments", icon: ClipboardCheck, label: "Avaliações" },
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 h-[calc(100vh-64px)] p-4 flex flex-col gap-2 sticky top-16">
      {links.map(link => (
        <Link 
          key={link.to} 
          to={link.to}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all font-medium"
        >
          <link.icon className="w-5 h-5" />
          {link.label}
        </Link>
      ))}
    </aside>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (user: User, token: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user, data.token);
        navigate('/');
      } else {
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <TrendingUp className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
          <p className="text-slate-500 text-sm mt-1">Entre para gerenciar suas avaliações FinOps</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Dica: Use <span className="font-mono text-slate-600">admin@example.com</span> / <span className="font-mono text-slate-600">admin123</span> para testes.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/user/assessments`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setAssessments(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visão geral das suas avaliações de maturidade.</p>
        </div>
        <Link 
          to="/assessments/new"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Nova Avaliação
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Total</span>
          </div>
          <div className="text-4xl font-black text-slate-900">{assessments.length}</div>
          <div className="text-xs text-slate-400 mt-1">Avaliações realizadas</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Concluídas</span>
          </div>
          <div className="text-4xl font-black text-slate-900">
            {assessments.filter(a => a.status === 'completed').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Prontas para relatório</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Em Aberto</span>
          </div>
          <div className="text-4xl font-black text-slate-900">
            {assessments.filter(a => a.status === 'draft').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Aguardando preenchimento</div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-4">Avaliações Recentes</h2>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assessments.map(a => (
              <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{a.company_name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(a.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-1 rounded-full",
                    a.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {a.status === 'completed' ? 'Concluída' : 'Rascunho'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={a.status === 'completed' ? `/reports/${a.id}` : `/assessments/${a.id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-sm inline-flex items-center gap-1"
                  >
                    {a.status === 'completed' ? 'Ver Relatório' : 'Continuar'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {assessments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                  Nenhuma avaliação encontrada. Comece uma agora!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');

  const fetchCompanies = () => {
    fetch(`${API_URL}/companies`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setCompanies(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/companies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, industry, size })
    });
    if (res.ok) {
      setName(''); setIndustry(''); setSize('');
      setShowForm(false);
      fetchCompanies();
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Empresas Clientes</h1>
          <p className="text-slate-500 mt-1">Gerencie as empresas que serão avaliadas.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nome da Empresa</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Indústria</label>
                <input 
                  type="text" 
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tamanho</label>
                <select 
                  value={size}
                  onChange={e => setSize(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Pequena">Pequena (1-50)</option>
                  <option value="Média">Média (51-500)</option>
                  <option value="Grande">Grande (500+)</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all">
                  Salvar Empresa
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-indigo-50 transition-colors">
                <Building2 className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
              </div>
              <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                {c.size}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{c.industry}</p>
            <Link 
              to={`/assessments/new?companyId=${c.id}`}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-indigo-600 text-indigo-600 font-bold hover:bg-indigo-600 hover:text-white transition-all text-sm"
            >
              <ClipboardCheck className="w-4 h-4" />
              Nova Avaliação
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const AssessmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, { score: number, comments: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [qRes, aRes] = await Promise.all([
        fetch(`${API_URL}/questions`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/assessments/${id}`, { headers: getAuthHeaders() })
      ]);
      const qData = await qRes.json();
      const aData = await aRes.json();
      
      setQuestions(qData);
      setAssessment(aData);
      
      const initialAnswers: Record<number, { score: number, comments: string }> = {};
      aData.answers?.forEach((ans: Answer) => {
        initialAnswers[ans.question_id] = { score: ans.score, comments: ans.comments };
      });
      setAnswers(initialAnswers);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleScoreChange = (qId: number, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...prev[qId], score }
    }));
  };

  const handleCommentChange = (qId: number, comments: string) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...prev[qId], comments }
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const answersArray = Object.entries(answers).map(([qId, data]) => {
      const d = data as { score: number, comments: string };
      return {
        question_id: parseInt(qId),
        score: d.score,
        comments: d.comments
      };
    });

    const res = await fetch(`${API_URL}/assessments/${id}/answers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers: answersArray })
    });

    if (res.ok) {
      navigate(`/reports/${id}`);
    } else {
      setSaving(false);
      alert('Erro ao salvar avaliação');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  const categories = ['Informar', 'Otimizar', 'Operar'] as const;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Avaliação de Maturidade</h1>
        <p className="text-slate-500 mt-1">Empresa: <span className="font-bold text-indigo-600">{assessment?.company_name}</span></p>
      </div>

      <div className="space-y-12">
        {categories.map(cat => (
          <div key={cat} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                cat === 'Informar' ? "bg-blue-500" : cat === 'Otimizar' ? "bg-emerald-500" : "bg-amber-500"
              )} />
              <h2 className="text-xl font-bold text-slate-800">{cat}</h2>
            </div>
            
            <div className="space-y-4">
              {questions.filter(q => q.category === cat).map(q => (
                <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="font-semibold text-slate-900 mb-4">{q.text}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[0, 1, 2, 3, 4].map(s => (
                      <button
                        key={s}
                        onClick={() => handleScoreChange(q.id, s)}
                        className={cn(
                          "w-10 h-10 rounded-lg font-bold transition-all border",
                          answers[q.id]?.score === s 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:border-indigo-300"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                    <span className="ml-4 text-xs text-slate-400 flex items-center">
                      {answers[q.id]?.score === 0 ? "Inexistente" : 
                       answers[q.id]?.score === 4 ? "Otimizado/Automático" : "Em evolução"}
                    </span>
                  </div>
                  <textarea
                    placeholder="Comentários ou evidências..."
                    value={answers[q.id]?.comments || ''}
                    onChange={e => handleCommentChange(q.id, e.target.value)}
                    className="w-full p-3 text-sm rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all min-h-[80px]"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-end gap-4">
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSubmit}
          disabled={saving || questions.length !== Object.keys(answers).length}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          Finalizar Avaliação
        </button>
      </div>
    </div>
  );
};

const NewAssessment = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetch(`${API_URL}/companies`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setCompanies(data);
        const cid = searchParams.get('companyId');
        if (cid) setSelectedCompanyId(cid);
      });
  }, [searchParams]);

  const handleStart = async () => {
    const res = await fetch(`${API_URL}/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ company_id: selectedCompanyId })
    });
    const data = await res.json();
    if (res.ok) {
      navigate(`/assessments/${data.id}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Iniciar Nova Avaliação</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Selecione a Empresa</label>
          <select 
            value={selectedCompanyId}
            onChange={e => setSelectedCompanyId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            <option value="">Escolha uma empresa...</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleStart}
          disabled={!selectedCompanyId}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          Começar
        </button>
        <p className="text-center text-sm text-slate-400">
          Não encontrou a empresa? <Link to="/companies" className="text-indigo-600 font-bold">Cadastre aqui</Link>
        </p>
      </div>
    </div>
  );
};

const ReportPage = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiReport, setAiReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [qRes, aRes] = await Promise.all([
        fetch(`${API_URL}/questions`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/assessments/${id}`, { headers: getAuthHeaders() })
      ]);
      setQuestions(await qRes.json());
      setAssessment(await aRes.json());
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const scores = useMemo(() => {
    if (!assessment?.answers || questions.length === 0) return null;
    
    const catScores: Record<string, { sum: number, count: number }> = {
      'Informar': { sum: 0, count: 0 },
      'Otimizar': { sum: 0, count: 0 },
      'Operar': { sum: 0, count: 0 }
    };

    assessment.answers.forEach(ans => {
      const q = questions.find(q => q.id === ans.question_id);
      if (q) {
        catScores[q.category].sum += ans.score;
        catScores[q.category].count += 1;
      }
    });

    const informar = catScores['Informar'].sum / (catScores['Informar'].count || 1);
    const otimizar = catScores['Otimizar'].sum / (catScores['Otimizar'].count || 1);
    const operar = catScores['Operar'].sum / (catScores['Operar'].count || 1);
    const overall = (informar + otimizar + operar) / 3;

    return { overall, informar, otimizar, operar };
  }, [assessment, questions]);

  const handleGenerateAI = async () => {
    if (!scores || !assessment) return;
    setGenerating(true);
    const report = await generateMaturityReport(
      assessment.company_name,
      scores,
      questions,
      assessment.answers || []
    );
    setAiReport(report || '');
    setGenerating(false);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (!scores) return <div>Erro ao carregar scores.</div>;

  const chartData = [
    { subject: 'Informar', A: scores.informar, fullMark: 4 },
    { subject: 'Otimizar', A: scores.otimizar, fullMark: 4 },
    { subject: 'Operar', A: scores.operar, fullMark: 4 },
  ];

  const getMaturityLevel = (score: number) => {
    if (score < 1) return { label: "Iniciante", color: "text-red-600", bg: "bg-red-50" };
    if (score < 2.5) return { label: "Em Evolução", color: "text-amber-600", bg: "bg-amber-50" };
    if (score < 3.5) return { label: "Maduro", color: "text-blue-600", bg: "bg-blue-50" };
    return { label: "Líder / Otimizado", color: "text-emerald-600", bg: "bg-emerald-50" };
  };

  const level = getMaturityLevel(scores.overall);

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatório de Maturidade FinOps</h1>
          <p className="text-slate-500 mt-1">Empresa: <span className="font-bold text-indigo-600">{assessment?.company_name}</span></p>
        </div>
        <div className={cn("px-6 py-3 rounded-2xl flex flex-col items-center", level.bg)}>
          <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Score Geral</span>
          <span className={cn("text-3xl font-black", level.color)}>{scores.overall.toFixed(1)}</span>
          <span className={cn("text-xs font-bold", level.color)}>{level.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Radar de Maturidade</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
                <Radar
                  name="Maturidade"
                  dataKey="A"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Informar', score: scores.informar, color: 'bg-blue-500', desc: 'Visibilidade, alocação e monitoramento de custos.' },
            { label: 'Otimizar', score: scores.otimizar, color: 'bg-emerald-500', desc: 'Eficiência de recursos, instâncias reservadas e rightsizing.' },
            { label: 'Operar', score: scores.operar, color: 'bg-amber-500', desc: 'Governança, cultura organizacional e automação.' },
          ].map(item => (
            <div key={item.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-700">{item.label}</span>
                <span className="text-lg font-black text-slate-900">{item.score.toFixed(1)}/4.0</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / 4) * 100}%` }}
                  className={cn("h-full rounded-full", item.color)}
                />
              </div>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden mb-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-500 p-2 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Análise Inteligente (Gemini AI)</h2>
          </div>
          
          {!aiReport ? (
            <div className="py-10 flex flex-col items-center text-center">
              <p className="text-slate-400 mb-6 max-w-md">
                Use nossa IA para cruzar os dados da avaliação e gerar um plano de ação personalizado com foco em ROI e eficiência.
              </p>
              <button 
                onClick={handleGenerateAI}
                disabled={generating}
                className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                Gerar Relatório Estratégico
              </button>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none mt-6 bg-slate-800/50 p-8 rounded-2xl border border-white/10">
              <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                {aiReport}
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 blur-[100px] -ml-32 -mb-32" />
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex">
          <Sidebar user={user} />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/companies" element={user ? <CompaniesPage /> : <Navigate to="/login" />} />
              <Route path="/assessments" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/assessments/new" element={user ? <NewAssessment /> : <Navigate to="/login" />} />
              <Route path="/assessments/:id" element={user ? <AssessmentForm /> : <Navigate to="/login" />} />
              <Route path="/reports/:id" element={user ? <ReportPage /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
