import { Component, DestroyRef, ElementRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TitleCasePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFeatherPointed, faFileLines, faSearch } from '@fortawesome/free-solid-svg-icons';
import { combineLatest } from 'rxjs';

import { SpellComponent } from './spell/spell.component';
import { Spell, spellSchool } from 'src/app/models/spell';
import { matchesPhrase, sourceColorClass } from 'src/app/shared/helpers/format.utils';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import {
  ReferenceTableCellDirective,
  ReferenceTableColumn,
  ReferenceTableComponent
} from 'src/app/shared/reference-table/reference-table.component';

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const SPELL_SCHOOLS = Object.values(spellSchool)
  .map(s => ({ name: s.name, key: s.name.toLowerCase(), abbrev: s.abbrev }))

const VALID_SCHOOL_KEYS = new Set(SPELL_SCHOOLS.map(s => s.key));

@Component({
  imports: [FaIconComponent, ReferenceTableComponent, ReferenceTableCellDirective, SpellComponent],
  selector: 'app-spells',
  templateUrl: './spells.component.html',
  styleUrls: ['./spells.component.scss']
})
export class SpellsComponent implements OnInit {
  readonly faFeatherPointed = faFeatherPointed;
  readonly faSearch = faSearch;
  readonly faFileLines = faFileLines;

  readonly spells = signal<Spell[]>([]);
  readonly currSpell = signal<Spell | undefined>(undefined);

  readonly spellLevels = SPELL_LEVELS;
  readonly schoolOptions = SPELL_SCHOOLS;
  readonly selectedLevels = signal<number[]>([]);
  readonly selectedSchools = signal<string[]>([]);
  readonly selectedClasses = signal<string[]>([]);
  readonly classMenuOpen = signal<boolean>(false);
  readonly onlyConcentration = signal<boolean>(false);
  readonly onlyRitual = signal<boolean>(false);
  readonly onlyCaiusNotes = signal<boolean>(false);
  readonly nameQuery = signal<string>('');
  readonly fullTextQuery = signal<string>('');

  readonly availableClasses = computed(() => {
    const map = new Map<string, string>();
    for (const s of this.spells()) {
      for (const raw of s.classes || []) {
        const trimmed = raw.trim();
        if (!trimmed) {
          continue;
        }
        const key = trimmed.toLowerCase();
        const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        if (!map.has(key)) {
          map.set(key, formatted);
        }
      }
    }
    return [...map.values()].sort((a, b) => a.localeCompare(b));
  });

  readonly classDropdownLabel = computed(() => {
    const selected = this.selectedClasses();
    if (selected.length === 0) {
      return 'All Classes';
    }
    if (selected.length <= 2) {
      return selected.join(', ');
    }
    return `${selected.length} Classes`;
  });

  readonly hasQuickFilters = computed(
    () =>
      this.selectedLevels().length > 0 ||
      this.selectedSchools().length > 0 ||
      this.selectedClasses().length > 0 ||
      this.onlyConcentration() ||
      this.onlyRitual() ||
      this.onlyCaiusNotes() ||
      this.nameQuery().trim().length > 0 ||
      this.fullTextQuery().trim().length > 0
  );

  readonly filteredSpells = computed(() => {
    const all = this.spells();
    const levels = this.selectedLevels();
    const schools = this.selectedSchools();
    const classes = this.selectedClasses().map(c => c.toLowerCase());
    const conc = this.onlyConcentration();
    const ritual = this.onlyRitual();
    const caius = this.onlyCaiusNotes();
    const nameTerm = this.nameQuery().trim().toLowerCase();
    const fullText = this.fullTextQuery();

    return all.filter(s => {
      if (levels.length > 0 && !levels.includes(Number(s.level))) {
        return false;
      }
      if (schools.length > 0 && !schools.includes((s.school?.name || '').toLowerCase())) {
        return false;
      }
      if (classes.length > 0 && !(s.classes || []).some(c => classes.includes(c.trim().toLowerCase()))) {
        return false;
      }
      if (conc && !s.concentration) {
        return false;
      }
      if (ritual && !s.ritual) {
        return false;
      }
      if (caius && !s.hasCaiusNotes) {
        return false;
      }
      if (nameTerm && !s.name.toLowerCase().includes(nameTerm)) {
        return false;
      }
      if (!matchesPhrase(s.searchText, fullText)) {
        return false;
      }
      return true;
    });
  });

  private titleCase = new TitleCasePipe();

  columns: ReferenceTableColumn<Spell>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '46%',
      filterable: false,
      value: s => s.name
    },
    {
      key: 'level',
      label: 'Lvl',
      width: '9%',
      align: 'center',
      filterable: false,
      value: s => s.level,
      sortValue: s => Number(s.level) || 0
    },
    {
      key: 'time',
      label: 'Time',
      width: '16%',
      align: 'center',
      filterable: false,
      value: s => this.titleCase.transform(s.tableTime || '')
    },
    {
      key: 'school',
      label: 'School',
      width: '17%',
      align: 'center',
      filterable: false,
      value: s => s.school?.abbrev || s.school?.name || '',
      sortValue: s => s.school?.name || ''
    },
    {
      key: 'source',
      label: 'Src',
      width: '12%',
      align: 'right',
      filterable: false,
      value: s => s.source || '',
      cellClass: s => sourceColorClass(s.source)
    }
  ];

  readonly rowKey = (spell: Spell) => spell.id;

  private dataService = inject(DndDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private hostRef = inject(ElementRef<HTMLElement>);
  private destroyRef = inject(DestroyRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.classMenuOpen()) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (!target || !this.hostRef.nativeElement.querySelector('.spell-class-dropdown')?.contains(target)) {
      this.classMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.classMenuOpen()) {
      this.classMenuOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queryParams => {
      const classQuery = queryParams['classes'] ?? queryParams['spell-class-filter'];
      const nextClasses =
        typeof classQuery === 'string' && classQuery.trim()
          ? [
              ...new Set(
                classQuery
                  .split(',')
                  .map(c => c.trim())
                  .filter(Boolean)
                  .map(c => c.charAt(0).toUpperCase() + c.slice(1))
              )
            ]
          : [];
      if (nextClasses.join(',') !== this.selectedClasses().join(',')) {
        this.selectedClasses.set(nextClasses);
      }

      const levelsQuery = queryParams['levels'] ?? queryParams['spell-level-filter'];
      const nextLevels =
        typeof levelsQuery === 'string' && levelsQuery.trim()
          ? [
              ...new Set(
                levelsQuery
                  .split(',')
                  .map(n => Number(n.trim()))
                  .filter(n => Number.isInteger(n) && n >= 0 && n <= 9)
              )
            ].sort((a, b) => a - b)
          : [];
      if (nextLevels.join(',') !== this.selectedLevels().join(',')) {
        this.selectedLevels.set(nextLevels);
      }

      const schoolsQuery = queryParams['schools'] ?? queryParams['spell-school-filter'];
      const nextSchools =
        typeof schoolsQuery === 'string' && schoolsQuery.trim()
          ? [
              ...new Set(
                schoolsQuery
                  .split(',')
                  .map(s => s.trim().toLowerCase())
                  .filter(s => VALID_SCHOOL_KEYS.has(s))
              )
            ]
          : [];
      if (nextSchools.join(',') !== this.selectedSchools().join(',')) {
        this.selectedSchools.set(nextSchools);
      }

      const nameParam = queryParams['name'] ?? queryParams['spell-name-filter'];
      if (typeof nameParam === 'string' && nameParam !== this.nameQuery()) {
        this.nameQuery.set(nameParam);
      }

      const textParam = queryParams['text'];
      if (typeof textParam === 'string' && textParam !== this.fullTextQuery()) {
        this.fullTextQuery.set(textParam);
      }

      this.onlyConcentration.set(queryParams['conc'] === '1' || queryParams['conc'] === 'true');
      this.onlyRitual.set(queryParams['ritual'] === '1' || queryParams['ritual'] === 'true');
      this.onlyCaiusNotes.set(queryParams['caius'] === '1' || queryParams['caius'] === 'true');
    });

    combineLatest([this.dataService.getSpells(), this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([spells, params]) => {
        this.spells.set(spells);
        const spellName = params.get('spellName');
        const found = spellName ? spells.find(f => f.id === spellName) : undefined;
        this.currSpell.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : 'Spells — EotCC 5e');
      });
  }

  onNameInput(event: Event): void {
    this.nameQuery.set((event.target as HTMLInputElement).value);
  }

  onFullTextInput(event: Event): void {
    this.fullTextQuery.set((event.target as HTMLInputElement).value);
  }

  toggleLevel(level: number): void {
    const curr = this.selectedLevels();
    const next = curr.includes(level) ? curr.filter(l => l !== level) : [...curr, level].sort((a, b) => a - b);
    this.selectedLevels.set(next);
    this.syncQuickFilterParams();
  }

  toggleSchool(schoolKey: string): void {
    const curr = this.selectedSchools();
    const next = curr.includes(schoolKey) ? curr.filter(s => s !== schoolKey) : [...curr, schoolKey];
    this.selectedSchools.set(next);
    this.syncQuickFilterParams();
  }

  toggleClassMenu(): void {
    this.classMenuOpen.update(open => !open);
  }

  toggleClass(cls: string): void {
    const current = this.selectedClasses();
    const next = current.includes(cls) ? current.filter(c => c !== cls) : [...current, cls];
    this.selectedClasses.set(next);
    this.syncQuickFilterParams();
  }

  toggleConcentration(): void {
    this.onlyConcentration.update(v => !v);
    this.syncQuickFilterParams();
  }

  toggleRitual(): void {
    this.onlyRitual.update(v => !v);
    this.syncQuickFilterParams();
  }

  toggleCaiusNotes(): void {
    this.onlyCaiusNotes.update(v => !v);
    this.syncQuickFilterParams();
  }

  clearQuickFilters(): void {
    this.selectedLevels.set([]);
    this.selectedSchools.set([]);
    this.selectedClasses.set([]);
    this.onlyConcentration.set(false);
    this.onlyRitual.set(false);
    this.onlyCaiusNotes.set(false);
    this.nameQuery.set('');
    this.fullTextQuery.set('');
    this.classMenuOpen.set(false);
    this.syncQuickFilterParams();
  }

  private syncQuickFilterParams(): void {
    const classes = this.selectedClasses();
    const levels = this.selectedLevels();
    const schools = this.selectedSchools();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        classes: classes.length ? classes.join(',') : null,
        'spell-class-filter': null,
        levels: levels.length ? levels.join(',') : null,
        'spell-level-filter': null,
        schools: schools.length ? schools.join(',') : null,
        'spell-school-filter': null,
        'spell-name-filter': null,
        name: this.nameQuery().trim() || null,
        text: this.fullTextQuery().trim() || null,
        conc: this.onlyConcentration() ? '1' : null,
        ritual: this.onlyRitual() ? '1' : null,
        caius: this.onlyCaiusNotes() ? '1' : null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  setCurrSpell(clickedSpell: Spell): void {
    this.currSpell.set(clickedSpell);
    this.title.setTitle(`${clickedSpell.name} — EotCC 5e`);
    this.router.navigate(['/spells', clickedSpell.id], { queryParamsHandling: 'preserve' });

    if (window.innerWidth < 1200) {
      setTimeout(() => {
        document.getElementById('spell-detail-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }
}
