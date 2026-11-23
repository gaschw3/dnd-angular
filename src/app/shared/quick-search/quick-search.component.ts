import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faSearch, faThumbtack } from '@fortawesome/free-solid-svg-icons';

import { DndDataService } from '../services/dnd-data.service';
import { BookmarkCategory, BookmarksService } from '../services/bookmarks.service';
import { IdToNamePipe } from '../../pipes/id-to-name.pipe';

interface SearchEntry {
  id: string;
  name: string;
  category: BookmarkCategory;
  route: string;
  subtitle: string;
  searchText: string;
}

@Component({
  selector: 'app-quick-search',
  imports: [CommonModule, FormsModule, FaIconComponent],
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss']
})
export class QuickSearchComponent {
  readonly faSearch = faSearch;
  readonly faThumbtack = faThumbtack;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly isOpen = signal(false);
  readonly loading = signal(false);
  readonly query = signal('');
  readonly activeCategory = signal<BookmarkCategory | 'All'>('All');
  readonly activeIndex = signal(0);

  private readonly entries = signal<SearchEntry[]>([]);
  private indexLoaded = false;
  private idPipe = new IdToNamePipe();

  readonly categories: (BookmarkCategory | 'All')[] = [
    'All',
    'Spell',
    'Class',
    'Monster',
    'Item',
    'Feat',
    'Ancestry',
    'Background',
    'Feature'
  ];

  readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.activeCategory();
    const all = this.entries();

    const filtered = cat === 'All' ? all : all.filter(e => e.category === cat);
    if (!q) {
      return filtered.slice(0, 25);
    }

    const prefixMatches: SearchEntry[] = [];
    const nameMatches: SearchEntry[] = [];
    const otherMatches: SearchEntry[] = [];

    for (const entry of filtered) {
      const nameLower = entry.name.toLowerCase();
      if (nameLower.startsWith(q)) {
        prefixMatches.push(entry);
      } else if (nameLower.includes(q)) {
        nameMatches.push(entry);
      } else if (entry.searchText.includes(q)) {
        otherMatches.push(entry);
      }
    }

    return [...prefixMatches, ...nameMatches, ...otherMatches].slice(0, 40);
  });

  private dataService = inject(DndDataService);
  public bookmarks = inject(BookmarksService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'g') {
      event.preventDefault();
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
      return;
    }

    if (!this.isOpen()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const max = Math.max(0, this.results().length - 1);
      this.activeIndex.set(Math.min(max, this.activeIndex() + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set(Math.max(0, this.activeIndex() - 1));
    } else if (event.key === 'Enter') {
      const list = this.results();
      const chosen = list[this.activeIndex()];
      if (chosen) {
        event.preventDefault();
        this.select(chosen);
      }
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.activeIndex.set(0);
    this.ensureIndexLoaded();
    this.cdr.detectChanges();
    this.searchInput?.nativeElement?.focus();
    this.searchInput?.nativeElement?.select();
  }

  close(): void {
    this.isOpen.set(false);
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  setCategory(cat: BookmarkCategory | 'All'): void {
    this.activeCategory.set(cat);
    this.activeIndex.set(0);
  }

  select(entry: SearchEntry): void {
    this.close();
    this.router.navigateByUrl(entry.route);
  }

  toggleBookmark(entry: SearchEntry, event: MouseEvent): void {
    event.stopPropagation();
    this.bookmarks.toggle({
      id: entry.id,
      name: entry.name,
      category: entry.category,
      route: entry.route,
      subtitle: entry.subtitle
    });
  }

  private ensureIndexLoaded(): void {
    if (this.indexLoaded || this.loading()) {
      return;
    }
    this.loading.set(true);
    forkJoin({
      spells: this.dataService.getSpells(),
      classes: this.dataService.getClasses(),
      monsters: this.dataService.getMonsters(),
      items: this.dataService.getItems(),
      feats: this.dataService.getFeats(),
      ancestries: this.dataService.getAncestries(),
      backgrounds: this.dataService.getBackgrounds(),
      features: this.dataService.getOtherFeatures()
    }).subscribe({
      next: data => {
        const idx: SearchEntry[] = [];

        for (const s of data.spells) {
          const levelText = Number(s.level) === 0 ? 'Cantrip' : `Level ${s.level}`;
          const subtitle = `${levelText} ${s.school?.name || ''} · ${s.source || ''}`.trim();
          idx.push({
            id: `spell:${s.id}`,
            name: s.name,
            category: 'Spell',
            route: `/spells/${s.id}`,
            subtitle,
            searchText: `${s.name} ${subtitle} ${(s.classes || []).join(' ')}`.toLowerCase()
          });
        }

        for (const c of data.classes) {
          const subtitle = `Class · ${c.source || ''}`.trim();
          idx.push({
            id: `class:${c.id}`,
            name: c.name,
            category: 'Class',
            route: `/classes/${c.id}`,
            subtitle,
            searchText: `${c.name} ${subtitle}`.toLowerCase()
          });
        }

        for (const m of data.monsters) {
          const subtitle = `CR ${m.cr} · ${m.source || ''}`.trim();
          idx.push({
            id: `monster:${m.id}`,
            name: m.name,
            category: 'Monster',
            route: `/beastiary/${m.id}`,
            subtitle,
            searchText: `${m.name} cr ${m.cr} ${m.source || ''}`.toLowerCase()
          });
        }

        for (const item of data.items) {
          const slug = this.idPipe.transform(item.name);
          const subtitle = `${item.rarity || 'item'} · ${item.source || ''}`.trim();
          idx.push({
            id: `item:${slug}`,
            name: item.name,
            category: 'Item',
            route: `/items/${slug}`,
            subtitle,
            searchText: `${item.name} ${subtitle}`.toLowerCase()
          });
        }

        for (const f of data.feats) {
          const subtitle = `${f.category || 'Feat'} · ${f.source || ''}`.trim();
          idx.push({
            id: `feat:${f.id}`,
            name: f.name,
            category: 'Feat',
            route: `/feats/${f.id}`,
            subtitle,
            searchText: `${f.name} ${subtitle}`.toLowerCase()
          });
        }

        for (const a of data.ancestries) {
          const subtitle = `Ancestry · ${a.source || ''}`.trim();
          idx.push({
            id: `ancestry:${a.id}`,
            name: a.name,
            category: 'Ancestry',
            route: `/ancestries/${a.id}`,
            subtitle,
            searchText: `${a.name} ${subtitle}`.toLowerCase()
          });
        }

        for (const b of data.backgrounds) {
          const subtitle = `${b.skill || 'Background'} · ${b.source || ''}`.trim();
          idx.push({
            id: `bg:${b.id}`,
            name: b.name,
            category: 'Background',
            route: `/backgrounds/${b.id}`,
            subtitle,
            searchText: `${b.name} ${subtitle}`.toLowerCase()
          });
        }

        for (const feat of data.features) {
          const slug = this.idPipe.transform(feat.name);
          const subtitle = `Feature · ${feat.source || ''}`.trim();
          idx.push({
            id: `feature:${slug}`,
            name: feat.name,
            category: 'Feature',
            route: `/other-features/${slug}`,
            subtitle,
            searchText: `${feat.name} ${subtitle}`.toLowerCase()
          });
        }

        this.entries.set(idx);
        this.indexLoaded = true;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
