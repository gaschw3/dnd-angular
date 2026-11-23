import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

import { BackgroundComponent } from './background/background.component';
import { Background } from 'src/app/models/background';
import { transformLinks } from 'src/app/pipes/linkmaker.pipe';
import { sourceColorClass } from 'src/app/shared/helpers/format.utils';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [ReferenceTableComponent, BackgroundComponent],
  selector: 'app-backgrounds',
  templateUrl: './backgrounds.component.html',
  styleUrls: ['./backgrounds.component.scss']
})
export class BackgroundsComponent implements OnInit {
  readonly backgrounds = signal<Background[]>([]);
  readonly currBackground = signal<Background | undefined>(undefined);

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
      value: bg => transformLinks(bg.tool || ''),
      filterValue: bg => bg.tool || ''
    },
    {
      key: 'feat',
      label: 'Feat',
      placeholder: 'Feats',
      filterId: 'bg-feat-filter',
      width: '22%',
      isHtml: true,
      value: bg => transformLinks(bg.feat || ''),
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
      cellClass: bg => sourceColorClass(bg.source)
    }
  ];

  readonly rowKey = (bg: Background) => bg.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    combineLatest([this.dataService.getBackgrounds(), this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([backgrounds, params]) => {
        this.backgrounds.set(backgrounds);
        const backgroundName = params.get('backgroundName');
        const found = backgroundName ? backgrounds.find(f => f.id === backgroundName) : undefined;
        this.currBackground.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : 'Backgrounds — EotCC 5e');
      });
  }

  setCurrBackground(clicked: Background): void {
    this.currBackground.set(clicked);
    this.title.setTitle(`${clicked.name} — EotCC 5e`);
    this.router.navigate(['/backgrounds', clicked.id], { queryParamsHandling: 'preserve' });
  }
}
