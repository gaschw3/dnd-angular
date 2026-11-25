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
      if (typeof nameParam === 'string' && nameParam !== this.nameQuery()) {
        this.nameQuery.set(nameParam);
      }

      const textParam = queryParams['text'];
      if (typeof textParam === 'string' && textParam !== this.fullTextQuery()) {
        this.fullTextQuery.set(textParam);
      }

      this.onlyModified.set(queryParams['modified'] === '1' || queryParams['modified'] === 'true');
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
  }

  onFullTextInput(event: Event): void {
    this.fullTextQuery.set((event.target as HTMLInputElement).value);
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
      this.setFilter('all');
    } else {
      this.syncQuickFilterParams();
    }
  }

  private syncQuickFilterParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
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
      this.router.navigate(['/other-features', clicked.id], { queryParamsHandling: 'preserve' });
    } else {
      this.router.navigate(['/other-features', sel, clicked.id], { queryParamsHandling: 'preserve' });
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
      if (current) {
        this.router.navigate(['/other-features', current.id], { queryParamsHandling: 'preserve' });
      } else {
        this.router.navigate(['/other-features'], { queryParamsHandling: 'preserve' });
      }
      return;
    }

    if (current && visible.includes(current)) {
      this.router.navigate(['/other-features', clicked, current.id], {
        queryParamsHandling: 'preserve'
      });
    } else if (visible.length > 0 && current) {
      this.currFeature.set(visible[0]);
      this.title.setTitle(`${visible[0].name} — EotCC 5e`);
      this.router.navigate(['/other-features', clicked, visible[0].id], {
        queryParamsHandling: 'preserve'
      });
    }
  }
}
