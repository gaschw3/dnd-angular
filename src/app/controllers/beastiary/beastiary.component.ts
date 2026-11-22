import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { MonsterComponent } from './monster/monster.component';
import { Monster } from 'src/app/models/monster';
import { sizeMap } from 'src/app/shared/helpers/monster/sizeMap';
import { MonsterHelperService } from 'src/app/shared/helpers/monster/monster-helper.service';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  selector: 'app-beastiary',
  templateUrl: './beastiary.component.html',
  styleUrls: ['./beastiary.component.scss']
})
export class BeastiaryComponent implements OnInit, OnDestroy {
  monsters: Monster[] = [];
  currMonster?: Monster;

  private destroy$ = new Subject<void>();

  @ViewChild(MonsterComponent) child?: MonsterComponent;

  columns: ReferenceTableColumn<Monster>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Name',
      filterId: 'beastiary-name-filter',
      width: '30%',
      headerIcon: true,
      value: m => m.name
    },
    {
      key: 'cr',
      label: 'CR',
      placeholder: 'CR',
      filterId: 'beastiary-level-filter',
      width: '10%',
      align: 'center',
      value: m => m.cr,
      sortValue: m => this.monsterHelper.getSortCr(m.cr)
    },
    {
      key: 'type',
      label: 'Type',
      placeholder: 'Type',
      filterId: 'beastiary-school-filter',
      width: '30%',
      value: m => this.getType(m.type)
    },
    {
      key: 'other',
      label: 'Tags',
      placeholder: 'Tags',
      filterId: 'beastiary-source-filter',
      width: '25%',
      sortable: false,
      value: m => m.other || ''
    },
    {
      key: 'source',
      label: 'Source',
      placeholder: 'Source',
      filterId: 'beastiary-classes-filter',
      width: '5%',
      align: 'right',
      value: m => m.source || '',
      cellClass: m => (m.source ? `color-${m.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (monster: Monster) => monster.id;

  constructor(
    private dataService: DndDataService,
    private monsterHelper: MonsterHelperService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.dataService.getMonsters().pipe(takeUntil(this.destroy$)).subscribe(monsters => {
      this.monsters = monsters;
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const monsterName = params.get('monsterName');
        if (monsterName) {
          this.currMonster = this.monsters.find(f => f.id === monsterName);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCurrMonster(clickedMonster: Monster): void {
    this.currMonster = clickedMonster;
    this.location.go('/beastiary/' + this.currMonster.id);
  }

  getType(type: any): string {
    if (type) {
      if (type.tags) {
        return `${type.type} (${type.tags[0]})`;
      } else if (type.swarmSize) {
        return `swarm of ${sizeMap[type.swarmSize]} ${type.type}`;
      } else if (type.type && type.type.choose) {
        return type.type.choose.join(', ') + ' (choose)';
      } else if (type.type) {
        return type.type;
      } else {
        return type;
      }
    }
    return '';
  }

  goBack(): void {
    this.location.back();
  }
}
