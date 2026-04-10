import React, { useState } from 'react';
import { FINOPS_QUESTIONS } from './constants/questions';
import { generateFinOpsReport } from './services/geminiService';
import ReactMarkdown from 'react-markdown';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ClipboardCheck, 
  FileText, 
  Building2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Step = 'company' | 'questionnaire' | 'result';

function MainApp() {
  const [step, setStep] = useState<Step>('company');
  const [company, setCompany] = useState({ name: '', sector: '', size: '' });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (company.name && company.sector && company.size) {
      setStep('questionnaire');
    }
  };

  const handleAnswer = (score: number) => {
    const questionId = FINOPS_QUESTIONS[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: score }));
    
    if (currentQuestionIndex < FINOPS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const averageScore = totalScore / FINOPS_QUESTIONS.length;
    
    const result = {
      answers,
      totalScore,
      averageScore,
      createdAt: new Date().toISOString(),
    };

    setAssessmentResult(result);
    setStep('result');
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    const generatedReport = await generateFinOpsReport(company, assessmentResult);
    setReport(generatedReport ?? null);
    setGeneratingReport(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">FinOps Maturity</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {step === 'company' && (
            <motion.div
              key="company"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-zinc-200 shadow-xl shadow-zinc-200/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Building2 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Passo 1 de 3</span>
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight">Cadastro da Empresa</CardTitle>
                  <CardDescription>Conte-nos um pouco sobre a empresa que será avaliada.</CardDescription>
                </CardHeader>
                <form onSubmit={handleCompanySubmit}>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Empresa</Label>
                      <Input 
                        id="name" 
                        placeholder="Ex: Tech Solutions Ltda" 
                        value={company.name}
                        onChange={(e) => setCompany(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="h-11 border-zinc-200 focus:ring-zinc-900"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sector">Setor de Atuação</Label>
                        <Input 
                          id="sector" 
                          placeholder="Ex: Tecnologia, Varejo, Saúde" 
                          value={company.sector}
                          onChange={(e) => setCompany(prev => ({ ...prev, sector: e.target.value }))}
                          required
                          className="h-11 border-zinc-200 focus:ring-zinc-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Porte da Empresa</Label>
                        <Select 
                          value={company.size} 
                          onValueChange={(value) => setCompany(prev => ({ ...prev, size: value ?? '' }))}
                          required
                        >
                          <SelectTrigger className="h-11 min-w-[350px] border-zinc-200 focus:ring-zinc-900">
                            <SelectValue placeholder="Selecione o porte" />
                          </SelectTrigger>
                          <SelectContent className="min-w-[300px]">
                            <SelectItem value="Small">Pequena (até 50 funcionários)</SelectItem>
                            <SelectItem value="Medium">Média (51-250 funcionários)</SelectItem>
                            <SelectItem value="Large">Grande (251-1000 funcionários)</SelectItem>
                            <SelectItem value="Enterprise">Corporativa (+1000 funcionários)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-6">
                    <Button type="submit" className="bg-zinc-900 hover:bg-zinc-800 text-white h-11 px-8">
                      Iniciar Questionário
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 'questionnaire' && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <ClipboardCheck className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Passo 2 de 3</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Avaliação FinOps</h2>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-zinc-500">Progresso</span>
                  <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-zinc-200">
                    <motion.div 
                      className="h-full bg-zinc-900"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex + 1) / FINOPS_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{currentQuestionIndex + 1} de {FINOPS_QUESTIONS.length}</p>
                </div>
              </div>

              <Card className="border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                <div className="bg-zinc-900 px-6 py-3">
                  <Badge variant="outline" className="text-white border-white/20 uppercase tracking-wider text-[10px]">
                    {FINOPS_QUESTIONS[currentQuestionIndex].category}
                  </Badge>
                </div>
                <CardContent className="p-8 sm:p-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <h3 className="text-2xl font-medium leading-tight text-zinc-900 sm:text-3xl">
                        {FINOPS_QUESTIONS[currentQuestionIndex].text}
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <Button
                            key={score}
                            variant="outline"
                            onClick={() => handleAnswer(score)}
                            className="h-20 flex-col gap-1 border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
                          >
                            <span className="text-xl font-bold group-hover:scale-110 transition-transform">{score}</span>
                            <span className="text-[10px] uppercase tracking-tighter text-zinc-400 group-hover:text-zinc-900">
                              {score === 1 ? 'Discordo' : score === 5 ? 'Concordo' : ''}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
                <CardFooter className="bg-zinc-50 border-t border-zinc-100 px-8 py-4 flex justify-between">
                  <Button 
                    variant="ghost" 
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="text-zinc-500"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  <p className="text-xs text-zinc-400 italic">Responda de 1 (Mínimo) a 5 (Máximo)</p>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 text-zinc-500">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Passo 3 de 3</span>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-1 border-zinc-200 shadow-xl shadow-zinc-200/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-semibold">Score de Maturidade</CardTitle>
                    <CardDescription>Baseado em 15 indicadores</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center pb-8">
                    <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-zinc-100">
                      <div className="text-center">
                        <span className="text-5xl font-black text-zinc-900">{assessmentResult.averageScore.toFixed(1)}</span>
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">de 5.0</p>
                      </div>
                      <svg className="absolute -rotate-90 h-full w-full" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="72"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 72}
                          strokeDashoffset={2 * Math.PI * 72 * (1 - assessmentResult.averageScore / 5)}
                          strokeLinecap="round"
                          className="text-zinc-900"
                        />
                      </svg>
                    </div>
                    <div className="mt-8 w-full space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Pontuação Total</span>
                        <span className="font-bold">{assessmentResult.totalScore} / 75</span>
                      </div>
                      <Separator className="bg-zinc-100" />
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Nível Estimado</span>
                        <Badge className="bg-zinc-900 text-white">
                          {assessmentResult.averageScore < 2 ? 'Iniciante' : 
                           assessmentResult.averageScore < 3.5 ? 'Intermediário' : 'Avançado'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {!report && (
                      <Button 
                        onClick={handleGenerateReport} 
                        disabled={generatingReport}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-11"
                      >
                        {generatingReport ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analisando com Gemini...
                          </>
                        ) : (
                          <>
                            Gerar Relatório Detalhado
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>

                <Card className="lg:col-span-2 border-zinc-200 shadow-xl shadow-zinc-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-zinc-900" />
                      Relatório de Diagnóstico
                    </CardTitle>
                    <CardDescription>Análise gerada por IA sobre sua maturidade FinOps</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      {report ? (
                        <div className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-p:text-zinc-600">
                          <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center py-20">
                          <div className="h-12 w-12 rounded-full bg-zinc-50 flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-zinc-300" />
                          </div>
                          <p className="text-sm text-zinc-500 max-w-xs">
                            Clique no botão ao lado para gerar uma análise profunda baseada em seus resultados.
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center pb-12">
                <Button variant="ghost" onClick={() => window.location.reload()} className="text-zinc-400 hover:text-zinc-900">
                  Realizar Nova Avaliação
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-zinc-400 uppercase tracking-widest">
            &copy; 2026 FinOps Maturity Evaluator
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MainApp />
  );
}
