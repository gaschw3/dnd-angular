import { Component, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ParticlesComponent } from './controllers/particles/particles.component';
import { ScrollTopComponent } from './shared/scroll-top/scroll-top.component';
import { QuickSearchComponent } from './shared/quick-search/quick-search.component';
import { BookmarksTrayComponent } from './shared/bookmarks-tray/bookmarks-tray.component';
import { BookmarksService } from './shared/services/bookmarks.service';

declare let gtag: any;

@Component({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ParticlesComponent,
    ScrollTopComponent,
    QuickSearchComponent,
    BookmarksTrayComponent
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'EotCC 5e';
  defaultTheme = 'forest';
  isNavbarCollapsed = true;
  openDropdown: string | null = null;
  particles = this.getStoredParticles();
  theme = this.getStoredTheme();

  @ViewChild(QuickSearchComponent) quickSearch?: QuickSearchComponent;
  @ViewChild(BookmarksTrayComponent) bookmarksTray?: BookmarksTrayComponent;

  private router = inject(Router);
  public bookmarks = inject(BookmarksService);
  private viewportScroller = inject(ViewportScroller);

  constructor() {
    this.viewportScroller.setOffset([0, 80]);
    const navEndEvent$ = this.router.events.pipe(
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

  openQuickSearch(): void {
    this.closeMenus();
    this.quickSearch?.open();
  }

  toggleBookmarks(): void {
    this.closeMenus();
    this.bookmarks.toggleOpen();
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

  //hijack internal-link clicks to preserve navigation stats and avoid reloads
  @HostListener('click', ['$event'])
  onInternalLinkClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a.internal-link') as HTMLAnchorElement | null;
    if (!anchor) {
      return;
    }
    const href = anchor.getAttribute('href');
    if (href?.startsWith('./')) {
      event.preventDefault();
      this.router.navigateByUrl(href.slice(1));
    }
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
