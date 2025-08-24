import {
  selectAllCards,
  selectCardsLoading,
  selectCardsError,
} from './card.selectors';
import { Card } from '@models/card';
import { CardState } from './card.state';

describe('Card Selectors', () => {
  const mockCards: Card[] = [
    {
      id: 1,
      title: 'Test Card 1',
      image: 'test1.jpg',
      rating: 4.5,
      description: 'First test card',
      author: 'Author 1',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      title: 'Test Card 2',
      image: 'test2.jpg',
      rating: 3.0,
      description: 'Second test card',
      author: 'Author 2',
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      title: 'Test Card 3',
      image: 'test3.jpg',
      rating: 5.0,
      description: 'Third test card',
      author: 'Author 3',
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
    },
  ];

  const createMockState = (cardState: Partial<CardState>) => ({
    cards: {
      cards: [],
      loading: false,
      error: null,
      ...cardState,
    },
  });

  describe('selectAllCards', () => {
    it('should return all cards from the state', () => {
      const state = createMockState({ cards: mockCards });
      const result = selectAllCards.projector(state.cards);

      expect(result).toEqual(mockCards);
      expect(result.length).toBe(3);
    });

    it('should return empty array when no cards exist', () => {
      const state = createMockState({ cards: [] });
      const result = selectAllCards.projector(state.cards);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should return immutable reference to cards', () => {
      const state = createMockState({ cards: mockCards });
      const result1 = selectAllCards.projector(state.cards);
      const result2 = selectAllCards.projector(state.cards);

      expect(result1).toBe(result2);
    });

    it('should handle state with undefined cards', () => {
      const state = createMockState({ cards: undefined as any });
      const result = selectAllCards.projector(state.cards);
      expect(result).toEqual([]);
    });
  });

  describe('selectCardsLoading', () => {
    it('should return true when loading', () => {
      const state = createMockState({ loading: true });
      const result = selectCardsLoading.projector(state.cards);

      expect(result).toBe(true);
    });

    it('should return false when not loading', () => {
      const state = createMockState({ loading: false });
      const result = selectCardsLoading.projector(state.cards);

      expect(result).toBe(false);
    });

    it('should return false by default', () => {
      const state = createMockState({});
      const result = selectCardsLoading.projector(state.cards);

      expect(result).toBe(false);
    });

    it('should handle undefined loading state', () => {
      const state = createMockState({ loading: undefined as any });
      const result = selectCardsLoading.projector(state.cards);

      expect(result).toBe(false);
    });
  });

  describe('selectCardsError', () => {
    it('should return error message when error exists', () => {
      const errorMessage = 'Failed to load cards';
      const state = createMockState({ error: errorMessage });
      const result = selectCardsError.projector(state.cards);

      expect(result).toBe(errorMessage);
    });

    it('should return null when no error exists', () => {
      const state = createMockState({ error: null });
      const result = selectCardsError.projector(state.cards);

      expect(result).toBe(null);
    });

    it('should return null by default', () => {
      const state = createMockState({});
      const result = selectCardsError.projector(state.cards);

      expect(result).toBe(null);
    });

    it('should handle different error types', () => {
      const errorMessage = 'Error object message';
      const state = createMockState({ error: errorMessage });
      const result = selectCardsError.projector(state.cards);

      expect(result).toBe(errorMessage);
    });

    it('should handle empty string error', () => {
      const state = createMockState({ error: '' });
      const result = selectCardsError.projector(state.cards);

      expect(result).toBe('');
    });
  });

  describe('Selector Memoization', () => {
    it('should return same reference when state has not changed for selectAllCards', () => {
      const state = createMockState({ cards: mockCards });
      const result1 = selectAllCards.projector(state.cards);
      const result2 = selectAllCards.projector(state.cards);

      expect(result1).toBe(result2);
    });

    it('should return different reference when cards change', () => {
      const state1 = createMockState({ cards: mockCards });
      const state2 = createMockState({ cards: [mockCards[0]] });

      const result1 = selectAllCards.projector(state1.cards);
      const result2 = selectAllCards.projector(state2.cards);

      expect(result1).not.toBe(result2);
      expect(result1.length).toBe(3);
      expect(result2.length).toBe(1);
    });

    it('should return same reference when loading state has not changed', () => {
      const state = createMockState({ loading: true });
      const result1 = selectCardsLoading.projector(state.cards);
      const result2 = selectCardsLoading.projector(state.cards);

      expect(result1).toBe(result2);
    });

    it('should return same reference when error state has not changed', () => {
      const error = 'Some error';
      const state = createMockState({ error });
      const result1 = selectCardsError.projector(state.cards);
      const result2 = selectCardsError.projector(state.cards);

      expect(result1).toBe(result2);
    });
  });

  describe('Combined State Scenarios', () => {
    it('should handle loading state with existing cards', () => {
      const state = createMockState({
        cards: mockCards,
        loading: true,
        error: null,
      });

      expect(selectAllCards.projector(state.cards)).toEqual(mockCards);
      expect(selectCardsLoading.projector(state.cards)).toBe(true);
      expect(selectCardsError.projector(state.cards)).toBe(null);
    });

    it('should handle error state with existing cards', () => {
      const error = 'Update failed';
      const state = createMockState({
        cards: mockCards,
        loading: false,
        error,
      });

      expect(selectAllCards.projector(state.cards)).toEqual(mockCards);
      expect(selectCardsLoading.projector(state.cards)).toBe(false);
      expect(selectCardsError.projector(state.cards)).toBe(error);
    });

    it('should handle clean state after successful operation', () => {
      const state = createMockState({
        cards: mockCards,
        loading: false,
        error: null,
      });

      expect(selectAllCards.projector(state.cards)).toEqual(mockCards);
      expect(selectCardsLoading.projector(state.cards)).toBe(false);
      expect(selectCardsError.projector(state.cards)).toBe(null);
    });

    it('should handle initial/empty state', () => {
      const state = createMockState({
        cards: [],
        loading: false,
        error: null,
      });

      expect(selectAllCards.projector(state.cards)).toEqual([]);
      expect(selectCardsLoading.projector(state.cards)).toBe(false);
      expect(selectCardsError.projector(state.cards)).toBe(null);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null card state gracefully', () => {
      const result1 = selectAllCards.projector(null as any);
      const result2 = selectCardsLoading.projector(null as any);
      const result3 = selectCardsError.projector(null as any);

      expect(result1).toEqual([]);
      expect(result2).toBe(false);
      expect(result3).toBeNull();
    });

    it('should handle undefined card state', () => {
      const result1 = selectAllCards.projector(undefined as any);
      const result2 = selectCardsLoading.projector(undefined as any);
      const result3 = selectCardsError.projector(undefined as any);

      expect(result1).toEqual([]);
      expect(result2).toBe(false);
      expect(result3).toBeNull();
    });

    it('should handle partial card state', () => {
      const partialState = { cards: mockCards } as CardState;

      expect(selectAllCards.projector(partialState)).toEqual(mockCards);
      expect(selectCardsLoading.projector(partialState)).toBe(false);
      expect(selectCardsError.projector(partialState)).toBeNull();
    });
  });
});
