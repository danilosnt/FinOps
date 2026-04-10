import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
