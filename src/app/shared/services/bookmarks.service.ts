import { Injectable, computed, signal } from '@angular/core';

export type BookmarkCategory =
  | 'Spell'
  | 'Class'
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

  isBookmarked(route: string): boolean {
    return this._items().some(item => item.route === route);
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
    const next = this._items().filter(item => item.route !== route);
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
