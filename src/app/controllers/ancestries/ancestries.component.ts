import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

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
  ancestries: Ancestry[] = [];
  currAncestry?: Ancestry;

  private destroy$ = new Subject<void>();

  @ViewChild(AncestryComponent) child?: AncestryComponent;

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
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.dataService.getAncestries().pipe(takeUntil(this.destroy$)).subscribe(ancestries => {
      this.ancestries = ancestries;
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const ancestryName = params.get('ancestryName');
        if (ancestryName) {
          this.currAncestry = this.ancestries.find(f => f.id === ancestryName);
          if (this.currAncestry) {
            this.title.setTitle(`${this.currAncestry.name} — EotCC 5e`);
          }
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

  setCurrAncestry(clicked: Ancestry): void {
    this.currAncestry = clicked;
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    this.router.navigate(['/ancestries', clicked.id], { queryParamsHandling: 'preserve' });
  }
}
