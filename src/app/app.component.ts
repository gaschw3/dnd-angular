import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare var gtag: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Poop Deck 5e';
  defaultTheme = 'forest';
  isNavbarCollapsed = true;
  openDropdown: string | null = null;
  particles = this.getStoredParticles();
  theme = this.getStoredTheme();

  constructor(router: Router) {
    const navEndEvent$ = router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    );
    navEndEvent$.subscribe((e: NavigationEnd) => {
      this.isNavbarCollapsed = true;
      this.openDropdown = null;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof gtag !== 'undefined') {
        gtag('config', 'G-BKMXZP7BG0', { page_path: e.urlAfterRedirects });
      }
    });
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  toggleDropdown(name: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  closeMenus(): void {
    this.openDropdown = null;
    this.isNavbarCollapsed = true;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdown = null;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.openDropdown = null;
    this.isNavbarCollapsed = true;
  }

  private getStoredTheme(): string {
    try {
      return localStorage.getItem('theme') || this.getCookie('theme') || this.defaultTheme;
    } catch {
      return this.getCookie('theme') || this.defaultTheme;
    }
  }

  private getStoredParticles(): boolean {
    try {
      return localStorage.getItem('particles') === 'true';
    } catch {
      return false;
    }
  }

  private getCookie(name: string): string {
    const prefix = name + '=';
    const cookie = document.cookie
      .split(';')
      .map(value => value.trim())
      .find(value => value.startsWith(prefix));
    return cookie ? decodeURIComponent(cookie.substring(prefix.length)) : '';
  }

  changeTheme(): void {
    try {
      localStorage.setItem('theme', this.theme);
    } catch {
      // Cookies remain available for browsers that block local storage.
    }
    const expires = new Date();
    expires.setTime(expires.getTime() + (4 * 24 * 60 * 60 * 1000));
    document.cookie = `theme=${encodeURIComponent(this.theme)}; expires=${expires.toUTCString()}; path=/`;
  }

  changeParticles(): void {
    try {
      localStorage.setItem('particles', String(this.particles));
    } catch {
      // The effect remains available for the current session.
    }
  }
}
