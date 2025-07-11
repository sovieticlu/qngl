import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { LanguageService } from '../../services/language.service';
import { Language } from '../../store/app.state';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="language-selector" #selectorRef (click)="$event.stopPropagation()">
      <button 
        class="language-selector-btn" 
        (click)="toggleDropdown($event)" 
        [class.open]="isDropdownOpen"
        type="button"
        #buttonRef
      >
        <span class="flag">{{ currentLanguage.flag }}</span>
        <span class="language-name">{{ currentLanguage.nativeName }}</span>
        <span class="dropdown-arrow">{{ isDropdownOpen ? '▲' : '▼' }}</span>
      </button>
      
      <div 
        class="language-menu" 
        *ngIf="isDropdownOpen"
        style="position: absolute; top: 100%; left: 0; margin-top: 4px;"
        #menuRef
        (click)="$event.stopPropagation()"
      >
        <div 
          class="language-menu-item"
          *ngFor="let language of supportedLanguages"
          [class.selected]="language.code === currentLanguage.code"
          (click)="selectLanguage(language, $event)"
        >
          <span class="flag">{{ language.flag }}</span>
          <span class="native-name">{{ language.nativeName }}</span>
          <span class="english-name">({{ language.name }})</span>
          <span class="check-icon" *ngIf="language.code === currentLanguage.code">✓</span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  @ViewChild('selectorRef', { static: false }) selectorRef!: ElementRef;
  @ViewChild('buttonRef', { static: false }) buttonRef!: ElementRef;
  @ViewChild('menuRef', { static: false }) menuRef!: ElementRef;

  currentLanguage!: Language;
  supportedLanguages: Language[] = [];
  isDropdownOpen = false;
  dropdownTop = 0;
  dropdownLeft = 0;
  private subscriptions = new Subscription();

  constructor(
    private languageService: LanguageService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('LanguageSelector initializing...');
    
    this.supportedLanguages = this.languageService.availableLanguages;
    this.updateCurrentLanguage();
    
    console.log('Current language:', this.currentLanguage);
    console.log('Supported languages:', this.supportedLanguages);

    // Subscribe to language changes
    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe((languageCode: string) => {
        console.log('Language changed to:', languageCode);
        this.updateCurrentLanguage();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // Ensure body class is removed when component is destroyed
    document.body.classList.remove('dropdown-open');
  }

  private updateCurrentLanguage(): void {
    const currentLangCode = this.languageService.currentLanguage;
    this.currentLanguage = this.supportedLanguages.find(lang => lang.code === currentLangCode) || this.supportedLanguages[0];
  }

  selectLanguage(language: Language, event?: Event): void {
    // Prevent event bubbling
    if (event) {
      event.stopPropagation();
    }
    
    if (language.code === this.currentLanguage.code) {
      this.closeDropdown();
      return; // Already selected
    }

    this.languageService.setLanguage(language.code);
    
    // Show notification using the correct API
    const message = this.languageService.translate('notifications.languageChanged', { 
      language: language.nativeName 
    });
    
    this.notificationService.success(message);
    this.closeDropdown();
  }

  toggleDropdown(event?: Event): void {
    console.log('Button clicked! Current state:', this.isDropdownOpen);
    
    // Always prevent event bubbling
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Simply toggle the state
    this.isDropdownOpen = !this.isDropdownOpen;
    
    console.log('After toggle, new state:', this.isDropdownOpen);
    
    // Force change detection
    this.cdr.detectChanges();
    
    if (this.isDropdownOpen) {
      console.log('Dropdown is now open');
      // Add body class to prevent scroll on mobile only
      if (window.innerWidth <= 767) {
        document.body.classList.add('dropdown-open');
      }
    } else {
      console.log('Dropdown is now closed');
      // Remove body class to restore scroll
      document.body.classList.remove('dropdown-open');
    }
  }

  private calculateDropdownPosition(): void {
    console.log('Calculating dropdown position...');
    
    if (!this.buttonRef || !this.buttonRef.nativeElement) {
      console.log('Button ref not available');
      // Set default position if button ref is not available
      this.dropdownTop = 60;
      this.dropdownLeft = 0;
      return;
    }

    try {
      const buttonRect = this.buttonRef.nativeElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth <= 767;
      
      console.log('Button rect:', buttonRect);
      
      // Position dropdown below the button by default
      let top = buttonRect.bottom + 4;
      let left = buttonRect.left;

      // Check if dropdown would go below viewport
      const menuHeight = 300; // max-height from CSS
      if (top + menuHeight > viewportHeight) {
        // Position above the button instead
        top = buttonRect.top - Math.min(menuHeight, viewportHeight * 0.4) - 4;
      }

      if (isMobile) {
        // On mobile, position from the right edge
        if (viewportWidth <= 480) {
          // Full width on very small screens
          left = 20;
        } else {
          // Align to right edge
          left = Math.max(20, viewportWidth - 200 - 20);
        }
      } else {
        // Check if dropdown would go beyond right edge
        const menuWidth = 200; // min-width from CSS
        if (left + menuWidth > viewportWidth) {
          left = Math.max(20, buttonRect.right - menuWidth);
        }
      }

      // Ensure dropdown doesn't go beyond viewport bounds
      top = Math.max(10, Math.min(top, viewportHeight - 100));
      left = Math.max(20, Math.min(left, viewportWidth - 220));

      this.dropdownTop = top;
      this.dropdownLeft = left;
      
      console.log('Calculated position:', { top, left });
    } catch (error) {
      console.error('Error calculating dropdown position:', error);
      // Fallback position
      this.dropdownTop = 60;
      this.dropdownLeft = 0;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    document.body.classList.remove('dropdown-open');
    this.cdr.detectChanges(); // Force change detection
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.isDropdownOpen) {
      return;
    }
    
    // Since we added stopPropagation to the component template,
    // any click that reaches here is outside the component
    this.closeDropdown();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isDropdownOpen) {
      this.calculateDropdownPosition();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isDropdownOpen) {
      this.calculateDropdownPosition();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    }
  }
}
