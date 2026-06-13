import { SensitiveWord, SensitiveCheckResult } from '../types';
import { FORBIDDEN_WORDS, EXTREME_WORDS, FALSE_CLAIM_WORDS, REPLACEMENT_SUGGESTIONS } from './sensitive';

export function checkSensitiveWords(text: string): SensitiveCheckResult {
  const words: SensitiveWord[] = [];
  const allSensitiveWords = [...FORBIDDEN_WORDS, ...EXTREME_WORDS, ...FALSE_CLAIM_WORDS];
  const suggestions: string[] = [];

  allSensitiveWords.forEach(sensitiveWord => {
    const regex = new RegExp(sensitiveWord, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      let type: 'forbidden' | 'extreme' | 'false_claim';
      if (FORBIDDEN_WORDS.includes(sensitiveWord)) {
        type = 'forbidden';
      } else if (EXTREME_WORDS.includes(sensitiveWord)) {
        type = 'extreme';
      } else {
        type = 'false_claim';
      }

      words.push({
        word: match[0],
        type,
        position: match.index,
        suggestion: REPLACEMENT_SUGGESTIONS[sensitiveWord]?.[0],
      });

      if (REPLACEMENT_SUGGESTIONS[sensitiveWord]) {
        suggestions.push(...REPLACEMENT_SUGGESTIONS[sensitiveWord]);
      }
    }
  });

  words.sort((a, b) => a.position - b.position);

  return {
    hasRisk: words.length > 0,
    words,
    suggestions: [...new Set(suggestions)],
  };
}

export function highlightSensitiveWords(text: string, words: SensitiveWord[]): string {
  if (words.length === 0) return text;

  let result = text;
  const parts: { text: string; isHighlight: boolean }[] = [];
  let lastIndex = 0;

  words.forEach(word => {
    if (lastIndex < word.position) {
      parts.push({
        text: text.slice(lastIndex, word.position),
        isHighlight: false,
      });
    }
    parts.push({
      text: word.word,
      isHighlight: true,
    });
    lastIndex = word.position + word.word.length;
  });

  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isHighlight: false,
    });
  }

  return parts.map(part => part.isHighlight ? `<mark class="bg-danger-100 text-danger-700 px-1 rounded">${part.text}</mark>` : part.text).join('');
}
