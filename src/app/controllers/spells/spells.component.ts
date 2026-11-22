import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location, TitleCasePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { SpellComponent } from './spell/spell.component';
import { Spell } from 'src/app/models/spell';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn } from 'src/app/shared/reference-table/reference-table.component';

@Component({
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

  constructor(
    private dataService: DndDataService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.initialFilters = { ...params };
    });

    this.dataService.getSpells().pipe(takeUntil(this.destroy$)).subscribe(spells => {
      this.spells = spells;
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const spellName = params.get('spellName');
        if (spellName) {
          this.currSpell = this.spells.find(f => f.id === spellName);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCurrSpell(clickedSpell: Spell): void {
    this.currSpell = clickedSpell;
    this.location.go('/spells/' + this.currSpell.id);
  }

  goBack(): void {
    this.location.back();
  }
}
