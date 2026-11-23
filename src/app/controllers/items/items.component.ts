import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location, TitleCasePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { Item } from 'src/app/models/item';
import { ItemComponent } from './item/item.component';
import { typeTable } from '../../shared/itemTypes';
import { IdToNamePipe } from 'src/app/pipes/id-to-name.pipe';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { ReferenceTableColumn, ReferenceTableComponent } from 'src/app/shared/reference-table/reference-table.component';

@Component({
  imports: [CommonModule, ReferenceTableComponent, ItemComponent],
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit, OnDestroy {
  magic: Item[] = [];
  normal: Item[] = [];
  treasure: Item[] = [];
  items: Item[] = [];
  shownItems: Item[] = [];

  currItem?: Item;
  selected = 'all';

  idPipe = new IdToNamePipe();
  private titleCase = new TitleCasePipe();
  private destroy$ = new Subject<void>();

  @ViewChild(ItemComponent) child?: ItemComponent;

  columns: ReferenceTableColumn<Item>[] = [
    {
      key: 'name',
      label: 'Name',
      placeholder: 'Filter Items',
      filterId: 'item-name-filter',
      width: '38%',
      headerIcon: true,
      isHtml: true,
      value: item => item.name
    },
    {
      key: 'type',
      label: 'Type',
      placeholder: 'Type',
      filterId: 'item-prof-filter',
      width: '24%',
      value: item => this.titleCase.transform(this.getItemType(item))
    },
    {
      key: 'attunement',
      label: 'Attun.',
      placeholder: 'Attunement',
      filterId: 'item-attune-filter',
      width: '8%',
      align: 'center',
      value: item => (item.reqAttune ? 'X' : '')
    },
    {
      key: 'value',
      label: 'Value',
      placeholder: 'Value',
      filterId: 'item-value-filter',
      width: '10%',
      value: item => this.formatValue(item.value),
      sortValue: item => item.value || 0,
      cellClass: item => {
        if (!item.value) {
          return '';
        }
        return item.value / 100 >= 1 ? 'text--gp' : item.value / 10 >= 1 ? 'text--sp' : 'text--cp';
      }
    },
    {
      key: 'rarity',
      label: 'Rarity',
      placeholder: 'Rarity',
      filterId: 'item-rarity-filter',
      width: '12%',
      value: item => item.rarity || '',
      sortValue: item => this.getRaritySort(item.rarity)
    },
    {
      key: 'source',
      label: 'Source',
      placeholder: 'Source',
      filterId: 'item-source-filter',
      width: '8%',
      align: 'right',
      value: item => item.source || '',
      cellClass: item => (item.source ? `color-${item.source.toLowerCase()}` : '')
    }
  ];

  readonly rowKey = (item: Item) => this.idPipe.transform(item.name);

  constructor(
    private dataService: DndDataService,
    private route: ActivatedRoute,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataService.getItems().pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.items = items;
      this.treasure = this.items.filter(f => (f.type ? f.type.includes('$') : false));
      this.normal = this.items.filter(f => (f.type ? !f.type.includes('$') && f.rarity.includes('none') : false));
      this.magic = this.items.filter(f => (f.type ? !f.type.includes('$') && !f.rarity.includes('none') : true));
      this.shownItems = this.items;
      this.selected = 'all';

      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const itemName = params.get('itemName');
        if (itemName) {
          this.currItem = this.items.find(f => this.idPipe.transform(f.name) === itemName);
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

  setCurrItem(clicked: Item): void {
    this.currItem = clicked;
    this.location.go('/items/' + this.idPipe.transform(this.currItem.name));
  }

  setItems(choice: string): void {
    if (choice !== this.selected) {
      switch (choice) {
        case 'magic':
          this.shownItems = this.magic;
          break;
        case 'normal':
          this.shownItems = this.normal;
          break;
        case 'treasure':
          this.shownItems = this.treasure;
          break;
        case 'all':
          this.shownItems = this.items;
          break;
      }
      this.selected = choice;
    }
  }

  formatValue(value?: number): string {
    if (!value) {
      return '';
    }
    if (value / 100 >= 1) {
      return `${Math.round(value / 100).toLocaleString('en-US')} gp`;
    }
    if (value / 10 >= 1) {
      return `${Math.round(value / 10).toLocaleString('en-US')} sp`;
    }
    return `${Math.round(value).toLocaleString('en-US')} cp`;
  }

  getRaritySort(rarity: string): number {
    switch (rarity) {
      case 'none':
        return 0;
      case 'common':
        return 1;
      case 'uncommon':
        return 2;
      case 'rare':
        return 3;
      case 'very rare':
        return 4;
      case 'legendary':
        return 5;
      case 'artifact':
        return 6;
      default:
        return 0;
    }
  }

  getItemType(item: Item): string {
    let returnType = '';

    if (item.wondrous && item.type) {
      returnType += 'Wondrous Item, ';
    } else if (item.wondrous) {
      return 'Wondrous Item';
    }

    switch (item.type) {
      case 'M': {
        if (item.weaponCategory && item.baseItem) {
          returnType += item.weaponCategory + ' Melee Weapon (' + item.baseItem + ')';
        } else if (item.weaponCategory) {
          returnType += item.weaponCategory + ' Melee Weapon';
        } else if (item.baseItem) {
          returnType += 'Melee Weapon(' + item.baseItem + ')';
        }
        break;
      }
      case 'R': {
        if (item.weaponCategory && item.baseItem) {
          returnType += item.weaponCategory + ' Ranged Weapon (' + item.baseItem + ')';
        } else if (item.weaponCategory) {
          returnType += item.weaponCategory + ' Ranged Weapon';
        } else if (item.baseItem) {
          returnType += 'Ranged Weapon(' + item.baseItem + ')';
        }
        break;
      }
      default: {
        returnType += typeTable[item.type] || '';
        break;
      }
    }
    return returnType;
  }
}
