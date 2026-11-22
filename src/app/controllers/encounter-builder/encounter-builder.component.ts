import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MonsterHelperService } from '../../shared/helpers/monster/monster-helper.service';
import { Monster } from 'src/app/models';
import { HelperService } from '../../shared/helpers/helper.service';
import { crXpMap, levelXp } from 'src/app/shared/helpers/monster/experienceMaps';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  standalone: false,
  selector: 'app-encounter-builder',
  templateUrl: './encounter-builder.component.html',
  styleUrls: ['./encounter-builder.component.scss']
})
export class EncounterBuilderComponent implements OnInit, OnDestroy {
  levelXp = levelXp;
  crXp = crXpMap;

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

  constructor(
    private dataService: DndDataService,
    public helper: HelperService,
    public monsterHelper: MonsterHelperService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
    this.recalcEncounterXp();
  }

  recalcPartyDifficulty(): void {
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

  recalcEncounterDifficulty(adjXp: number): string {
    if (adjXp < this.currPartyDifficulty.easy) {
      return 'trivial';
    } else if (adjXp < this.currPartyDifficulty.medium) {
      return 'easy';
    } else if (adjXp < this.currPartyDifficulty.hard) {
      return 'medium';
    } else if (adjXp < this.currPartyDifficulty.deadly) {
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
    this.adjustedXp = totalXp * this.getMultiplier(totalMonsters);
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
}

interface EncounterMonster {
  monster: Monster;
  number: number;
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
