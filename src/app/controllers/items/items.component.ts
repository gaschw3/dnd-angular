import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TitleCasePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFileLines, faSearch } from '@fortawesome/free-solid-svg-icons';
import { combineLatest } from 'rxjs';

import { Item, ItemCategory } from 'src/app/models/item';
import { ItemComponent } from './item/item.component';
import { SanitizeHtmlPipe } from 'src/app/pipes/sanitize-html.pipe';
import { matchesPhrase, sourceColorClass } from 'src/app/shared/helpers/format.utils';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import {
  ReferenceTableCellDirective,
  ReferenceTableColumn,
  ReferenceTableComponent
} from 'src/app/shared/reference-table/reference-table.component';

const RARITY_OPTIONS = ['none', 'common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'] as const;

const RARITY_SLUG_MAP: Record<string, string> = {
  common: 'common',
  uncommon: 'uncommon',
  rare: 'rare',
  'very rare': 'very-rare',
  legendary: 'legendary',
  artifact: 'artifact'
};

type ItemCategoryFilter = 'all' | ItemCategory;

@Component({
  imports: [FaIconComponent, ReferenceTableComponent, ReferenceTableCellDirective, SanitizeHtmlPipe, ItemComponent],
  selector: 'app-items',
  templateUrl: './items.component.html'
})
export class ItemsComponent implements OnInit {
  readonly faSearch = faSearch;
  readonly faFileLines = faFileLines;

  readonly items = signal<Item[]>([]);
  readonly currItem = signal<Item | undefined>(undefined);
  readonly selectedCategory = signal<ItemCategoryFilter>('all');
  readonly selectedRarities = signal<string[]>([]);
  readonly nameQuery = signal<string>('');
  readonly fullTextQuery = signal<string>('');

  readonly rarityOptions = RARITY_OPTIONS;

  readonly hasQuickFilters = computed(
    () =>
      this.selectedCategory() !== 'all' ||
      this.selectedRarities().length > 0 ||
      this.nameQuery().trim().length > 0 ||
      this.fullTextQuery().trim().length > 0
  );

  readonly filteredItems = computed(() => {
    const all = this.items();
    const cat = this.selectedCategory();
    const rarities = this.selectedRarities();
    const nameTerm = this.nameQuery().trim().toLowerCase();
    const fullText = this.fullTextQuery();

    return all.filter(item => {
      if (cat !== 'all' && item.category !== cat) {
        return false;
      }
      if (rarities.length > 0) {
        const normalized = !item.rarity || item.rarity.includes('none') ? 'none' : item.rarity;
        if (!rarities.includes(normalized)) {
          return false;
        }
      }
      if (nameTerm && !item.plainName.toLowerCase().includes(nameTerm)) {
        return false;
      }
      if (!matchesPhrase(item.searchText, fullText)) {
        return false;
      }
      return true;
    });
  });

  private titleCase = new TitleCasePipe();

  columns: ReferenceTableColumn<Item>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '38%',
      filterable: false,
      value: item => item.plainName
    },
    {
      key: 'type',
      label: 'Type',
      width: '24%',
      filterable: false,
      value: item => this.titleCase.transform(item.typeLabel)
    },
    {
      key: 'value',
      label: 'Value',
      width: '12%',
      filterable: false,
      value: item => item.valueFormatted,
      sortValue: item => item.value || 0,
      cellClass: item => (item.valueUnit ? `text--${item.valueUnit}` : '')
    },
    {
      key: 'rarity',
      label: 'Rarity',
      width: '16%',
      align: 'center',
      filterable: false,
      value: item => item.rarity,
      sortValue: item => item.raritySort
    },
    {
      key: 'source',
      label: 'Src',
      width: '10%',
      align: 'right',
      filterable: false,
      value: item => item.source || '',
      cellClass: item => sourceColorClass(item.source)
    }
  ];

  readonly rowKey = (item: Item) => item.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queryParams => {
      const cat = queryParams['cat'];
      const nextCat: ItemCategoryFilter =
        cat === 'magic' || cat === 'weapons' || cat === 'armor' || cat === 'normal' || cat === 'treasure'
          ? cat
          : 'all';
      if (nextCat !== this.selectedCategory()) {
        this.selectedCategory.set(nextCat);
      }

      const rawRarity = queryParams['rarity'];
      const nextRarities =
        typeof rawRarity === 'string' && rawRarity.trim()
          ? [...new Set(rawRarity.split(',').map(r => r.trim().toLowerCase()).filter(Boolean))]
          : [];
      if (nextRarities.join(',') !== this.selectedRarities().join(',')) {
        this.selectedRarities.set(nextRarities);
      }

      const nameParam = queryParams['name'];
      if (typeof nameParam === 'string' && nameParam !== this.nameQuery()) {
        this.nameQuery.set(nameParam);
      }

      const textParam = queryParams['text'];
      if (typeof textParam === 'string' && textParam !== this.fullTextQuery()) {
        this.fullTextQuery.set(textParam);
      }
    });

    combineLatest([this.dataService.getItems(), this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([items, params]) => {
        this.items.set(items);
        const itemName = params.get('itemName');
        const found = itemName ? items.find(f => f.id === itemName) : undefined;
        this.currItem.set(found);
        this.title.setTitle(found ? `${found.plainName} — EotCC 5e` : 'Items — EotCC 5e');
      });
  }

  onNameInput(event: Event): void {
    this.nameQuery.set((event.target as HTMLInputElement).value);
  }

  onFullTextInput(event: Event): void {
    this.fullTextQuery.set((event.target as HTMLInputElement).value);
  }

  setCategory(choice: ItemCategoryFilter): void {
    this.selectedCategory.set(choice);
    this.syncQuickFilterParams();
  }

  toggleRarity(rarity: string): void {
    const curr = this.selectedRarities();
    const next = curr.includes(rarity) ? curr.filter(r => r !== rarity) : [...curr, rarity];
    this.selectedRarities.set(next);
    this.syncQuickFilterParams();
  }

  resetQuickFilters(): void {
    this.selectedCategory.set('all');
    this.selectedRarities.set([]);
    this.nameQuery.set('');
    this.fullTextQuery.set('');
    this.syncQuickFilterParams();
  }

  private syncQuickFilterParams(): void {
    const cat = this.selectedCategory();
    const rarities = this.selectedRarities();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        cat: cat !== 'all' ? cat : null,
        rarity: rarities.length ? rarities.join(',') : null,
        name: this.nameQuery().trim() || null,
        text: this.fullTextQuery().trim() || null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  setCurrItem(clicked: Item): void {
    this.currItem.set(clicked);
    this.title.setTitle(`${clicked.plainName} — EotCC 5e`);
    this.router.navigate(['/items', clicked.id], { queryParamsHandling: 'preserve' });

    if (window.innerWidth < 1200) {
      setTimeout(() => {
        document.getElementById('item-detail-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }

  formatRarityLabel(rarity: string): string {
    return this.titleCase.transform(rarity);
  }

  getRaritySlug(rarity: string): string {
    return RARITY_SLUG_MAP[rarity] || 'other';
  }
}
