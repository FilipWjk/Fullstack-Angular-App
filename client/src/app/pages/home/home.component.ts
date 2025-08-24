import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Card } from '@models/card';
import { CardCreateModalComponent } from '@app/features/card-modal/card-modal.component';
import * as CardActions from '../../store/card.actions';
import {
  selectAllCards,
  selectCardsLoading,
  selectCardsError,
} from '../../store/card.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardCreateModalComponent,
    MatIconModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  recentCards: Card[] = [];
  showCreateModal = false;

  // * NgRx Store Observables
  cards$!: Observable<Card[]>;
  recentCards$!: Observable<Card[]>;
  isLoading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  constructor(private store: Store, private destroyRef: DestroyRef) {}

  ngOnInit() {
    // * Initialize store observables
    this.cards$ = this.store.select(selectAllCards);
    this.isLoading$ = this.store.select(selectCardsLoading);
    this.error$ = this.store.select(selectCardsError);

    // * Create observable for recent cards (last 3, reversed)
    this.recentCards$ = this.cards$.pipe(
      map((cards) => cards.slice(-3).reverse())
    );

    // * Subscribe to recent cards for local state
    this.recentCards$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cards) => {
        this.recentCards = cards;
      });

    this.loadRecentCards();
  }

  loadRecentCards() {
    this.store.dispatch(CardActions.loadCards());
  }

  createFirstCard() {
    this.showCreateModal = true;
  }

  onCardCreated(newCard: Card) {
    this.showCreateModal = false;
  }

  onModalClosed() {
    this.showCreateModal = false;
  }

  getRoundedRating(rating: number): number {
    return Math.round(rating);
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars)
    );
  }
}
