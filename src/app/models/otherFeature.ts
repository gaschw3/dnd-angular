import { slugifyName } from '../pipes/id-to-name.pipe';

export interface OtherFeature {
  id: string;
  name: string;
  source: string;
  page: number;
  featureType: string[];
  entries: string[];
  prerequisite?: Prerequisite[];
  isClassFeatureVariant?: boolean;

  // Normalized display fields populated by normalizeOtherFeature()
  typeLabel: string;
  prereqSummary: string;
  prereqFull: string;
  levelPrereq: string;
}

export interface Prerequisite {
  spell?: string;
  pact?: string;
  ability?: any[];
  level?: Level;
  item?: string[];
  feature?: string[];
  patron?: string;
  otherSummary?: string;
}

interface Level {
  level: number;
  class?: Class;
  subclass?: Class;
}

export interface Class {
  name: string;
}

export const featureType: Record<string, string> = {
    //"AI": "Artificer Infusion",
    //"AS": "Arcane Shot",
    "EI": "Eldritch Invocation",
    "FS": "Fighting Style",
    "MM": "Metamagic",
    "MV": "Battlemaster Maneuver",
    "EX": "Tactical Exploit",
    "SP": "Scholarly Pursuit"
    //"RN": "Rune Knight Rune",
    //"DM": "Dragonmark"
}

export function normalizeOtherFeature(raw: any): OtherFeature {
  const firstType = raw.featureType?.[0];
  return {
    ...raw,
    id: raw.id || slugifyName(String(raw.name || '')),
    typeLabel: firstType ? featureType[firstType] || '' : '',
    prereqSummary: formatPrereq(raw.prerequisite, false),
    prereqFull: formatPrereq(raw.prerequisite, true),
    levelPrereq: extractLevelPrereq(raw.prerequisite)
  };
}

function formatPrereq(prereq: Prerequisite[] | undefined, includeLevelNumber: boolean): string {
  if (!prereq || prereq.length < 1) {
    return includeLevelNumber ? '' : '—';
  }
  const ret: string[] = [];
  const reqs = prereq[0];

  if (includeLevelNumber && reqs.level !== undefined) {
    const className = reqs.level.class?.name ?? '';
    if (reqs.level.subclass !== undefined) {
      ret.push(`Level ${reqs.level.level} ${reqs.level.subclass.name}${className ? ' ' + className : ''}`);
    } else if (className) {
      ret.push(`Level ${reqs.level.level} ${className}`);
    } else {
      ret.push(`Level ${reqs.level.level}`);
    }
  }

  if (reqs.pact !== undefined) {
    ret.push(`Pact of the ${reqs.pact}`);
  }
  if (reqs.spell !== undefined) {
    ret.push(reqs.spell);
  }
  if (reqs.item !== undefined) {
    ret.push(reqs.item[0]);
  }
  if (reqs.feature !== undefined) {
    ret.push(reqs.feature[0]);
  }
  if (reqs.ability !== undefined) {
    reqs.ability.forEach(obj => {
      const arr = Object.entries(obj);
      ret.push(`${arr[0][0].replace(/^[a-z]/, c => c.toUpperCase())} ${arr[0][1]}`);
    });
  }

  if (!includeLevelNumber && reqs.level !== undefined) {
    const className = reqs.level.class?.name ?? '';
    if (reqs.level.subclass !== undefined) {
      ret.push(reqs.level.subclass.name + (className ? ' ' + className : ''));
    } else if (className) {
      ret.push(className);
    }
  }

  return ret.join(', ') || (includeLevelNumber ? '' : '—');
}

function extractLevelPrereq(prereq?: Prerequisite[]): string {
  if (!prereq || prereq.length < 1) {
    return '—';
  }
  const reqs = prereq[0];
  if (reqs.level !== undefined && reqs.level.level !== undefined) {
    return String(reqs.level.level);
  }
  return '—';
}
