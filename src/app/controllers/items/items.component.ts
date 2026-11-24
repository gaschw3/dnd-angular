import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TitleCasePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

import { Item, ItemCategory } from 'src/app/models/item';
import { ItemComponent } from './item/item.component';
import { SanitizeHtmlPipe } from 'src/app/pipes/sanitize-html.pipe';
import { sourceColorClass } from 'src/app/shared/helpers/format.utils';
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
  imports: [ReferenceTableComponent, ReferenceTableCellDirective, SanitizeHtmlPipe, ItemComponent],
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {
  readonly items = signal<Item[]>([]);
  readonly currItem = signal<Item | undefined>(undefined);
  readonly selectedCategory = signal<ItemCategoryFilter>('all');
  readonly selectedRarities = signal<string[]>([]);

  readonly rarityOptions = RARITY_OPTIONS;

  readonly hasQuickFilters = computed(
    () => this.selectedCategory() !== 'all' || this.selectedRarities().length > 0
  );

  readonly filteredItems = computed(() => {
    const all = this.items();
    const cat = this.selectedCategory();
    const rarities = this.selectedRarities();

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
      return true;
    });
  });

  private titleCase = new TitleCasePipe();

  columns: ReferenceTableColumn<Item>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Filter Items',
      filterId: 'item-name-filter',
      width: '38%',
      headerIcon: true,
      value: item => item.plainName
    },
    {
      key: 'type',
      label: 'Type',
      placeholder: 'Type',
      filterId: 'item-prof-filter',
      width: '24%',
      value: item => this.titleCase.transform(item.typeLabel)
    },
    {
      key: 'value',
      label: 'Value',
      placeholder: 'Value',
      filterId: 'item-value-filter',
      width: '12%',
      value: item => item.valueFormatted,
      sortValue: item => item.value || 0,
      cellClass: item => (item.valueUnit ? `text--${item.valueUnit}` : '')
    },
    {
      key: 'rarity',
      label: 'Rarity',
      placeholder: 'Rarity',
      filterId: 'item-rarity-filter',
      width: '16%',
      align: 'center',
      value: item => item.rarity,
      sortValue: item => item.raritySort
    },
    {
      key: 'source',
      label: 'Src',
      placeholder: 'Src',
      filterId: 'item-source-filter',
      width: '10%',
      align: 'right',
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
    this.syncQuickFilterParams();
  }

  private syncQuickFilterParams(): void {
    const cat = this.selectedCategory();
    const rarities = this.selectedRarities();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        cat: cat !== 'all' ? cat : null,
        rarity: rarities.length ? rarities.join(',') : null
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
