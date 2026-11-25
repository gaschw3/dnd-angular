import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFileLines, faSearch } from '@fortawesome/free-solid-svg-icons';
import { combineLatest } from 'rxjs';

import { FeatComponent } from './feat/feat.component';
import { Feat, featCategory } from 'src/app/models/feat';
import { titlecaseExcept } from 'src/app/pipes/titlecase-except.pipe';
import { ChangeBadgeComponent } from 'src/app/shared/change-badge/change-badge.component';
import { matchesPhrase, sourceColorClass } from 'src/app/shared/helpers/format.utils';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import {
  ReferenceTableCellDirective,
  ReferenceTableColumn,
  ReferenceTableComponent
} from 'src/app/shared/reference-table/reference-table.component';

const FEAT_CATEGORIES = [
  { key: 'O', label: 'Origin' },
  { key: 'G', label: 'General' }
] as const;

const VALID_CATEGORY_KEYS = new Set<string>(FEAT_CATEGORIES.map(c => c.key));

const ASI_OPTIONS = [
  { key: 'str', label: 'STR' },
  { key: 'dex', label: 'DEX' },
  { key: 'con', label: 'CON' },
  { key: 'int', label: 'INT' },
  { key: 'wis', label: 'WIS' },
  { key: 'cha', label: 'CHA' },
  { key: 'any', label: 'Any' }
] as const;

const VALID_ASI_KEYS = new Set<string>(ASI_OPTIONS.map(a => a.key));

@Component({
  imports: [FaIconComponent, ReferenceTableComponent, ReferenceTableCellDirective, ChangeBadgeComponent, FeatComponent],
  selector: 'app-feats',
  templateUrl: './feats.component.html',
  styleUrls: ['./feats.component.scss']
})
export class FeatsComponent implements OnInit {
  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private destroyRef = inject(DestroyRef);

  readonly faSearch = faSearch;
  readonly faFileLines = faFileLines;

  readonly isEpicBoons = this.route.snapshot.data['mode'] === 'epic-boons';
  readonly pageHeading = this.isEpicBoons ? 'D&D 5e Epic Boons' : 'D&D 5e Feats';
  readonly pageTitle = this.isEpicBoons ? 'Epic Boons — EotCC 5e' : 'Feats — EotCC 5e';
  readonly basePath = this.isEpicBoons ? '/epic-boons' : '/feats';
  readonly itemLabel = this.isEpicBoons ? 'boons' : 'feats';
  readonly emptyTitle = this.isEpicBoons ? 'Select an Epic Boon' : 'Select a Feat';
  readonly emptyDescription = this.isEpicBoons
    ? 'Choose an epic boon from the table to view its prerequisites, ability score bonuses, and benefits.'
    : 'Choose a feat from the table to view its prerequisites, ability score bonuses, and benefits.';

  readonly categoryOptions = FEAT_CATEGORIES;
  readonly asiOptions = ASI_OPTIONS;

  readonly feats = signal<Feat[]>([]);
  readonly currFeat = signal<Feat | undefined>(undefined);
  readonly selectedCategories = signal<string[]>([]);
  readonly selectedAsis = signal<string[]>([]);
  readonly onlyModified = signal<boolean>(false);
  readonly nameQuery = signal<string>('');
  readonly fullTextQuery = signal<string>('');

  readonly hasQuickFilters = computed(
    () =>
      this.selectedCategories().length > 0 ||
      this.selectedAsis().length > 0 ||
      this.onlyModified() ||
      this.nameQuery().trim().length > 0 ||
      this.fullTextQuery().trim().length > 0
  );

  readonly filteredFeats = computed(() => {
    const all = this.feats();
    const cats = this.selectedCategories();
    const asis = this.selectedAsis();
    const modified = this.onlyModified();
    const nameTerm = this.nameQuery().trim().toLowerCase();
    const fullText = this.fullTextQuery();

    return all.filter(f => {
      if (!this.isEpicBoons && cats.length > 0 && !cats.includes(f.category)) {
        return false;
      }
      if (asis.length > 0 && !f.asiAbilities.some(a => asis.includes(a))) {
        return false;
      }
      if (modified && !f.change) {
        return false;
      }
      if (nameTerm && !f.name.toLowerCase().includes(nameTerm)) {
        return false;
      }
      if (!matchesPhrase(f.searchText, fullText)) {
        return false;
      }
      return true;
    });
  });

  columns: ReferenceTableColumn<Feat>[] = this.isEpicBoons
    ? [
        {
          key: 'name',
          label: 'Name',
          width: '56%',
          filterable: false,
          value: f => f.name
        },
        {
          key: 'asi',
          label: 'ASI',
          width: '30%',
          filterable: false,
          value: f => titlecaseExcept(f.asi || '') || '—'
        },
        {
          key: 'source',
          label: 'Src',
          width: '14%',
          align: 'right',
          filterable: false,
          value: f => f.source || '',
          cellClass: f => sourceColorClass(f.source)
        }
      ]
    : [
        {
          key: 'name',
          label: 'Name',
          width: '44%',
          filterable: false,
          value: f => f.name
        },
        {
          key: 'category',
          label: 'Type',
          width: '14%',
          align: 'center',
          filterable: false,
          value: f => featCategory[f.category] || f.category || ''
        },
        {
          key: 'asi',
          label: 'ASI',
          width: '28%',
          filterable: false,
          value: f => titlecaseExcept(f.asi || '') || '—'
        },
        {
          key: 'source',
          label: 'Src',
          width: '14%',
          align: 'right',
          filterable: false,
          value: f => f.source || '',
          cellClass: f => sourceColorClass(f.source)
        }
      ];

  readonly rowKey = (feat: Feat) => feat.id;

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queryParams => {
      const catQuery = queryParams['categories'] ?? queryParams['feat-category-filter'];
      const nextCats =
        typeof catQuery === 'string' && catQuery.trim()
          ? [
              ...new Set(
                catQuery
                  .split(',')
                  .map(c => c.trim().toUpperCase())
                  .filter(c => VALID_CATEGORY_KEYS.has(c))
              )
            ]
          : [];
      if (nextCats.join(',') !== this.selectedCategories().join(',')) {
        this.selectedCategories.set(nextCats);
      }

      const asiQuery = queryParams['asi'];
      const nextAsis =
        typeof asiQuery === 'string' && asiQuery.trim()
          ? [
              ...new Set(
                asiQuery
                  .split(',')
                  .map(a => a.trim().toLowerCase())
                  .filter(a => VALID_ASI_KEYS.has(a))
              )
            ]
          : [];
      if (nextAsis.join(',') !== this.selectedAsis().join(',')) {
        this.selectedAsis.set(nextAsis);
      }

      const nameParam = queryParams['name'] ?? queryParams['feat-name-filter'];
      if (typeof nameParam === 'string' && nameParam !== this.nameQuery()) {
        this.nameQuery.set(nameParam);
      }

      const textParam = queryParams['text'];
      if (typeof textParam === 'string' && textParam !== this.fullTextQuery()) {
        this.fullTextQuery.set(textParam);
      }

      this.onlyModified.set(queryParams['modified'] === '1' || queryParams['modified'] === 'true');
    });

    const data$ = this.isEpicBoons ? this.dataService.getEpicBoons() : this.dataService.getFeats();
    combineLatest([data$, this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([feats, params]) => {
        this.feats.set(feats);
        const featName = params.get('featName');
        const found = featName ? feats.find(f => f.id === featName) : undefined;
        this.currFeat.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : this.pageTitle);
      });
  }

  onNameInput(event: Event): void {
    this.nameQuery.set((event.target as HTMLInputElement).value);
  }

  onFullTextInput(event: Event): void {
    this.fullTextQuery.set((event.target as HTMLInputElement).value);
  }

  toggleCategory(key: string): void {
    const curr = this.selectedCategories();
    const next = curr.includes(key) ? curr.filter(c => c !== key) : [...curr, key];
    this.selectedCategories.set(next);
    this.syncQuickFilterParams();
  }

  toggleAsi(key: string): void {
    const curr = this.selectedAsis();
    const next = curr.includes(key) ? curr.filter(a => a !== key) : [...curr, key];
    this.selectedAsis.set(next);
    this.syncQuickFilterParams();
  }

  toggleModified(): void {
    this.onlyModified.update(v => !v);
    this.syncQuickFilterParams();
  }

  clearQuickFilters(): void {
    this.selectedCategories.set([]);
    this.selectedAsis.set([]);
    this.onlyModified.set(false);
    this.nameQuery.set('');
    this.fullTextQuery.set('');
    this.syncQuickFilterParams();
  }

  private syncQuickFilterParams(): void {
    const cats = this.selectedCategories();
    const asis = this.selectedAsis();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categories: cats.length ? cats.join(',') : null,
        asi: asis.length ? asis.join(',') : null,
        modified: this.onlyModified() ? '1' : null,
        name: this.nameQuery().trim() || null,
        text: this.fullTextQuery().trim() || null,
        'feat-name-filter': null,
        'feat-category-filter': null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  setCurrFeat(clicked: Feat): void {
    this.currFeat.set(clicked);
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    this.router.navigate([this.basePath, clicked.id], { queryParamsHandling: 'preserve' });

    if (window.innerWidth < 1200) {
      setTimeout(() => {
        document.getElementById('feat-detail-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }
}
