/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  category: string;
  text: string;
  description: string;
}

export interface Company {
  name: string;
  sector: string;
  size: string;
}

export interface Assessment {
  company: Company;
  answers: Record<string, number>; // questionId -> score (1-5)
  timestamp: number;
  id?: string;
}

export const CATEGORIES = [
  "Governança e Estratégia",
  "Infraestrutura e Nuvem",
  "Segurança e Conformidade",
  "Processos e Operações",
  "Inovação e Dados"
];

export const QUESTIONS: Question[] = [
  // Governança
  {
    id: "gov_1",
    category: "Governança e Estratégia",
    text: "Alinhamento Estratégico",
    description: "A TI participa ativamente das decisões estratégicas do negócio?"
  },
  {
    id: "gov_2",
    category: "Governança e Estratégia",
    text: "Gestão de Orçamento",
    description: "Existe um orçamento de TI definido e acompanhado regularmente?"
  },
  {
    id: "gov_3",
    category: "Governança e Estratégia",
    text: "Políticas de TI",
    description: "Existem políticas formais (uso aceitável, BYOD, etc.) comunicadas a todos?"
  },
  // Infraestrutura
  {
    id: "infra_1",
    category: "Infraestrutura e Nuvem",
    text: "Escalabilidade",
    description: "A infraestrutura atual suporta um crescimento rápido sem interrupções?"
  },
  {
    id: "infra_2",
    category: "Infraestrutura e Nuvem",
    text: "Adoção de Nuvem",
    description: "Qual o nível de utilização de serviços em nuvem (SaaS, PaaS, IaaS)?"
  },
  {
    id: "infra_3",
    category: "Infraestrutura e Nuvem",
    text: "Monitoramento",
    description: "Existe monitoramento proativo de servidores, redes e aplicações?"
  },
  // Segurança
  {
    id: "sec_1",
    category: "Segurança e Conformidade",
    text: "Proteção de Dados (LGPD)",
    description: "A empresa está em conformidade com as leis de proteção de dados?"
  },
  {
    id: "sec_2",
    category: "Segurança e Conformidade",
    text: "Gestão de Backups",
    description: "Backups são realizados, testados e armazenados de forma segura?"
  },
  {
    id: "sec_3",
    category: "Segurança e Conformidade",
    text: "Controle de Acesso",
    description: "O acesso aos sistemas é baseado no princípio do menor privilégio?"
  },
  // Processos
  {
    id: "proc_1",
    category: "Processos e Operações",
    text: "Padronização",
    description: "Os processos de suporte e desenvolvimento são padronizados?"
  },
  {
    id: "proc_2",
    category: "Processos e Operações",
    text: "Documentação",
    description: "A documentação técnica e de processos está atualizada e acessível?"
  },
  {
    id: "proc_3",
    category: "Processos e Operações",
    text: "Gestão de Mudanças",
    description: "Existe um processo formal para aprovação e execução de mudanças?"
  },
  // Inovação
  {
    id: "inv_1",
    category: "Inovação e Dados",
    text: "Cultura de Inovação",
    description: "A empresa investe em novas tecnologias (IA, Automação) regularmente?"
  },
  {
    id: "inv_2",
    category: "Inovação e Dados",
    text: "Análise de Dados",
    description: "Os dados do negócio são utilizados para gerar insights e decisões?"
  },
  {
    id: "inv_3",
    category: "Inovação e Dados",
    text: "Pesquisa e Desenvolvimento",
    description: "Existe tempo ou orçamento dedicado a testes de novas ferramentas?"
  }
];

export const MATURITY_LEVELS = [
  { level: 1, name: "Inexistente / Ad-hoc", description: "Processos não estruturados, reativos e dependentes de indivíduos." },
  { level: 2, name: "Repetível", description: "Processos básicos estabelecidos, mas ainda informais e pouco documentados." },
  { level: 3, name: "Definido", description: "Processos padronizados, documentados e comunicados em toda a organização." },
  { level: 4, name: "Gerenciado", description: "Processos medidos por KPIs e controlados quantitativamente." },
  { level: 5, name: "Otimizado", description: "Foco em melhoria contínua e inovação tecnológica proativa." }
];
