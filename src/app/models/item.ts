import { IdToNamePipe } from '../pipes/id-to-name.pipe';
import { typeTable } from '../shared/itemTypes';

const idPipe = new IdToNamePipe();

export type ItemCategory = 'magic' | 'weapons' | 'armor' | 'normal' | 'treasure';

export interface Item {
  name: string;
  id: string;
  type: string;
  entries: any;
  source: string;
  value: number;
  weight: number;
  reqAttune: string;
  dmg1: string;
  dmgType: string;
  dmg2: string;
  ac: string;
  rarity: string;
  wondrous?: boolean;
  weaponCategory?: string;
  baseItem?: string;
  property?: string[];
  range?: string;

  // Normalized display fields populated by normalizeItem()
  plainName: string;
  hasHtmlName: boolean;
  category: ItemCategory;
  typeLabel: string;
  subtitleText: string;
  damageText: string;
  valueAmount: number;
  valueUnit: 'gp' | 'sp' | 'cp' | '';
  valueFormatted: string;
  raritySort: number;
}

const ARMOR_TYPES = new Set(['LA', 'MA', 'HA', 'S']);
const WEAPON_TYPES = new Set(['M', 'R']);

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

export function normalizeItem(raw: any): Item {
  const plainName = String(raw.name || '').replace(/<[^>]+>/g, '').trim();
  const rarity = String(raw.rarity || 'none').toLowerCase().trim() || 'none';
  const typeLabel = formatItemType(raw);
  const rarityLabel = formatItemRarity(rarity, raw.reqAttune);
  const { valueAmount, valueUnit, valueFormatted } = formatItemValue(raw.value);

  return {
    ...raw,
    id: raw.id || idPipe.transform(String(raw.name || '')),
    plainName,
    hasHtmlName: String(raw.name || '').includes('<'),
    rarity,
    category: classifyItemCategory(raw.type, rarity),
    typeLabel,
    subtitleText: [typeLabel, rarityLabel].filter(Boolean).join(', '),
    damageText: formatItemDamage(raw),
    valueAmount,
    valueUnit,
    valueFormatted,
    raritySort: getRaritySort(rarity)
  };
}

function classifyItemCategory(type: string | undefined, rarity: string): ItemCategory {
  const isTreasure = type ? type.includes('$') : false;
  if (isTreasure) {
    return 'treasure';
  }
  const isNoneRarity = !rarity || rarity.includes('none');
  if (!isNoneRarity) {
    return 'magic';
  }
  if (type && WEAPON_TYPES.has(type)) {
    return 'weapons';
  }
  if (type && ARMOR_TYPES.has(type)) {
    return 'armor';
  }
  return 'normal';
}

function formatItemType(item: any): string {
  let info = '';
  if (item.wondrous && item.type) {
    info += 'Wondrous item, ';
  } else if (item.wondrous) {
    return 'Wondrous item';
  }

  switch (item.type) {
    case 'M': {
      if (item.weaponCategory && item.baseItem) {
        info += `${item.weaponCategory} melee weapon (${item.baseItem})`;
      } else if (item.weaponCategory) {
        info += `${item.weaponCategory} melee weapon`;
      } else if (item.baseItem) {
        info += `melee weapon (${item.baseItem})`;
      }
      break;
    }
    case 'R': {
      if (item.weaponCategory && item.baseItem) {
        info += `${item.weaponCategory} ranged weapon (${item.baseItem})`;
      } else if (item.weaponCategory) {
        info += `${item.weaponCategory} ranged weapon`;
      } else if (item.baseItem) {
        info += `ranged weapon (${item.baseItem})`;
      }
      break;
    }
    case 'HA':
    case 'MA':
    case 'LA': {
      info += item.baseItem ? `${typeTable[item.type]} (${item.baseItem})` : typeTable[item.type];
      break;
    }
    default: {
      info += typeTable[item.type] || '';
      break;
    }
  }

  return info ? info.charAt(0).toUpperCase() + info.slice(1) : '';
}

function formatItemRarity(rarity: string, reqAttune: any): string {
  let text = rarity && rarity !== 'none' ? rarity : '';
  if (reqAttune) {
    if (reqAttune === true || reqAttune === 'true') {
      text += ' (requires attunement)';
    } else {
      text += ` (requires attunement ${reqAttune})`;
    }
  }
  return text.trim();
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

function formatItemValue(value?: number): {
  valueAmount: number;
  valueUnit: 'gp' | 'sp' | 'cp' | '';
  valueFormatted: string;
} {
  if (!value) {
    return { valueAmount: 0, valueUnit: '', valueFormatted: '' };
  }
  if (value / 100 >= 1) {
    const amt = value / 100;
    return { valueAmount: amt, valueUnit: 'gp', valueFormatted: `${Math.round(amt).toLocaleString('en-US')} gp` };
  }
  if (value / 10 >= 1) {
    const amt = value / 10;
    return { valueAmount: amt, valueUnit: 'sp', valueFormatted: `${Math.round(amt).toLocaleString('en-US')} sp` };
  }
  return { valueAmount: value, valueUnit: 'cp', valueFormatted: `${Math.round(value).toLocaleString('en-US')} cp` };
}

function getRaritySort(rarity: string): number {
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
