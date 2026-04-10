export interface Question {
  id: string;
  text: string;
  category: string;
}

export const FINOPS_QUESTIONS: Question[] = [
  { id: 'q1', text: 'Você possui uma equipe ou pessoa dedicada a FinOps?', category: 'Cultura' },
  { id: 'q2', text: 'Os custos de nuvem são alocados a unidades de negócio ou projetos específicos?', category: 'Visibilidade' },
  { id: 'q3', text: 'Você utiliza tags/labels em todos os recursos de nuvem?', category: 'Visibilidade' },
  { id: 'q4', text: 'Existe um orçamento definido para gastos em nuvem?', category: 'Planejamento' },
  { id: 'q5', text: 'Você recebe alertas quando os gastos excedem um limite?', category: 'Controle' },
  { id: 'q6', text: 'Você revisa e encerra recursos não utilizados regularmente?', category: 'Otimização' },
  { id: 'q7', text: 'Você utiliza Instâncias Reservadas ou Savings Plans?', category: 'Otimização' },
  { id: 'q8', text: 'Você tem visibilidade dos gastos em nuvem em tempo real?', category: 'Visibilidade' },
  { id: 'q9', text: 'Existe um processo de aprovação para novos serviços em nuvem?', category: 'Governança' },
  { id: 'q10', text: 'Você realiza revisões mensais de custos com os stakeholders?', category: 'Cultura' },
  { id: 'q11', text: 'Você utiliza ferramentas automatizadas para otimização de custos?', category: 'Otimização' },
  { id: 'q12', text: 'Os desenvolvedores estão cientes do impacto financeiro de suas escolhas?', category: 'Cultura' },
  { id: 'q13', text: 'Você possui um Centro de Excelência em Nuvem (CCoE)?', category: 'Governança' },
  { id: 'q14', text: 'Você acompanha a "Economia de Unidade" (ex: custo por transação)?', category: 'Visibilidade' },
  { id: 'q15', text: 'Existe um roadmap para otimização contínua de custos?', category: 'Planejamento' }
];
