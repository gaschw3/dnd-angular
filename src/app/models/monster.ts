import { Trait } from "./trait";

export class Monster {
  name: string;
  id: string;
  size: string;
  type: string;
  other: string;
  alignment: string;
  ac: string[]|AC;
  hp: HP;
  speed: string[];
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
  reaction: Action[];
  legendary: Action[];
  source: string;
  hasToken: boolean;
}

export class Action {
  name: string;
  entries: string[];
  attack: string[];
}

export class HP {
  average: string;
  formula: string[];
  special: string; //specific hack to work with TCE summons
}

export class AC {
  ac: string;
  from: string[];
}

export class Spellcasting {
  name: string;
  headerEntries: string[];
  footerEntries: string[];
  spells: Spells;
  will: string[];
  daily: Daily;
  from: string[];
}

export class Spells {
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

export class Daily {
  once: string[];
  twice: string[];
  thrice: string[];
}

export class sLevel {
  spells: string[];
  slots: string;
}