/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QUESTIONS } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateScores(answers: Record<string, number>) {
  const categoryScores: Record<string, { total: number; count: number }> = {};
  
  Object.entries(answers).forEach(([qId, score]) => {
    const question = QUESTIONS.find(q => q.id === qId);
    if (question) {
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { total: 0, count: 0 };
      }
      categoryScores[question.category].total += score;
      categoryScores[question.category].count += 1;
    }
  });

  const segmented: Record<string, number> = {};
  let overallTotal = 0;
  let overallCount = 0;

  Object.entries(categoryScores).forEach(([cat, data]) => {
    segmented[cat] = Number((data.total / data.count).toFixed(1));
    overallTotal += data.total;
    overallCount += data.count;
  });

  const overall = overallCount > 0 ? Number((overallTotal / overallCount).toFixed(1)) : 0;

  return { segmented, overall };
}
