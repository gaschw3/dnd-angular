import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
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
  idPipe = new IdToNamePipe();
  otherFeatures: OtherFeature[] = [];
  shownFeatures: OtherFeature[] = [];
  currFeature?: OtherFeature;
  initialFilters: Record<string, string> = {};

  selected = 'all';
  featureType = featureType;

  private destroy$ = new Subject<void>();

  @ViewChild(FeatureComponent) child?: FeatureComponent;

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
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.initialFilters = { ...params };
      this.cdr.markForCheck();
    });

    this.dataService.getOtherFeatures().pipe(takeUntil(this.destroy$)).subscribe(otherFeatures => {
      this.otherFeatures = otherFeatures;
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const featureParam = params.get('feature');
        const typeParam = params.get('type');
        if (featureParam) {
          this.currFeature = this.otherFeatures.find(f => this.idPipe.transform(f.name) === featureParam);
          if (this.currFeature) {
            this.title.setTitle(`${this.currFeature.name} — EotCC 5e`);
          }
        }
        if (typeParam) {
          this.selected = typeParam;
        }
        if (this.selected !== 'all' && this.selected !== undefined) {
          this.shownFeatures = this.otherFeatures.filter(f =>
            f.featureType ? f.featureType[0].includes(this.selected) : false
          );
        } else {
          this.shownFeatures = this.otherFeatures;
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

  setCurrFeature(clicked: OtherFeature): void {
    this.currFeature = clicked;
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    const slug = this.idPipe.transform(clicked.name);
    if (this.selected === 'all') {
      this.router.navigate(['/other-features', slug], { queryParamsHandling: 'preserve' });
    } else {
      this.router.navigate(['/other-features', this.selected, slug], { queryParamsHandling: 'preserve' });
    }
  }

  setFilter(clicked: string): void {
    this.selected = clicked;
    if (clicked === 'all') {
      this.shownFeatures = this.otherFeatures;
    } else {
      this.shownFeatures = this.otherFeatures.filter(f =>
        f.featureType ? f.featureType[0].includes(clicked) : false
      );
    }
    if (this.currFeature && this.shownFeatures.indexOf(this.currFeature) >= 0) {
      this.router.navigate(['/other-features', clicked, this.idPipe.transform(this.currFeature.name)], {
        queryParamsHandling: 'preserve'
      });
    } else if (this.shownFeatures.length > 0) {
      this.currFeature = this.shownFeatures[0];
      this.title.setTitle(`${this.currFeature.name} — EotCC 5e`);
      this.router.navigate(['/other-features', clicked, this.idPipe.transform(this.shownFeatures[0].name)], {
        queryParamsHandling: 'preserve'
      });
    }
  }

  getPrereq(prereq?: Prerequisite[]): string {
    if (!prereq || prereq.length < 1) {
      return '—';
    } else {
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
  }

  getLevelPrereq(prereq?: Prerequisite[]): string {
    if (!prereq || prereq.length < 1) {
      return '—';
    } else {
      const reqs = prereq[0];
      if (typeof reqs.level !== 'undefined' && typeof reqs.level.level !== 'undefined') {
        return String(reqs.level.level);
      }
      return '—';
    }
  }
}
