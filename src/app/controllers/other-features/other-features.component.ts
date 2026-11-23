import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeatureComponent } from './feature/feature.component';
import { featureType, OtherFeature } from 'src/app/models/otherFeature';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [CommonModule, ReferenceTableComponent, FeatureComponent],
  selector: 'app-other-features',
  styleUrls: ['./other-features.component.scss'],
  templateUrl: './other-features.component.html'
})
export class OtherFeaturesComponent implements OnInit, OnDestroy {
  readonly otherFeatures = signal<OtherFeature[]>([]);
  readonly selected = signal<string>('all');
  readonly currFeature = signal<OtherFeature | undefined>(undefined);
  readonly initialFilters = signal<Record<string, string>>({});

  readonly featureType = featureType;

  readonly shownFeatures = computed(() => {
    const all = this.otherFeatures();
    const sel = this.selected();
    if (!sel || sel === 'all') {
      return all;
    }
    return all.filter(f => (f.featureType ? f.featureType[0].includes(sel) : false));
  });

  private destroy$ = new Subject<void>();

  columns: ReferenceTableColumn<OtherFeature>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Filter Feature',
      filterId: 'feature-name-filter',
      width: '30%',
      headerIcon: true,
      value: f => f.name
    },
    {
      key: 'type',
      label: 'Type',
      placeholder: 'Type',
      filterId: 'feature-type-filter',
      width: '30%',
      value: f => f.typeLabel
    },
    {
      key: 'prereq',
      label: 'Prerequisites',
      placeholder: 'Prerequisites',
      filterId: 'feature-prereq-filter',
      width: '30%',
      value: f => f.prereqSummary
    },
    {
      key: 'level',
      label: 'Level',
      placeholder: 'Level',
      filterId: 'feature-level-filter',
      width: '5%',
      align: 'center',
      value: f => f.levelPrereq,
      sortValue: f => (f.levelPrereq === '—' ? 0 : Number(f.levelPrereq) || 0)
    },
    {
      key: 'source',
      label: 'Source',
      placeholder: 'Source',
      filterId: 'feature-source-filter',
      width: '5%',
      align: 'right',
      value: f => f.source || '',
      cellClass: f => (f.source ? `color-${f.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (f: OtherFeature) => f.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.initialFilters.set({ ...params });
    });

    combineLatest([this.dataService.getOtherFeatures(), this.route.paramMap])
      .pipe(takeUntil(this.destroy$))
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
  }

  setFilter(clicked: string): void {
    this.selected.set(clicked);
    const visible = this.shownFeatures();
    const current = this.currFeature();
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
