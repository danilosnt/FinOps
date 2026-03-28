export interface User {
  id: number;
  email: string;
  role: 'admin' | 'consultant' | 'client';
}

export interface Company {
  id: number;
  name: string;
  industry: string;
  size: string;
}

export interface Question {
  id: number;
  category: 'Informar' | 'Otimizar' | 'Operar';
  text: string;
  weight: number;
}

export interface Answer {
  question_id: number;
  score: number;
  comments: string;
}

export interface Assessment {
  id: number;
  company_id: number;
  company_name: string;
  user_id: number;
  date: string;
  status: 'draft' | 'completed';
  answers?: Answer[];
}

export interface MaturityScore {
  overall: number;
  informar: number;
  otimizar: number;
  operar: number;
}
