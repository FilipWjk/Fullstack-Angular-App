import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';

import { CardCreateModalComponent } from './card-modal.component';
import { Card } from '@models/card';
import * as CardActions from '../../store/card.actions';

describe('CardCreateModalComponent', () => {
  let component: CardCreateModalComponent;
  let fixture: ComponentFixture<CardCreateModalComponent>;
  let mockStore: MockStore;
  let dispatchSpy: jasmine.Spy;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        BrowserAnimationsModule,
        CardCreateModalComponent,
      ],
      providers: [
        provideMockStore({ initialState: {} }),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardCreateModalComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    dispatchSpy = spyOn(mockStore, 'dispatch');

    fixture.detectChanges();
  });

  afterEach(() => {
    dispatchSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default form values', () => {
      expect(component.formData.title).toBe('');
      expect(component.formData.image).toBe('');
      expect(component.formData.rating).toBe(1);
      expect(component.formData.description).toBe('');
      expect(component.formData.author).toBe('');
      expect(component.editMode).toBe(false);
      expect(component.isSubmitting).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should populate form when in edit mode', () => {
      component.editMode = true;
      component.cardData = mockCard;
      component.ngOnInit();

      expect(component.formData.title).toBe(mockCard.title);
      expect(component.formData.image).toBe(mockCard.image);
      expect(component.formData.rating).toBe(mockCard.rating);
      expect(component.formData.description).toBe(mockCard.description);
      expect(component.formData.author).toBe(mockCard.author);
    });

    it('should not populate form when not in edit mode', () => {
      component.editMode = false;
      component.cardData = mockCard;
      component.ngOnInit();

      expect(component.formData.title).toBe('');
      expect(component.formData.image).toBe('');
      expect(component.formData.rating).toBe(1);
      expect(component.formData.description).toBe('');
      expect(component.formData.author).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      expect(component.isFormValid()).toBe(false);

      component.formData = {
        title: 'Test Title',
        image: 'test.jpg',
        rating: 3,
        description: 'Test description',
        author: 'Test Author',
      };

      expect(component.isFormValid()).toBe(true);
    });

    it('should validate rating range', () => {
      component.formData = {
        title: 'Test',
        image: 'test.jpg',
        rating: -1,
        description: 'Test',
        author: 'Test',
      };
      expect(component.isFormValid()).toBe(false);

      component.formData.rating = 6;
      expect(component.isFormValid()).toBe(false);

      component.formData.rating = 0;
      expect(component.isFormValid()).toBe(true);

      component.formData.rating = 5;
      expect(component.isFormValid()).toBe(true);
    });

    it('should validate trimmed strings', () => {
      component.formData = {
        title: '   ',
        image: 'test.jpg',
        rating: 3,
        description: 'Test description',
        author: 'Test Author',
      };
      expect(component.isFormValid()).toBe(false);

      component.formData.title = 'Valid Title';
      expect(component.isFormValid()).toBe(true);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.formData = {
        title: 'Test Card',
        image: 'test.jpg',
        rating: 4,
        description: 'Test description',
        author: 'Test Author',
      };
    });

    it('should dispatch addCard action when creating new card', () => {
      component.editMode = false;
      component.onSubmit();

      const expectedCard = {
        title: 'Test Card',
        image: 'test.jpg',
        rating: 4,
        description: 'Test description',
        author: 'Test Author',
      };

      expect(dispatchSpy).toHaveBeenCalledWith(
        CardActions.addCard({ card: expectedCard })
      );
    });

    it('should dispatch updateCard action when editing existing card', () => {
      component.editMode = true;
      component.cardData = mockCard;
      component.onSubmit();

      const expectedCard = {
        title: 'Test Card',
        image: 'test.jpg',
        rating: 4,
        description: 'Test description',
        author: 'Test Author',
      };

      expect(dispatchSpy).toHaveBeenCalledWith(
        CardActions.updateCard({
          id: mockCard.id,
          card: expectedCard,
        })
      );
    });

    it('should not submit invalid form', () => {
      component.formData.title = '';
      component.onSubmit();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should set submitting state during form submission', () => {
      component.onSubmit();
      expect(component.isSubmitting).toBe(false);
    });

    it('should emit cardCreated event after submission', () => {
      spyOn(component.cardCreated, 'emit');
      component.onSubmit();
      expect(component.cardCreated.emit).toHaveBeenCalled();
    });

    it('should close modal after submission', () => {
      spyOn(component, 'closeModal');
      component.onSubmit();
      expect(component.closeModal).toHaveBeenCalled();
    });
  });

  describe('Modal Management', () => {
    it('should close modal and reset form', () => {
      component.formData.title = 'Test';
      component.isSubmitting = true;
      component.error = 'Test error';
      spyOn(component.modalClosed, 'emit');

      component.closeModal();

      expect(component.modalClosed.emit).toHaveBeenCalled();
      expect(component.formData.title).toBe('');
      expect(component.isSubmitting).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should handle backdrop clicks', () => {
      spyOn(component, 'closeModal');
      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: document.createElement('div'),
      } as any;

      mockEvent.target = mockEvent.currentTarget;
      component.onBackdropClick(mockEvent);
      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should not close on inner element clicks', () => {
      spyOn(component, 'closeModal');
      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: document.createElement('div'),
      } as any;

      component.onBackdropClick(mockEvent);
      expect(component.closeModal).not.toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should set default image when empty', () => {
      component.formData.image = '';
      component.setDefaultImage();
      expect(component.formData.image).toBe(
        '/assets/images/placeholder-image.svg'
      );
    });

    it('should not change existing image URL', () => {
      const existingImage = 'https://example.com/image.jpg';
      component.formData.image = existingImage;
      component.setDefaultImage();
      expect(component.formData.image).toBe(existingImage);
    });

    it('should handle whitespace in image field', () => {
      component.formData.image = '   ';
      component.setDefaultImage();
      expect(component.formData.image).toBe(
        '/assets/images/placeholder-image.svg'
      );
    });
  });

  describe('Error Handling', () => {
    it('should clear error on valid form submission', () => {
      component.error = 'Previous error';
      component.formData = {
        title: 'Valid Title',
        image: 'valid.jpg',
        rating: 3,
        description: 'Valid description',
        author: 'Valid Author',
      };

      component.onSubmit();
      expect(component.error).toBeNull();
    });
  });

  describe('Component Properties', () => {
    it('should have correct initial property values', () => {
      expect(component.editMode).toBe(false);
      expect(component.cardData).toBeNull();
      expect(component.isSubmitting).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should handle cardData being null in edit mode', () => {
      component.editMode = true;
      component.cardData = null;

      expect(() => component.ngOnInit()).not.toThrow();

      expect(component.formData.title).toBe('');
      expect(component.formData.image).toBe('');
      expect(component.formData.rating).toBe(1);
    });
  });

  describe('Integration Tests', () => {
    it('should complete create workflow', () => {
      component.editMode = false;
      component.formData = {
        title: 'New Card',
        image: 'new.jpg',
        rating: 4,
        description: 'New description',
        author: 'New Author',
      };

      spyOn(component.cardCreated, 'emit');
      spyOn(component.modalClosed, 'emit');

      const expectedPayload = { ...component.formData };

      // Submit form
      component.onSubmit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        CardActions.addCard({ card: expectedPayload })
      );
      expect(component.cardCreated.emit).toHaveBeenCalled();
      expect(component.modalClosed.emit).toHaveBeenCalled();
    });

    it('should complete edit workflow', () => {
      component.editMode = true;
      component.cardData = mockCard;
      component.formData = {
        title: 'Updated Card',
        image: 'updated.jpg',
        rating: 5,
        description: 'Updated description',
        author: 'Updated Author',
      };

      spyOn(component.cardCreated, 'emit');
      spyOn(component.modalClosed, 'emit');

      const expectedUpdate = { ...component.formData };

      component.onSubmit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        CardActions.updateCard({
          id: mockCard.id,
          card: expectedUpdate,
        })
      );
      expect(component.cardCreated.emit).toHaveBeenCalled();
      expect(component.modalClosed.emit).toHaveBeenCalled();
    });
  });
});
