import { Component, ElementRef, HostListener, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFeatherPointed } from '@fortawesome/free-solid-svg-icons';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SpellComponent } from './spell/spell.component';
import { Spell } from 'src/app/models/spell';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

@Component({
  imports: [FaIconComponent, ReferenceTableComponent, SpellComponent],
  selector: 'app-spells',
  templateUrl: './spells.component.html',
  styleUrls: ['./spells.component.scss']
})
export class SpellsComponent implements OnInit, OnDestroy {
  readonly faFeatherPointed = faFeatherPointed;
  readonly spells = signal<Spell[]>([]);
  readonly currSpell = signal<Spell | undefined>(undefined);
  readonly initialFilters = signal<Record<string, string>>({});

  readonly spellLevels = SPELL_LEVELS;
  readonly selectedLevels = signal<number[]>([]);
  readonly selectedClasses = signal<string[]>([]);
  readonly classMenuOpen = signal<boolean>(false);
  readonly onlyConcentration = signal<boolean>(false);
  readonly onlyRitual = signal<boolean>(false);
  readonly onlyCaiusNotes = signal<boolean>(false);

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
      this.selectedClasses().length > 0 ||
      this.onlyConcentration() ||
      this.onlyRitual() ||
      this.onlyCaiusNotes()
  );

  readonly filteredSpells = computed(() => {
    const all = this.spells();
    const levels = this.selectedLevels();
    const classes = this.selectedClasses().map(c => c.toLowerCase());
    const conc = this.onlyConcentration();
    const ritual = this.onlyRitual();
    const caius = this.onlyCaiusNotes();

    return all.filter(s => {
      if (levels.length > 0 && !levels.includes(Number(s.level))) {
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
      return true;
    });
  });

  private destroy$ = new Subject<void>();
  private titleCase = new TitleCasePipe();

  columns: ReferenceTableColumn<Spell>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Filter Spells',
      filterId: 'spell-name-filter',
      width: '46%',
      headerIcon: true,
      filterType: 'regex',
      isHtml: true,
      value: s => formatSpellNameHtml(s),
      filterValue: s => s.name,
      sortValue: s => s.name
    },
    {
      key: 'level',
      label: 'Lvl',
      placeholder: 'Lvl',
      filterId: 'spell-level-filter',
      width: '9%',
      align: 'center',
      filterType: 'regex',
      value: s => s.level,
      filterValue: s => String(s.level),
      sortValue: s => Number(s.level) || 0
    },
    {
      key: 'time',
      label: 'Time',
      placeholder: 'Time',
      filterId: 'spell-time-filter',
      width: '16%',
      align: 'center',
      filterType: 'regex',
      value: s => this.titleCase.transform(s.tableTime || '')
    },
    {
      key: 'school',
      label: 'School',
      placeholder: 'School',
      filterId: 'spell-school-filter',
      width: '17%',
      align: 'center',
      filterType: 'regex',
      isHtml: true,
      value: s => formatSchoolPillHtml(s),
      filterValue: s => `${s.school?.name || ''} ${s.school?.abbrev || ''}`,
      sortValue: s => s.school?.name || ''
    },
    {
      key: 'source',
      label: 'Src',
      placeholder: 'Src',
      filterId: 'spell-source-filter',
      width: '12%',
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
  private title = inject(Title);
  private hostRef = inject(ElementRef<HTMLElement>);

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
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(queryParams => {
      const {
        classes: classQuery,
        levels: levelsQuery,
        conc: concQuery,
        ritual: ritualQuery,
        caius: caiusQuery,
        ...tableFilters
      } = queryParams;

      const nextFilters = tableFilters as Record<string, string>;
      if (JSON.stringify(nextFilters) !== JSON.stringify(this.initialFilters())) {
        this.initialFilters.set(nextFilters);
      }

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

      this.onlyConcentration.set(concQuery === '1' || concQuery === 'true');
      this.onlyRitual.set(ritualQuery === '1' || ritualQuery === 'true');
      this.onlyCaiusNotes.set(caiusQuery === '1' || caiusQuery === 'true');
    });

    combineLatest([this.dataService.getSpells(), this.route.paramMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([spells, params]) => {
        this.spells.set(spells);
        const spellName = params.get('spellName');
        const found = spellName ? spells.find(f => f.id === spellName) : undefined;
        this.currSpell.set(found);
        this.title.setTitle(found ? `${found.name} — EotCC 5e` : 'Spells — EotCC 5e');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleLevel(level: number): void {
    const curr = this.selectedLevels();
    const next = curr.includes(level) ? curr.filter(l => l !== level) : [...curr, level].sort((a, b) => a - b);
    this.selectedLevels.set(next);
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
    this.selectedClasses.set([]);
    this.onlyConcentration.set(false);
    this.onlyRitual.set(false);
    this.onlyCaiusNotes.set(false);
    this.classMenuOpen.set(false);
    this.syncQuickFilterParams();
  }

  private syncQuickFilterParams(): void {
    const classes = this.selectedClasses();
    const levels = this.selectedLevels();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        classes: classes.length ? classes.join(',') : null,
        levels: levels.length ? levels.join(',') : null,
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSpellNameHtml(spell: Spell): string {
  const safeName = escapeHtml(spell.name);
  const namePart = spell.replaced ? `<span class="strikethrough">${safeName}</span>` : safeName;
  const tags: string[] = [];
  if (spell.concentration) {
    tags.push('<span class="spell-tag-badge" title="Concentration">C</span>');
  }
  if (spell.ritual) {
    tags.push('<span class="spell-tag-badge" title="Ritual">R</span>');
  }
  if (spell.change === 'buff') {
    tags.push('<span class="spell-tag-badge spell-tag-buff" title="Buffed">++</span>');
  } else if (spell.change === 'nerf') {
    tags.push('<span class="spell-tag-badge spell-tag-nerf" title="Nerfed">--</span>');
  } else if (spell.change === 'change') {
    tags.push('<span class="spell-tag-badge spell-tag-change" title="Modified">??</span>');
  }
  return `${namePart}${tags.join('')}`;
}

function formatSchoolPillHtml(spell: Spell): string {
  const name = spell.school?.name || '';
  const abbrev = spell.school?.abbrev || name;
  if (!abbrev) {
    return '';
  }
  const key = name.toLowerCase();
  return `<span class="spell-school-pill spell-pill-${escapeHtml(key)}" title="${escapeHtml(name)}">${escapeHtml(abbrev)}</span>`;
}
