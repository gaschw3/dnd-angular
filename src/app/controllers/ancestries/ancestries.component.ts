import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AncestryComponent } from './ancestry/ancestry.component';
import { Ancestry } from 'src/app/models/ancestry';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [ReferenceTableComponent, AncestryComponent],
  selector: 'app-ancestries',
  templateUrl: './ancestries.component.html',
  styleUrls: ['./ancestries.component.scss']
})
export class AncestriesComponent implements OnInit, OnDestroy {
  readonly ancestries = signal<Ancestry[]>([]);
  readonly currAncestry = signal<Ancestry | undefined>(undefined);

  private destroy$ = new Subject<void>();

  columns: ReferenceTableColumn<Ancestry>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Filter Ancestry',
      filterId: 'ancestry-name-filter',
      width: '70%',
      headerIcon: true,
      value: a => a.name
    },
    {
      key: 'source',
      label: 'Source',
      placeholder: 'Source',
      filterId: 'ancestry-source-filter',
      width: '30%',
      align: 'right',
      value: a => a.source || '',
      cellClass: a => (a.source ? `color-${a.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (ancestry: Ancestry) => ancestry.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);

  ngOnInit(): void {
    combineLatest([this.dataService.getAncestries(), this.route.paramMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([ancestries, params]) => {
        this.ancestries.set(ancestries);
        const ancestryName = params.get('ancestryName');
        const found = ancestryName ? ancestries.find(f => f.id === ancestryName) : undefined;
        this.currAncestry.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : 'Ancestries — EotCC 5e');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCurrAncestry(clicked: Ancestry): void {
    this.currAncestry.set(clicked);
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    this.router.navigate(['/ancestries', clicked.id], { queryParamsHandling: 'preserve' });
  }
}
