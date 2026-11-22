import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { newClass } from '../../models';
import { ClassComponent } from './class/class.component';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn } from 'src/app/shared/reference-table/reference-table.component';

@Component({
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
      value: c => c.source || '',
      cellClass: c => (c.source ? `color-${c.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (cls: newClass) => cls.id;

  constructor(
    private dataService: DndDataService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.dataService.getClasses().pipe(takeUntil(this.destroy$)).subscribe(classes => {
      this.classes = classes;
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const className = params.get('className');
        if (className) {
          this.currClass = this.classes.find(f => f.id === className);
        }
      });
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
    this.location.go('/classes/' + this.currClass.id);
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
