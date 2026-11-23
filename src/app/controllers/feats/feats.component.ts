import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

import { FeatComponent } from './feat/feat.component';
import { Feat } from 'src/app/models/feat';
import { titlecaseExcept } from 'src/app/pipes/titlecase-except.pipe';
import { sourceColorClass } from 'src/app/shared/helpers/format.utils';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [ReferenceTableComponent, FeatComponent],
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

  readonly isEpicBoons = this.route.snapshot.data['mode'] === 'epic-boons';
  readonly pageHeading = this.isEpicBoons ? 'D&D 5e Epic Boons' : 'D&D 5e Feats';
  readonly pageTitle = this.isEpicBoons ? 'Epic Boons — EotCC 5e' : 'Feats — EotCC 5e';
  readonly basePath = this.isEpicBoons ? '/epic-boons' : '/feats';
  readonly itemLabel = this.isEpicBoons ? 'boons' : 'feats';
  readonly emptyTitle = this.isEpicBoons ? 'Select an Epic Boon' : 'Select a Feat';
  readonly emptyDescription = this.isEpicBoons
    ? 'Choose an epic boon from the list to view its prerequisites, ability score bonuses, and benefits.'
    : 'Choose a feat from the list to view its prerequisites, ability score bonuses, and benefits.';

  readonly feats = signal<Feat[]>([]);
  readonly currFeat = signal<Feat | undefined>(undefined);
  readonly initialFilters = signal<Record<string, string>>({});

  columns: ReferenceTableColumn<Feat>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: this.isEpicBoons ? 'Filter Boons' : 'Filter Feats',
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
      value: f => titlecaseExcept(f.asi || '')
    },
    {
      key: 'source',
      label: 'Source',
      placeholder: 'Source',
      filterId: 'feat-source-filter',
      width: '10%',
      align: 'right',
      value: f => f.source || '',
      cellClass: f => sourceColorClass(f.source)
    }
  ];

  readonly rowKey = (feat: Feat) => feat.id;

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.initialFilters.set({ ...params });
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

  setCurrFeat(clicked: Feat): void {
    this.currFeat.set(clicked);
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    this.router.navigate([this.basePath, clicked.id], { queryParamsHandling: 'preserve' });
  }
}
