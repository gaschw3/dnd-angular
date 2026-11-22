import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { Feat } from 'src/app/models/feat';
import { FeatComponent } from '../feats/feat/feat.component';
import { TitlecaseExceptPipe } from 'src/app/pipes/titlecase-except.pipe';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  standalone: false,
  selector: 'app-epic-boons',
  templateUrl: './epic-boons.component.html',
  styleUrls: ['./epic-boons.component.scss']
})
export class EpicBoonsComponent implements OnInit, OnDestroy {
  feats: Feat[] = [];
  currFeat?: Feat;
  initialFilters: Record<string, string> = {};

  private destroy$ = new Subject<void>();
  private titlecaseExcept = new TitlecaseExceptPipe();

  @ViewChild(FeatComponent) child?: FeatComponent;

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
      value: f => this.titlecaseExcept.transform(f.asi || '')
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

  constructor(
    private dataService: DndDataService,
    private route: ActivatedRoute,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.initialFilters = { ...params };
      this.cdr.markForCheck();
    });

    this.dataService.getEpicBoons().pipe(takeUntil(this.destroy$)).subscribe(feats => {
      this.feats = feats;
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const featName = params.get('featName');
        if (featName) {
          this.currFeat = this.feats.find(f => f.id === featName);
        }
        this.cdr.markForCheck();
      });
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCurrBoon(clicked: Feat): void {
    this.currFeat = clicked;
    this.location.go('/epic-boons/' + this.currFeat.id);
  }
}
