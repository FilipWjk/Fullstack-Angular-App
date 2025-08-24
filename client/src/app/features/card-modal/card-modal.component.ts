import {
  Component,
  EventEmitter,
  Output,
  Input,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Card } from '@models/card';
import * as CardActions from '../../store/card.actions';

@Component({
  selector: 'app-card-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
})
export class CardCreateModalComponent implements OnInit {
  @Input() editMode = false;
  @Input() cardData: Card | null = null;
  @Output() cardCreated = new EventEmitter<Card>();
  @Output() modalClosed = new EventEmitter<void>();

  isSubmitting = false;
  error: string | null = null;

  //* Form data
  formData = {
    title: '',
    image: '',
    rating: 1,
    description: '',
    author: '',
  };

  constructor(private store: Store) {}

  ngOnInit() {
    if (this.editMode && this.cardData) {
      this.formData = {
        title: this.cardData.title,
        image: this.cardData.image,
        rating: this.cardData.rating,
        description: this.cardData.description,
        author: this.cardData.author,
      };
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      this.error = null;

      if (this.editMode && this.cardData) {
        // * Update existing card
        this.store.dispatch(
          CardActions.updateCard({
            id: this.cardData.id,
            card: this.formData,
          })
        );
      } else {
        // * Add new card
        this.store.dispatch(CardActions.addCard({ card: this.formData }));
      }

      // * Emit event and close modal
      this.cardCreated.emit();
      this.closeModal();
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.title.trim() &&
      this.formData.image.trim() &&
      this.formData.description.trim() &&
      this.formData.author.trim() &&
      this.formData.rating >= 0 &&
      this.formData.rating <= 5
    );
  }

  closeModal() {
    this.modalClosed.emit();
    this.resetForm();
  }

  private resetForm() {
    this.formData = {
      title: '',
      image: '',
      rating: 1,
      description: '',
      author: '',
    };
    this.isSubmitting = false;
    this.error = null;
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  //* Helper method to set a default image URL placeholder
  setDefaultImage() {
    if (!this.formData.image.trim()) {
      this.formData.image = '/assets/images/placeholder-image.svg';
    }
  }
}
