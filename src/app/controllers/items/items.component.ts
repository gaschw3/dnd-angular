import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Item } from 'src/app/models/item';
import { ItemComponent } from './item/item.component';
import { typeTable } from '../../shared/itemTypes';
import { IdToNamePipe } from 'src/app/pipes/id-to-name.pipe';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

const RARITY_OPTIONS = ['none', 'common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'] as const;
const ARMOR_TYPES = new Set(['LA', 'MA', 'HA', 'S']);
const WEAPON_TYPES = new Set(['M', 'R']);

type ItemCategory = 'all' | 'magic' | 'weapons' | 'armor' | 'normal' | 'treasure';

@Component({
  imports: [ReferenceTableComponent, ItemComponent],
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit, OnDestroy {
  readonly items = signal<Item[]>([]);
  readonly currItem = signal<Item | undefined>(undefined);
  readonly selectedCategory = signal<ItemCategory>('all');
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
      const isTreasure = item.type ? item.type.includes('$') : false;
      const rarityLower = (item.rarity || '').toLowerCase();
      const isNoneRarity = !rarityLower || rarityLower.includes('none');
      const isWeapon = isNoneRarity && WEAPON_TYPES.has(item.type);
      const isArmor = isNoneRarity && ARMOR_TYPES.has(item.type);

      if (cat === 'treasure' && !isTreasure) {
        return false;
      }
      if (cat === 'weapons' && !isWeapon) {
        return false;
      }
      if (cat === 'armor' && !isArmor) {
        return false;
      }
      if (cat === 'normal' && (isTreasure || !isNoneRarity || isWeapon || isArmor)) {
        return false;
      }
      if (cat === 'magic' && (isTreasure || isNoneRarity)) {
        return false;
      }
      if (rarities.length > 0) {
        const normalized = isNoneRarity ? 'none' : rarityLower;
        if (!rarities.includes(normalized)) {
          return false;
        }
      }
      return true;
    });
  });

  readonly idPipe = new IdToNamePipe();
  private titleCase = new TitleCasePipe();
  private destroy$ = new Subject<void>();

  columns: ReferenceTableColumn<Item>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Filter Items',
      filterId: 'item-name-filter',
      width: '38%',
      headerIcon: true,
      isHtml: true,
      value: item => formatItemNameHtml(item),
      filterValue: item => stripHtml(item.name),
      sortValue: item => stripHtml(item.name)
    },
    {
      key: 'type',
      label: 'Type',
      placeholder: 'Type',
      filterId: 'item-prof-filter',
      width: '24%',
      value: item => this.titleCase.transform(this.getItemType(item))
    },
    {
      key: 'value',
      label: 'Value',
      placeholder: 'Value',
      filterId: 'item-value-filter',
      width: '12%',
      value: item => this.formatValue(item.value),
      sortValue: item => item.value || 0,
      cellClass: item => {
        if (!item.value) {
          return '';
        }
        return item.value / 100 >= 1 ? 'text--gp' : item.value / 10 >= 1 ? 'text--sp' : 'text--cp';
      }
    },
    {
      key: 'rarity',
      label: 'Rarity',
      placeholder: 'Rarity',
      filterId: 'item-rarity-filter',
      width: '16%',
      align: 'center',
      isHtml: true,
      value: item => formatRarityPillHtml(item.rarity, this.titleCase),
      filterValue: item => item.rarity || '',
      sortValue: item => this.getRaritySort(item.rarity)
    },
    {
      key: 'source',
      label: 'Src',
      placeholder: 'Src',
      filterId: 'item-source-filter',
      width: '10%',
      align: 'right',
      value: item => item.source || '',
      cellClass: item => (item.source ? `color-${item.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (item: Item) => this.idPipe.transform(item.name);

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(queryParams => {
      const cat = queryParams['cat'];
      const nextCat: ItemCategory =
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
      .pipe(takeUntil(this.destroy$))
      .subscribe(([items, params]) => {
        this.items.set(items);
        const itemName = params.get('itemName');
        const found = itemName ? items.find(f => this.idPipe.transform(f.name) === itemName) : undefined;
        this.currItem.set(found);
        this.title.setTitle(found ? `${stripHtml(found.name)} — EotCC 5e` : 'Items — EotCC 5e');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCategory(choice: ItemCategory): void {
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
    this.title.setTitle(`${stripHtml(clicked.name)} — EotCC 5e`);
    this.router.navigate(['/items', this.idPipe.transform(clicked.name)], { queryParamsHandling: 'preserve' });

    if (window.innerWidth < 1200) {
      setTimeout(() => {
        document.getElementById('item-detail-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }

  formatRarityLabel(rarity: string): string {
    return this.titleCase.transform(rarity);
  }

  formatValue(value?: number): string {
    if (!value) {
      return '';
    }
    if (value / 100 >= 1) {
      return `${Math.round(value / 100).toLocaleString('en-US')} gp`;
    }
    if (value / 10 >= 1) {
      return `${Math.round(value / 10).toLocaleString('en-US')} sp`;
    }
    return `${Math.round(value).toLocaleString('en-US')} cp`;
  }

  getRaritySort(rarity: string): number {
    switch ((rarity || '').toLowerCase()) {
      case 'none':
        return 0;
      case 'common':
        return 1;
      case 'uncommon':
        return 2;
      case 'rare':
        return 3;
      case 'very rare':
        return 4;
      case 'legendary':
        return 5;
      case 'artifact':
        return 6;
      default:
        return 0;
    }
  }

  getItemType(item: Item): string {
    let returnType = '';

    if (item.wondrous && item.type) {
      returnType += 'Wondrous Item, ';
    } else if (item.wondrous) {
      return 'Wondrous Item';
    }

    switch (item.type) {
      case 'M': {
        if (item.weaponCategory && item.baseItem) {
          returnType += `${item.weaponCategory} Melee Weapon (${item.baseItem})`;
        } else if (item.weaponCategory) {
          returnType += `${item.weaponCategory} Melee Weapon`;
        } else if (item.baseItem) {
          returnType += `Melee Weapon (${item.baseItem})`;
        }
        break;
      }
      case 'R': {
        if (item.weaponCategory && item.baseItem) {
          returnType += `${item.weaponCategory} Ranged Weapon (${item.baseItem})`;
        } else if (item.weaponCategory) {
          returnType += `${item.weaponCategory} Ranged Weapon`;
        } else if (item.baseItem) {
          returnType += `Ranged Weapon (${item.baseItem})`;
        }
        break;
      }
      default: {
        returnType += typeTable[item.type] || '';
        break;
      }
    }
    return returnType;
  }
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '').trim();
}

function formatItemNameHtml(item: Item): string {
  const attune = item.reqAttune ? '<span class="spell-tag-badge" title="Requires Attunement">A</span>' : '';
  return `${item.name}${attune}`;
}

function formatRarityPillHtml(rawRarity: string, titleCase: TitleCasePipe): string {
  const r = (rawRarity || '').toLowerCase().trim();
  if (!r || r === 'none') {
    return '—';
  }
  const slugMap: Record<string, string> = {
    common: 'common',
    uncommon: 'uncommon',
    rare: 'rare',
    'very rare': 'very-rare',
    legendary: 'legendary',
    artifact: 'artifact'
  };
  const cls = slugMap[r] || 'other';
  const label = titleCase.transform(r);
  return `<span class="item-rarity-pill item-rarity-${cls}">${label}</span>`;
}
