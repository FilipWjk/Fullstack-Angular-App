import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { Card } from '@models/card';
import * as CardActions from '../../store/card.actions';
import {
  selectAllCards,
  selectCardsLoading,
  selectCardsError,
} from '../../store/card.selectors';

@Component({
  selector: 'app-card-create-modal',
  template: '<div>Mock Card Modal</div>',
})
class MockCardModalComponent {
  editMode = false;
  cardData: Card | null = null;
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockStore: MockStore;
  let dispatchSpy: jasmine.Spy;

  const mockCards: Card[] = [
    {
      id: 1,
      title: 'First Card',
      image: 'first.jpg',
      rating: 4.5,
      description: 'First description',
      author: 'Author 1',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      title: 'Second Card',
      image: 'second.jpg',
      rating: 3.8,
      description: 'Second description',
      author: 'Author 2',
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      title: 'Third Card',
      image: 'third.jpg',
      rating: 4.2,
      description: 'Third description',
      author: 'Author 3',
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
    },
  ];

  const initialState = {
    cards: {
      cards: mockCards,
      loading: false,
      error: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        CommonModule,
        RouterTestingModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [
        provideMockStore({ initialState }),
        provideZonelessChangeDetection(),
      ],
    })
      .overrideComponent(HomeComponent, {
        remove: {
          imports: [MockCardModalComponent],
        },
        add: {
          imports: [MockCardModalComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    dispatchSpy = spyOn(mockStore, 'dispatch');

    // Mock selectors
    mockStore.overrideSelector(selectAllCards, mockCards);
    mockStore.overrideSelector(selectCardsLoading, false);
    mockStore.overrideSelector(selectCardsError, null);

    fixture.detectChanges();
  });

  afterEach(() => {
    mockStore?.resetSelectors();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct observables', () => {
    expect(component.cards$).toBeDefined();
    expect(component.recentCards$).toBeDefined();
    expect(component.isLoading$).toBeDefined();
    expect(component.error$).toBeDefined();
  });

  it('should load recent cards on init', () => {
    expect(dispatchSpy).toHaveBeenCalledWith(CardActions.loadCards());
  });

  describe('Card Creation Modal', () => {
    it('should open create modal', () => {
      expect(component.showCreateModal).toBe(false);
      component.createFirstCard();
      expect(component.showCreateModal).toBe(true);
    });

    it('should close modal when card is created', () => {
      component.showCreateModal = true;
      const newCard: Card = {
        id: 4,
        title: 'New Card',
        image: 'new.jpg',
        rating: 5.0,
        description: 'New description',
        author: 'New Author',
        createdAt: '2025-01-04T00:00:00.000Z',
        updatedAt: '2025-01-04T00:00:00.000Z',
      };

      component.onCardCreated(newCard);
      expect(component.showCreateModal).toBe(false);
    });

    it('should close modal when modal is closed', () => {
      component.showCreateModal = true;
      component.onModalClosed();
      expect(component.showCreateModal).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should round rating correctly', () => {
      expect(component.getRoundedRating(4.3)).toBe(4);
      expect(component.getRoundedRating(4.6)).toBe(5);
      expect(component.getRoundedRating(4.5)).toBe(5);
      expect(component.getRoundedRating(3.2)).toBe(3);
    });

    it('should generate rating stars correctly', () => {
      expect(component.getRatingStars(5)).toBe('★★★★★');
      expect(component.getRatingStars(4)).toBe('★★★★☆');
      expect(component.getRatingStars(3.5)).toBe('★★★☆☆');
      expect(component.getRatingStars(2.5)).toBe('★★☆☆☆');
      expect(component.getRatingStars(1)).toBe('★☆☆☆☆');
      expect(component.getRatingStars(0)).toBe('☆☆☆☆☆');
    });
  });

  describe('Store Integration', () => {
    it('should respond to store changes', () => {
      const newCards: Card[] = [
        {
          id: 4,
          title: 'Fourth Card',
          image: 'fourth.jpg',
          rating: 4.9,
          description: 'Fourth description',
          author: 'Author 4',
          createdAt: '2025-01-04T00:00:00.000Z',
          updatedAt: '2025-01-04T00:00:00.000Z',
        },
      ];

      mockStore.overrideSelector(selectAllCards, newCards);
      mockStore.refreshState();

      component.recentCards$.subscribe((cards) => {
        expect(cards).toEqual([newCards[0]]);
      });
    });

    it('should handle loading state', () => {
      mockStore.overrideSelector(selectCardsLoading, true);
      mockStore.refreshState();

      component.isLoading$.subscribe((loading) => {
        expect(loading).toBe(true);
      });
    });

    it('should handle error state', () => {
      const errorMessage = 'Failed to load cards';
      mockStore.overrideSelector(selectCardsError, errorMessage);
      mockStore.refreshState();

      component.error$.subscribe((error) => {
        expect(error).toBe(errorMessage);
      });
    });
  });

  describe('Recent Cards Logic', () => {
    it('should subscribe to recent cards and update local state', (done) => {
      component.recentCards$.subscribe((cards) => {
        // Recent cards should be last 3 cards in reverse order
        expect(cards).toEqual([mockCards[2], mockCards[1], mockCards[0]]);
        expect(component.recentCards).toEqual([
          mockCards[2],
          mockCards[1],
          mockCards[0],
        ]);
        done();
      });
    });

    it('should handle empty cards array', () => {
      mockStore.overrideSelector(selectAllCards, []);
      mockStore.refreshState();

      component.recentCards$.subscribe((cards) => {
        expect(cards).toEqual([]);
      });
    });

    it('should handle single card', () => {
      const singleCard = [mockCards[0]];
      mockStore.overrideSelector(selectAllCards, singleCard);
      mockStore.refreshState();

      component.recentCards$.subscribe((cards) => {
        expect(cards).toEqual([mockCards[0]]);
      });
    });

    it('should handle two cards', () => {
      const twoCards = [mockCards[0], mockCards[1]];
      mockStore.overrideSelector(selectAllCards, twoCards);
      mockStore.refreshState();

      component.recentCards$.subscribe((cards) => {
        expect(cards).toEqual([mockCards[1], mockCards[0]]); // reversed
      });
    });

    it('should limit to 3 recent cards', () => {
      const manyCards: Card[] = [...mockCards];
      for (let i = 4; i <= 10; i++) {
        manyCards.push({
          id: i,
          title: `Card ${i}`,
          image: `card${i}.jpg`,
          rating: 3.0,
          description: `Description ${i}`,
          author: `Author ${i}`,
          createdAt: `2025-01-0${i}T00:00:00.000Z`,
          updatedAt: `2025-01-0${i}T00:00:00.000Z`,
        });
      }

      mockStore.overrideSelector(selectAllCards, manyCards);
      mockStore.refreshState();

      component.recentCards$.subscribe((cards) => {
        expect(cards.length).toBe(3);
        // Should be the last 3 cards in reverse order
        expect(cards[0].id).toBe(10); // Most recent first
        expect(cards[1].id).toBe(9);
        expect(cards[2].id).toBe(8);
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should call loadRecentCards on init', () => {
      spyOn(component, 'loadRecentCards');
      component.ngOnInit();
      expect(component.loadRecentCards).toHaveBeenCalled();
    });

    it('should dispatch loadCards action when loadRecentCards is called', () => {
      dispatchSpy.calls.reset(); //* Clear previous calls
      component.loadRecentCards();
      expect(dispatchSpy).toHaveBeenCalledWith(CardActions.loadCards());
    });
  });
});
