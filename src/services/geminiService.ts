import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

/**
 * Validates that the core business data contains sufficient information
 * about the client's actual business environment before generating a report.
 * This is a "guardrail" to prevent generating generic reports that don't
 * address the client's real operations (per professor feedback).
 */
function validateCoreBusinessAdherence(coreBusinessData: Record<string, string>): {
  valid: boolean;
  missingFields: string[];
} {
  const requiredFields = [
    { key: 'erp_system', label: 'Sistema ERP' },
    { key: 'erp_integration', label: 'Integração do ERP' },
    { key: 'core_operations', label: 'Operações principais' },
    { key: 'physical_infrastructure', label: 'Infraestrutura física' },
    { key: 'cloud_status', label: 'Status de adoção de nuvem' },
    { key: 'known_pain_points', label: 'Problemas conhecidos' },
  ];

  const missingFields = requiredFields
    .filter(f => !coreBusinessData[f.key] || coreBusinessData[f.key].trim().length < 3)
    .map(f => f.label);

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Generates the FinOps maturity report with full core business context.
 * The prompt is calibrated to diagnose the CLIENT's environment, not
 * the tool itself (addressing professor's critical feedback).
 */
export async function generateFinOpsReport(
  companyData: { name: string; sector: string; size: string },
  assessmentData: { averageScore: number; totalScore: number; answers: Record<string, number> },
  coreBusinessData?: Record<string, string>
) {
  // ── Guardrail: Validate core business data adherence (only if data was provided) ──
  const cbData = coreBusinessData || {};
  if (coreBusinessData) {
    const validation = validateCoreBusinessAdherence(coreBusinessData);
    if (!validation.valid) {
      return `⚠️ **Relatório Rejeitado — Dados Insuficientes do Core Business**\n\n` +
        `O sistema detectou que os seguintes dados obrigatórios sobre o ambiente de negócios do cliente não foram preenchidos:\n\n` +
        validation.missingFields.map(f => `- ❌ ${f}`).join('\n') +
        `\n\n**Ação necessária:** Retorne à etapa de Diagnóstico e preencha todos os campos obrigatórios sobre a infraestrutura e operações reais do cliente antes de gerar o relatório.\n\n` +
        `> Este controle existe para garantir que o relatório diagnostique o **ambiente de negócios do cliente**, e não apenas riscos genéricos de TI (Guardrail de Governança GenAI — ISO 27001 A.8).`;
    }
  }

  // ── Build contextual prompt focused on client's core business ──
  const prompt = `
Você é um consultor sênior de Governança de TI especializado em COBIT 2019, ITIL 4, ISO/IEC 27001, ISO 27005, frameworks FinOps e Guardrails de GenAI.

Gere um RELATÓRIO DE MATURIDADE E DIAGNÓSTICO DE GOVERNANÇA DE TI completo para o seguinte cliente:

═══════════════════════════════════════════════
DADOS DA EMPRESA
═══════════════════════════════════════════════
Nome: ${companyData.name}
Setor: ${companyData.sector}
Porte: ${companyData.size}

═══════════════════════════════════════════════
DIAGNÓSTICO DO CORE BUSINESS (DADOS REAIS)
═══════════════════════════════════════════════
Sistema ERP / Sistema Central: ${cbData.erp_system || 'Não informado'}
Integração de Dados do ERP: ${cbData.erp_integration || 'Não informado'}
Operações Principais: ${cbData.core_operations || 'Não informado'}
Infraestrutura Física de TI: ${cbData.physical_infrastructure || 'Não informado'}
Estágio de Adoção de Nuvem: ${cbData.cloud_status || 'Não informado'}
Plano Estratégico de Modernização: ${cbData.strategic_plan || 'Não informado'}
Dores / Problemas Conhecidos: ${cbData.known_pain_points || 'Não informado'}
Requisitos Regulatórios: ${cbData.compliance_requirements || 'Não informado'}

═══════════════════════════════════════════════
RESULTADOS DO QUESTIONÁRIO DE MATURIDADE
═══════════════════════════════════════════════
Score Médio: ${assessmentData.averageScore.toFixed(2)} / 5.0
Score Total: ${assessmentData.totalScore} / 75
Nível COBIT estimado: ${assessmentData.averageScore < 1 ? '0 - Incompleto' : assessmentData.averageScore < 2 ? '1 - Executado' : assessmentData.averageScore < 3 ? '2 - Gerenciado' : assessmentData.averageScore < 4 ? '3 - Estabelecido' : assessmentData.averageScore < 4.5 ? '4 - Previsível' : '5 - Inovador/Otimizado'}

Respostas detalhadas (escala 1-5):
${Object.entries(assessmentData.answers).map(([qId, score]) => `- Questão ${qId}: ${score}`).join('\n')}

═══════════════════════════════════════════════
ESTRUTURA OBRIGATÓRIA DO RELATÓRIO
═══════════════════════════════════════════════

O relatório DEVE conter as seguintes seções nesta ordem:

## 1. Resumo Executivo
- Visão geral do diagnóstico focada no AMBIENTE DE NEGÓCIOS do cliente
- Mencione explicitamente a infraestrutura real (ERP, sistemas físicos, operações)
- Score de maturidade com mapeamento COBIT 2019

## 2. Diagnóstico do Ambiente Atual
- Análise da Camada Física (infraestrutura, equipamentos, instalações)
- Análise da Camada de Aplicação (ERP, sistemas operacionais, integrações)
- Análise da Camada de Dados (fluxo de dados, gaps de real-time, qualidade)
- Análise da Camada Estratégica (alinhamento com plano de modernização)

## 3. Análise por Categoria de Maturidade
- Cultura FinOps
- Visibilidade & Dados
- Otimização & Eficiência
- Governança & Compliance
- Planejamento & Estratégia
Para cada categoria, analise com base nos dados REAIS do cliente, não genericamente.

## 4. Mapeamento de Capacidades COBIT 2019
- Tabela com processos COBIT relevantes (EDM01, EDM02, APO02, APO06, APO09, APO12, BAI03, BAI06, DSS05)
- Nível atual (0-5 conforme ISO/IEC 15504) vs. nível desejado
- Gap analysis

## 5. Matriz de Análise de Riscos (ISO 27005 / COBIT APO12)
- FOQUE nos riscos do CORE BUSINESS do cliente (ERP legado, infraestrutura física, integração de dados, operações)
- NÃO foque nos riscos da ferramenta de consultoria
- Tabela: Risco | Impacto | Probabilidade | Mitigação (com referência normativa)

## 6. Checklist de Conformidade ISO 27001 Anexo A
- Controles: A.5 (Políticas), A.6 (Organização), A.7 (RH), A.8 (Gestão de Ativos), A.9 (Controle de Acesso), A.12 (Segurança Operacional), A.13 (Comunicações), A.14 (Aquisição), A.17 (Continuidade), A.18 (Conformidade)
- Status: Atendido ✅ | Parcial ⚠️ | Não Atendido ❌
- Lacunas e ações recomendadas

## 7. Pontos Fortes e Áreas de Melhoria
- Baseie-se nos dados reais do cliente, não em suposições genéricas

## 8. Recomendações Práticas com Análise de Impacto de Mudança
- Para cada recomendação, avalie: Impacto em Segurança, Custos, Operação, Continuidade e Compliance
- Criticidade: Baixa | Média | Alta
- Dependências entre mudanças
- Referência ITIL Change Enablement

## 9. Plano de Ação por Horizontes
- 30 dias (Quick Wins): ações imediatas de alto impacto
- 60 dias (Estruturação): implementações de médio prazo
- 90 dias (Consolidação): ações alinhadas ao plano estratégico do cliente

## 10. Conclusão e Recomendações Executivas

REGRAS CRÍTICAS:
- O diagnóstico deve focar no AMBIENTE DE NEGÓCIOS DO CLIENTE, não nos riscos da ferramenta de consultoria
- Toda análise de risco deve referenciar a infraestrutura REAL informada pelo cliente
- Use níveis de capacidade COBIT 2019 (ISO/IEC 15504): 0-Incompleto até 5-Inovador
- Inclua referências normativas (COBIT, ITIL, ISO) em cada recomendação
- Tom profissional e consultivo
- Formate em Markdown com tabelas, listas e seções bem estruturadas
- DISCLAIMER: Inclua ao final uma nota informando que este relatório é gerado por IA e serve como subsídio para decisões, devendo ser validado por profissionais qualificados
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report:", error);
    return "❌ **Erro na Geração do Relatório**\n\nNão foi possível gerar o relatório no momento. Por favor, verifique sua conexão e tente novamente.\n\n> Se o erro persistir, verifique se a chave da API Gemini está configurada corretamente.";
  }
}
