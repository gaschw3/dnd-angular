import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { BackgroundComponent } from './background/background.component';
import { Background } from 'src/app/models/background';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [ReferenceTableComponent, BackgroundComponent],
  selector: 'app-backgrounds',
  templateUrl: './backgrounds.component.html',
  styleUrls: ['./backgrounds.component.scss']
})
export class BackgroundsComponent implements OnInit, OnDestroy {
  backgrounds: Background[] = [];
  currBackground?: Background;

  private destroy$ = new Subject<void>();
  private linkmaker = new LinkmakerPipe();

  @ViewChild(BackgroundComponent) child?: BackgroundComponent;

  columns: ReferenceTableColumn<Background>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Filter Background',
      filterId: 'bg-name-filter',
      width: '22%',
      headerIcon: true,
      value: bg => bg.name
    },
    {
      key: 'skill',
      label: 'Skills',
      placeholder: 'Skills',
      filterId: 'bg-skill-filter',
      width: '22%',
      value: bg => bg.skill || ''
    },
    {
      key: 'tool',
      label: 'Tool',
      placeholder: 'Tools',
      filterId: 'bg-tool-filter',
      width: '22%',
      isHtml: true,
      value: bg => this.linkmaker.transform(bg.tool || ''),
      filterValue: bg => bg.tool || ''
    },
    {
      key: 'feat',
      label: 'Feat',
      placeholder: 'Feats',
      filterId: 'bg-feat-filter',
      width: '22%',
      isHtml: true,
      value: bg => this.linkmaker.transform(bg.feat || ''),
      filterValue: bg => bg.feat || ''
    },
    {
      key: 'source',
      label: 'Source',
      placeholder: 'Source',
      filterId: 'bg-source-filter',
      width: '12%',
      align: 'right',
      value: bg => bg.source || '',
      cellClass: bg => (bg.source ? `color-${bg.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (bg: Background) => bg.id;

  constructor(
    private dataService: DndDataService,
    private route: ActivatedRoute,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataService.getBackgrounds().pipe(takeUntil(this.destroy$)).subscribe(backgrounds => {
      this.backgrounds = backgrounds;
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const backgroundName = params.get('backgroundName');
        if (backgroundName) {
          this.currBackground = this.backgrounds.find(f => f.id === backgroundName);
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

  setCurrBackground(clicked: Background): void {
    this.currBackground = clicked;
    this.location.go('/backgrounds/' + this.currBackground.id);
  }
}
