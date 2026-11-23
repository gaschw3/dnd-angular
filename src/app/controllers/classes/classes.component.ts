import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { newClass } from '../../models';
import { ArchetypesComponent } from './archetypes/archetypes.component';
import { ClassComponent } from './class/class.component';
import { LevelTableComponent } from './level-table/level-table.component';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [RouterModule, FaIconComponent, ReferenceTableComponent, DetailHeaderComponent, EntryRendererComponent, ArchetypesComponent, LevelTableComponent, ClassComponent],
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit, OnDestroy {
  readonly classes = signal<newClass[]>([]);
  readonly currClass = signal<newClass | undefined>(undefined);
  readonly selectedArchetypes = signal<string[]>([]);
  readonly sortedArchetypes = computed(() => {
    const cls = this.currClass();
    return cls ? [...cls.subclass].sort((a, b) => a.name.localeCompare(b.name)) : [];
  });
  readonly faWandSparkles = faWandSparkles;

  private destroy$ = new Subject<void>();
  private shakeTimer?: ReturnType<typeof setTimeout>;

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

  ngOnInit(): void {
    combineLatest([
      this.dataService.getClasses(),
      this.route.paramMap,
      this.route.queryParamMap
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([classes, params, queryParams]) => {
        this.classes.set(classes);
        const className = params.get('className');
        const found = className ? classes.find(f => f.id === className) : undefined;
        this.currClass.set(found);

        if (found) {
          this.title.setTitle(`${found.name} — EotCC 5e`);
          const rawSub = queryParams.get('subclass') || '';
          const validSubs = new Set(found.subclass.map(s => s.shortName));
          const parsedSubs = rawSub
            .split(',')
            .map(s => s.trim())
            .filter(s => validSubs.has(s));
          this.selectedArchetypes.set(parsedSubs);
        } else {
          this.title.setTitle('Classes — EotCC 5e');
          this.selectedArchetypes.set([]);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.shakeTimer) {
      clearTimeout(this.shakeTimer);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCurrClass(clickedClass: newClass): void {
    this.selectedArchetypes.set([]);
    this.currClass.set(clickedClass);
    this.title.setTitle(`${clickedClass.name} — EotCC 5e`);
    this.router.navigate(['/classes', clickedClass.id], {
      queryParams: { subclass: null },
      queryParamsHandling: 'merge'
    });
  }

  onArchetypesChange(next: string[]): void {
    this.selectedArchetypes.set(next);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subclass: next.length ? next.join(',') : null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  shake(id: string): void {
    if (this.shakeTimer) {
      clearTimeout(this.shakeTimer);
    }
    this.shakeTimer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el && typeof el.animate === 'function') {
        el.animate(
          [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-4px)' },
            { transform: 'translateX(4px)' },
            { transform: 'translateX(-3px)' },
            { transform: 'translateX(3px)' },
            { transform: 'translateX(0)' }
          ],
          { duration: 750, easing: 'ease-in-out' }
        );
      }
    }, 500);
  }
}
