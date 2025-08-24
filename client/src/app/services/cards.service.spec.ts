import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CardsService } from './cards.service';
import { Card } from '@models/card';
import { environment } from '../../environments/environment';

describe('CardsService', () => {
  let service: CardsService;
  let httpMock: HttpTestingController;

  const mockCard: Card = {
    id: 1,
    title: 'Test Card',
    image: 'test-image.jpg',
    rating: 4.5,
    description: 'Test description',
    author: 'Test Author',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const mockCards: Card[] = [
    mockCard,
    {
      id: 2,
      title: 'Second Card',
      image: 'second-image.jpg',
      rating: 3.0,
      description: 'Second description',
      author: 'Second Author',
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CardsService, provideZonelessChangeDetection()],
    });
    service = TestBed.inject(CardsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // * Hide Error output for expected errors
  beforeEach(() => {
    if (!(console.error as any).and) {
      spyOn(console, 'error').and.stub();
    }
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCards', () => {
    it('should retrieve cards from API', () => {
      service.getCards().subscribe({
        next: (cards) => {
          expect(cards).toEqual(mockCards);
          expect(cards.length).toBe(2);
        },
        error: () => fail('Expected successful response'),
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCards);
    });

    it('should handle empty response', () => {
      service.getCards().subscribe({
        next: (cards) => {
          expect(cards).toEqual([]);
          expect(cards.length).toBe(0);
        },
        error: () => fail('Expected successful response'),
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle HTTP error responses', () => {
      service.getCards().subscribe({
        next: () => fail('Expected error response'),
        error: (error) => {
          expect(error.message).toContain('Server Error 500');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      req.flush(
        { message: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle network errors', () => {
      service.getCards().subscribe({
        next: () => fail('Expected error response'),
        error: (error) => {
          expect(error.message).toContain('Unable to connect to server');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      req.error(new ProgressEvent('Network error'), { status: 0 });
    });

    it('should handle client-side errors', () => {
      const clientError = new ErrorEvent('Client Error', {
        message: 'Client side error occurred',
      });

      service.getCards().subscribe({
        next: () => fail('Expected error response'),
        error: (error) => {
          expect(error.message).toContain('Client Error');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      req.error(clientError);
    });
  });

  describe('addCard', () => {
    const newCardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'New Card',
      image: 'new-image.jpg',
      rating: 4.0,
      description: 'New description',
      author: 'New Author',
    };

    it('should add a new card', () => {
      const expectedCard: Card = {
        ...newCardData,
        id: 3,
        createdAt: '2025-01-03T00:00:00.000Z',
        updatedAt: '2025-01-03T00:00:00.000Z',
      };

      service.addCard(newCardData).subscribe({
        next: (card) => {
          expect(card).toEqual(expectedCard);
          expect(card.id).toBeDefined();
          expect(card.createdAt).toBeDefined();
          expect(card.updatedAt).toBeDefined();
        },
        error: () => fail('Expected successful response'),
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCardData);
      req.flush(expectedCard);
    });

    it('should handle validation errors', () => {
      service.addCard(newCardData).subscribe({
        next: () => fail('Expected error response'),
        error: (error) => {
          expect(error.message).toContain('Server Error 400');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      req.flush(
        { message: 'Validation failed' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should send correct request headers', () => {
      service.addCard(newCardData).subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockCard);
    });
  });

  describe('updateCard', () => {
    const updateData: Partial<Omit<Card, 'id'>> = {
      title: 'Updated Title',
      rating: 5.0,
    };

    it('should update an existing card', () => {
      const updatedCard: Card = {
        ...mockCard,
        ...updateData,
        updatedAt: '2025-01-04T00:00:00.000Z',
      };

      service.updateCard(1, updateData).subscribe({
        next: (card) => {
          expect(card).toEqual(updatedCard);
          expect(card.title).toBe('Updated Title');
          expect(card.rating).toBe(5.0);
        },
        error: () => fail('Expected successful response'),
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(updatedCard);
    });

    it('should handle non-existent card', () => {
      service.updateCard(999, updateData).subscribe({
        next: () => fail('Expected error response'),
        error: (error) => {
          expect(error.message).toContain('Server Error 404');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards/999`);
      req.flush(
        { message: 'Card not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should handle partial updates', () => {
      const partialUpdate = { title: 'Only Title Updated' };
      const partiallyUpdatedCard: Card = {
        ...mockCard,
        title: 'Only Title Updated',
        updatedAt: '2025-01-04T00:00:00.000Z',
      };

      service.updateCard(1, partialUpdate).subscribe({
        next: (card) => {
          expect(card.title).toBe('Only Title Updated');
          expect(card.rating).toBe(mockCard.rating); // Should remain unchanged
        },
        error: () => fail('Expected successful response'),
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards/1`);
      expect(req.request.body).toEqual(partialUpdate);
      req.flush(partiallyUpdatedCard);
    });
  });

  describe('deleteCard', () => {
    it('should delete a card', () => {
      service.deleteCard(1).subscribe({
        next: (result) => {
          expect(result).toEqual({ success: true });
        },
        error: () => fail('Expected successful response'),
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });

    it('should handle non-existent card deletion', () => {
      service.deleteCard(999).subscribe({
        next: () => fail('Expected error response'),
        error: (error) => {
          expect(error.message).toContain('Server Error 404');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards/999`);
      req.flush(
        { message: 'Card not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should handle server errors during deletion', () => {
      service.deleteCard(1).subscribe({
        next: () => fail('Expected error response'),
        error: (error) => {
          expect(error.message).toContain('Server Error 500');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards/1`);
      req.flush(
        { message: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('Error Handling', () => {
    it('should log error details to console', () => {
      // console.error already spied/stubbed in global beforeEach; just clear calls.
      (console.error as jasmine.Spy).calls.reset();
      service.getCards().subscribe({
        next: () => fail('Expected error response'),
        error: () => {
          expect(console.error).toHaveBeenCalledWith(
            'CardsService: Get cards error',
            jasmine.any(Object)
          );
          expect(console.error).toHaveBeenCalledWith(
            'CardsService Error Details:',
            jasmine.any(Object)
          );
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      req.flush(
        { message: 'Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should provide user-friendly error messages', () => {
      service.getCards().subscribe({
        next: () => fail('Expected error response'),
        error: (error) => {
          expect(error.message).not.toContain('Http failure response');
          expect(error.message).toContain('Server Error 500');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
      req.flush(
        { message: 'Database connection failed' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle different HTTP status codes appropriately', () => {
      const testCases = [
        { status: 400, expectedMessage: 'Server Error 400' },
        { status: 401, expectedMessage: 'Server Error 401' },
        { status: 403, expectedMessage: 'Server Error 403' },
        { status: 404, expectedMessage: 'Server Error 404' },
        { status: 500, expectedMessage: 'Server Error 500' },
      ];

      testCases.forEach((testCase, index) => {
        service.getCards().subscribe({
          next: () =>
            fail(`Expected error response for status ${testCase.status}`),
          error: (error) => {
            expect(error.message).toContain(testCase.expectedMessage);
          },
        });

        const req = httpMock.expectOne(`${environment.apiBaseUrl}/cards`);
        req.flush(
          { message: 'Error' },
          { status: testCase.status, statusText: 'Error' }
        );
      });
    });
  });
});
