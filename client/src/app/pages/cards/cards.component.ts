import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Card } from '@models/card';
import { CardCreateModalComponent } from '@app/features/card-modal/card-modal.component';
import { ConfirmationModalComponent } from '@features/confirmation-modal/confirmation-modal.component';
import * as CardActions from '../../store/card.actions';
import {
  selectAllCards,
  selectCardsLoading,
  selectCardsError,
} from '../../store/card.selectors';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardCreateModalComponent,
    ConfirmationModalComponent,
    MatIconModule,
  ],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent implements OnInit {
  // * Local state for UI management
  cards: Card[] = [];
  filteredCards: Card[] = [];

  // * Filters
  searchTerm = '';
  minRating = 0;
  sortBy: 'title' | 'rating' | 'author' = 'title';
  sortOrder: 'asc' | 'desc' = 'asc';

  // * Stats
  totalCards = 0;
  averageRating = 0;

  // * Edit functionality
  showCreateModal = false;
  showEditModal = false;
  editingCard: Card | null = null;
  openMenuId: number | null = null;

  // * Confirmation modal
  showDeleteConfirmation = false;
  cardToDelete: number | null = null;

  // ! NgRx Store Observables
  cards$!: Observable<Card[]>;
  isLoading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  constructor(private store: Store, private destroyRef: DestroyRef) {}

  ngOnInit() {
    // * Initialize store observables
    this.cards$ = this.store.select(selectAllCards);
    this.isLoading$ = this.store.select(selectCardsLoading);
    this.error$ = this.store.select(selectCardsError);

    // * Subscribe to cards changes
    this.cards$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((cards) => {
      this.cards = cards;
      this.calculateStats();
      this.applyFilters();
    });

    // * Load cards from the store
    this.loadCards();
  }

  loadCards() {
    this.store.dispatch(CardActions.loadCards());
  }

  applyFilters() {
    let filtered = [...this.cards];

    // * Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.title.toLowerCase().includes(search) ||
          card.description.toLowerCase().includes(search) ||
          card.author.toLowerCase().includes(search)
      );
    }

    // * Rating filter
    if (this.minRating > 0) {
      filtered = filtered.filter((card) => card.rating >= this.minRating);
    }

    // * Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
      }
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredCards = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onRatingFilterChange() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  calculateStats() {
    this.totalCards = this.cards.length;
    if (this.cards.length > 0) {
      const totalRating = this.cards.reduce(
        (sum, card) => sum + card.rating,
        0
      );
      this.averageRating =
        Math.round((totalRating / this.cards.length) * 10) / 10;
    } else {
      this.averageRating = 0;
    }
  }

  deleteCard(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.openDeleteConfirmation(id);
  }

  openDeleteConfirmation(cardId: number) {
    this.cardToDelete = cardId;
    this.showDeleteConfirmation = true;
    this.openMenuId = null; // Close the menu
  }

  confirmDelete() {
    if (this.cardToDelete === null) return;

    this.store.dispatch(CardActions.deleteCard({ id: this.cardToDelete }));
    this.closeDeleteConfirmation();
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirmation = false;
    this.cardToDelete = null;
  }

  getRoundedRating(rating: number): number {
    return Math.round(rating * 10) / 10;
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars)
    );
  }

  clearFilters() {
    this.searchTerm = '';
    this.minRating = 0;
    this.sortBy = 'title';
    this.sortOrder = 'asc';
    this.applyFilters();
  }

  startCreate() {
    this.showCreateModal = true;
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  onCardCreated(event?: any) {
    this.closeCreateModal();
  }

  onModalClosed() {
    this.closeCreateModal();
    this.closeEditModal();
  }

  startEdit(card: Card, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.editingCard = card;
    this.showEditModal = true;
    this.openMenuId = null; // * Close the menu
  }

  openEditModal(card: Card) {
    this.editingCard = card;
    this.showEditModal = true;
    this.openMenuId = null; // * Close the menu
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingCard = null;
  }

  onCardUpdated(event?: any) {
    this.closeEditModal();
  }

  closeMenu() {
    this.openMenuId = null;
  }

  toggleMenu(cardId: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.openMenuId = this.openMenuId === cardId ? null : cardId;
  }
}
