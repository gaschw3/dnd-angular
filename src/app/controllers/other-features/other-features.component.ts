import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeatureComponent } from './feature/feature.component';
import { featureType, OtherFeature, Prerequisite } from 'src/app/models/otherFeature';
import { IdToNamePipe } from 'src/app/pipes/id-to-name.pipe';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [CommonModule, ReferenceTableComponent, FeatureComponent],
  selector: 'app-other-features',
  styleUrls: ['./other-features.component.scss'],
  templateUrl: './other-features.component.html'
})
export class OtherFeaturesComponent implements OnInit, OnDestroy {
  readonly idPipe = new IdToNamePipe();
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
      value: f => (f.featureType && f.featureType[0] ? this.featureType[f.featureType[0]] || '' : '')
    },
    {
      key: 'prereq',
      label: 'Prerequisites',
      placeholder: 'Prerequisites',
      filterId: 'feature-prereq-filter',
      width: '30%',
      value: f => this.getPrereq(f.prerequisite)
    },
    {
      key: 'level',
      label: 'Level',
      placeholder: 'Level',
      filterId: 'feature-level-filter',
      width: '5%',
      align: 'center',
      value: f => this.getLevelPrereq(f.prerequisite),
      sortValue: f => {
        const lvl = this.getLevelPrereq(f.prerequisite);
        return lvl === '—' ? 0 : Number(lvl) || 0;
      }
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

  readonly rowKey = (f: OtherFeature) => f.name;

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
        const found = featureParam
          ? otherFeatures.find(f => this.idPipe.transform(f.name) === featureParam)
          : undefined;
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
    const slug = this.idPipe.transform(clicked.name);
    const sel = this.selected();
    if (sel === 'all') {
      this.router.navigate(['/other-features', slug], { queryParamsHandling: 'preserve' });
    } else {
      this.router.navigate(['/other-features', sel, slug], { queryParamsHandling: 'preserve' });
    }
  }

  setFilter(clicked: string): void {
    this.selected.set(clicked);
    const visible = this.shownFeatures();
    const current = this.currFeature();
    if (current && visible.includes(current)) {
      this.router.navigate(['/other-features', clicked, this.idPipe.transform(current.name)], {
        queryParamsHandling: 'preserve'
      });
    } else if (visible.length > 0 && current) {
      this.currFeature.set(visible[0]);
      this.title.setTitle(`${visible[0].name} — EotCC 5e`);
      this.router.navigate(['/other-features', clicked, this.idPipe.transform(visible[0].name)], {
        queryParamsHandling: 'preserve'
      });
    }
  }

  getPrereq(prereq?: Prerequisite[]): string {
    if (!prereq || prereq.length < 1) {
      return '—';
    }
    const ret: string[] = [];
    const reqs = prereq[0];
    if (typeof reqs.pact !== 'undefined') {
      ret.push('Pact of the ' + reqs.pact);
    }
    if (typeof reqs.spell !== 'undefined') {
      ret.push(reqs.spell);
    }
    if (typeof reqs.item !== 'undefined') {
      ret.push(reqs.item[0]);
    }
    if (typeof reqs.feature !== 'undefined') {
      ret.push(reqs.feature[0]);
    }
    if (typeof reqs.ability !== 'undefined') {
      reqs.ability.forEach(obj => {
        const arr = Object.entries(obj);
        ret.push(`${arr[0][0].replace(/^[a-z]/, firstChar => firstChar.toUpperCase())} ${arr[0][1]}`);
      });
    }
    if (typeof reqs.level !== 'undefined') {
      const className = reqs.level.class?.name ?? '';
      if (typeof reqs.level.subclass !== 'undefined') {
        ret.push(reqs.level.subclass.name + (className ? ' ' + className : ''));
      } else if (className) {
        ret.push(className);
      }
    }
    return ret.join(', ');
  }

  getLevelPrereq(prereq?: Prerequisite[]): string {
    if (!prereq || prereq.length < 1) {
      return '—';
    }
    const reqs = prereq[0];
    if (typeof reqs.level !== 'undefined' && typeof reqs.level.level !== 'undefined') {
      return String(reqs.level.level);
    }
    return '—';
  }
}
