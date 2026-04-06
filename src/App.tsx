import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  ChevronRight, 
  ChevronLeft, 
  ClipboardCheck, 
  TrendingUp, 
  ShieldCheck, 
  Activity,
  ArrowRight,
  RefreshCcw,
  Download,
  Info
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { QUESTIONS } from './types';
import Markdown from 'react-markdown';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

type Step = 'landing' | 'questions' | 'loading' | 'results';

export default function App() {
  const [step, setStep] = useState<Step>('landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [report, setReport] = useState<string>("");
  const [finalScore, setFinalScore] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    if (!apiKey) {
      setError("Gemini API Key is missing. Please set it in your environment variables.");
      return;
    }
    setStep('questions');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSavedId(null);
    setError(null);
  };

  const handleAnswer = (score: number) => {
    const question = QUESTIONS[currentQuestionIndex];
    const newAnswers = { ...answers, [question.id]: score };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      generateReport(newAnswers);
    }
  };

  const generateReport = async (finalAnswers: Record<string, number>) => {
    setStep('loading');
    
    // Calculate average score (1-5)
    const total = Object.values(finalAnswers).reduce((acc, val) => acc + val, 0);
    const avg = total / QUESTIONS.length;
    setFinalScore(Number(avg.toFixed(1)));

    try {
      const prompt = `
        Você é um especialista em FinOps. Com base nos seguintes resultados de avaliação (pontuações de 1 a 5, onde 1 é baixa maturidade e 5 é alta maturidade), gere um relatório de maturidade profissional.
        
        Resultados da Avaliação:
        ${QUESTIONS.map(q => `- ${q.text}: ${finalAnswers[q.id]}/5`).join('\n')}
        
        Pontuação Geral de Maturidade: ${avg.toFixed(1)}/5
        
        O relatório deve incluir:
        1. Resumo Executivo
        2. Principais Pontos Fortes
        3. Lacunas Críticas
        4. Recomendações Acionáveis (curto, médio e longo prazo)
        
        Formate a saída em Markdown limpo e em Português do Brasil.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const reportText = response.text || "Falha ao gerar o relatório.";
      setReport(reportText);
      setStep('results');
      
      // Save to Firestore
      saveToFirestore(avg, finalAnswers, reportText);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setReport("Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.");
      setStep('results');
    }
  };

  const saveToFirestore = async (score: number, finalAnswers: Record<string, number>, reportText: string) => {
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'assessments'), {
        score,
        answers: finalAnswers,
        report: reportText,
        createdAt: serverTimestamp()
      });
      setSavedId(docRef.id);
    } catch (error) {
      console.error("Erro ao salvar no Firestore:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center text-white">
              <BarChart3 size={18} />
            </div>
            <span>FinOps</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <span className="hidden sm:inline">Ferramenta de Avaliação Profissional</span>
            <div className="w-px h-4 bg-gray-200" />
            <Activity size={16} className="text-emerald-500" />
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight leading-[1.1]">
                  Avalie sua Maturidade <br />
                  <span className="text-gray-400">Financeira em Nuvem.</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                  Uma avaliação abrangente de 5 minutos para avaliar as práticas de FinOps da sua organização e receber um roadmap gerado por IA.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <TrendingUp size={20} />, title: "Visibilidade", desc: "Transparência de custos" },
                  { icon: <ShieldCheck size={20} />, title: "Otimização", desc: "Eficiência de recursos" },
                  { icon: <Activity size={20} />, title: "Governança", desc: "Controle de políticas" }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <div className="text-gray-400">{item.icon}</div>
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStart}
                className="group flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all active:scale-95"
              >
                Iniciar Avaliação
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
                  <Info size={16} />
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {step === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Pergunta {currentQuestionIndex + 1} de {QUESTIONS.length}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {Math.round(((currentQuestionIndex + 1) / QUESTIONS.length) * 100)}% Concluído
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#1A1A1A]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="text-3xl font-bold tracking-tight leading-tight">
                  {QUESTIONS[currentQuestionIndex].text}
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswer(score)}
                      className="group flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#1A1A1A] hover:bg-gray-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center font-mono text-sm group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                          {score}
                        </div>
                        <span className="font-medium">
                          {score === 1 && "Não Implementado"}
                          {score === 2 && "Inicial / Manual"}
                          {score === 3 && "Definido / Consistente"}
                          {score === 4 && "Gerenciado / Automatizado"}
                          {score === 5 && "Otimizado / Estratégico"}
                        </span>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-[#1A1A1A] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 disabled:opacity-0 transition-all"
              >
                <ChevronLeft size={16} />
                Pergunta Anterior
              </button>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 space-y-8 text-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 border-4 border-gray-200 border-t-[#1A1A1A] rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={24} className="text-[#1A1A1A]" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Analisando Resultados</h3>
                <p className="text-gray-500">O Gemini está gerando seu roadmap de FinOps personalizado...</p>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="p-10 bg-[#1A1A1A] text-white rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BarChart3 size={120} />
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <ClipboardCheck size={14} />
                    Avaliação Concluída
                  </div>
                  
                  <div className="flex items-baseline gap-4">
                    <span className="text-8xl font-bold tracking-tighter">{finalScore}</span>
                    <span className="text-2xl text-gray-400 font-medium">/ 5.0</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">Nível de Maturidade: {
                      finalScore < 2 ? "Crawl (Engatinhar)" :
                      finalScore < 3.5 ? "Walk (Andar)" : "Run (Correr)"
                    }</h2>
                    <p className="text-gray-400 max-w-md">
                      Sua organização está atualmente na fase <strong>{
                        finalScore < 2 ? "Crawl" :
                        finalScore < 3.5 ? "Walk" : "Run"
                      }</strong> de maturidade FinOps.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3 font-bold">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                    Recomendações da IA
                  </div>
                  <div className="flex items-center gap-2">
                    {isSaving ? (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <RefreshCcw size={12} className="animate-spin" /> Salvando...
                      </span>
                    ) : savedId && (
                      <span className="text-xs text-emerald-500 font-medium">Salvo no Banco de Dados</span>
                    )}
                  </div>
                </div>
                <div className="p-8 prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-600 prose-li:text-gray-600">
                  <Markdown>{report}</Markdown>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStart}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all active:scale-95"
                >
                  <RefreshCcw size={20} />
                  Refazer Avaliação
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all active:scale-95"
                >
                  <Download size={20} />
                  Exportar Relatório
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="py-10 border-t border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-widest">
          <Info size={14} />
          Powered by Gemini AI & Firebase
        </div>
      </footer>
    </div>
  );
}
