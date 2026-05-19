export interface Question {
  id: string;
  text: string;
  category: string;
  tooltip?: string;
}

// ── Etapa 1: Dados do Core Business (campos de texto livre) ──
export interface CoreBusinessField {
  id: string;
  label: string;
  placeholder: string;
  category: string;
  required: boolean;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
}

export const CORE_BUSINESS_FIELDS: CoreBusinessField[] = [
  {
    id: 'erp_system',
    label: 'Sistema ERP / Sistema Central',
    placeholder: 'Ex: SAP R/3, TOTVS Protheus, Oracle EBS, nenhum',
    category: 'Infraestrutura',
    required: true,
    type: 'text',
  },
  {
    id: 'erp_integration',
    label: 'Como os dados do ERP são integrados a outros sistemas?',
    placeholder: 'Ex: exportação CSV a cada 48h, API REST, batch noturno, manual',
    category: 'Infraestrutura',
    required: true,
    type: 'text',
  },
  {
    id: 'core_operations',
    label: 'Descreva as operações principais do negócio',
    placeholder: 'Ex: transporte rodoviário de cargas, terminais portuários, armazenagem, comércio exterior...',
    category: 'Core Business',
    required: true,
    type: 'textarea',
  },
  {
    id: 'physical_infrastructure',
    label: 'Infraestrutura física relevante de TI',
    placeholder: 'Ex: data centers on-premises nos terminais, sistemas SCADA, IoT em frota, servidores locais...',
    category: 'Infraestrutura',
    required: true,
    type: 'textarea',
  },
  {
    id: 'cloud_status',
    label: 'Qual o estágio de adoção de nuvem?',
    placeholder: '',
    category: 'Cloud & FinOps',
    required: true,
    type: 'select',
    options: [
      'Não utiliza nuvem (100% on-premises)',
      'Início de migração (menos de 20% na nuvem)',
      'Híbrido (20-60% na nuvem)',
      'Predominantemente cloud (60-90%)',
      'Cloud-native (90%+ na nuvem)',
    ],
  },
  {
    id: 'strategic_plan',
    label: 'Plano estratégico de modernização (se houver)',
    placeholder: 'Ex: Plano Horizonte 2029 para digitalização completa, migração SAP S/4HANA até 2027...',
    category: 'Estratégia',
    required: false,
    type: 'textarea',
  },
  {
    id: 'known_pain_points',
    label: 'Principais dores/problemas conhecidos de TI',
    placeholder: 'Ex: delay de 48h nos dados do ERP, falta de visibilidade de custos, vulnerabilidades SCADA, resistência à mudança...',
    category: 'Diagnóstico',
    required: true,
    type: 'textarea',
  },
  {
    id: 'compliance_requirements',
    label: 'Requisitos regulatórios ou normativos aplicáveis',
    placeholder: 'Ex: LGPD, ISPS Code (portos), ANTT, ISO 27001, SOX...',
    category: 'Compliance',
    required: false,
    type: 'text',
  },
];

// ── Etapa 2: Questionário de Maturidade FinOps / Governança ──
export const FINOPS_QUESTIONS: Question[] = [
  // Cultura FinOps
  { id: 'q1', text: 'Existe uma equipe ou pessoa dedicada a FinOps na organização?', category: 'Cultura FinOps', tooltip: 'Avalia a maturidade organizacional em gestão financeira de TI' },
  { id: 'q2', text: 'Os stakeholders de negócio participam ativamente das revisões de custos de TI?', category: 'Cultura FinOps', tooltip: 'COBIT EDM02 - Garantir Entrega de Benefícios' },
  { id: 'q3', text: 'A equipe operacional compreende o impacto financeiro de suas decisões técnicas?', category: 'Cultura FinOps', tooltip: 'Alinhamento entre TI e negócio' },

  // Visibilidade & Dados
  { id: 'q4', text: 'Os custos de TI (nuvem, on-premises, licenças) são alocados a unidades de negócio ou projetos?', category: 'Visibilidade & Dados', tooltip: 'COBIT APO06 - Gestão de Orçamento e Custos' },
  { id: 'q5', text: 'Você tem visibilidade em tempo real ou quase real-time dos gastos de TI?', category: 'Visibilidade & Dados', tooltip: 'Avalia a latência dos dados financeiros - delay de CSV é um indicador negativo' },
  { id: 'q6', text: 'Os recursos de infraestrutura (servidores, VMs, IoT, SCADA) são catalogados e tagueados?', category: 'Visibilidade & Dados', tooltip: 'ISO 27001 A.8 - Gestão de Ativos' },

  // Otimização & Eficiência
  { id: 'q7', text: 'Você revisa e encerra recursos não utilizados (servidores, licenças, instâncias) regularmente?', category: 'Otimização', tooltip: 'FinOps Optimize Phase' },
  { id: 'q8', text: 'Utiliza Instâncias Reservadas, Savings Plans ou negociação de contratos de longo prazo?', category: 'Otimização', tooltip: 'FinOps Committed Use Discounts' },
  { id: 'q9', text: 'Existe automação para redimensionamento ou desligamento de recursos ociosos?', category: 'Otimização', tooltip: 'COBIT BAI04 - Gestão de Disponibilidade e Capacidade' },

  // Governança & Compliance
  { id: 'q10', text: 'Existe um processo formal de aprovação para novos serviços ou mudanças de infraestrutura?', category: 'Governança', tooltip: 'ITIL Change Enablement / COBIT BAI06' },
  { id: 'q11', text: 'Os sistemas críticos (ERP, SCADA, IoT) possuem controles de segurança documentados?', category: 'Governança', tooltip: 'ISO 27001 Anexo A - Controles de Segurança' },
  { id: 'q12', text: 'Existe um plano de continuidade de negócios (BCP/DRP) testado e atualizado?', category: 'Governança', tooltip: 'ITIL Service Continuity / ISO 22301' },

  // Planejamento & Estratégia
  { id: 'q13', text: 'Existe um roadmap de modernização de TI alinhado à estratégia de negócio?', category: 'Planejamento', tooltip: 'COBIT APO02 - Gestão de Estratégia' },
  { id: 'q14', text: 'A integração entre sistemas legados e modernos está planejada e em execução?', category: 'Planejamento', tooltip: 'Avalia maturidade na migração de sistemas legados' },
  { id: 'q15', text: 'Existe mensuração de economia unitária (ex: custo por transação, custo por container, custo por km)?', category: 'Planejamento', tooltip: 'FinOps Unit Economics' },
];
