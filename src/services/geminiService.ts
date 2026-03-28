import { GoogleGenAI } from "@google/genai";
import { MaturityScore, Question, Answer } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateMaturityReport(
  companyName: string,
  scores: MaturityScore,
  questions: Question[],
  answers: Answer[]
) {
  const prompt = `
    Você é um consultor especialista em FinOps e Maturidade de TI.
    Gere um relatório executivo detalhado para a empresa "${companyName}" com base nos seguintes scores de maturidade (escala 0 a 4):
    
    - Score Geral: ${scores.overall.toFixed(2)}
    - Informar (Visibilidade): ${scores.informar.toFixed(2)}
    - Otimizar (Eficiência): ${scores.otimizar.toFixed(2)}
    - Operar (Governança): ${scores.operar.toFixed(2)}
    
    Detalhes das respostas:
    ${answers.map(a => {
      const q = questions.find(q => q.id === a.question_id);
      return `- Pergunta: ${q?.text} | Score: ${a.score} | Comentário: ${a.comments || "Nenhum"}`;
    }).join("\n")}
    
    O relatório deve conter:
    1. Resumo Executivo: Uma visão geral do estado atual.
    2. Análise por Pilar: O que está bom e o que precisa melhorar em Informar, Otimizar e Operar.
    3. Plano de Eficiência (ROI Imediato): Sugestões práticas para reduzir custos e aumentar a maturidade.
    4. Conclusão e Próximos Passos.
    
    Use uma linguagem profissional, técnica mas acessível a executivos (CFO/CTO).
    Formate o texto em Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report:", error);
    return "Erro ao gerar o relatório. Por favor, tente novamente.";
  }
}
