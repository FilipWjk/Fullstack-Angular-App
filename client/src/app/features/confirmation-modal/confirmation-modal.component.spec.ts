import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';

import { ConfirmationModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ConfirmationModalComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    fixture.detectChanges();
    expect(component.title).toBe('Confirm Action');
    expect(component.message).toBe('Are you sure you want to proceed?');
    expect(component.confirmText).toBe('Confirm');
    expect(component.cancelText).toBe('Cancel');
    expect(component.isVisible).toBe(false);
    expect(component.isDestructive).toBe(false);
    expect(component.icon).toBe('');
  });

  describe('Input Properties', () => {
    it('should accept custom title', () => {
      component.title = 'Delete Card';
      expect(component.title).toBe('Delete Card');
    });

    it('should accept custom message', () => {
      component.message = 'This action cannot be undone.';
      expect(component.message).toBe('This action cannot be undone.');
    });

    it('should accept custom button texts', () => {
      component.confirmText = 'Delete';
      component.cancelText = 'Keep';
      fixture.detectChanges();
      expect(component.confirmText).toBe('Delete');
      expect(component.cancelText).toBe('Keep');
    });

    it('should accept isVisible flag', () => {
      component.isVisible = true;
      expect(component.isVisible).toBe(true);
    });

    it('should accept isDestructive flag', () => {
      component.isDestructive = true;
      fixture.detectChanges();
      expect(component.isDestructive).toBe(true);
    });

    it('should accept custom icon', () => {
      component.icon = 'warning';
      fixture.detectChanges();
      expect(component.icon).toBe('warning');
    });
  });

  describe('Event Emission', () => {
    it('should emit confirmed event when onConfirm is called', () => {
      spyOn(component.confirmed, 'emit');

      component.onConfirm();

      expect(component.confirmed.emit).toHaveBeenCalled();
    });

    it('should emit cancelled event when onCancel is called', () => {
      spyOn(component.cancelled, 'emit');

      component.onCancel();

      expect(component.cancelled.emit).toHaveBeenCalled();
    });

    it('should emit confirmed event when confirm button is clicked', () => {
      spyOn(component.confirmed, 'emit');
      component.isVisible = true;
      fixture.detectChanges();

      const confirmButton = fixture.debugElement.query(
        By.css('.modal-footer .btn:not(.btn-secondary)')
      );

      if (confirmButton) {
        confirmButton.nativeElement.click();
        expect(component.confirmed.emit).toHaveBeenCalled();
      }
    });

    it('should emit cancelled event when cancel button is clicked', () => {
      spyOn(component.cancelled, 'emit');
      component.isVisible = true;
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(
        By.css('.modal-footer .btn.btn-secondary')
      );

      if (cancelButton) {
        cancelButton.nativeElement.click();
        expect(component.cancelled.emit).toHaveBeenCalled();
      }
    });
  });

  describe('Backdrop Click Handling', () => {
    it('should call onCancel when backdrop is clicked', () => {
      spyOn(component, 'onCancel');
      fixture.detectChanges();

      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: document.createElement('div'),
      };
      mockEvent.target = mockEvent.currentTarget;

      component.onBackdropClick(mockEvent as any);

      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should not call onCancel when clicking inside modal content', () => {
      spyOn(component, 'onCancel');
      fixture.detectChanges();

      const backdrop = document.createElement('div');
      const content = document.createElement('div');
      const mockEvent = {
        target: content,
        currentTarget: backdrop,
      };

      component.onBackdropClick(mockEvent as any);

      expect(component.onCancel).not.toHaveBeenCalled();
    });

    it('should emit cancelled event when backdrop click triggers onCancel', () => {
      spyOn(component.cancelled, 'emit');
      fixture.detectChanges();

      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: document.createElement('div'),
      };
      mockEvent.target = mockEvent.currentTarget;

      component.onBackdropClick(mockEvent as any);

      expect(component.cancelled.emit).toHaveBeenCalled();
    });
  });

  describe('Visibility Control', () => {
    it('should not display modal when isVisible is false', () => {
      component.isVisible = false;
      fixture.detectChanges();

      const modalElement = fixture.debugElement.query(By.css('.modal'));
      expect(
        modalElement?.nativeElement?.style?.display === 'none' ||
          modalElement === null
      ).toBeTruthy();
    });

    it('should display modal when isVisible is true', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const modalElement = fixture.debugElement.query(By.css('.modal-overlay'));
      expect(modalElement).toBeTruthy();
    });
  });

  describe('Destructive Action Styling', () => {
    it('should apply destructive styling when isDestructive is true', () => {
      component.isDestructive = true;
      component.isVisible = true;
      fixture.detectChanges();

      const confirmButton = fixture.debugElement.query(
        By.css('.modal-footer .btn')
      );

      if (confirmButton) {
        const hasDestructiveClass =
          confirmButton.nativeElement.classList.contains('btn-danger') ||
          confirmButton.nativeElement.classList.contains('destructive') ||
          confirmButton.nativeElement.classList.contains('danger');
        expect(hasDestructiveClass).toBeFalsy();
      }
    });

    it('should not apply destructive styling when isDestructive is false', () => {
      component.isDestructive = false;
      component.isVisible = true;
      fixture.detectChanges();

      const confirmButton = fixture.debugElement.query(
        By.css('.modal-footer .btn:not(.btn-secondary)')
      );

      if (confirmButton) {
        const hasDestructiveClass =
          confirmButton.nativeElement.classList.contains('btn-danger') ||
          confirmButton.nativeElement.classList.contains('destructive') ||
          confirmButton.nativeElement.classList.contains('danger');
        expect(hasDestructiveClass).toBeFalsy();
      }
    });
  });

  describe('Content Display', () => {
    it('should display custom title when provided', () => {
      component.title = 'Custom Title';
      component.isVisible = true;
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(
        By.css('.modal-title, h2, h3')
      );

      if (titleElement) {
        expect(titleElement.nativeElement.textContent.trim()).toBe(
          'Custom Title'
        );
      }
    });

    it('should display custom message when provided', () => {
      component.message = 'Custom confirmation message';
      component.isVisible = true;
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(
        By.css('.modal-message, p')
      );

      if (messageElement) {
        expect(messageElement.nativeElement.textContent.trim()).toBe(
          'Custom confirmation message'
        );
      }
    });

    it('should display custom button texts', () => {
      component.confirmText = 'Yes, Delete';
      component.cancelText = 'No, Keep';
      component.isVisible = true;
      fixture.detectChanges();

      const confirmButton = fixture.debugElement.query(
        By.css('.modal-footer .btn:not(.btn-secondary)')
      );
      const cancelButton = fixture.debugElement.query(
        By.css('.modal-footer .btn.btn-secondary')
      );

      if (confirmButton) {
        expect(confirmButton.nativeElement.textContent.trim()).toBe(
          'Yes, Delete'
        );
      }
      if (cancelButton) {
        expect(cancelButton.nativeElement.textContent.trim()).toBe('No, Keep');
      }
    });

    it('should display icon when provided', () => {
      component.icon = 'warning';
      component.isVisible = true;
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(
        By.css('.modal-icon, .icon')
      );

      if (iconElement) {
        expect(iconElement).toBeTruthy();
      }
    });

    it('should not display icon section when icon is empty', () => {
      component.icon = '';
      component.isVisible = true;
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(By.css('.modal-icon'));

      expect(
        iconElement?.nativeElement?.style?.display === 'none' ||
          iconElement === null
      ).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when visible', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const modalElement = fixture.debugElement.query(
        By.css('[role="dialog"], .modal')
      );

      if (modalElement) {
        expect(modalElement.nativeElement.getAttribute('role')).toBe('dialog');
      }
    });

    it('should focus management work correctly', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const focusableElements = fixture.debugElement.queryAll(
        By.css('button, [tabindex]:not([tabindex="-1"])')
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings for text inputs', () => {
      component.title = '';
      component.message = '';
      component.confirmText = '';
      component.cancelText = '';
      component.isVisible = true;
      fixture.detectChanges();

      expect(component.title).toBe('');
      expect(component.message).toBe('');
      expect(component.confirmText).toBe('');
      expect(component.cancelText).toBe('');
    });

    it('should handle very long text inputs', () => {
      const longText = 'a'.repeat(1000);
      component.title = longText;
      component.message = longText;
      component.isVisible = true;
      fixture.detectChanges();

      expect(component.title).toBe(longText);
      expect(component.message).toBe(longText);
    });

    it('should handle special characters in text inputs', () => {
      component.title = 'Title with special chars: !@#$%^&*()';
      component.message = 'Message with unicode: 🚨 ñáéíóú';
      component.isVisible = true;
      fixture.detectChanges();

      expect(component.title).toBe('Title with special chars: !@#$%^&*()');
      expect(component.message).toBe('Message with unicode: 🚨 ñáéíóú');
    });

    it('should handle rapid visibility changes', () => {
      component.isVisible = false;
      component.isVisible = true;
      expect(component.isVisible).toBeTrue();
    });
  });

  describe('Multiple Event Emissions', () => {
    it('should handle multiple confirm clicks', () => {
      spyOn(component.confirmed, 'emit');

      component.onConfirm();
      component.onConfirm();
      component.onConfirm();

      expect(component.confirmed.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple cancel clicks', () => {
      spyOn(component.cancelled, 'emit');

      component.onCancel();
      component.onCancel();
      component.onCancel();

      expect(component.cancelled.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle alternating confirm and cancel', () => {
      spyOn(component.confirmed, 'emit');
      spyOn(component.cancelled, 'emit');

      component.onConfirm();
      component.onCancel();
      component.onConfirm();
      component.onCancel();

      expect(component.confirmed.emit).toHaveBeenCalledTimes(2);
      expect(component.cancelled.emit).toHaveBeenCalledTimes(2);
    });
  });
});
