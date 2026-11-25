import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
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
export class BookmarksTrayComponent {
  readonly faThumbtack = faThumbtack;
  readonly faPlus = faPlus;
  readonly currentUrl = signal('/');
  readonly dragOffset = signal(0);
  readonly isDragging = signal(false);

  private dragStartY = 0;

  public bookmarks = inject(BookmarksService);
  private router = inject(Router);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.syncCurrentUrl();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.syncCurrentUrl());
    const unlistenLocation = this.location.onUrlChange(() => this.syncCurrentUrl());
    this.destroyRef.onDestroy(() => unlistenLocation());
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
    const [pathPart, queryString = ''] = url.split('?');
    const segments = pathPart.split('/').filter(Boolean);
    const section = segments[0] || 'classes';
    const slug = segments.length > 1 ? segments[segments.length - 1] : '';

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

    const params = new URLSearchParams(queryString);
    let category: BookmarkCategory = categoryMap[section] || 'Page';
    const formatSlug = (raw: string): string =>
      raw
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, ch => ch.toUpperCase());

    let name = formatSlug(slug || section);
    let subtitle = pathPart;

    if (section === 'classes' && slug && params.get('subclass')) {
      const subclasses = params
        .get('subclass')!
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (subclasses.length === 1) {
        category = 'Subclass';
        subtitle = name;
        name = subclasses[0];
      } else if (subclasses.length > 1) {
        subtitle = `Subclasses: ${subclasses.join(', ')}`;
      }
    } else if (queryString) {
      subtitle = this.formatQuerySummary(params) || url;
    }

    this.bookmarks.toggle({
      id: `page:${url}`,
      name,
      category,
      route: url,
      subtitle
    });
  }

  private formatQuerySummary(params: URLSearchParams): string {
    const parts: string[] = [];
    const sort = params.get('sort');
    const dir = params.get('dir');
    const crMin = params.get('crMin');
    const crMax = params.get('crMax');

    const flagLabels: Record<string, string> = {
      conc: 'Concentration',
      ritual: 'Ritual',
      modified: 'Modified',
      caius: 'Caius',
      leg: 'Legendary',
      spell: 'Spellcaster'
    };

    const paramLabels: Record<string, string> = {
      classes: 'Class',
      levels: 'Lvl',
      schools: 'School',
      cat: 'Category',
      rarity: 'Rarity',
      types: 'Type',
      categories: 'Type',
      asi: 'ASI',
      type: 'Type',
      name: 'Name',
      text: 'Text',
      skill: 'Skill',
      tool: 'Tool',
      feat: 'Feat',
      source: 'Source'
    };

    if (crMin || crMax) {
      parts.push(`CR ${crMin || '0'}–${crMax || '30'}`);
    }

    params.forEach((value, key) => {
      if (!value || key === 'sort' || key === 'dir' || key === 'crMin' || key === 'crMax') {
        return;
      }
      if (key in flagLabels) {
        if (value === '1' || value === 'true') {
          parts.push(flagLabels[key]);
        }
        return;
      }
      const label = paramLabels[key] || key;
      parts.push(`${label}: ${value}`);
    });

    if (sort) {
      parts.push(`Sort: ${sort} ${dir === 'desc' ? '↓' : '↑'}`);
    }

    return parts.join(' · ');
  }

  private syncCurrentUrl(): void {
    const raw = this.location.path(false) || this.router.url || '/';
    const withoutHash = raw.split('#')[0] || '/';
    this.currentUrl.set(withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`);
  }
}
