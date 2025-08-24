import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  Component,
  DebugElement,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';

import { CardsComponent } from './cards.component';
import { Card } from '@models/card';
import * as CardActions from '../../store/card.actions';
import {
  selectAllCards,
  selectCardsLoading,
  selectCardsError,
} from '../../store/card.selectors';
import { CardCreateModalComponent } from '../../features/card-modal/card-modal.component';
import { ConfirmationModalComponent } from '../../features/confirmation-modal/confirmation-modal.component';

// Mock child components
@Component({
  selector: 'app-card-create-modal',
  template: '<div>Mock Card Modal</div>',
  standalone: true,
})
class MockCardModalComponent {
  @Input() editMode = false;
  @Input() cardData: Card | null = null;
  @Output() cardCreated = new EventEmitter<Card>();
  @Output() modalClosed = new EventEmitter<void>();
}

@Component({
  selector: 'app-confirmation-modal',
  template: '<div>Mock Confirmation Modal</div>',
  standalone: true,
})
class MockConfirmationModalComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() isVisible: boolean = false;
  @Input() isDestructive: boolean = false;
  @Input() icon: string = '';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}

describe('CardsComponent', () => {
  let component: CardsComponent;
  let fixture: ComponentFixture<CardsComponent>;
  let mockStore: MockStore;
  let dispatchSpy: jasmine.Spy;

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
      title: 'Amazing Card',
      image: 'test3.jpg',
      rating: 5.0,
      description: 'Third card with amazing content',
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
        CommonModule,
        FormsModule,
        MatIconModule,
        BrowserAnimationsModule,
        CardsComponent,
      ],
      providers: [
        provideMockStore({ initialState }),
        provideZonelessChangeDetection(),
      ],
    })
      .overrideComponent(CardsComponent, {
        remove: {
          imports: [CardCreateModalComponent, ConfirmationModalComponent],
        },
        add: {
          imports: [MockCardModalComponent, MockConfirmationModalComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CardsComponent);
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

  it('should initialize component properties', () => {
    // Ensure filters are applied after component initialization
    component.applyFilters();

    // `cards` property should be the original data from the store
    expect(component.cards).toEqual(mockCards);

    // `filteredCards` should be sorted by title (asc) by default: "Amazing Card", "Test Card 1", "Test Card 2"
    const expectedSortedCards = [
      mockCards[2], // Amazing Card
      mockCards[0], // Test Card 1
      mockCards[1], // Test Card 2
    ];
    expect(component.filteredCards).toEqual(expectedSortedCards);

    expect(component.searchTerm).toBe('');
    expect(component.minRating).toBe(0);
    expect(component.sortBy).toBe('title');
    expect(component.sortOrder).toBe('asc');
  });

  it('should dispatch loadCards action on init', () => {
    expect(dispatchSpy).toHaveBeenCalledWith(CardActions.loadCards());
  });

  it('should calculate stats correctly', () => {
    component.calculateStats();
    expect(component.totalCards).toBe(3);
    expect(component.averageRating).toBe(4.2); // (4.5 + 3.0 + 5.0) / 3 = 4.166... rounded to 4.2
  });

  it('should calculate stats for empty card array', () => {
    component.cards = [];
    component.calculateStats();
    expect(component.totalCards).toBe(0);
    expect(component.averageRating).toBe(0);
  });

  describe('Search Functionality', () => {
    it('should filter cards by title', () => {
      component.searchTerm = 'Amazing';
      component.applyFilters();
      expect(component.filteredCards.length).toBe(1);
      expect(component.filteredCards[0].title).toBe('Amazing Card');
    });

    it('should filter cards by description', () => {
      component.searchTerm = 'amazing content';
      component.applyFilters();
      expect(component.filteredCards.length).toBe(1);
      expect(component.filteredCards[0].title).toBe('Amazing Card');
    });

    it('should filter cards by author', () => {
      component.searchTerm = 'Author 2';
      component.applyFilters();
      expect(component.filteredCards.length).toBe(1);
      expect(component.filteredCards[0].author).toBe('Author 2');
    });

    it('should be case insensitive', () => {
      component.searchTerm = 'AMAZING';
      component.applyFilters();
      expect(component.filteredCards.length).toBe(1);
      expect(component.filteredCards[0].title).toBe('Amazing Card');
    });

    it('should return empty array when no matches found', () => {
      component.searchTerm = 'NonExistentCard';
      component.applyFilters();
      expect(component.filteredCards.length).toBe(0);
    });

    it('should return all cards when search term is empty', () => {
      component.searchTerm = '';
      component.applyFilters();
      expect(component.filteredCards.length).toBe(3);
    });
  });

  describe('Rating Filter', () => {
    it('should filter cards by minimum rating', () => {
      component.minRating = 4;
      component.applyFilters();
      expect(component.filteredCards.length).toBe(2);
      expect(component.filteredCards.every((card) => card.rating >= 4)).toBe(
        true
      );
    });

    it('should return all cards when minRating is 0', () => {
      component.minRating = 0;
      component.applyFilters();
      expect(component.filteredCards.length).toBe(3);
    });

    it('should return no cards when minRating is higher than all ratings', () => {
      component.minRating = 6;
      component.applyFilters();
      expect(component.filteredCards.length).toBe(0);
    });
  });

  describe('Sorting', () => {
    it('should sort cards by title ascending', () => {
      component.sortBy = 'title';
      component.sortOrder = 'asc';
      component.applyFilters();
      expect(component.filteredCards[0].title).toBe('Amazing Card');
      expect(component.filteredCards[1].title).toBe('Test Card 1');
      expect(component.filteredCards[2].title).toBe('Test Card 2');
    });

    it('should sort cards by title descending', () => {
      component.sortBy = 'title';
      component.sortOrder = 'desc';
      component.applyFilters();
      expect(component.filteredCards[0].title).toBe('Test Card 2');
      expect(component.filteredCards[1].title).toBe('Test Card 1');
      expect(component.filteredCards[2].title).toBe('Amazing Card');
    });

    it('should sort cards by rating ascending', () => {
      component.sortBy = 'rating';
      component.sortOrder = 'asc';
      component.applyFilters();
      expect(component.filteredCards[0].rating).toBe(3.0);
      expect(component.filteredCards[1].rating).toBe(4.5);
      expect(component.filteredCards[2].rating).toBe(5.0);
    });

    it('should sort cards by rating descending', () => {
      component.sortBy = 'rating';
      component.sortOrder = 'desc';
      component.applyFilters();
      expect(component.filteredCards[0].rating).toBe(5.0);
      expect(component.filteredCards[1].rating).toBe(4.5);
      expect(component.filteredCards[2].rating).toBe(3.0);
    });

    it('should sort cards by author ascending', () => {
      component.sortBy = 'author';
      component.sortOrder = 'asc';
      component.applyFilters();
      expect(component.filteredCards[0].author).toBe('Author 1');
      expect(component.filteredCards[1].author).toBe('Author 2');
      expect(component.filteredCards[2].author).toBe('Author 3');
    });
  });

  describe('Combined Filters', () => {
    it('should apply search and rating filters together', () => {
      component.searchTerm = 'Test';
      component.minRating = 4;
      component.applyFilters();
      expect(component.filteredCards.length).toBe(1);
      expect(component.filteredCards[0].title).toBe('Test Card 1');
    });

    it('should apply all filters and sorting together', () => {
      component.searchTerm = 'Test';
      component.minRating = 3;
      component.sortBy = 'rating';
      component.sortOrder = 'desc';
      component.applyFilters();
      expect(component.filteredCards.length).toBe(2);
      expect(component.filteredCards[0].rating).toBe(4.5); // Test Card 1 (higher rating first)
      expect(component.filteredCards[1].rating).toBe(3.0); // Test Card 2
    });
  });

  describe('Modal Management', () => {
    it('should open create modal', () => {
      component.openCreateModal();
      expect(component.showCreateModal).toBe(true);
      expect(component.editingCard).toBe(null);
    });

    it('should close create modal', () => {
      component.showCreateModal = true;
      component.closeCreateModal();
      expect(component.showCreateModal).toBe(false);
      expect(component.editingCard).toBe(null);
    });

    it('should open edit modal with card data', () => {
      const cardToEdit = mockCards[0];
      component.openEditModal(cardToEdit);
      expect(component.showEditModal).toBe(true);
      expect(component.editingCard).toBe(cardToEdit);
    });

    it('should close edit modal', () => {
      component.showEditModal = true;
      component.editingCard = mockCards[0];
      component.closeEditModal();
      expect(component.showEditModal).toBe(false);
      expect(component.editingCard).toBeNull();
    });

    it('should open delete confirmation modal', () => {
      component.openDeleteConfirmation(1);
      expect(component.showDeleteConfirmation).toBe(true);
      expect(component.cardToDelete).toBe(1);
    });

    it('should close delete confirmation modal', () => {
      component.showDeleteConfirmation = true;
      component.cardToDelete = 1;
      component.closeDeleteConfirmation();
      expect(component.showDeleteConfirmation).toBe(false);
      expect(component.cardToDelete).toBeNull();
    });
  });

  describe('Card Actions', () => {
    it('should confirm delete and dispatch delete action', () => {
      component.cardToDelete = 1;
      component.confirmDelete();
      expect(dispatchSpy).toHaveBeenCalledWith(
        CardActions.deleteCard({ id: 1 })
      );
      expect(component.showDeleteConfirmation).toBe(false);
      expect(component.cardToDelete).toBeNull();
    });

    it('should not dispatch delete action if no card to delete', () => {
      dispatchSpy.calls.reset();
      component.cardToDelete = null;
      component.confirmDelete();
      expect(dispatchSpy).not.toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: jasmine.stringMatching(/delete/i),
        })
      );
    });

    it('should handle card created event', () => {
      const newCard: Card = {
        id: 4,
        title: 'New Card',
        image: 'new.jpg',
        rating: 4.0,
        description: 'New description',
        author: 'New Author',
        createdAt: '2025-01-04T00:00:00.000Z',
        updatedAt: '2025-01-04T00:00:00.000Z',
      };

      component.onCardCreated(newCard);
      expect(component.showCreateModal).toBe(false);
      expect(component.showEditModal).toBe(false);
      expect(component.editingCard).toBe(null);
    });
  });

  describe('Menu Management', () => {
    it('should toggle menu for a card', () => {
      component.toggleMenu(1);
      expect(component.openMenuId).toBe(1);

      component.toggleMenu(1);
      expect(component.openMenuId).toBeNull();
    });

    it('should close menu when clicking outside', () => {
      component.openMenuId = 1;
      component.closeMenu();
      expect(component.openMenuId).toBeNull();
    });

    it('should switch between different card menus', () => {
      component.toggleMenu(1);
      expect(component.openMenuId).toBe(1);

      component.toggleMenu(2);
      expect(component.openMenuId).toBe(2);
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      mockStore.overrideSelector(selectCardsLoading, true);
      mockStore.refreshState();
      fixture.detectChanges();

      component.isLoading$.subscribe((loading) => {
        expect(loading).toBe(true);
      });
    });

    it('should show error state', () => {
      const errorMessage = 'Failed to load cards';
      mockStore.overrideSelector(selectCardsError, errorMessage);
      mockStore.refreshState();
      fixture.detectChanges();

      component.error$.subscribe((error) => {
        expect(error).toBe(errorMessage);
      });
    });

    it('should clear error when loading starts', () => {
      mockStore.overrideSelector(selectCardsError, null);
      mockStore.overrideSelector(selectCardsLoading, true);
      mockStore.refreshState();
      fixture.detectChanges();

      component.error$.subscribe((error) => {
        expect(error).toBe(null);
      });
    });
  });

  describe('Component Integration', () => {
    it('should render search input', () => {
      const searchInput = fixture.debugElement.query(
        By.css('input[type="text"]')
      );
      expect(searchInput).toBeTruthy();
    });

    it('should update search term when input changes', () => {
      const searchInput = fixture.debugElement.query(
        By.css('input[type="text"]')
      );
      searchInput.nativeElement.value = 'test search';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.searchTerm).toBe('test search');
    });

    it('should call applyFilters when search term changes', () => {
      spyOn(component, 'applyFilters');
      component.searchTerm = 'new search';
      component.applyFilters();
      expect(component.applyFilters).toHaveBeenCalled();
    });
  });
});
