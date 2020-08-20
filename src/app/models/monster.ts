import { Trait } from "./trait";

export class Monster {
  name: string;
  size: string;
  type: string;
  other: string;
  alignment: string;
  ac: string;
  hp: string;
  speed: string;
  save: string;
  str: string;
  dex: string;
  con: string;
  int: string;
  wis: string;
  cha: string;
  skill: string[];
  languages: string;
  immune: string;
  resist: string;
  vulnerable: string;
  cr: string;
  traits: Trait[];
  action: Action[];
  reaction: Action[];
  legendary: Action[];
  source: string;

  get id(): string {
    return this.name.toLowerCase().replace("\W","-");
  }
}

export class Action {
  name: string;
  text: string[];
  attack: string[];
}