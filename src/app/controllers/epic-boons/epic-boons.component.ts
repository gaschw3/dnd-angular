import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Feat } from 'src/app/models/feat';
import { FeatComponent } from '../feats/feat/feat.component';
import { TitlecaseExceptPipe } from 'src/app/pipes/titlecase-except.pipe';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [ReferenceTableComponent, FeatComponent],
  selector: 'app-epic-boons',
  templateUrl: './epic-boons.component.html'
})
export class EpicBoonsComponent implements OnInit, OnDestroy {
  readonly feats = signal<Feat[]>([]);
  readonly currFeat = signal<Feat | undefined>(undefined);
  readonly initialFilters = signal<Record<string, string>>({});

  private destroy$ = new Subject<void>();
  private titlecaseExcept = new TitlecaseExceptPipe();

  columns: ReferenceTableColumn<Feat>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Filter Boons',
      filterId: 'feat-name-filter',
      width: '50%',
      headerIcon: true,
      value: f => f.name
    },
    {
      key: 'category',
      label: 'Category',
      placeholder: 'Category',
      filterId: 'feat-category-filter',
      width: '10%',
      value: f => f.category || ''
    },
    {
      key: 'asi',
      label: 'ASI',
      placeholder: 'ASI',
      filterId: 'feat-bonus-filter',
      width: '30%',
      value: f => this.titlecaseExcept.transform(f.asi || '') || ''
    },
    {
      key: 'source',
      label: 'Source',
      placeholder: 'Source',
      filterId: 'feat-source-filter',
      width: '10%',
      align: 'right',
      value: f => f.source || '',
      cellClass: f =>
        f.source ? `color-${f.source.replace('+', '').replace('-', '').toLowerCase()}` : ''
    }
  ];

  readonly rowKey = (feat: Feat) => feat.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.initialFilters.set({ ...params });
    });

    combineLatest([this.dataService.getEpicBoons(), this.route.paramMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([feats, params]) => {
        this.feats.set(feats);
        const featName = params.get('featName');
        const found = featName ? feats.find(f => f.id === featName) : undefined;
        this.currFeat.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : 'Epic Boons — EotCC 5e');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCurrBoon(clicked: Feat): void {
    this.currFeat.set(clicked);
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    this.router.navigate(['/epic-boons', clicked.id], { queryParamsHandling: 'preserve' });
  }
}
