import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Location, TitleCasePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { SpellComponent } from './spell/spell.component';
import { Spell } from 'src/app/models/spell';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [ReferenceTableComponent, SpellComponent],
  selector: 'app-spells',
  templateUrl: './spells.component.html',
  styleUrls: ['./spells.component.scss']
})
export class SpellsComponent implements OnInit, OnDestroy {
  spells: Spell[] = [];
  currSpell?: Spell;
  initialFilters: Record<string, string> = {};

  private destroy$ = new Subject<void>();
  private titleCase = new TitleCasePipe();

  @ViewChild(SpellComponent) child?: SpellComponent;

  columns: ReferenceTableColumn<Spell>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Name',
      filterId: 'spell-name-filter',
      width: '30%',
      headerIcon: true,
      filterType: 'regex',
      value: s =>
        `${s.name}${s.ritual ? ' (r)' : ''}${s.change === 'buff' ? ' (++)' : ''}${s.change === 'nerf' ? ' (--)' : ''}${s.change === 'change' ? ' (??)' : ''}`,
      sortValue: s => s.name,
      cellClass: s => (s.replaced ? 'strikethrough' : '')
    },
    {
      key: 'level',
      label: 'Level',
      placeholder: 'Lvl',
      filterId: 'spell-level-filter',
      width: '7%',
      align: 'center',
      filterType: 'regex',
      value: s => s.level,
      sortValue: s => Number(s.level) || 0
    },
    {
      key: 'concentration',
      label: 'Conc',
      placeholder: 'Conc',
      filterId: 'spell-conc-filter',
      width: '5%',
      align: 'center',
      filterType: 'regex',
      value: s => (s.concentration === true ? 'X' : '')
    },
    {
      key: 'time',
      label: 'Time',
      placeholder: 'Time',
      filterId: 'spell-time-filter',
      width: '7%',
      align: 'center',
      filterType: 'regex',
      value: s => this.titleCase.transform(s.tableTime || '')
    },
    {
      key: 'school',
      label: 'School',
      placeholder: 'School',
      filterId: 'spell-school-filter',
      width: '7%',
      align: 'center',
      filterType: 'regex',
      value: s => s.school?.abbrev || '',
      cellClass: s => (s.school?.name ? `color-${s.school.name.toLowerCase()}` : '')
    },
    {
      key: 'classes',
      label: 'Classes',
      placeholder: 'Classes',
      filterId: 'spell-class-filter',
      width: '39%',
      sortable: false,
      filterType: 'regex',
      value: s => (s.classes ? s.classes.join(', ') : '')
    },
    {
      key: 'source',
      label: 'Source',
      placeholder: 'Source',
      filterId: 'spell-source-filter',
      width: '5%',
      align: 'right',
      filterType: 'regex',
      value: s => s.source || '',
      cellClass: s => (s.source ? `color-${s.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (spell: Spell) => spell.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private title = inject(Title);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.initialFilters = { ...params };
      this.cdr.markForCheck();
    });

    this.dataService.getSpells().pipe(takeUntil(this.destroy$)).subscribe(spells => {
      this.spells = spells;
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const spellName = params.get('spellName');
        if (spellName) {
          this.currSpell = this.spells.find(f => f.id === spellName);
          if (this.currSpell) {
            this.title.setTitle(`${this.currSpell.name} — EotCC 5e`);
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

  setCurrSpell(clickedSpell: Spell): void {
    this.currSpell = clickedSpell;
    this.title.setTitle(`${clickedSpell.name} — EotCC 5e`);
    this.router.navigate(['/spells', clickedSpell.id], { queryParamsHandling: 'preserve' });
  }

  goBack(): void {
    this.location.back();
  }
}
