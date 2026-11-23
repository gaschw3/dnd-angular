import { Component, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPlus, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { BookmarkCategory, BookmarksService } from '../services/bookmarks.service';

@Component({
  selector: 'app-bookmarks-tray',
  imports: [CommonModule, FaIconComponent],
  templateUrl: './bookmarks-tray.component.html',
  styleUrls: ['./bookmarks-tray.component.scss']
})
export class BookmarksTrayComponent implements OnDestroy {
  readonly faThumbtack = faThumbtack;
  readonly faPlus = faPlus;
  readonly currentUrl = signal('/');
  readonly dragOffset = signal(0);
  readonly isDragging = signal(false);

  private dragStartY = 0;
  private routerSub: Subscription;
  private unlistenLocation?: () => void;

  public bookmarks = inject(BookmarksService);
  private router = inject(Router);
  private location = inject(Location);

  constructor() {
    this.syncCurrentUrl();
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.syncCurrentUrl());
    this.unlistenLocation = this.location.onUrlChange(() => this.syncCurrentUrl());
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    if (this.unlistenLocation) {
      this.unlistenLocation();
    }
  }

  get isOpen() {
    return this.bookmarks.isOpen;
  }

  open(): void {
    this.syncCurrentUrl();
    this.bookmarks.open();
  }

  close(): void {
    this.isDragging.set(false);
    this.dragOffset.set(0);
    this.bookmarks.close();
  }

  onTouchStart(event: TouchEvent): void {
    if (window.innerWidth >= 992 || event.touches.length !== 1) {
      return;
    }
    this.dragStartY = event.touches[0].clientY;
    this.isDragging.set(true);
    this.dragOffset.set(0);
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging() || event.touches.length !== 1) {
      return;
    }
    const delta = event.touches[0].clientY - this.dragStartY;
    if (delta > 0) {
      event.preventDefault();
      this.dragOffset.set(delta);
    } else {
      this.dragOffset.set(0);
    }
  }

  onTouchEnd(): void {
    if (!this.isDragging()) {
      return;
    }
    const offset = this.dragOffset();
    this.isDragging.set(false);
    this.dragOffset.set(0);
    if (offset > 80) {
      this.close();
    }
  }

  toggle(): void {
    this.syncCurrentUrl();
    this.bookmarks.toggleOpen();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen() && !document.querySelector('.qs-backdrop')) {
      this.close();
    }
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
    // On mobile/tablet bottom-sheet mode, auto-close after selecting a bookmark
    if (window.innerWidth < 992) {
      this.close();
    }
  }

  pinCurrentPage(): void {
    this.syncCurrentUrl();
    const url = this.currentUrl();
    const segments = url.split('/').filter(Boolean);
    const section = segments[0] || 'classes';
    const slug = segments[1] || '';

    const categoryMap: Record<string, BookmarkCategory> = {
      spells: 'Spell',
      classes: 'Class',
      beastiary: 'Monster',
      items: 'Item',
      feats: 'Feat',
      'epic-boons': 'Feat',
      ancestries: 'Ancestry',
      backgrounds: 'Background',
      'other-features': 'Feature'
    };

    const category: BookmarkCategory = categoryMap[section] || 'Page';
    const rawName = slug || section;
    const name = rawName
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, ch => ch.toUpperCase());

    this.bookmarks.toggle({
      id: `page:${url}`,
      name,
      category,
      route: url,
      subtitle: url
    });
  }

  private syncCurrentUrl(): void {
    const raw = this.location.path(false) || this.router.url || '/';
    const clean = raw.split('?')[0].split('#')[0] || '/';
    this.currentUrl.set(clean.startsWith('/') ? clean : `/${clean}`);
  }
}
