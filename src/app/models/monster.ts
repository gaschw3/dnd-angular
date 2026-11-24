import { HelperService } from '../shared/helpers/helper.service';
import { buildSearchText, extractEntryText } from '../shared/helpers/format.utils';
import { Trait } from './trait';

export interface Monster {
  name: string;
  id: string;
  size: string;
  type: any;
  baseType: string;
  other: string;
  alignment: any;
  ac: (any | AC)[];
  hp: HP;
  speed: any;
  save: any;
  str: string;
  dex: string;
  con: string;
  int: string;
  wis: string;
  cha: string;
  skill: any;
  languages: string[];
  immune: any[];
  resist: any[];
  vulnerable: any[];
  cr: string;
  trait: Trait[];
  spellcasting: Spellcasting[];
  action: Action[];
  bonus?: Action[];
  reaction: Action[];
  legendary: Action[];
  source: string;
  hasToken: boolean;
  token: any;

  // Normalized display fields populated by normalizeMonster()
  hpText: string;
  acText: string;
  speedText: string;
  savesText: string;
  skillsText: string;
  resistText: string;
  immuneText: string;
  vulnerableText: string;
  isLegendary: boolean;
  isSpellcaster: boolean;
  searchText: string;
}

interface Action {
  name: string;
  entries: string[];
  attack: string[];
}

interface HP {
  average: string;
  formula: string[];
  special: string; // specific hack to work with TCE summons
}

interface AC {
  ac?: number;
  from?: string[];
  condition?: string;
  braces?: boolean;
  special?: string;
}

interface Spellcasting {
  name: string;
  headerEntries: string[];
  footerEntries: string[];
  spells: Spells;
  will: string[];
  daily: Daily;
  from: string[];
}

interface Spells {
  cantrip: sLevel;
  first: sLevel;
  second: sLevel;
  third: sLevel;
  fourth: sLevel;
  fifth: sLevel;
  sixth: sLevel;
  seventh: sLevel;
  eighth: sLevel;
  ninth: sLevel;
}

interface Daily {
  once: string[];
  twice: string[];
  thrice: string[];
}

interface sLevel {
  spells: string[];
  slots: string;
}

export function normalizeMonster(raw: any): Monster {
  const size = Array.isArray(raw.size) ? raw.size.join(',') : String(raw.size || 'M');
  const baseType = extractMonsterBaseType(raw.type);
  const hpText = formatMonsterHp(raw.hp);
  const acText = formatMonsterAc(raw.ac);
  const speedText = formatMonsterSpeed(raw.speed);
  const savesText = formatKeyValueMap(raw.save);
  const skillsText = formatKeyValueMap(raw.skill);
  const resistText = formatMonsterDamageList(raw.resist);
  const immuneText = formatMonsterDamageList(raw.immune);
  const vulnerableText = formatMonsterDamageList(raw.vulnerable);
  const typeTags = Array.isArray(raw.type?.tags)
    ? raw.type.tags.join(' ')
    : Array.isArray(raw.type?.type?.choose)
      ? raw.type.type.choose.join(' ')
      : '';

  return {
    ...raw,
    id: raw.id || HelperService.createIdFromName(raw.name),
    size,
    baseType,
    hpText,
    acText,
    speedText,
    savesText,
    skillsText,
    resistText,
    immuneText,
    vulnerableText,
    isLegendary: Array.isArray(raw.legendary) && raw.legendary.length > 0,
    isSpellcaster: Array.isArray(raw.spellcasting) && raw.spellcasting.length > 0,
    searchText: buildSearchText([
      raw.name || '',
      raw.source || '',
      raw.cr ? `cr ${raw.cr}` : '',
      baseType,
      typeTags,
      raw.other || '',
      acText,
      hpText,
      speedText,
      savesText,
      skillsText,
      resistText,
      immuneText,
      vulnerableText,
      Array.isArray(raw.languages) ? raw.languages.join(' ') : '',
      Array.isArray(raw.senses) ? raw.senses.join(' ') : '',
      Array.isArray(raw.conditionImmune) ? raw.conditionImmune.join(' ') : '',
      extractEntryText(raw.trait),
      extractEntryText(raw.spellcasting),
      extractEntryText(raw.action),
      extractEntryText(raw.bonus),
      extractEntryText(raw.reaction),
      extractEntryText(raw.legendary)
    ])
  };
}

function extractMonsterBaseType(type: any): string {
  if (!type) {
    return '';
  }
  if (typeof type === 'string') {
    return type.toLowerCase();
  }
  if (typeof type.type === 'string') {
    return type.type.toLowerCase();
  }
  return '';
}

function formatMonsterHp(hp: any): string {
  if (!hp) {
    return '';
  }
  if (hp.average) {
    return hp.formula ? `${hp.average} (${hp.formula})` : String(hp.average);
  }
  return hp.special || '';
}

function formatMonsterAc(acList: any): string {
  if (!Array.isArray(acList) || acList.length === 0) {
    return '';
  }
  return acList
    .map(entry => {
      if (typeof entry === 'object' && entry !== null) {
        // special case for spell summons from TCE, working this in as a backwards compatible patch because of how the source JSON did it
        if (entry.special) {
          return entry.special;
        }
        const details = [
          Array.isArray(entry.from) ? entry.from.join(', ') : entry.from,
          entry.condition
        ]
          .filter(Boolean)
          .join(' ');
        return details ? `${entry.ac} (${details})` : String(entry.ac ?? '');
      }
      return String(entry);
    })
    .filter(Boolean)
    .join(', ');
}

function formatMonsterSpeed(speed: any): string {
  if (!speed || typeof speed !== 'object') {
    return '';
  }
  return Object.entries(speed)
    .map(([key, val]: [string, any]) => {
      if (typeof val === 'object' && val !== null) {
        return `${key} ${val.number} ft.${val.condition ? ' ' + val.condition : ''}`;
      }
      return `${key} ${val} ft.`;
    })
    .join(', ');
}

function formatKeyValueMap(map: any): string {
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    return '';
  }
  return Object.entries(map)
    .map(([k, v]) => `${capitalizeWords(k)} ${v}`)
    .join(', ');
}

function formatMonsterDamageList(list?: any[]): string {
  if (!Array.isArray(list) || list.length === 0) {
    return '';
  }
  return list
    .map(entry => {
      if (typeof entry === 'string') {
        return entry;
      }
      if (entry && typeof entry === 'object') {
        const vals = Array.isArray(entry.resist)
          ? entry.resist.join(', ')
          : Array.isArray(entry.immune)
            ? entry.immune.join(', ')
            : '';
        return entry.note ? `${vals} ${entry.note}`.trim() : vals;
      }
      return '';
    })
    .filter(Boolean)
    .join('; ');
}

function capitalizeWords(text: string): string {
  return text.replace(/\b[a-z]/g, ch => ch.toUpperCase());
}
