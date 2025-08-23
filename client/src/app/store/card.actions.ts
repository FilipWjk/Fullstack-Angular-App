import { createAction, props } from '@ngrx/store';
import { Card } from '../models/card';

// * Load Cards
export const loadCards = createAction('[Card] Load Cards');
export const loadCardsSuccess = createAction(
  '[Card] Load Cards Success',
  props<{ cards: Card[] }>()
);
export const loadCardsFailure = createAction(
  '[Card] Load Cards Failure',
  props<{ error: string }>()
);

// * Add Card
export const addCard = createAction(
  '[Card] Add Card',
  props<{ card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'> }>()
);
export const addCardSuccess = createAction(
  '[Card] Add Card Success',
  props<{ card: Card }>()
);
export const addCardFailure = createAction(
  '[Card] Add Card Failure',
  props<{ error: string }>()
);

// * Update Card
export const updateCard = createAction(
  '[Card] Update Card',
  props<{ id: number; card: Partial<Card> }>()
);
export const updateCardSuccess = createAction(
  '[Card] Update Card Success',
  props<{ card: Card }>()
);
export const updateCardFailure = createAction(
  '[Card] Update Card Failure',
  props<{ error: string }>()
);

// * Delete Card
export const deleteCard = createAction(
  '[Card] Delete Card',
  props<{ id: number }>()
);
export const deleteCardSuccess = createAction(
  '[Card] Delete Card Success',
  props<{ id: number }>()
);
export const deleteCardFailure = createAction(
  '[Card] Delete Card Failure',
  props<{ error: string }>()
);

// * Clear Error
export const clearError = createAction('[Card] Clear Error');
