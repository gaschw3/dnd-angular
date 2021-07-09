import { Trait } from "./trait";

export interface Monster {
  name: string;
  id: string;
  size: string;
  type: string;
  other: string;
  alignment: string;
  ac: (any|AC)[];
  hp: HP;
  speed: (any|ConditionalSpeed)[];
  save: string[];
  str: string;
  dex: string;
  con: string;
  int: string;
  wis: string;
  cha: string;
  skill: string[];
  languages: string[];
  immune: string[];
  resist: string[];
  vulnerable: string[];
  cr: string;
  trait: Trait[];
  spellcasting: Spellcasting[];
  action: Action[];
  bonus?: Action[];
  reaction: Action[];
  legendary: Action[];
  source: string;
  hasToken: boolean;
}

interface Action {
  name: string;
  entries: string[];
  attack: string[];
}

interface HP {
  average: string;
  formula: string[];
  special: string; //specific hack to work with TCE summons
}

interface AC {
  ac?:        number;
  from?:      string[];
  condition?: string;
  braces?:    boolean;
  special?:   string;
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

interface ConditionalSpeed {
    number:    number;
    condition: string;
}