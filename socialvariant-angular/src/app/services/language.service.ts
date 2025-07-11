import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { AppStore } from '../store/app.store';
import { LanguageState, Language } from '../store/app.state';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translationsCache = new Map<string, any>();
  private readonly defaultTranslations = {
    'en': {
      'common': {
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'cancel': 'Cancel',
        'save': 'Save',
        'delete': 'Delete',
        'edit': 'Edit',
        'add': 'Add',
        'search': 'Search',
        'filter': 'Filter',
        'sort': 'Sort',
        'export': 'Export',
        'import': 'Import',
        'settings': 'Settings',
        'profile': 'Profile',
        'logout': 'Logout',
        'login': 'Login',
        'register': 'Register',
        'forgotPassword': 'Forgot Password',
        'resetPassword': 'Reset Password',
        'changePassword': 'Change Password',
        'confirm': 'Confirm',
        'close': 'Close',
        'open': 'Open',
        'collapse': 'Collapse',
        'expand': 'Expand',
        'yes': 'Yes',
        'no': 'No'
      },
      'navigation': {
        'dashboard': 'Dashboard',
        'home': 'Home',
        'about': 'About',
        'contact': 'Contact',
        'help': 'Help',
        'faq': 'FAQ',
        'privacy': 'Privacy Policy',
        'terms': 'Terms of Service'
      },
      'auth': {
        'loginTitle': 'Sign In',
        'registerTitle': 'Create Account',
        'email': 'Email',
        'password': 'Password',
        'confirmPassword': 'Confirm Password',
        'rememberMe': 'Remember me',
        'forgotPassword': 'Forgot your password?',
        'noAccount': "Don't have an account?",
        'hasAccount': 'Already have an account?',
        'signUp': 'Sign up',
        'signIn': 'Sign in',
        'signOut': 'Sign out',
        'welcomeBack': 'Welcome back!',
        'createAccount': 'Create your account'
      },
      'errors': {
        'required': 'This field is required',
        'email': 'Please enter a valid email',
        'minLength': 'Minimum length is {min} characters',
        'maxLength': 'Maximum length is {max} characters',
        'passwordMismatch': 'Passwords do not match',
        'loginFailed': 'Login failed. Please check your credentials.',
        'networkError': 'Network error. Please try again.',
        'serverError': 'Server error. Please try again later.',
        'notFound': 'Resource not found',
        'unauthorized': 'You are not authorized to access this resource',
        'forbidden': 'Access forbidden'
      },
      'messages': {
        'loginSuccess': 'Successfully logged in',
        'logoutSuccess': 'Successfully logged out',
        'registerSuccess': 'Account created successfully',
        'passwordResetSent': 'Password reset email sent',
        'passwordChanged': 'Password changed successfully',
        'profileUpdated': 'Profile updated successfully',
        'settingsSaved': 'Settings saved successfully'
      }
    }
  };

  constructor(
    private store: AppStore,
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.initializeLanguage();
  }

  // Getters for reactive state
  get languageState$(): Observable<LanguageState> {
    return this.store.language$;
  }

  get currentLanguage$(): Observable<string> {
    return this.store.currentLanguage$;
  }

  get currentLanguage(): string {
    return this.store.state.language.currentLanguage;
  }

  get availableLanguages(): Language[] {
    return this.store.state.language.availableLanguages;
  }

  get translations(): any {
    return this.store.state.language.translations;
  }

  get isLoading(): boolean {
    return this.store.state.language.isLoading;
  }

  /**
   * Set the application language
   */
  setLanguage(languageCode: string): void {
    if (this.isLanguageSupported(languageCode)) {
      this.store.dispatch('SET_LANGUAGE', languageCode);
      this.loadTranslations(languageCode);
      this.applyLanguageToDOM(languageCode);
      this.persistLanguage(languageCode);
    } else {
      console.warn(`Language ${languageCode} is not supported`);
    }
  }

  /**
   * Load translations for a specific language
   */
  loadTranslations(languageCode: string): void {
    // Check cache first
    if (this.translationsCache.has(languageCode)) {
      this.store.dispatch('SET_TRANSLATIONS', this.translationsCache.get(languageCode));
      return;
    }

    // Check if we have default translations
    if (this.defaultTranslations[languageCode as keyof typeof this.defaultTranslations]) {
      const translations = this.defaultTranslations[languageCode as keyof typeof this.defaultTranslations];
      this.translationsCache.set(languageCode, translations);
      this.store.dispatch('SET_TRANSLATIONS', translations);
      return;
    }

    // Load from external source
    this.store.dispatch('SET_LANGUAGE_LOADING', true);
    
    this.loadTranslationsFromFile(languageCode)
      .pipe(
        finalize(() => this.store.dispatch('SET_LANGUAGE_LOADING', false))
      )
      .subscribe({
        next: (translations) => {
          this.translationsCache.set(languageCode, translations);
          this.store.dispatch('SET_TRANSLATIONS', translations);
        },
        error: (error) => {
          console.error(`Failed to load translations for ${languageCode}:`, error);
          // Fallback to English if available
          if (languageCode !== 'en' && this.defaultTranslations['en']) {
            this.translationsCache.set(languageCode, this.defaultTranslations['en']);
            this.store.dispatch('SET_TRANSLATIONS', this.defaultTranslations['en']);
          }
        }
      });
  }

  /**
   * Get a translated string by key
   */
  translate(key: string, params?: { [key: string]: any }): string {
    const translations = this.translations;
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value === 'string') {
      return this.interpolateParams(value, params);
    }

    return key;
  }

  /**
   * Get translated string as Observable
   */
  translate$(key: string, params?: { [key: string]: any }): Observable<string> {
    return this.languageState$.pipe(
      map(() => this.translate(key, params))
    );
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.availableLanguages.some(lang => lang.code === languageCode);
  }

  /**
   * Get browser's preferred language
   */
  getBrowserLanguage(): string {
    if (typeof navigator === 'undefined') {
      return 'en'; // Default for SSR
    }

    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    return this.isLanguageSupported(langCode) ? langCode : 'en';
  }

  /**
   * Get language direction (LTR/RTL)
   */
  getLanguageDirection(languageCode?: string): 'ltr' | 'rtl' {
    const lang = languageCode || this.currentLanguage;
    const language = this.availableLanguages.find(l => l.code === lang);
    return language?.isRTL ? 'rtl' : 'ltr';
  }

  /**
   * Apply language changes to DOM
   */
  private applyLanguageToDOM(languageCode: string): void {
    if (typeof document === 'undefined') {
      return; // Skip for SSR
    }

    const htmlElement = this.document.documentElement;
    const language = this.availableLanguages.find(l => l.code === languageCode);
    
    if (language) {
      htmlElement.setAttribute('lang', language.code);
      htmlElement.setAttribute('dir', language.isRTL ? 'rtl' : 'ltr');
    }
  }

  /**
   * Initialize language service
   */
  private initializeLanguage(): void {
    const savedLanguage = this.getPersistedLanguage();
    const initialLanguage = savedLanguage || this.getBrowserLanguage();
    
    if (initialLanguage !== this.currentLanguage) {
      this.setLanguage(initialLanguage);
    } else {
      this.loadTranslations(initialLanguage);
      this.applyLanguageToDOM(initialLanguage);
    }
  }

  /**
   * Load translations from file/API
   */
  private loadTranslationsFromFile(languageCode: string): Observable<any> {
    // Try to load from assets/i18n folder
    return this.http.get(`/assets/i18n/${languageCode}.json`).pipe(
      catchError((error) => {
        console.warn(`Failed to load translations from file for ${languageCode}:`, error);
        return of({}); // Return empty object on error
      })
    );
  }

  /**
   * Interpolate parameters in translation strings
   */
  private interpolateParams(text: string, params?: { [key: string]: any }): string {
    if (!params) {
      return text;
    }

    return text.replace(/{(\w+)}/g, (match, key) => {
      return params[key] !== undefined ? params[key].toString() : match;
    });
  }

  /**
   * Persist language preference
   */
  private persistLanguage(languageCode: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app-language', languageCode);
    }
  }

  /**
   * Get persisted language preference
   */
  private getPersistedLanguage(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('app-language');
    }
    return null;
  }
}