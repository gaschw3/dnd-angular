import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MonsterHelperService } from '../../shared/helpers/monster/monster-helper.service';
import { Monster } from 'src/app/models';
import { HelperService } from '../../shared/helpers/helper.service';
import { crXpMap, levelXp, levelXp2024 } from 'src/app/shared/helpers/monster/experienceMaps';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';
import { MonsterComponent } from '../beastiary/monster/monster.component';

const ENCOUNTERS_STORAGE_KEY = 'eotcc_encounters_v1';

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
  imports: [CommonModule, FormsModule, ReferenceTableComponent, MonsterComponent],
  selector: 'app-encounter-builder',
  templateUrl: './encounter-builder.component.html',
  styleUrls: ['./encounter-builder.component.scss']
})
export class EncounterBuilderComponent implements OnInit, OnDestroy {
  levelXp = levelXp;
  levelXp2024 = levelXp2024;
  crXp = crXpMap;

  ruleset: '2024' | '2014' = '2024';
  partySize = 5;
  partyLevel = 9;

  singleMultiplier = 1;
  pairMultiplier = 1;
  groupMultiplier = 1;
  hordeMultiplier = 1;
  encounterXp = 0;
  adjustedXp = 0;
  currEncounterDifficulty = 'trivial';
  currPartyDifficulty!: PartyDifficulty;

  showMonsterTable = true;
  showLegend = false;

  currMonster?: Monster;
  monsters: Monster[] = [];
  currEncounter: EncounterMonster[] = [];

  encounterName = '';
  savedEncounters: SavedEncounter[] = [];

  private destroy$ = new Subject<void>();

  columns: ReferenceTableColumn<Monster>[] = [
    {
      key: 'add',
      label: '',
      width: '5%',
      sortable: false,
      filterable: false,
      action: {
        iconClass: 'fa fa-plus',
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
      sortValue: m => this.monsterHelper.getSortCr(m.cr),
      cellClass: m => `text--black color--${this.getMonsterDifficulty(m.cr)}`
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
      cellClass: m => (m.source ? `color-${m.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (monster: Monster) => monster.id;

  private dataService = inject(DndDataService);
  public helper = inject(HelperService);
  public monsterHelper = inject(MonsterHelperService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.savedEncounters = this.loadSavedEncounters();
    this.dataService.getMonsters().pipe(takeUntil(this.destroy$)).subscribe(monsters => {
      this.monsters = monsters.filter(f => f.cr !== 'N/A');
      this.cdr.markForCheck();
    });
    this.recalcPartyDifficulty();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setRuleset(mode: '2024' | '2014'): void {
    this.ruleset = mode;
    this.recalcPartyDifficulty();
  }

  setCurrMonster(clickedMonster: Monster): void {
    this.currMonster = clickedMonster;
  }

  addMonster(clickedMonster: Monster): void {
    const monsterInCurrEncounter = this.currEncounter.find(encEntry => encEntry.monster === clickedMonster);
    if (monsterInCurrEncounter) {
      monsterInCurrEncounter.number++;
    } else {
      this.currEncounter.push({ monster: clickedMonster, number: 1 });
    }
    this.recalcEncounterXp();
  }

  encounterChange(index: number, change: number): void {
    this.currEncounter[index].number += change;
    if (this.currEncounter[index].number < 1) {
      this.currEncounter.splice(index, 1);
    }
    this.recalcEncounterXp();
  }

  clearEncounter(): void {
    this.currEncounter = [];
    this.encounterName = '';
    this.recalcEncounterXp();
  }

  saveEncounter(): void {
    if (this.currEncounter.length === 0) {
      return;
    }
    const name = this.encounterName.trim() || `Encounter (${this.currEncounter[0].monster.name})`;
    const saved: SavedEncounter = {
      id: `${Date.now()}`,
      name,
      ruleset: this.ruleset,
      partySize: this.partySize,
      partyLevel: this.partyLevel,
      entries: this.currEncounter.map(e => ({
        monsterId: e.monster.id,
        monsterName: e.monster.name,
        number: e.number
      }))
    };
    const existingIdx = this.savedEncounters.findIndex(e => e.name.toLowerCase() === name.toLowerCase());
    if (existingIdx >= 0) {
      this.savedEncounters[existingIdx] = saved;
    } else {
      this.savedEncounters = [saved, ...this.savedEncounters];
    }
    this.encounterName = name;
    this.persistSavedEncounters();
  }

  loadEncounter(saved: SavedEncounter): void {
    this.ruleset = saved.ruleset || '2024';
    this.partySize = saved.partySize;
    this.partyLevel = saved.partyLevel;
    this.encounterName = saved.name;
    this.currEncounter = [];
    for (const entry of saved.entries) {
      const found = this.monsters.find(m => m.id === entry.monsterId || m.name === entry.monsterName);
      if (found) {
        this.currEncounter.push({ monster: found, number: entry.number });
      }
    }
    this.recalcPartyDifficulty();
  }

  deleteSavedEncounter(id: string): void {
    this.savedEncounters = this.savedEncounters.filter(e => e.id !== id);
    this.persistSavedEncounters();
  }

  recalcPartyDifficulty(): void {
    if (this.ruleset === '2024') {
      const budget = levelXp2024[this.partyLevel];
      const low = budget.low * this.partySize;
      const moderate = budget.moderate * this.partySize;
      const high = budget.high * this.partySize;
      this.currPartyDifficulty = {
        deadly: high,
        hard: high,
        medium: moderate,
        easy: low,
        pair: moderate / 2,
        group: moderate / 4,
        trivial: moderate / 8
      };
      this.recalcEncounterXp();
      return;
    }

    const mediumXp = levelXp[this.partyLevel].medium * this.partySize;
    if (this.partySize < 3) {
      this.singleMultiplier = 1.5;
      this.pairMultiplier = 2;
      this.groupMultiplier = 2.5;
      this.hordeMultiplier = 3;
    } else if (this.partySize > 5) {
      this.singleMultiplier = 0.5;
      this.pairMultiplier = 1;
      this.groupMultiplier = 1.5;
      this.hordeMultiplier = 2;
    } else {
      this.singleMultiplier = 1;
      this.pairMultiplier = 1.5;
      this.groupMultiplier = 2;
      this.hordeMultiplier = 2.5;
    }

    this.currPartyDifficulty = {
      deadly: (levelXp[this.partyLevel].deadly * this.partySize) / this.singleMultiplier,
      hard: (levelXp[this.partyLevel].hard * this.partySize) / this.singleMultiplier,
      medium: mediumXp / this.singleMultiplier,
      easy: (levelXp[this.partyLevel].easy * this.partySize) / this.singleMultiplier,
      pair: mediumXp / (2 * this.pairMultiplier),
      group: mediumXp / (4 * this.groupMultiplier),
      trivial: mediumXp / (8 * this.hordeMultiplier)
    };
    this.recalcEncounterXp();
  }

  recalcEncounterDifficulty(xpValue: number): string {
    if (this.ruleset === '2024') {
      const budget = levelXp2024[this.partyLevel];
      if (xpValue === 0) {
        return 'trivial';
      } else if (xpValue < budget.low * this.partySize) {
        return 'trivial';
      } else if (xpValue < budget.moderate * this.partySize) {
        return 'low';
      } else if (xpValue < budget.high * this.partySize) {
        return 'moderate';
      }
      return 'high';
    }

    if (xpValue < this.currPartyDifficulty.easy) {
      return 'trivial';
    } else if (xpValue < this.currPartyDifficulty.medium) {
      return 'easy';
    } else if (xpValue < this.currPartyDifficulty.hard) {
      return 'medium';
    } else if (xpValue < this.currPartyDifficulty.deadly) {
      return 'hard';
    }
    return 'deadly';
  }

  recalcEncounterXp(): void {
    let totalXp = 0;
    let totalMonsters = 0;
    for (const m of this.currEncounter) {
      const cr = m.monster.cr.includes('(') ? m.monster.cr.split(' (')[0] : m.monster.cr;
      const matchingCr = this.crXp.find(i => i.cr === cr);
      if (matchingCr) {
        totalXp += matchingCr.xp * m.number;
      }
      totalMonsters += m.number;
    }
    this.encounterXp = totalXp;
    this.adjustedXp = this.ruleset === '2024' ? totalXp : totalXp * this.getMultiplier(totalMonsters);
    this.currEncounterDifficulty = this.recalcEncounterDifficulty(this.adjustedXp);
  }

  getMultiplier(monsterCount: number): number {
    const partySize = this.partySize;
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
    if (cr.includes('(')) {
      cr = cr.split(' (')[0];
    }

    const matchingCr = this.crXp.find(i => i.cr === cr);
    if (!matchingCr) {
      return 'trivial';
    }
    const monsterXp = matchingCr.xp;
    if (monsterXp > this.currPartyDifficulty.deadly) {
      return 'deadly';
    } else if (monsterXp > this.currPartyDifficulty.hard) {
      return 'hard';
    } else if (monsterXp > this.currPartyDifficulty.medium) {
      return 'medium';
    } else if (monsterXp > this.currPartyDifficulty.easy) {
      return 'easy';
    } else if (monsterXp > this.currPartyDifficulty.pair) {
      return 'pair';
    } else if (monsterXp > this.currPartyDifficulty.group) {
      return 'group';
    } else {
      return 'trivial';
    }
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
      localStorage.setItem(ENCOUNTERS_STORAGE_KEY, JSON.stringify(this.savedEncounters));
    } catch {
      // Ignore storage errors.
    }
  }
}
