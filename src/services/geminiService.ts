import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export async function generateFinOpsReport(companyData: any, assessmentData: any) {
  const prompt = `
    Você é um especialista em FinOps e Maturidade de TI. 
    Gere um relatório detalhado de maturidade FinOps para a seguinte empresa:
    
    Empresa: ${companyData.name}
    Setor: ${companyData.sector}
    Porte: ${companyData.size}
    
    Resultados do Questionário:
    Score Médio: ${assessmentData.averageScore.toFixed(2)} / 5.0
    Score Total: ${assessmentData.totalScore} / 75
    
    Respostas detalhadas (escala 1-5):
    ${Object.entries(assessmentData.answers).map(([qId, score]) => `- Questão ${qId}: ${score}`).join('\n')}
    
    O relatório deve conter:
    1. Resumo Executivo.
    2. Análise por categoria (Cultura, Visibilidade, Otimização, Governança, Planejamento).
    3. Pontos Fortes.
    4. Áreas de Melhoria.
    5. Recomendações Práticas (Próximos Passos).
    6. Checklist de Conformidade baseado nos controles do Anexo A da ISO/IEC 27001, com status por controle (Atendido, Parcial, Não Atendido), lacunas e ações recomendadas.
    7. Módulo de Análise de Impacto de Mudança dentro das recomendações, avaliando impacto em Segurança, Custos, Operação, Continuidade e Compliance, com criticidade (Baixa, Média, Alta) e dependências.

    Regras adicionais obrigatórias:
    - Calibre a avaliação de maturidade e o score final utilizando os níveis de capacidade do COBIT 2019 baseados na ISO/IEC 15504, mapeando explicitamente os níveis de 0 a 5 (0 Incompleto, 1 Executado, 2 Gerenciado, 3 Estabelecido, 4 Previsível, 5 Inovador/Otimizado).
    - Mostre no relatório o mapeamento entre o score do questionário (1-5) e o nível de capacidade COBIT correspondente.
    - Inclua uma seção final de priorização com ações por horizonte (30, 60 e 90 dias), considerando as lacunas de ISO 27001 Anexo A e os impactos de mudança.
    
    Use um tom profissional e consultivo. Formate em Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report:", error);
    return "Não foi possível gerar o relatório no momento. Por favor, tente novamente mais tarde.";
  }
}
