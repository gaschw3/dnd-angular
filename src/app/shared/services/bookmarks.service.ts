import { Injectable, computed, signal } from '@angular/core';

export type BookmarkCategory =
  | 'Spell'
  | 'Class'
  | 'Subclass'
  | 'Monster'
  | 'Item'
  | 'Feat'
  | 'Ancestry'
  | 'Background'
  | 'Feature'
  | 'Page';

export interface BookmarkItem {
  id: string;
  name: string;
  category: BookmarkCategory;
  route: string;
  subtitle?: string;
}

const STORAGE_KEY = 'eotcc_bookmarks_v1';

const MULTI_VALUE_PARAMS = new Set([
  'classes',
  'levels',
  'schools',
  'rarity',
  'types',
  'categories',
  'asi',
  'subclass'
]);

export function normalizeBookmarkRoute(route: string): string {
  const withoutHash = (route || '/').split('#')[0] || '/';
  const normalizedPath = withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`;
  const qIndex = normalizedPath.indexOf('?');
  if (qIndex === -1) {
    return normalizedPath;
  }

  const pathPart = normalizedPath.slice(0, qIndex);
  const queryPart = normalizedPath.slice(qIndex + 1);
  if (!queryPart) {
    return pathPart;
  }

  const entries: [string, string][] = [];
  new URLSearchParams(queryPart).forEach((value, key) => {
    const trimmedKey = key.trim();
    const trimmedVal = value.trim();
    if (!trimmedKey || !trimmedVal) {
      return;
    }
    const normalizedVal = MULTI_VALUE_PARAMS.has(trimmedKey)
      ? trimmedVal
          .split(',')
          .map(v => v.trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
          .join(',')
      : trimmedVal;
    entries.push([trimmedKey, normalizedVal]);
  });

  if (entries.length === 0) {
    return pathPart;
  }

  entries.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  const normalizedQuery = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `${pathPart}?${normalizedQuery}`;
}

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {
  private readonly _items = signal<BookmarkItem[]>(this.load());
  readonly isOpen = signal(false);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggleOpen(): void {
    this.isOpen.set(!this.isOpen());
  }

  routesMatch(a: string, b: string): boolean {
    return normalizeBookmarkRoute(a) === normalizeBookmarkRoute(b);
  }

  isBookmarked(route: string): boolean {
    const target = normalizeBookmarkRoute(route);
    return this._items().some(item => normalizeBookmarkRoute(item.route) === target);
  }

  toggle(item: BookmarkItem): void {
    if (this.isBookmarked(item.route)) {
      this.remove(item.route);
    } else {
      const next = [item, ...this._items()];
      this._items.set(next);
      this.save(next);
    }
  }

  remove(route: string): void {
    const target = normalizeBookmarkRoute(route);
    const next = this._items().filter(item => normalizeBookmarkRoute(item.route) !== target);
    this._items.set(next);
    this.save(next);
  }

  clear(): void {
    this._items.set([]);
    this.save([]);
  }

  private load(): BookmarkItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private save(items: BookmarkItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota / privacy mode errors.
    }
  }
}
