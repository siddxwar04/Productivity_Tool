/**
 * AI-ready flashcard generation architecture.
 * Swap `getFlashcardGenerator()` to plug in a real PDF/LLM provider later.
 */

export type FlashcardSourceType = 'pdf' | 'text' | 'url';

export interface FlashcardGeneratorInput {
  sourceType: FlashcardSourceType;
  sourceUri?: string;
  text?: string;
  deckId: string;
  maxCards?: number;
}

export interface GeneratedFlashcardDraft {
  front: string;
  back: string;
}

export interface FlashcardGeneratorResult {
  cards: GeneratedFlashcardDraft[];
  source: 'mock' | 'ai';
  metadata?: Record<string, string>;
}

export interface FlashcardGenerator {
  readonly name: string;
  generate(input: FlashcardGeneratorInput): Promise<FlashcardGeneratorResult>;
}

/** Placeholder generator until AI/PDF pipeline is connected. */
export const mockFlashcardGenerator: FlashcardGenerator = {
  name: 'mock',
  async generate(input) {
    const topic = input.text?.slice(0, 40) ?? 'Sample topic';
    return {
      source: 'mock',
      cards: [
        { front: `Key concept from ${topic}`, back: 'Definition or explanation' },
        { front: 'Important term', back: 'Meaning and example' },
        { front: 'Review question', back: 'Answer summary' },
      ],
      metadata: { note: 'Replace mockFlashcardGenerator with AI provider' },
    };
  },
};

let activeGenerator: FlashcardGenerator = mockFlashcardGenerator;

export function getFlashcardGenerator(): FlashcardGenerator {
  return activeGenerator;
}

/** Register a real AI/PDF generator at app startup when available. */
export function setFlashcardGenerator(generator: FlashcardGenerator): void {
  activeGenerator = generator;
}
