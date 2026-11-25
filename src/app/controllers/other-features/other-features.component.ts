import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFileLines, faSearch } from '@fortawesome/free-solid-svg-icons';
import { combineLatest } from 'rxjs';

import { FeatureComponent } from './feature/feature.component';
import { featureType, OtherFeature } from 'src/app/models/otherFeature';
import { ChangeBadgeComponent } from 'src/app/shared/change-badge/change-badge.component';
import { matchesPhrase, sourceColorClass } from 'src/app/shared/helpers/format.utils';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import {
  ReferenceTableCellDirective,
  ReferenceTableColumn,
  ReferenceTableComponent
} from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [
    CommonModule,
    FaIconComponent,
    ReferenceTableComponent,
    ReferenceTableCellDirective,
    ChangeBadgeComponent,
    FeatureComponent
  ],
  selector: 'app-other-features',
  templateUrl: './other-features.component.html'
})
export class OtherFeaturesComponent implements OnInit {
  readonly faSearch = faSearch;
  readonly faFileLines = faFileLines;

  readonly otherFeatures = signal<OtherFeature[]>([]);
  readonly selected = signal<string>('all');
  readonly currFeature = signal<OtherFeature | undefined>(undefined);
  readonly onlyModified = signal<boolean>(false);
  readonly nameQuery = signal<string>('');
  readonly fullTextQuery = signal<string>('');

  readonly featureType = featureType;

  readonly hasQuickFilters = computed(
    () =>
      this.selected() !== 'all' ||
      this.onlyModified() ||
      this.nameQuery().trim().length > 0 ||
      this.fullTextQuery().trim().length > 0
  );

  readonly shownFeatures = computed(() => {
    const all = this.otherFeatures();
    const sel = this.selected();
    const modified = this.onlyModified();
    const nameTerm = this.nameQuery().trim().toLowerCase();
    const fullText = this.fullTextQuery();

    return all.filter(f => {
      if (sel && sel !== 'all') {
        if (!f.featureType || !f.featureType[0].includes(sel)) {
          return false;
        }
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

  columns: ReferenceTableColumn<OtherFeature>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '34%',
      filterable: false,
      value: f => f.name
    },
    {
      key: 'type',
      label: 'Type',
      width: '22%',
      filterable: false,
      value: f => f.typeLabel
    },
    {
      key: 'prereq',
      label: 'Prereq',
      width: '24%',
      filterable: false,
      value: f => f.prereqSummary
    },
    {
      key: 'level',
      label: 'Lvl',
      width: '8%',
      align: 'center',
      filterable: false,
      value: f => f.levelPrereq,
      sortValue: f => (f.levelPrereq === '—' ? 0 : Number(f.levelPrereq) || 0)
    },
    {
      key: 'source',
      label: 'Src',
      width: '12%',
      align: 'right',
      filterable: false,
      value: f => f.source || '',
      cellClass: f => sourceColorClass(f.source)
    }
  ];

  readonly rowKey = (f: OtherFeature) => f.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queryParams => {
      const nameParam = queryParams['name'] ?? queryParams['feature-name-filter'];
      const nextName = typeof nameParam === 'string' ? nameParam : '';
      if (nextName.trim() !== this.nameQuery().trim()) {
        this.nameQuery.set(nextName);
      }

      const textParam = queryParams['text'];
      const nextText = typeof textParam === 'string' ? textParam : '';
      if (nextText.trim() !== this.fullTextQuery().trim()) {
        this.fullTextQuery.set(nextText);
      }

      this.onlyModified.set(queryParams['modified'] === '1' || queryParams['modified'] === 'true');

      if (!this.route.snapshot.paramMap.get('type')) {
        const typeQuery = typeof queryParams['type'] === 'string' ? queryParams['type'].trim() : '';
        const nextType = typeQuery && typeQuery in featureType ? typeQuery : 'all';
        if (nextType !== this.selected()) {
          this.selected.set(nextType);
        }
      }
    });

    combineLatest([this.dataService.getOtherFeatures(), this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([otherFeatures, params]) => {
        this.otherFeatures.set(otherFeatures);
        const featureParam = params.get('feature');
        const typeParam = params.get('type');
        if (typeParam) {
          this.selected.set(typeParam);
        }
        const found = featureParam ? otherFeatures.find(f => f.id === featureParam) : undefined;
        this.currFeature.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : 'Misc. Features — EotCC 5e');
      });
  }

  onNameInput(event: Event): void {
    this.nameQuery.set((event.target as HTMLInputElement).value);
    this.syncQuickFilterParams();
  }

  onFullTextInput(event: Event): void {
    this.fullTextQuery.set((event.target as HTMLInputElement).value);
    this.syncQuickFilterParams();
  }

  toggleModified(): void {
    this.onlyModified.update(v => !v);
    this.syncQuickFilterParams();
  }

  clearQuickFilters(): void {
    this.onlyModified.set(false);
    this.nameQuery.set('');
    this.fullTextQuery.set('');
    if (this.selected() !== 'all') {
      this.selected.set('all');
      const current = this.currFeature();
      const target = current ? ['/other-features', current.id] : ['/other-features'];
      this.router.navigate(target, {
        queryParams: {
          type: null,
          modified: null,
          name: null,
          text: null,
          'feature-name-filter': null
        },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    } else {
      this.syncQuickFilterParams();
    }
  }

  private syncQuickFilterParams(): void {
    const sel = this.selected();
    const hasPathType = Boolean(this.route.snapshot.paramMap.get('type'));
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: sel !== 'all' && !hasPathType ? sel : null,
        modified: this.onlyModified() ? '1' : null,
        name: this.nameQuery().trim() || null,
        text: this.fullTextQuery().trim() || null,
        'feature-name-filter': null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  setCurrFeature(clicked: OtherFeature): void {
    this.currFeature.set(clicked);
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    const sel = this.selected();
    if (sel === 'all') {
      this.router.navigate(['/other-features', clicked.id], {
        queryParams: { type: null },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate(['/other-features', sel, clicked.id], {
        queryParams: { type: null },
        queryParamsHandling: 'merge'
      });
    }

    if (window.innerWidth < 1200) {
      setTimeout(() => {
        document.getElementById('feature-detail-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }

  setFilter(clicked: string): void {
    this.selected.set(clicked);
    const visible = this.shownFeatures();
    const current = this.currFeature();
    if (clicked === 'all') {
      const target = current ? ['/other-features', current.id] : ['/other-features'];
      this.router.navigate(target, {
        queryParams: { type: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
      return;
    }

    if (current && visible.includes(current)) {
      this.router.navigate(['/other-features', clicked, current.id], {
        queryParams: { type: null },
        queryParamsHandling: 'merge'
      });
    } else if (visible.length > 0 && current) {
      this.currFeature.set(visible[0]);
      this.title.setTitle(`${visible[0].name} — EotCC 5e`);
      this.router.navigate(['/other-features', clicked, visible[0].id], {
        queryParams: { type: null },
        queryParamsHandling: 'merge'
      });
    } else {
      this.syncQuickFilterParams();
    }
  }
}
