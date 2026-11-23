import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Item } from 'src/app/models/item';
import { typeTable } from '../../../shared/itemTypes';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';

const DAMAGE_TYPE: Record<string, string> = {
  B: 'bludgeoning',
  P: 'piercing',
  S: 'slashing',
  Y: 'psychic'
};

const ITEM_PROPS: Record<string, string> = {
  A: 'ammunition',
  F: 'finesse',
  '2H': 'two-handed',
  L: 'light',
  H: 'heavy',
  R: 'reach',
  S: 'special',
  LD: 'loading',
  V: 'versatile'
};

@Component({
  imports: [DecimalPipe, DetailHeaderComponent, EntryRendererComponent],
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent {
  readonly item = input.required<Item>();

  readonly plainTitle = computed(() => this.item().name.replace(/<[^>]+>/g, '').trim());
  readonly hasHtmlTitle = computed(() => this.item().name.includes('<'));

  readonly rarityClass = computed(() => {
    const r = (this.item().rarity || '').toLowerCase().trim();
    if (!r || r === 'none') {
      return '';
    }
    return `item-rarity-accent-${r.replace(/\s+/g, '-')}`;
  });

  readonly subtitleText = computed(() => {
    const it = this.item();
    return [formatItemType(it), formatItemRarity(it)].filter(Boolean).join(', ');
  });

  readonly valueAmount = computed(() => {
    const v = this.item().value;
    if (!v) {
      return 0;
    }
    if (v / 100 >= 1) {
      return v / 100;
    }
    if (v / 10 >= 1) {
      return v / 10;
    }
    return v;
  });

  readonly valueUnit = computed<'gp' | 'sp' | 'cp'>(() => {
    const v = this.item().value;
    if (v / 100 >= 1) {
      return 'gp';
    }
    if (v / 10 >= 1) {
      return 'sp';
    }
    return 'cp';
  });

  readonly damageText = computed(() => formatItemDamage(this.item()));
}

function formatItemDamage(item: any): string {
  if (!item.dmg1) {
    return '';
  }
  let dmgString = `${item.dmg1} ${DAMAGE_TYPE[item.dmgType] || item.dmgType || ''}`.trim();
  if (Array.isArray(item.property) && item.property.length) {
    const properties: string[] = item.property
      .map((element: string) => {
        switch (element) {
          case 'A':
            return `ammunition (${item.range})`;
          case 'T':
            return `thrown (${item.range})`;
          case 'V':
            return `versatile (${item.dmg2})`;
          default:
            return ITEM_PROPS[element] || '';
        }
      })
      .filter(Boolean);
    if (properties.length) {
      dmgString += ` — ${properties.join(', ')}`;
    }
  }
  return dmgString;
}

function formatItemType(item: Item): string {
  let itemInfo = '';

  if (item.wondrous && item.type) {
    itemInfo += 'Wondrous item, ';
  } else if (item.wondrous) {
    return 'Wondrous item';
  }

  switch (item.type) {
    case 'M': {
      if (item.weaponCategory && item.baseItem) {
        itemInfo += `${item.weaponCategory} melee weapon (${item.baseItem})`;
      } else if (item.weaponCategory) {
        itemInfo += `${item.weaponCategory} melee weapon`;
      } else if (item.baseItem) {
        itemInfo += `melee weapon (${item.baseItem})`;
      }
      break;
    }
    case 'R': {
      if (item.weaponCategory && item.baseItem) {
        itemInfo += `${item.weaponCategory} ranged weapon (${item.baseItem})`;
      } else if (item.weaponCategory) {
        itemInfo += `${item.weaponCategory} ranged weapon`;
      } else if (item.baseItem) {
        itemInfo += `ranged weapon (${item.baseItem})`;
      }
      break;
    }
    case 'HA':
    case 'MA':
    case 'LA': {
      itemInfo += item.baseItem ? `${typeTable[item.type]} (${item.baseItem})` : typeTable[item.type];
      break;
    }
    default: {
      itemInfo += typeTable[item.type] || '';
      break;
    }
  }

  return itemInfo ? itemInfo.charAt(0).toUpperCase() + itemInfo.slice(1) : '';
}

function formatItemRarity(item: Item): string {
  let itemRarity = '';
  const rarity = (item.rarity || '').toLowerCase();
  if (rarity && rarity !== 'none') {
    itemRarity += rarity;
  }
  if (item.reqAttune) {
    if ((item.reqAttune as unknown) === true || item.reqAttune === 'true') {
      itemRarity += ' (requires attunement)';
    } else {
      itemRarity += ` (requires attunement ${item.reqAttune})`;
    }
  }
  return itemRarity.trim();
}
