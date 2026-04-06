/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const generateAnalysis = async (company: any, scores: any) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Você é um especialista sênior em Maturidade de TI e Transformação Digital. 
    Analise os seguintes resultados de uma avaliação de maturidade para a empresa "${company.name}" (Setor: ${company.sector}, Porte: ${company.size}).
    
    Scores por Categoria (Escala 1-5):
    ${Object.entries(scores.segmented).map(([cat, score]) => `- ${cat}: ${score}`).join('\n')}
    
    Score Geral: ${scores.overall}
    
    Gere um relatório estruturado em Português (Markdown) com:
    1. **Resumo Executivo**: Uma visão geral do estado atual.
    2. **Análise por Pilar**: Comentários sobre os pontos fortes e fracos em cada categoria.
    3. **Gaps Críticos**: Identifique o que mais está impedindo a empresa de evoluir.
    4. **Plano de Ação (Roadmap)**: 3 a 5 recomendações práticas e imediatas para aumentar o score de maturidade.
    
    Use um tom profissional, consultivo e encorajador.`,
  });

  const response = await model;
  return response.text;
};
