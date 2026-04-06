export interface Question {
  id: string;
  text: string;
  category: string;
}

export interface AssessmentResult {
  id?: string;
  score: number;
  answers: Record<string, number>;
  report: string;
  createdAt: Date;
}

export const QUESTIONS: Question[] = [
  {
    id: "visibility",
    text: "Você tem visibilidade em tempo real dos custos de nuvem em todos os provedores e contas?",
    category: "Informar"
  },
  {
    id: "optimization",
    text: "Você utiliza ativamente Instâncias Reservadas, Savings Plans ou Instâncias Spot para otimizar custos?",
    category: "Otimizar"
  },
  {
    id: "governance",
    text: "Você possui políticas automatizadas para marcação (tagging) de recursos e gerenciamento de ciclo de vida?",
    category: "Operar"
  },
  {
    id: "budgeting",
    text: "Orçamentos e alertas estão configurados para todos os projetos com escalonamento automatizado?",
    category: "Informar"
  },
  {
    id: "unit_economics",
    text: "Você acompanha o custo por unidade de negócio, cliente ou produto (Unit Economics)?",
    category: "Operar"
  }
];
