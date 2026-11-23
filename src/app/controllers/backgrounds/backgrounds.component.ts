import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  readonly backgrounds = signal<Background[]>([]);
  readonly currBackground = signal<Background | undefined>(undefined);

  private destroy$ = new Subject<void>();
  private linkmaker = new LinkmakerPipe();

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

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);

  ngOnInit(): void {
    combineLatest([this.dataService.getBackgrounds(), this.route.paramMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([backgrounds, params]) => {
        this.backgrounds.set(backgrounds);
        const backgroundName = params.get('backgroundName');
        const found = backgroundName ? backgrounds.find(f => f.id === backgroundName) : undefined;
        this.currBackground.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : 'Backgrounds — EotCC 5e');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCurrBackground(clicked: Background): void {
    this.currBackground.set(clicked);
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    this.router.navigate(['/backgrounds', clicked.id], { queryParamsHandling: 'preserve' });
  }
}
