import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, mergeMap, catchError } from 'rxjs/operators';
import { CardsService } from '@app/services/cards.service';
import * as CardActions from './card.actions';
import { Card } from '../models/card';

function getErrorMessage(error: any): string {
  return error?.message || error?.statusText || 'Unknown error';
}

function sanitizeImageUrl(imageUrl: string | null | undefined): string {
  return imageUrl &&
    typeof imageUrl === 'string' &&
    imageUrl.includes('via.placeholder.com')
    ? '/assets/images/placeholder-image.svg'
    : imageUrl && imageUrl.trim()
    ? imageUrl
    : '/assets/images/placeholder-image.svg';
}

@Injectable()
export class CardEffects {
  private actions$ = inject(Actions);
  private cardService = inject(CardsService);

  loadCards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CardActions.loadCards),
      switchMap(() =>
        this.cardService.getCards().pipe(
          map((apiCards) => {
            const cards = apiCards.map((apiCard: Card) => ({
              ...apiCard,
              image: sanitizeImageUrl(apiCard.image),
            }));
            return CardActions.loadCardsSuccess({ cards });
          }),
          catchError((error) =>
            of(CardActions.loadCardsFailure({ error: getErrorMessage(error) }))
          )
        )
      )
    )
  );

  addCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CardActions.addCard),
      mergeMap(({ card }) =>
        this.cardService.addCard(card).pipe(
          map((apiCard: Card) => {
            return CardActions.addCardSuccess({
              card: {
                ...apiCard,
                image: sanitizeImageUrl(apiCard.image),
              },
            });
          }),
          catchError((error) =>
            of(CardActions.addCardFailure({ error: getErrorMessage(error) }))
          )
        )
      )
    )
  );

  updateCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CardActions.updateCard),
      switchMap(({ id, card }) =>
        this.cardService.updateCard(id, card).pipe(
          map((updated: Card) => {
            return CardActions.updateCardSuccess({
              card: {
                ...updated,
                image: sanitizeImageUrl(updated.image),
              },
            });
          }),
          catchError((error) =>
            of(CardActions.updateCardFailure({ error: getErrorMessage(error) }))
          )
        )
      )
    )
  );

  deleteCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CardActions.deleteCard),
      mergeMap(({ id }) =>
        this.cardService.deleteCard(id).pipe(
          map(() => CardActions.deleteCardSuccess({ id })),
          catchError((error) =>
            of(CardActions.deleteCardFailure({ error: getErrorMessage(error) }))
          )
        )
      )
    )
  );
}
