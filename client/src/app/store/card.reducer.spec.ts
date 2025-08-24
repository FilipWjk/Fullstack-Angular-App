import { cardReducer } from './card.reducer';
import { initialCardState } from './card.state';
import * as CardActions from './card.actions';
import { Card } from '@models/card';

describe('Card Reducer', () => {
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
  ];

  describe('Initial State', () => {
    it('should return the initial state', () => {
      const result = cardReducer(undefined, { type: 'unknown' } as any);

      expect(result).toEqual(initialCardState);
      expect(result.cards.length).toBe(0);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('Load Cards Actions', () => {
    it('should handle loadCards', () => {
      const result = cardReducer(initialCardState, CardActions.loadCards());

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle loadCardsSuccess', () => {
      const loadingState = { ...initialCardState, loading: true };
      const result = cardReducer(
        loadingState,
        CardActions.loadCardsSuccess({ cards: mockCards })
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.cards).toEqual(mockCards);
      expect(result.cards.length).toBe(2);
    });

    it('should handle loadCardsFailure', () => {
      const loadingState = { ...initialCardState, loading: true };
      const errorMessage = 'Failed to load cards';
      const result = cardReducer(
        loadingState,
        CardActions.loadCardsFailure({ error: errorMessage })
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.cards.length).toBe(0);
    });
  });

  describe('Add Card Actions', () => {
    it('should handle addCard', () => {
      const result = cardReducer(
        initialCardState,
        CardActions.addCard({
          card: {
            title: 'New Card',
            image: 'new.jpg',
            rating: 4,
            description: 'New card description',
            author: 'New Author',
          },
        })
      );

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle addCardSuccess', () => {
      const stateWithCards = { ...initialCardState, cards: mockCards };
      const newCard: Card = {
        id: 3,
        title: 'New Card',
        image: 'new.jpg',
        rating: 4,
        description: 'New card description',
        author: 'New Author',
        createdAt: '2025-01-03T00:00:00.000Z',
        updatedAt: '2025-01-03T00:00:00.000Z',
      };

      const result = cardReducer(
        stateWithCards,
        CardActions.addCardSuccess({ card: newCard })
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.cards.length).toBe(3);
      expect(result.cards[result.cards.length - 1]).toEqual(newCard);
    });

    it('should handle addCardFailure', () => {
      const loadingState = { ...initialCardState, loading: true };
      const errorMessage = 'Failed to add card';
      const result = cardReducer(
        loadingState,
        CardActions.addCardFailure({ error: errorMessage })
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.cards.length).toBe(0);
    });
  });

  describe('Update Card Actions', () => {
    it('should handle updateCard', () => {
      const result = cardReducer(
        initialCardState,
        CardActions.updateCard({
          id: 1,
          card: { title: 'Updated Title' },
        })
      );

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle updateCardSuccess', () => {
      const stateWithCards = { ...initialCardState, cards: mockCards };
      const updatedCard: Card = {
        ...mockCards[0],
        title: 'Updated Title',
        updatedAt: '2025-01-04T00:00:00.000Z',
      };

      const result = cardReducer(
        stateWithCards,
        CardActions.updateCardSuccess({ card: updatedCard })
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.cards.length).toBe(2);
      expect(result.cards[0].title).toBe('Updated Title');
      expect(result.cards[0].updatedAt).toBe('2025-01-04T00:00:00.000Z');
    });

    it('should handle updateCardFailure', () => {
      const loadingState = { ...initialCardState, loading: true };
      const errorMessage = 'Failed to update card';
      const result = cardReducer(
        loadingState,
        CardActions.updateCardFailure({ error: errorMessage })
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe(errorMessage);
    });
  });

  describe('Delete Card Actions', () => {
    it('should handle deleteCard', () => {
      const result = cardReducer(
        initialCardState,
        CardActions.deleteCard({ id: 1 })
      );

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle deleteCardSuccess', () => {
      const stateWithCards = { ...initialCardState, cards: mockCards };
      const result = cardReducer(
        stateWithCards,
        CardActions.deleteCardSuccess({ id: 1 })
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.cards.length).toBe(1);
      expect(result.cards[0].id).toBe(2);
    });

    it('should handle deleteCardFailure', () => {
      const loadingState = { ...initialCardState, loading: true };
      const errorMessage = 'Failed to delete card';
      const result = cardReducer(
        loadingState,
        CardActions.deleteCardFailure({ error: errorMessage })
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe(errorMessage);
    });
  });

  describe('State Immutability', () => {
    it('should not mutate the original state when adding a card', () => {
      const originalState = { ...initialCardState, cards: [...mockCards] };
      const originalCards = [...originalState.cards];
      const newCard: Card = {
        id: 3,
        title: 'New Card',
        image: 'new.jpg',
        rating: 4,
        description: 'New card description',
        author: 'New Author',
        createdAt: '2025-01-03T00:00:00.000Z',
        updatedAt: '2025-01-03T00:00:00.000Z',
      };

      const result = cardReducer(
        originalState,
        CardActions.addCardSuccess({ card: newCard })
      );

      expect(originalCards.length).toBe(2); // Original array unchanged
      expect(result.cards.length).toBe(3);
      expect(result.cards).not.toBe(originalState.cards);
    });

    it('should not mutate the original state when deleting a card', () => {
      const originalState = { ...initialCardState, cards: [...mockCards] };
      const originalCards = [...originalState.cards];

      const result = cardReducer(
        originalState,
        CardActions.deleteCardSuccess({ id: 1 })
      );

      expect(originalCards.length).toBe(2); // Original array unchanged
      expect(result.cards.length).toBe(1);
      expect(result.cards).not.toBe(originalState.cards);
    });

    it('should not mutate the original state when updating a card', () => {
      const originalState = { ...initialCardState, cards: [...mockCards] };
      const originalCard = { ...mockCards[0] };
      const updatedCard: Card = {
        ...mockCards[0],
        title: 'Updated Title',
      };

      const result = cardReducer(
        originalState,
        CardActions.updateCardSuccess({ card: updatedCard })
      );

      expect(originalCard.title).toBe('Test Card 1'); // Original unchanged
      expect(result.cards[0].title).toBe('Updated Title');
      expect(result.cards).not.toBe(originalState.cards);
    });
  });

  describe('Error State Management', () => {
    it('should clear error when starting a new operation', () => {
      const errorState = {
        ...initialCardState,
        error: 'Previous error',
      };

      let result = cardReducer(errorState, CardActions.loadCards());
      expect(result.error).toBeNull();

      result = cardReducer(
        errorState,
        CardActions.addCard({
          card: {
            title: 'New Card',
            image: 'new.jpg',
            rating: 4,
            description: 'New description',
            author: 'New Author',
          },
        })
      );
      expect(result.error).toBeNull();

      result = cardReducer(
        errorState,
        CardActions.updateCard({ id: 1, card: { title: 'Updated' } })
      );
      expect(result.error).toBeNull();

      result = cardReducer(errorState, CardActions.deleteCard({ id: 1 }));
      expect(result.error).toBeNull();
    });

    it('should preserve other state properties when setting errors', () => {
      const stateWithData = {
        ...initialCardState,
        cards: mockCards,
        loading: true,
      };

      const result = cardReducer(
        stateWithData,
        CardActions.loadCardsFailure({ error: 'Load failed' })
      );

      expect(result.cards).toEqual(mockCards); // Data preserved
      expect(result.loading).toBe(false);
      expect(result.error).toBe('Load failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle updating a non-existent card gracefully', () => {
      const stateWithCards = { ...initialCardState, cards: mockCards };
      const nonExistentCard: Card = {
        id: 999,
        title: 'Non-existent',
        image: 'none.jpg',
        rating: 1,
        description: 'This card does not exist',
        author: 'Nobody',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const result = cardReducer(
        stateWithCards,
        CardActions.updateCardSuccess({ card: nonExistentCard })
      );

      expect(result.cards.length).toBe(2); // No change
      expect(result.cards).toEqual(mockCards); // Original cards unchanged
    });

    it('should handle deleting a non-existent card gracefully', () => {
      const stateWithCards = { ...initialCardState, cards: mockCards };

      const result = cardReducer(
        stateWithCards,
        CardActions.deleteCardSuccess({ id: 999 })
      );

      expect(result.cards.length).toBe(2); // No change
      expect(result.cards).toEqual(mockCards); // Original cards unchanged
    });

    it('should handle empty cards array operations', () => {
      const emptyState = { ...initialCardState, cards: [] };

      const deleteResult = cardReducer(
        emptyState,
        CardActions.deleteCardSuccess({ id: 1 })
      );
      expect(deleteResult.cards.length).toBe(0);

      const updateResult = cardReducer(
        emptyState,
        CardActions.updateCardSuccess({
          card: {
            id: 1,
            title: 'Test',
            image: 'test.jpg',
            rating: 5,
            description: 'Test',
            author: 'Test',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        })
      );
      expect(updateResult.cards.length).toBe(0);
    });
  });
});
