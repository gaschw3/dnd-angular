import { HelperService } from './../../shared/helpers/helper.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Ancestry } from '../../models/ancestry';
import { DndDataService } from '../../shared/services/dnd-data.service';

interface Stat {
  name: string;
  value: number;
  topChosen?: boolean;
  botChosen?: boolean;
}

@Component({
  standalone: false,
  selector: 'app-point-buy',
  templateUrl: './point-buy.component.html',
  styleUrls: ['./point-buy.component.scss']
})
export class PointBuyComponent implements OnInit {
  ancestries: Ancestry[] = [];
  selectedAncestry?: Ancestry;

  pointsSpent = 0;
  totalPoints = 27;

  stats: Stat[] = [
    { name: 'str', value: 8, topChosen: false, botChosen: false },
    { name: 'dex', value: 8, topChosen: false, botChosen: false },
    { name: 'con', value: 8, topChosen: false, botChosen: false },
    { name: 'int', value: 8, topChosen: false, botChosen: false },
    { name: 'wis', value: 8, topChosen: false, botChosen: false },
    { name: 'cha', value: 8, topChosen: false, botChosen: false }
  ];

  ancestryStats: Stat[] = [
    { name: 'str', value: 0 },
    { name: 'dex', value: 0 },
    { name: 'con', value: 0 },
    { name: 'int', value: 0 },
    { name: 'wis', value: 0 },
    { name: 'cha', value: 0 }
  ];

  anChoose = 0;
  choose = 3;
  pickTwo = false;

  constructor(
    private dataService: DndDataService,
    public helper: HelperService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataService.getLegacyAncestries().subscribe(ancestries => {
      this.ancestries = ancestries;
      this.cdr.markForCheck();
    });
  }

  updatePercentage(): void {
    // Progress circle updates reactively via getPercentage() in the template.
  }

  getPercentage(): number {
    return Math.floor(((this.totalPoints - this.pointsSpent) / this.totalPoints) * 100);
  }

  setCurrAncestry(ancestry: any): void {
    if (ancestry) {
      for (const anStat of this.ancestryStats) {
        anStat.value = ancestry[anStat.name] ? ancestry[anStat.name] : 0;
      }
      this.choose = ancestry.choose ? ancestry.choose : 3;
    }
  }

  chooseStats(event: any): void {
    const checkedCount = this.stats.reduce(
      (sum, stat) => sum + (stat.topChosen ? 1 : 0) + (stat.botChosen ? 1 : 0),
      0
    );
    this.anChoose = checkedCount;
    if (event.target.checked === true) {
      if (this.anChoose <= this.choose) {
        for (const anStat of this.ancestryStats) {
          if (event.target.value === anStat.name) {
            anStat.value += 1;
          }
        }
      } else {
        event.target.checked = false;
        this.anChoose = Math.max(0, this.anChoose - 1);
      }
    } else if (this.anChoose >= 0) {
      for (const anStat of this.ancestryStats) {
        if (event.target.value === anStat.name) {
          anStat.value -= 1;
        }
      }
    }
  }

  calculatePoints(): void {
    this.pointsSpent = 0;
    for (const stat of this.stats) {
      this.validateStat(stat);
      this.pointsSpent += this.pointCost(stat.value);
    }
  }

  pointCost(stat: number): number {
    if (stat > 7 && stat < 14) {
      return stat - 8;
    } else if (stat === 14) {
      return 7;
    } else if (stat === 15) {
      return 9;
    }
    return 0;
  }

  validateStat(stat: Stat): void {
    if (stat.value < 8) {
      stat.value = 8;
    } else if (stat.value > 15) {
      stat.value = 15;
    }
  }

  getMod(stat: number, ancestryStat: number): string {
    return this.helper.getStatMod(String(stat + ancestryStat));
  }

  getModNum(stat: number, ancestryStat: number): number {
    return parseInt(this.getMod(stat, ancestryStat), 10);
  }

  getAnStat(statName: string): number {
    return this.ancestryStats.filter(anStat => anStat.name === statName)[0].value;
  }
}
