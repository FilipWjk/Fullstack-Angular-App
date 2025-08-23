import { Card } from '../models/card';

export interface CardState {
  cards: Card[];
  loading: boolean;
  error: string | null;
}

export const initialCardState: CardState = {
  cards: [],
  loading: false,
  error: null,
};
