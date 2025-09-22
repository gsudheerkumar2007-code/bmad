import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'ecommerce-theme-mode';
  private readonly DARK_THEME_CLASS = 'dark-theme';

  private themeModeSubject = new BehaviorSubject<ThemeMode>('auto');
  public themeMode$: Observable<ThemeMode> = this.themeModeSubject.asObservable();

  private isDarkSubject = new BehaviorSubject<boolean>(false);
  public isDark$: Observable<boolean> = this.isDarkSubject.asObservable();

  constructor() {
    this.initializeTheme();
    this.watchSystemTheme();
  }

  private initializeTheme(): void {
    const savedTheme = this.getSavedTheme();
    this.setThemeMode(savedTheme);
  }

  private getSavedTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem(this.THEME_KEY) as ThemeMode;
      return saved && ['light', 'dark', 'auto'].includes(saved) ? saved : 'auto';
    } catch {
      return 'auto';
    }
  }

  private saveTheme(mode: ThemeMode): void {
    try {
      localStorage.setItem(this.THEME_KEY, mode);
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  private watchSystemTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Listen for changes
      mediaQuery.addEventListener('change', (e) => {
        if (this.themeModeSubject.value === 'auto') {
          this.updateTheme(e.matches);
        }
      });

      // Apply initial theme if mode is auto
      if (this.themeModeSubject.value === 'auto') {
        this.updateTheme(mediaQuery.matches);
      }
    }
  }

  private updateTheme(isDark: boolean): void {
    this.isDarkSubject.next(isDark);

    if (typeof document !== 'undefined') {
      const body = document.body;
      if (isDark) {
        body.classList.add(this.DARK_THEME_CLASS);
      } else {
        body.classList.remove(this.DARK_THEME_CLASS);
      }
    }
  }

  public setThemeMode(mode: ThemeMode): void {
    this.themeModeSubject.next(mode);
    this.saveTheme(mode);

    switch (mode) {
      case 'light':
        this.updateTheme(false);
        break;
      case 'dark':
        this.updateTheme(true);
        break;
      case 'auto':
        if (typeof window !== 'undefined' && window.matchMedia) {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          this.updateTheme(isDark);
        } else {
          this.updateTheme(false); // Default to light if system preference is not available
        }
        break;
    }
  }

  public toggleTheme(): void {
    const currentMode = this.themeModeSubject.value;
    const isDark = this.isDarkSubject.value;

    if (currentMode === 'auto') {
      // If auto, switch to the opposite of current appearance
      this.setThemeMode(isDark ? 'light' : 'dark');
    } else if (currentMode === 'light') {
      this.setThemeMode('dark');
    } else {
      this.setThemeMode('light');
    }
  }

  public getCurrentThemeMode(): ThemeMode {
    return this.themeModeSubject.value;
  }

  public getCurrentIsDark(): boolean {
    return this.isDarkSubject.value;
  }

  // Utility methods for components
  public getThemeClass(): string {
    return this.isDarkSubject.value ? this.DARK_THEME_CLASS : '';
  }

  public isSystemDarkMode(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  // Reset theme to system default
  public resetToSystemDefault(): void {
    this.setThemeMode('auto');
  }

  // Get theme-aware colors
  public getThemeColors() {
    const isDark = this.isDarkSubject.value;
    return {
      primary: isDark ? '#64b5f6' : '#2196f3',
      accent: isDark ? '#ffb74d' : '#ff9800',
      warn: isDark ? '#ef5350' : '#f44336',
      background: isDark ? '#121212' : '#fafafa',
      surface: isDark ? '#1e1e1e' : '#ffffff',
      text: {
        primary: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
        secondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)'
      }
    };
  }
}