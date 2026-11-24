import { Component, DestroyRef, ElementRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TitleCasePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFileLines, faSearch } from '@fortawesome/free-solid-svg-icons';
import { combineLatest } from 'rxjs';

import { MonsterComponent } from './monster/monster.component';
import { Monster } from 'src/app/models/monster';
import { matchesPhrase, sourceColorClass } from 'src/app/shared/helpers/format.utils';
import { MonsterHelperService } from 'src/app/shared/helpers/monster/monster-helper.service';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import {
  ReferenceTableCellDirective,
  ReferenceTableColumn,
  ReferenceTableComponent
} from 'src/app/shared/reference-table/reference-table.component';

const CR_STEPS = [
  '0', '1/8', '1/4', '1/2',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'
] as const;

const CR_MAX_INDEX = CR_STEPS.length - 1;

@Component({
  imports: [FaIconComponent, ReferenceTableComponent, ReferenceTableCellDirective, MonsterComponent],
  selector: 'app-beastiary',
  templateUrl: './beastiary.component.html',
  styleUrls: ['./beastiary.component.scss']
})
export class BeastiaryComponent implements OnInit {
  readonly faSearch = faSearch;
  readonly faFileLines = faFileLines;

  readonly monsters = signal<Monster[]>([]);
  readonly currMonster = signal<Monster | undefined>(undefined);

  readonly crSteps = CR_STEPS;
  readonly crMaxLimit = CR_MAX_INDEX;
  readonly crMinIndex = signal<number>(0);
  readonly crMaxIndex = signal<number>(CR_MAX_INDEX);
  readonly selectedTypes = signal<string[]>([]);
  readonly typeMenuOpen = signal<boolean>(false);
  readonly onlyLegendary = signal<boolean>(false);
  readonly onlySpellcaster = signal<boolean>(false);
  readonly nameQuery = signal<string>('');
  readonly fullTextQuery = signal<string>('');

  private titleCase = new TitleCasePipe();

  readonly crMinLabel = computed(() => CR_STEPS[this.crMinIndex()]);
  readonly crMaxLabel = computed(() => CR_STEPS[this.crMaxIndex()]);
  readonly crFillLeft = computed(() => (this.crMinIndex() / CR_MAX_INDEX) * 100);
  readonly crFillWidth = computed(() => ((this.crMaxIndex() - this.crMinIndex()) / CR_MAX_INDEX) * 100);

  readonly availableTypes = computed(() => {
    const set = new Set<string>();
    for (const m of this.monsters()) {
      if (m.baseType) {
        set.add(this.titleCase.transform(m.baseType));
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  readonly typeDropdownLabel = computed(() => {
    const selected = this.selectedTypes();
    if (selected.length === 0) {
      return 'All Types';
    }
    if (selected.length <= 2) {
      return selected.join(', ');
    }
    return `${selected.length} Types`;
  });

  readonly hasQuickFilters = computed(
    () =>
      this.crMinIndex() > 0 ||
      this.crMaxIndex() < CR_MAX_INDEX ||
      this.selectedTypes().length > 0 ||
      this.onlyLegendary() ||
      this.onlySpellcaster() ||
      this.nameQuery().trim().length > 0 ||
      this.fullTextQuery().trim().length > 0
  );

  readonly filteredMonsters = computed(() => {
    const all = this.monsters();
    const minIdx = this.crMinIndex();
    const maxIdx = this.crMaxIndex();
    const crFiltered = minIdx > 0 || maxIdx < CR_MAX_INDEX;
    const minVal = this.monsterHelper.getSortCr(CR_STEPS[minIdx]);
    const maxVal = this.monsterHelper.getSortCr(CR_STEPS[maxIdx]);
    const types = this.selectedTypes().map(t => t.toLowerCase());
    const leg = this.onlyLegendary();
    const spell = this.onlySpellcaster();
    const nameTerm = this.nameQuery().trim().toLowerCase();
    const fullText = this.fullTextQuery();

    return all.filter(m => {
      if (crFiltered) {
        const crVal = this.monsterHelper.getSortCr(m.cr || 'N/A');
        if (crVal < 0 || crVal >= 10000 || crVal < minVal || crVal > maxVal) {
          return false;
        }
      }
      if (types.length > 0 && !types.includes(m.baseType)) {
        return false;
      }
      if (leg && !m.isLegendary) {
        return false;
      }
      if (spell && !m.isSpellcaster) {
        return false;
      }
      if (nameTerm && !m.name.toLowerCase().includes(nameTerm)) {
        return false;
      }
      if (!matchesPhrase(m.searchText, fullText)) {
        return false;
      }
      return true;
    });
  });

  columns: ReferenceTableColumn<Monster>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '40%',
      filterable: false,
      value: m => m.name
    },
    {
      key: 'cr',
      label: 'CR',
      width: '13%',
      align: 'center',
      filterable: false,
      value: m => m.cr || '',
      sortValue: m => this.monsterHelper.getSortCr(m.cr)
    },
    {
      key: 'type',
      label: 'Type',
      width: '25%',
      filterable: false,
      value: m => this.titleCase.transform(this.monsterHelper.getType(m.type))
    },
    {
      key: 'other',
      label: 'Tags',
      width: '14%',
      sortable: false,
      filterable: false,
      value: m => m.other || ''
    },
    {
      key: 'source',
      label: 'Src',
      width: '8%',
      align: 'right',
      filterable: false,
      value: m => m.source || '',
      cellClass: m => sourceColorClass(m.source)
    }
  ];

  readonly rowKey = (monster: Monster) => monster.id;

  private dataService = inject(DndDataService);
  private monsterHelper = inject(MonsterHelperService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private hostRef = inject(ElementRef<HTMLElement>);
  private destroyRef = inject(DestroyRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.typeMenuOpen()) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (!target || !this.hostRef.nativeElement.querySelector('.bestiary-type-dropdown')?.contains(target)) {
      this.typeMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.typeMenuOpen()) {
      this.typeMenuOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queryParams => {
      const crMin = queryParams['crMin'];
      const crMax = queryParams['crMax'];
      const minIdx = typeof crMin === 'string' ? CR_STEPS.indexOf(crMin as (typeof CR_STEPS)[number]) : -1;
      const maxIdx = typeof crMax === 'string' ? CR_STEPS.indexOf(crMax as (typeof CR_STEPS)[number]) : -1;
      const nextMin = minIdx >= 0 ? minIdx : 0;
      const nextMax = maxIdx >= 0 ? Math.max(maxIdx, nextMin) : CR_MAX_INDEX;
      this.crMinIndex.set(nextMin);
      this.crMaxIndex.set(nextMax);

      const rawTypes = queryParams['types'];
      const nextTypes =
        typeof rawTypes === 'string' && rawTypes.trim()
          ? [...new Set(rawTypes.split(',').map(t => this.titleCase.transform(t.trim())).filter(Boolean))]
          : [];
      if (nextTypes.join(',') !== this.selectedTypes().join(',')) {
        this.selectedTypes.set(nextTypes);
      }

      const nameParam = queryParams['name'];
      if (typeof nameParam === 'string' && nameParam !== this.nameQuery()) {
        this.nameQuery.set(nameParam);
      }

      const textParam = queryParams['text'];
      if (typeof textParam === 'string' && textParam !== this.fullTextQuery()) {
        this.fullTextQuery.set(textParam);
      }

      this.onlyLegendary.set(queryParams['leg'] === '1' || queryParams['leg'] === 'true');
      this.onlySpellcaster.set(queryParams['spell'] === '1' || queryParams['spell'] === 'true');
    });

    combineLatest([this.dataService.getMonsters(), this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([monsters, params]) => {
        this.monsters.set(monsters);
        const monsterName = params.get('monsterName');
        const found = monsterName ? monsters.find(f => f.id === monsterName) : undefined;
        this.currMonster.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : 'Bestiary — EotCC 5e');
      });
  }

  onNameInput(event: Event): void {
    this.nameQuery.set((event.target as HTMLInputElement).value);
  }

  onFullTextInput(event: Event): void {
    this.fullTextQuery.set((event.target as HTMLInputElement).value);
  }

  onCrMinInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    const clamped = Math.min(val, this.crMaxIndex());
    this.crMinIndex.set(clamped);
    this.syncQuickFilterParams();
  }

  onCrMaxInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    const clamped = Math.max(val, this.crMinIndex());
    this.crMaxIndex.set(clamped);
    this.syncQuickFilterParams();
  }

  toggleTypeMenu(): void {
    this.typeMenuOpen.update(v => !v);
  }

  toggleType(typeName: string): void {
    const curr = this.selectedTypes();
    const next = curr.includes(typeName) ? curr.filter(t => t !== typeName) : [...curr, typeName];
    this.selectedTypes.set(next);
    this.syncQuickFilterParams();
  }

  toggleLegendary(): void {
    this.onlyLegendary.update(v => !v);
    this.syncQuickFilterParams();
  }

  toggleSpellcaster(): void {
    this.onlySpellcaster.update(v => !v);
    this.syncQuickFilterParams();
  }

  resetQuickFilters(): void {
    this.crMinIndex.set(0);
    this.crMaxIndex.set(CR_MAX_INDEX);
    this.selectedTypes.set([]);
    this.onlyLegendary.set(false);
    this.onlySpellcaster.set(false);
    this.nameQuery.set('');
    this.fullTextQuery.set('');
    this.typeMenuOpen.set(false);
    this.syncQuickFilterParams();
  }

  private syncQuickFilterParams(): void {
    const minIdx = this.crMinIndex();
    const maxIdx = this.crMaxIndex();
    const types = this.selectedTypes();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        crMin: minIdx > 0 ? CR_STEPS[minIdx] : null,
        crMax: maxIdx < CR_MAX_INDEX ? CR_STEPS[maxIdx] : null,
        types: types.length ? types.join(',') : null,
        name: this.nameQuery().trim() || null,
        text: this.fullTextQuery().trim() || null,
        leg: this.onlyLegendary() ? '1' : null,
        spell: this.onlySpellcaster() ? '1' : null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  setCurrMonster(clickedMonster: Monster): void {
    this.currMonster.set(clickedMonster);
    this.title.setTitle(`${clickedMonster.name} — EotCC 5e`);
    this.router.navigate(['/beastiary', clickedMonster.id], { queryParamsHandling: 'preserve' });

    if (window.innerWidth < 1200) {
      setTimeout(() => {
        document.getElementById('monster-detail-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }

  getBaseCr(cr: string): string {
    return cr.includes('(') ? cr.split(' (')[0] : cr;
  }

  getCrTier(cr: string): string {
    const val = this.monsterHelper.getSortCr(this.getBaseCr(cr));
    if (val >= 17) {
      return 'epic';
    }
    if (val >= 11) {
      return 'high';
    }
    if (val >= 5) {
      return 'challenging';
    }
    if (val >= 2) {
      return 'standard';
    }
    return 'low';
  }
}
