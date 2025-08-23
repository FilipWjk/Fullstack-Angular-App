import { createReducer, on } from '@ngrx/store';
import { initialCardState } from './card.state';
import * as CardActions from './card.actions';

export const cardReducer = createReducer(
  initialCardState,

  // * Load Cards
  on(CardActions.loadCards, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CardActions.loadCardsSuccess, (state, { cards }) => ({
    ...state,
    cards,
    loading: false,
    error: null,
  })),

  on(CardActions.loadCardsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // * Add Card
  on(CardActions.addCard, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CardActions.addCardSuccess, (state, { card }) => ({
    ...state,
    cards: state.cards.some((c) => c.id === card.id)
      ? state.cards.map((c) => (c.id === card.id ? { ...card } : c))
      : [...state.cards, card],
    loading: false,
    error: null,
  })),

  on(CardActions.addCardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // * Update Card
  on(CardActions.updateCard, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CardActions.updateCardSuccess, (state, { card }) => ({
    ...state,
    cards: state.cards.map((c) => (c.id === card.id ? { ...card } : c)),
    loading: false,
    error: null,
  })),

  on(CardActions.updateCardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // * Delete Card
  on(CardActions.deleteCard, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CardActions.deleteCardSuccess, (state, { id }) => ({
    ...state,
    cards: state.cards.filter((c) => c.id !== id),
    loading: false,
    error: null,
  })),

  on(CardActions.deleteCardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // * Clear Error
  on(CardActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
