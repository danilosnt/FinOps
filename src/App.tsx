/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Settings, 
  Cloud, 
  Database, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  FileText,
  History,
  Info
} from 'lucide-react';
import { QUESTIONS, CATEGORIES, MATURITY_LEVELS, type Company } from './types';
import { calculateScores, cn } from './lib/utils';
import { saveAssessment, getRecentAssessments } from './firebase';
import { generateAnalysis } from './services/geminiService';
import Markdown from 'react-markdown';

// --- Components ---

const Header = () => (
  <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-1.5 rounded-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900">Maturidade TI</span>
      </div>
      <div className="text-xs font-mono text-gray-400 uppercase tracking-widest hidden sm:block">
        Assessment Tool v2.0
      </div>
    </div>
  </header>
);

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ["Empresa", "Avaliação", "Relatório"];
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
            currentStep > idx ? "bg-green-100 text-green-600" : 
            currentStep === idx ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : 
            "bg-gray-100 text-gray-400"
          )}>
            {currentStep > idx ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
          </div>
          <span className={cn(
            "text-sm font-medium hidden sm:block",
            currentStep === idx ? "text-indigo-600" : "text-gray-400"
          )}>
            {step}
          </span>
          {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
        </div>
      ))}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState(0); // 0: Home/Company, 1: Questions, 2: Report
  const [company, setCompany] = useState<Company>({ name: '', sector: '', size: '' });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getRecentAssessments(10);
      if (data) setRecentAssessments(data);
    };
    fetchHistory();
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (company.name && company.sector && company.size) {
      setStep(1);
    }
  };

  const handleAnswer = (qId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
  };

  const isComplete = Object.keys(answers).length === QUESTIONS.length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const scores = calculateScores(answers);
    const assessmentData = { company, answers, scores };
    
    try {
      await saveAssessment(assessmentData);
      const aiAnalysis = await generateAnalysis(company, scores);
      setAnalysis(aiAnalysis);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep(0);
    setCompany({ name: '', sector: '', size: '' });
    setAnswers({});
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
                  Avalie a Maturidade de TI da sua Empresa
                </h1>
                <p className="text-lg text-gray-600 max-w-lg mx-auto">
                  Descubra o grau de evolução tecnológica do seu negócio e receba um relatório detalhado gerado por IA.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                <form onSubmit={handleStart} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Empresa</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Ex: Tech Solutions Ltda"
                      value={company.name}
                      onChange={e => setCompany({...company, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Setor</label>
                      <select 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        value={company.sector}
                        onChange={e => setCompany({...company, sector: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Varejo">Varejo</option>
                        <option value="Indústria">Indústria</option>
                        <option value="Saúde">Saúde</option>
                        <option value="Educação">Educação</option>
                        <option value="Finanças">Finanças</option>
                        <option value="Serviços">Serviços</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Porte</label>
                      <select 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        value={company.size}
                        onChange={e => setCompany({...company, size: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        <option value="Micro (até 10 func.)">Micro (até 10 func.)</option>
                        <option value="Pequena (11-50 func.)">Pequena (11-50 func.)</option>
                        <option value="Média (51-250 func.)">Média (51-250 func.)</option>
                        <option value="Grande (+250 func.)">Grande (+250 func.)</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    Começar Avaliação <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {recentAssessments.length > 0 && (
                <div className="mt-12">
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mx-auto text-sm font-medium"
                  >
                    <History className="w-4 h-4" /> 
                    {showHistory ? "Ocultar Histórico" : "Ver Avaliações Recentes"}
                  </button>
                  
                  {showHistory && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 space-y-3"
                    >
                      {recentAssessments.map((item: any) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800">{item.company.name}</p>
                            <p className="text-xs text-gray-400">{item.company.sector} • {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Recente'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400 uppercase font-mono">Score</span>
                            <p className="text-lg font-black text-indigo-600">{item.scores.overall}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <StepIndicator currentStep={1} />
              
              <div className="space-y-12">
                {CATEGORIES.map(category => (
                  <section key={category} className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        {category === "Governança e Estratégia" && <Settings className="w-5 h-5" />}
                        {category === "Infraestrutura e Nuvem" && <Cloud className="w-5 h-5" />}
                        {category === "Segurança e Conformidade" && <Shield className="w-5 h-5" />}
                        {category === "Processos e Operações" && <Database className="w-5 h-5" />}
                        {category === "Inovação e Dados" && <Zap className="w-5 h-5" />}
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">{category}</h2>
                    </div>
                    
                    <div className="grid gap-6">
                      {QUESTIONS.filter(q => q.category === category).map(q => (
                        <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="mb-4">
                            <h3 className="font-bold text-gray-900 mb-1">{q.text}</h3>
                            <p className="text-sm text-gray-500">{q.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map(score => (
                              <button
                                key={score}
                                onClick={() => handleAnswer(q.id, score)}
                                className={cn(
                                  "flex-1 min-w-[60px] py-3 rounded-xl text-sm font-bold transition-all border-2",
                                  answers[q.id] === score 
                                    ? "bg-indigo-600 border-indigo-600 text-white scale-105" 
                                    : "bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600"
                                )}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-12 flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 sticky bottom-6 shadow-2xl shadow-indigo-100/50">
                <div className="text-sm text-gray-500">
                  <span className="font-bold text-indigo-600">{Object.keys(answers).length}</span> de {QUESTIONS.length} respondidas
                </div>
                <button
                  disabled={!isComplete || isSubmitting}
                  onClick={handleSubmit}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                    isComplete && !isSubmitting
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>Processando... <Loader2 className="w-5 h-5 animate-spin" /></>
                  ) : (
                    <>Gerar Relatório <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && analysis && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={reset} className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium">
                  <ChevronLeft className="w-4 h-4" /> Nova Avaliação
                </button>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50">
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Report Header */}
                <div className="bg-indigo-600 p-8 sm:p-12 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                      <div>
                        <span className="text-indigo-200 text-xs font-mono uppercase tracking-widest mb-2 block">Relatório de Maturidade</span>
                        <h2 className="text-3xl sm:text-4xl font-black mb-2">{company.name}</h2>
                        <p className="text-indigo-100 opacity-80">{company.sector} • {company.size}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[140px]">
                        <span className="text-[10px] uppercase tracking-widest opacity-70 block mb-1">Score Geral</span>
                        <div className="text-5xl font-black">{calculateScores(answers).overall}</div>
                        <span className="text-[10px] opacity-70">Escala 1-5</span>
                      </div>
                    </div>
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
                </div>

                {/* Score Breakdown */}
                <div className="p-8 sm:p-12 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" /> Desempenho por Pilar
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(calculateScores(answers).segmented).map(([cat, score]) => (
                      <div key={cat} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{cat}</p>
                        <div className="flex items-end justify-between">
                          <span className="text-3xl font-black text-gray-800">{score}</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full" 
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="p-8 sm:p-12 bg-gray-50/30">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Análise Estratégica (Gemini AI)</h3>
                  </div>
                  <div className="prose prose-indigo max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600">
                    <Markdown>{analysis}</Markdown>
                  </div>
                </div>

                {/* Maturity Levels Guide */}
                <div className="p-8 sm:p-12 bg-white border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-600" /> Guia de Níveis de Maturidade
                  </h3>
                  <div className="grid gap-4">
                    {MATURITY_LEVELS.map(lvl => (
                      <div key={lvl.level} className={cn(
                        "p-4 rounded-xl border transition-all",
                        Math.round(calculateScores(answers).overall) === lvl.level
                          ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200"
                          : "bg-white border-gray-100 opacity-60"
                      )}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-indigo-600">0{lvl.level}</span>
                          <div>
                            <h4 className="font-bold text-gray-900">{lvl.name}</h4>
                            <p className="text-xs text-gray-500">{lvl.description}</p>
                          </div>
                          {Math.round(calculateScores(answers).overall) === lvl.level && (
                            <div className="ml-auto bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
                              Seu Nível
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center text-gray-400 text-xs">
                Este relatório foi gerado automaticamente e deve ser usado como guia consultivo.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-bold">Maturidade TI</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 Assessment Tool. Desenvolvido para fins de consultoria tecnológica.</p>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">System Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
