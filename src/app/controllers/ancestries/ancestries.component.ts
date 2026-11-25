import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

import { AncestryComponent } from './ancestry/ancestry.component';
import { Ancestry } from 'src/app/models/ancestry';
import { sourceColorClass } from 'src/app/shared/helpers/format.utils';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [ReferenceTableComponent, AncestryComponent],
  selector: 'app-ancestries',
  templateUrl: './ancestries.component.html'
})
export class AncestriesComponent implements OnInit {
  readonly ancestries = signal<Ancestry[]>([]);
  readonly currAncestry = signal<Ancestry | undefined>(undefined);

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
      cellClass: a => sourceColorClass(a.source)
    }
  ];

  readonly rowKey = (ancestry: Ancestry) => ancestry.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    combineLatest([this.dataService.getAncestries(), this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([ancestries, params]) => {
        this.ancestries.set(ancestries);
        const ancestryName = params.get('ancestryName');
        const found = ancestryName ? ancestries.find(f => f.id === ancestryName) : undefined;
        this.currAncestry.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : 'Ancestries — EotCC 5e');
      });
  }

  setCurrAncestry(clicked: Ancestry): void {
    this.currAncestry.set(clicked);
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    this.router.navigate(['/ancestries', clicked.id], { queryParamsHandling: 'preserve' });
  }
}
