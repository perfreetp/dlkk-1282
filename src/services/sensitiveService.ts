import { SensitiveCheckResult } from '../types';
import { checkSensitiveWords } from '../utils/checkSensitive';

export function validateSensitive(text: string): SensitiveCheckResult {
  return checkSensitiveWords(text);
}

export function getRiskLevel(result: SensitiveCheckResult): 'safe' | 'warning' | 'danger' {
  if (!result.hasRisk) return 'safe';

  const forbiddenCount = result.words.filter(w => w.type === 'forbidden').length;
  const extremeCount = result.words.filter(w => w.type === 'extreme').length;
  const falseClaimCount = result.words.filter(w => w.type === 'false_claim').length;

  if (forbiddenCount > 0) return 'danger';
  if (extremeCount > 2 || falseClaimCount > 2) return 'danger';
  if (result.words.length > 3) return 'warning';

  return 'warning';
}

export function suggestFixes(result: SensitiveCheckResult): string[] {
  const suggestions: string[] = [];

  result.words.forEach(word => {
    if (word.suggestion) {
      suggestions.push(`"${word.word}" 可以替换为 "${word.suggestion}"`);
    }
  });

  return suggestions;
}
