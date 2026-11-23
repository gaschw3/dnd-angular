import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { newClass } from '../../models';
import { ClassComponent } from './class/class.component';
import { LevelTableComponent } from './level-table/level-table.component';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [ReferenceTableComponent, LevelTableComponent, ClassComponent],
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit, OnDestroy {
  classes: newClass[] = [];
  currClass?: newClass;

  private destroy$ = new Subject<void>();

  @ViewChild(ClassComponent) child?: ClassComponent;

  columns: ReferenceTableColumn<newClass>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Filter Class',
      filterId: 'class-name-filter',
      filterColspan: 2,
      headerIcon: true,
      sortable: false,
      value: c => c.name
    },
    {
      key: 'source',
      label: 'Src',
      align: 'right',
      sortable: false,
      filterable: false,
      filterSkipCell: true,
      value: c => c.source || '',
      cellClass: c => (c.source ? `color-${c.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (cls: newClass) => cls.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.dataService.getClasses().pipe(takeUntil(this.destroy$)).subscribe(classes => {
      this.classes = classes;
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const className = params.get('className');
        if (className) {
          this.currClass = this.classes.find(f => f.id === className);
          if (this.currClass) {
            this.title.setTitle(`${this.currClass.name} — EotCC 5e`);
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

  setCurrClass(clickedClass: newClass): void {
    if (this.child) {
      this.child.selectedArchetypes.splice(0, 100);
    }
    this.currClass = clickedClass;
    this.title.setTitle(`${clickedClass.name} — EotCC 5e`);
    this.router.navigate(['/classes', clickedClass.id], { queryParamsHandling: 'preserve' });
  }

  shake(id: string): void {
    const el = document.getElementById(id);
    if (el && typeof el.animate === 'function') {
      el.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(0)' }
        ],
        { duration: 350, easing: 'ease-in-out' }
      );
    }
  }
}
