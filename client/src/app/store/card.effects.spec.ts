import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { provideZonelessChangeDetection } from '@angular/core';
import { CardEffects } from './card.effects';
import { CardsService } from '@app/services/cards.service';
import * as CardActions from './card.actions';
import { Card } from '@models/card';

describe('CardEffects', () => {
  let effects: CardEffects;
  let actions$: Observable<Action>;
  let cardsService: jasmine.SpyObj<CardsService>;

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
      image: 'https://via.placeholder.com/300x200',
      rating: 3.0,
      description: 'Second test card',
      author: 'Author 2',
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    const cardsServiceSpy = jasmine.createSpyObj('CardsService', [
      'getCards',
      'addCard',
      'updateCard',
      'deleteCard',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CardEffects,
        provideMockActions(() => actions$),
        { provide: CardsService, useValue: cardsServiceSpy },
        provideZonelessChangeDetection(),
      ],
    });

    effects = TestBed.inject(CardEffects);
    cardsService = TestBed.inject(CardsService) as jasmine.SpyObj<CardsService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loadCards$', () => {
    it('should dispatch loadCardsSuccess on successful load', (done) => {
      cardsService.getCards.and.returnValue(of(mockCards));
      actions$ = of(CardActions.loadCards());

      effects.loadCards$.subscribe((action) => {
        expect(action.type).toBe(CardActions.loadCardsSuccess.type);
        expect((action as any).cards).toEqual([
          {
            ...mockCards[0],
          },
          {
            ...mockCards[1],
            image: '/assets/images/placeholder-image.svg', // Should sanitize placeholder URLs
          },
        ]);
        done();
      });
    });

    it('should dispatch loadCardsFailure on error', (done) => {
      const error = new Error('Failed to load cards');
      cardsService.getCards.and.returnValue(throwError(() => error));
      actions$ = of(CardActions.loadCards());

      effects.loadCards$.subscribe((action) => {
        expect(action.type).toBe(CardActions.loadCardsFailure.type);
        expect((action as any).error).toBe('Failed to load cards');
        done();
      });
    });

    it('should handle empty response', (done) => {
      cardsService.getCards.and.returnValue(of([]));
      actions$ = of(CardActions.loadCards());

      effects.loadCards$.subscribe((action) => {
        expect(action.type).toBe(CardActions.loadCardsSuccess.type);
        expect((action as any).cards).toEqual([]);
        done();
      });
    });

    it('should sanitize image URLs properly', (done) => {
      const cardsWithVariousImages: Card[] = [
        { ...mockCards[0], image: 'https://via.placeholder.com/300x200' },
        { ...mockCards[1], image: 'valid-image.jpg' },
        { ...mockCards[0], id: 3, image: '' },
        { ...mockCards[1], id: 4, image: null as any },
        { ...mockCards[0], id: 5, image: undefined as any },
        { ...mockCards[1], id: 6, image: '   ' },
      ];

      cardsService.getCards.and.returnValue(of(cardsWithVariousImages));
      actions$ = of(CardActions.loadCards());

      effects.loadCards$.subscribe((action) => {
        const cards = (action as any).cards;
        expect(cards[0].image).toBe('/assets/images/placeholder-image.svg');
        expect(cards[1].image).toBe('valid-image.jpg');
        expect(cards[2].image).toBe('/assets/images/placeholder-image.svg');
        expect(cards[3].image).toBe('/assets/images/placeholder-image.svg');
        expect(cards[4].image).toBe('/assets/images/placeholder-image.svg');
        expect(cards[5].image).toBe('/assets/images/placeholder-image.svg');
        done();
      });
    });
  });

  describe('addCard$', () => {
    const newCardData = {
      title: 'New Card',
      image: 'new-image.jpg',
      rating: 4.0,
      description: 'New description',
      author: 'New Author',
    };

    const newCard: Card = {
      id: 3,
      ...newCardData,
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
    };

    it('should dispatch addCardSuccess on successful add', (done) => {
      cardsService.addCard.and.returnValue(of(newCard));
      actions$ = of(CardActions.addCard({ card: newCardData }));

      effects.addCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.addCardSuccess.type);
        expect((action as any).card).toEqual(newCard);
        done();
      });
    });

    it('should dispatch addCardFailure on error', (done) => {
      const error = new Error('Failed to add card');
      cardsService.addCard.and.returnValue(throwError(() => error));
      actions$ = of(CardActions.addCard({ card: newCardData }));

      effects.addCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.addCardFailure.type);
        expect((action as any).error).toBe('Failed to add card');
        done();
      });
    });

    it('should sanitize image URL in added card', (done) => {
      const cardWithPlaceholderImage = {
        ...newCard,
        image: 'https://via.placeholder.com/300x200',
      };
      cardsService.addCard.and.returnValue(of(cardWithPlaceholderImage));
      actions$ = of(CardActions.addCard({ card: newCardData }));

      effects.addCard$.subscribe((action) => {
        expect((action as any).card.image).toBe(
          '/assets/images/placeholder-image.svg'
        );
        done();
      });
    });

    it('should handle HTTP error with status text', (done) => {
      const httpError = { statusText: 'Bad Request', message: undefined };
      cardsService.addCard.and.returnValue(throwError(() => httpError));
      actions$ = of(CardActions.addCard({ card: newCardData }));

      effects.addCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.addCardFailure.type);
        expect((action as any).error).toBe('Bad Request');
        done();
      });
    });
  });

  describe('updateCard$', () => {
    const updateData = { title: 'Updated Title', rating: 5.0 };
    const updatedCard: Card = {
      ...mockCards[0],
      ...updateData,
      updatedAt: '2025-01-04T00:00:00.000Z',
    };

    it('should dispatch updateCardSuccess on successful update', (done) => {
      cardsService.updateCard.and.returnValue(of(updatedCard));
      actions$ = of(CardActions.updateCard({ id: 1, card: updateData }));

      effects.updateCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.updateCardSuccess.type);
        expect((action as any).card).toEqual(updatedCard);
        done();
      });
    });

    it('should dispatch updateCardFailure on error', (done) => {
      const error = new Error('Failed to update card');
      cardsService.updateCard.and.returnValue(throwError(() => error));
      actions$ = of(CardActions.updateCard({ id: 1, card: updateData }));

      effects.updateCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.updateCardFailure.type);
        expect((action as any).error).toBe('Failed to update card');
        done();
      });
    });

    it('should sanitize image URL in updated card', (done) => {
      const cardWithPlaceholderImage = {
        ...updatedCard,
        image: 'https://via.placeholder.com/300x200',
      };
      cardsService.updateCard.and.returnValue(of(cardWithPlaceholderImage));
      actions$ = of(CardActions.updateCard({ id: 1, card: updateData }));

      effects.updateCard$.subscribe((action) => {
        expect((action as any).card.image).toBe(
          '/assets/images/placeholder-image.svg'
        );
        done();
      });
    });

    it('should handle update with partial data', (done) => {
      const partialUpdate = { title: 'Only Title Updated' };
      const partiallyUpdatedCard = { ...mockCards[0], ...partialUpdate };
      cardsService.updateCard.and.returnValue(of(partiallyUpdatedCard));
      actions$ = of(CardActions.updateCard({ id: 1, card: partialUpdate }));

      effects.updateCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.updateCardSuccess.type);
        expect((action as any).card.title).toBe('Only Title Updated');
        expect((action as any).card.rating).toBe(mockCards[0].rating);
        done();
      });
    });
  });

  describe('deleteCard$', () => {
    it('should dispatch deleteCardSuccess on successful delete', (done) => {
      cardsService.deleteCard.and.returnValue(of({ success: true }));
      actions$ = of(CardActions.deleteCard({ id: 1 }));

      effects.deleteCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.deleteCardSuccess.type);
        expect((action as any).id).toBe(1);
        done();
      });
    });

    it('should dispatch deleteCardFailure on error', (done) => {
      const error = new Error('Failed to delete card');
      cardsService.deleteCard.and.returnValue(throwError(() => error));
      actions$ = of(CardActions.deleteCard({ id: 1 }));

      effects.deleteCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.deleteCardFailure.type);
        expect((action as any).error).toBe('Failed to delete card');
        done();
      });
    });

    it('should handle 404 error for non-existent card', (done) => {
      const notFoundError = {
        statusText: 'Not Found',
        message: 'Card not found',
      };
      cardsService.deleteCard.and.returnValue(throwError(() => notFoundError));
      actions$ = of(CardActions.deleteCard({ id: 999 }));

      effects.deleteCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.deleteCardFailure.type);
        expect((action as any).error).toBe('Card not found');
        done();
      });
    });

    it('should handle unknown error format', (done) => {
      const unknownError = 'String error';
      cardsService.deleteCard.and.returnValue(throwError(() => unknownError));
      actions$ = of(CardActions.deleteCard({ id: 1 }));

      effects.deleteCard$.subscribe((action) => {
        expect(action.type).toBe(CardActions.deleteCardFailure.type);
        expect((action as any).error).toBe('Unknown error');
        done();
      });
    });
  });

  describe('Error Message Handling', () => {
    it('should extract message from error object', (done) => {
      const errorWithMessage = { message: 'Custom error message' };
      cardsService.getCards.and.returnValue(throwError(() => errorWithMessage));
      actions$ = of(CardActions.loadCards());

      effects.loadCards$.subscribe((action) => {
        expect((action as any).error).toBe('Custom error message');
        done();
      });
    });

    it('should extract statusText when message is not available', (done) => {
      const errorWithStatusText = { statusText: 'Internal Server Error' };
      cardsService.getCards.and.returnValue(
        throwError(() => errorWithStatusText)
      );
      actions$ = of(CardActions.loadCards());

      effects.loadCards$.subscribe((action) => {
        expect((action as any).error).toBe('Internal Server Error');
        done();
      });
    });

    it('should use default message for unknown error format', (done) => {
      const unknownError = null;
      cardsService.getCards.and.returnValue(throwError(() => unknownError));
      actions$ = of(CardActions.loadCards());

      effects.loadCards$.subscribe((action) => {
        expect((action as any).error).toBe('Unknown error');
        done();
      });
    });

    it('should prefer message over statusText', (done) => {
      const errorWithBoth = {
        message: 'Primary message',
        statusText: 'Secondary message',
      };
      cardsService.getCards.and.returnValue(throwError(() => errorWithBoth));
      actions$ = of(CardActions.loadCards());

      effects.loadCards$.subscribe((action) => {
        expect((action as any).error).toBe('Primary message');
        done();
      });
    });
  });

  describe('Image Sanitization Edge Cases', () => {
    it('should handle various placeholder URL formats', (done) => {
      const testCases = [
        'https://via.placeholder.com/300x200',
        'http://via.placeholder.com/150',
        'via.placeholder.com/300x200',
        'www.via.placeholder.com/test',
      ];

      testCases.forEach((imageUrl, index) => {
        const testCard = { ...mockCards[0], id: index + 1, image: imageUrl };
        cardsService.addCard.and.returnValue(of(testCard));
        actions$ = of(
          CardActions.addCard({
            card: {
              title: 'Test',
              image: imageUrl,
              rating: 4,
              description: 'Test',
              author: 'Test',
            },
          })
        );

        effects.addCard$.subscribe((action) => {
          expect((action as any).card.image).toBe(
            '/assets/images/placeholder-image.svg'
          );
          if (index === testCases.length - 1) done();
        });
      });
    });

    it('should preserve valid image URLs', (done) => {
      const validUrls = [
        'https://example.com/image.jpg',
        '/assets/images/custom.png',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'https://cdn.example.com/photos/123.webp',
      ];

      validUrls.forEach((imageUrl, index) => {
        const testCard = { ...mockCards[0], id: index + 1, image: imageUrl };
        cardsService.addCard.and.returnValue(of(testCard));
        actions$ = of(
          CardActions.addCard({
            card: {
              title: 'Test',
              image: imageUrl,
              rating: 4,
              description: 'Test',
              author: 'Test',
            },
          })
        );

        effects.addCard$.subscribe((action) => {
          expect((action as any).card.image).toBe(imageUrl);
          if (index === validUrls.length - 1) done();
        });
      });
    });
  });
});
