import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faAngleDown,
  faAngleUp,
  faCheck,
  faCopy,
  faFloppyDisk,
  faMinus,
  faPlus,
  faRotateLeft,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

import { MonsterHelperService } from '../../shared/helpers/monster/monster-helper.service';
import { Monster } from 'src/app/models';
import { copyToClipboard, sourceColorClass } from '../../shared/helpers/format.utils';
import { HelperService } from '../../shared/helpers/helper.service';
import { crXpMap, levelXp, levelXp2024 } from 'src/app/shared/helpers/monster/experienceMaps';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import {
  ReferenceTableCellDirective,
  ReferenceTableColumn,
  ReferenceTableComponent
} from 'src/app/shared/reference-table/reference-table.component';
import { MonsterComponent } from '../beastiary/monster/monster.component';

const ENCOUNTERS_STORAGE_KEY = 'eotcc_encounters_v1';
const PARTY_STORAGE_KEY = 'eotcc_encounter_party_v1';

interface EncounterMonster {
  monster: Monster;
  number: number;
}

interface SavedEncounter {
  id: string;
  name: string;
  ruleset: '2024' | '2014';
  partySize: number;
  partyLevel: number;
  entries: { monsterId: string; monsterName: string; number: number }[];
}

interface PartyDifficulty {
  deadly: number;
  hard: number;
  medium: number;
  easy: number;
  pair: number;
  group: number;
  trivial: number;
}

@Component({
  imports: [
    DecimalPipe,
    TitleCasePipe,
    FormsModule,
    FaIconComponent,
    ReferenceTableComponent,
    ReferenceTableCellDirective,
    MonsterComponent
  ],
  selector: 'app-encounter-builder',
  templateUrl: './encounter-builder.component.html',
  styleUrls: ['./encounter-builder.component.scss']
})
export class EncounterBuilderComponent implements OnInit {
  readonly faFloppyDisk = faFloppyDisk;
  readonly faPlus = faPlus;
  readonly faMinus = faMinus;
  readonly faAngleUp = faAngleUp;
  readonly faAngleDown = faAngleDown;
  readonly faCopy = faCopy;
  readonly faCheck = faCheck;
  readonly faRotateLeft = faRotateLeft;
  readonly faXmark = faXmark;

  readonly levelXp = levelXp;
  readonly levelXp2024 = levelXp2024;
  readonly crXp = crXpMap;

  readonly ruleset = signal<'2024' | '2014'>('2024');
  readonly partySize = signal(5);
  readonly partyLevel = signal(9);

  readonly showMonsterTable = signal(true);
  readonly showLegend = signal(true);

  readonly currMonster = signal<Monster | undefined>(undefined);
  readonly monsters = signal<Monster[]>([]);
  readonly currEncounter = signal<EncounterMonster[]>([]);

  readonly encounterName = signal('');
  readonly savedEncounters = signal<SavedEncounter[]>([]);
  readonly copied = signal(false);

  private copyResetTimer?: ReturnType<typeof setTimeout>;

  columns: ReferenceTableColumn<Monster>[] = [
    {
      key: 'add',
      label: '',
      width: '5%',
      sortable: false,
      filterable: false,
      action: {
        icon: faPlus,
        btnClass: 'btn btn-sm btn-success',
        ariaLabel: 'Add monster to encounter',
        onClick: monster => this.addMonster(monster)
      }
    },
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Name',
      filterId: 'beastiary-name-filter',
      width: '28%',
      headerIcon: true,
      value: m => m.name
    },
    {
      key: 'cr',
      label: 'CR',
      filterId: 'beastiary-cr-filter',
      width: '17%',
      align: 'center',
      filterType: 'number-range',
      min: 0,
      max: 30,
      value: m => m.cr,
      sortValue: m => this.monsterHelper.getSortCr(m.cr)
    },
    {
      key: 'size',
      label: 'Size',
      placeholder: 'Size',
      filterId: 'beastiary-size-filter',
      width: '12%',
      value: m => this.monsterHelper.translateSize(m.size)
    },
    {
      key: 'type',
      label: 'Type',
      placeholder: 'Type',
      filterId: 'beastiary-type-filter',
      width: '18%',
      value: m => this.monsterHelper.getType(m.type)
    },
    {
      key: 'alignment',
      label: 'Alignment',
      placeholder: 'Alignment',
      filterId: 'beastiary-alignment-filter',
      width: '14%',
      value: m => this.monsterHelper.translateAlignment(m.alignment)
    },
    {
      key: 'source',
      label: 'Source',
      placeholder: 'Source',
      filterId: 'beastiary-source-filter',
      width: '6%',
      align: 'right',
      value: m => m.source || '',
      cellClass: m => sourceColorClass(m.source)
    }
  ];

  readonly rowKey = (monster: Monster) => monster.id;

  private dataService = inject(DndDataService);
  public helper = inject(HelperService);
  public monsterHelper = inject(MonsterHelperService);
  private destroyRef = inject(DestroyRef);

  readonly totalMonsterCount = computed(() =>
    this.currEncounter().reduce((sum, entry) => sum + entry.number, 0)
  );

  readonly currPartyDifficulty = computed<PartyDifficulty>(() => {
    const mode = this.ruleset();
    const size = this.partySize();
    const level = this.partyLevel();

    if (mode === '2024') {
      const budget = levelXp2024[level];
      const low = budget.low * size;
      const moderate = budget.moderate * size;
      const high = budget.high * size;
      return {
        deadly: high,
        hard: high,
        medium: moderate,
        easy: low,
        pair: moderate / 2,
        group: moderate / 4,
        trivial: moderate / 8
      };
    }

    const mediumXp = levelXp[level].medium * size;
    let singleMultiplier = 1;
    let pairMultiplier = 1.5;
    let groupMultiplier = 2;
    let hordeMultiplier = 2.5;

    if (size < 3) {
      singleMultiplier = 1.5;
      pairMultiplier = 2;
      groupMultiplier = 2.5;
      hordeMultiplier = 3;
    } else if (size > 5) {
      singleMultiplier = 0.5;
      pairMultiplier = 1;
      groupMultiplier = 1.5;
      hordeMultiplier = 2;
    }

    return {
      deadly: (levelXp[level].deadly * size) / singleMultiplier,
      hard: (levelXp[level].hard * size) / singleMultiplier,
      medium: mediumXp / singleMultiplier,
      easy: (levelXp[level].easy * size) / singleMultiplier,
      pair: mediumXp / (2 * pairMultiplier),
      group: mediumXp / (4 * groupMultiplier),
      trivial: mediumXp / (8 * hordeMultiplier)
    };
  });

  readonly encounterXp = computed(() => {
    let totalXp = 0;
    for (const m of this.currEncounter()) {
      totalXp += this.monsterHelper.getXpByCr(m.monster.cr) * m.number;
    }
    return totalXp;
  });

  readonly adjustedXp = computed(() => {
    const totalXp = this.encounterXp();
    return this.ruleset() === '2024' ? totalXp : totalXp * this.getMultiplier(this.totalMonsterCount());
  });

  readonly currEncounterDifficulty = computed(() => {
    const xpValue = this.adjustedXp();
    const size = this.partySize();
    const level = this.partyLevel();

    if (this.ruleset() === '2024') {
      const budget = levelXp2024[level];
      if (xpValue === 0 || xpValue < budget.low * size) {
        return 'trivial';
      } else if (xpValue < budget.moderate * size) {
        return 'low';
      } else if (xpValue < budget.high * size) {
        return 'moderate';
      }
      return 'high';
    }

    const partyBudget = levelXp[level];
    if (xpValue < partyBudget.easy * size) {
      return 'trivial';
    } else if (xpValue < partyBudget.medium * size) {
      return 'easy';
    } else if (xpValue < partyBudget.hard * size) {
      return 'medium';
    } else if (xpValue < partyBudget.deadly * size) {
      return 'hard';
    }
    return 'deadly';
  });

  readonly maxBudgetXp = computed(() => {
    const size = this.partySize();
    const level = this.partyLevel();
    if (this.ruleset() === '2024') {
      return levelXp2024[level].high * size;
    }
    return levelXp[level].deadly * size;
  });

  readonly budgetFillPercent = computed(() => {
    const max = this.maxBudgetXp();
    if (max <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.adjustedXp() / max) * 100));
  });

  readonly difficultyBadgeClass = computed(() => {
    switch (this.currEncounterDifficulty()) {
      case 'high':
      case 'deadly':
        return 'eb-badge-deadly';
      case 'hard':
        return 'eb-badge-hard';
      case 'moderate':
      case 'medium':
        return 'eb-badge-medium';
      case 'low':
      case 'easy':
        return 'eb-badge-easy';
      default:
        return 'eb-badge-trivial';
    }
  });

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      if (this.copyResetTimer) {
        clearTimeout(this.copyResetTimer);
      }
    });

    this.restorePartySettings();
    this.savedEncounters.set(this.loadSavedEncounters());
    this.dataService
      .getMonsters()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(monsters => {
        this.monsters.set(monsters.filter(f => f.cr !== 'N/A'));
      });
  }

  removeMonster(index: number): void {
    this.currEncounter.update(list => list.filter((_, i) => i !== index));
  }

  buildEncounterSummary(): string {
    const mode = this.ruleset();
    const size = this.partySize();
    const level = this.partyLevel();
    const title = this.encounterName().trim() || 'Untitled Encounter';
    const header = `${title} (${mode} DMG) — ${size}× Level ${level}`;
    const lines = this.currEncounter().map(
      e =>
        `- ${e.number}× ${e.monster.name} (CR ${e.monster.cr}, ${this.monsterHelper.getXpByCr(e.monster.cr).toLocaleString('en-US')} XP)`
    );
    const totalXp = this.encounterXp();
    const adjXp = this.adjustedXp();
    const diff = this.currEncounterDifficulty();
    const perPlayer = Math.round(totalXp / size).toLocaleString('en-US');
    const xpLine =
      mode === '2014'
        ? `Total XP: ${totalXp.toLocaleString('en-US')} (${perPlayer}/player) | Adjusted XP: ${adjXp.toLocaleString('en-US')} | Difficulty: ${diff}`
        : `Total XP: ${totalXp.toLocaleString('en-US')} (${perPlayer}/player) | Difficulty: ${diff}`;
    return [header, ...lines, xpLine].join('\n');
  }

  copyEncounterSummary(): void {
    if (this.currEncounter().length === 0) {
      return;
    }
    copyToClipboard(this.buildEncounterSummary()).then(ok => {
      if (ok) {
        this.flashCopied();
      }
    });
  }

  private flashCopied(): void {
    this.copied.set(true);
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }
    this.copyResetTimer = setTimeout(() => {
      this.copied.set(false);
    }, 1800);
  }

  setRuleset(mode: '2024' | '2014'): void {
    this.ruleset.set(mode);
    this.persistPartySettings();
  }

  stepPartySize(delta: number): void {
    this.partySize.update(s => Math.max(1, Math.min(10, s + delta)));
    this.persistPartySettings();
  }

  stepPartyLevel(delta: number): void {
    this.partyLevel.update(l => Math.max(1, Math.min(20, l + delta)));
    this.persistPartySettings();
  }

  setPartySize(rawValue: number | string): void {
    const size = Number(rawValue);
    this.partySize.set(Number.isFinite(size) ? Math.max(1, Math.min(10, Math.round(size))) : 4);
    this.persistPartySettings();
  }

  setPartyLevel(rawValue: number | string): void {
    const level = Number(rawValue);
    this.partyLevel.set(Number.isFinite(level) ? Math.max(1, Math.min(20, Math.round(level))) : 1);
    this.persistPartySettings();
  }

  setCurrMonster(clickedMonster: Monster): void {
    this.currMonster.set(clickedMonster);
  }

  addMonster(clickedMonster: Monster): void {
    this.currEncounter.update(list => {
      const idx = list.findIndex(encEntry => encEntry.monster === clickedMonster);
      if (idx >= 0) {
        return list.map((entry, i) => (i === idx ? { ...entry, number: entry.number + 1 } : entry));
      }
      return [...list, { monster: clickedMonster, number: 1 }];
    });
  }

  encounterChange(index: number, change: number): void {
    this.currEncounter.update(list => {
      const target = list[index];
      if (!target) {
        return list;
      }
      const nextCount = target.number + change;
      if (nextCount < 1) {
        return list.filter((_, i) => i !== index);
      }
      return list.map((entry, i) => (i === index ? { ...entry, number: nextCount } : entry));
    });
  }

  setMonsterCount(index: number, rawValue: number | string): void {
    const parsed = Math.round(Number(rawValue));
    this.currEncounter.update(list => {
      if (!Number.isFinite(parsed) || parsed < 1) {
        return list.filter((_, i) => i !== index);
      }
      return list.map((entry, i) => (i === index ? { ...entry, number: parsed } : entry));
    });
  }

  clearEncounter(): void {
    this.currEncounter.set([]);
    this.encounterName.set('');
  }

  saveEncounter(): void {
    const current = this.currEncounter();
    if (current.length === 0) {
      return;
    }
    const name = this.encounterName().trim() || `Encounter (${current[0].monster.name})`;
    const saved: SavedEncounter = {
      id: `${Date.now()}`,
      name,
      ruleset: this.ruleset(),
      partySize: this.partySize(),
      partyLevel: this.partyLevel(),
      entries: current.map(e => ({
        monsterId: e.monster.id,
        monsterName: e.monster.name,
        number: e.number
      }))
    };
    this.savedEncounters.update(list => {
      const existingIdx = list.findIndex(e => e.name.toLowerCase() === name.toLowerCase());
      if (existingIdx >= 0) {
        return list.map((item, i) => (i === existingIdx ? saved : item));
      }
      return [saved, ...list];
    });
    this.encounterName.set(name);
    this.persistSavedEncounters();
  }

  loadEncounter(saved: SavedEncounter): void {
    this.ruleset.set(saved.ruleset || '2024');
    this.partySize.set(saved.partySize);
    this.partyLevel.set(saved.partyLevel);
    this.encounterName.set(saved.name);
    const allMonsters = this.monsters();
    const loaded: EncounterMonster[] = [];
    for (const entry of saved.entries) {
      const found = allMonsters.find(m => m.id === entry.monsterId || m.name === entry.monsterName);
      if (found) {
        loaded.push({ monster: found, number: entry.number });
      }
    }
    this.currEncounter.set(loaded);
    this.persistPartySettings();
  }

  deleteSavedEncounter(id: string): void {
    this.savedEncounters.update(list => list.filter(e => e.id !== id));
    this.persistSavedEncounters();
  }

  getMultiplier(monsterCount: number): number {
    const partySize = this.partySize();
    const multipliers = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
    let multiplierCategory: number;

    if (monsterCount === 0) {
      return 0;
    } else if (monsterCount === 1) {
      multiplierCategory = 1;
    } else if (monsterCount === 2) {
      multiplierCategory = 2;
    } else if (monsterCount < 7) {
      multiplierCategory = 3;
    } else if (monsterCount < 11) {
      multiplierCategory = 4;
    } else if (monsterCount < 15) {
      multiplierCategory = 5;
    } else {
      multiplierCategory = 6;
    }

    if (partySize < 3) {
      multiplierCategory++;
    } else if (partySize > 5) {
      multiplierCategory--;
    }

    return multipliers[multiplierCategory];
  }

  getMonsterDifficulty(cr: string): string {
    if (!cr || cr === 'N/A') {
      return 'trivial';
    }
    const monsterXp = this.monsterHelper.getXpByCr(cr);
    if (!monsterXp) {
      return 'trivial';
    }
    const difficulty = this.currPartyDifficulty();
    if (monsterXp > difficulty.deadly) {
      return 'deadly';
    } else if (monsterXp > difficulty.hard) {
      return 'hard';
    } else if (monsterXp > difficulty.medium) {
      return 'medium';
    } else if (monsterXp > difficulty.easy) {
      return 'easy';
    } else if (monsterXp > difficulty.pair) {
      return 'pair';
    } else if (monsterXp > difficulty.group) {
      return 'group';
    }
    return 'trivial';
  }

  private loadSavedEncounters(): SavedEncounter[] {
    try {
      const raw = localStorage.getItem(ENCOUNTERS_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persistSavedEncounters(): void {
    try {
      localStorage.setItem(ENCOUNTERS_STORAGE_KEY, JSON.stringify(this.savedEncounters()));
    } catch {
      // Ignore storage errors.
    }
  }

  private restorePartySettings(): void {
    try {
      const raw = localStorage.getItem(PARTY_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { partySize?: number; partyLevel?: number; ruleset?: '2024' | '2014' };
      if (typeof parsed.partySize === 'number' && parsed.partySize >= 1 && parsed.partySize <= 10) {
        this.partySize.set(Math.round(parsed.partySize));
      }
      if (typeof parsed.partyLevel === 'number' && parsed.partyLevel >= 1 && parsed.partyLevel <= 20) {
        this.partyLevel.set(Math.round(parsed.partyLevel));
      }
      if (parsed.ruleset === '2024' || parsed.ruleset === '2014') {
        this.ruleset.set(parsed.ruleset);
      }
    } catch {
      // Ignore storage errors.
    }
  }

  private persistPartySettings(): void {
    try {
      localStorage.setItem(
        PARTY_STORAGE_KEY,
        JSON.stringify({
          partySize: this.partySize(),
          partyLevel: this.partyLevel(),
          ruleset: this.ruleset()
        })
      );
    } catch {
      // Ignore storage errors.
    }
  }
}
