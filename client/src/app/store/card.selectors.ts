import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CardState } from './card.state';

export const selectCardState = createFeatureSelector<CardState>('cards');

export const selectAllCards = createSelector(
  selectCardState,
  (state) => state.cards
);

export const selectCardsLoading = createSelector(
  selectCardState,
  (state) => state.loading
);

export const selectCardsError = createSelector(
  selectCardState,
  (state) => state.error
);
