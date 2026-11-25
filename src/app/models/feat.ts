import { HelperService } from "../shared/helpers/helper.service";
import { buildSearchText, extractEntryText, toPlainSearchText } from "../shared/helpers/format.utils";
import { ChangeType, normalizeChangeType } from "../shared/change-badge/change-badge.component";

const ABILITY_KEYS = new Set(['str', 'dex', 'con', 'int', 'wis', 'cha']);

export class Feat {
  name:          string;
  id:            string;
  source:        string;
  category:      string;
  asi?:          string;
  asiAbilities:  string[] = [];
  text:          any[];
  prerequisite?: string;
  change?:       ChangeType;
  changeNote?:   string;
  searchText:    string;

  constructor(feat: any) {
    this.name = feat.name;
    this.id = HelperService.createIdFromName(feat.name);
    this.category = feat.category ? feat.category : 'G';
    this.source = feat.source;
    this.text = feat.entries;
    this.change = normalizeChangeType(feat.change);
    this.changeNote = feat.changeNote;

    if (feat.ability) {
      if (feat.ability[0].choose) {
        const from: string[] = Array.isArray(feat.ability[0].choose.from)
          ? feat.ability[0].choose.from.map((a: string) => String(a).toLowerCase())
          : [];
        if (from.length == 6) {
          this.asiAbilities = ['any'];
          if (feat.ability[0].choose.amount == 2)
            this.asi = `Any +1, Any +1`;
          else 
            this.asi = `Any +1`;
        } else {
          this.asiAbilities = from.filter(a => ABILITY_KEYS.has(a));
          this.asi = `${feat.ability[0].choose.from.join("/").replace(/, ([^,]*)$/, ' or $1')} +${feat.ability[0].choose.amount ?? 1}`;
        }
      } else {
        const keys = Object.keys(feat.ability[0]).map(k => k.toLowerCase()).filter(k => ABILITY_KEYS.has(k));
        this.asiAbilities = keys;
        this.asi = `${Object.keys(feat.ability[0])[0]} +${Object.values(feat.ability[0])[0]}`;
      }
    }

    if (feat.prerequisite) {
      const jsonPrereq = feat.prerequisite[0];
      const prereqArr = [];
      if (jsonPrereq.level) {
        prereqArr.push(`${getOrdinal(jsonPrereq.level)} level`);
      }
      if (jsonPrereq.spellcasting == true) {
        prereqArr.push("Spellcasting or pact magic feature");
      }
      if (jsonPrereq.race) {
        const ancestryArr = [];
        for (const ancestry of jsonPrereq.race) {
          ancestryArr.push(ancestry.name);
        }
        //kind of yucky regex, but basically parse into a comma-seperated list in this format: 'x', 'x or y', 'x, y, or z', etc.
        prereqArr.push(ancestryArr.join(', ').replace(/, ([^,]*)$/, ' or $1'));
      }
      if (jsonPrereq.class) {
        const rawClasses = Array.isArray(jsonPrereq.class) ? jsonPrereq.class : [jsonPrereq.class];
        const classArr = rawClasses
          .map((clazz: any) => (typeof clazz === 'string' ? clazz.trim() : clazz?.name?.trim()))
          .filter((name: string | undefined): name is string => Boolean(name))
          .map((name: string) => `{@class ${capitalize(name)}}`);
        //kind of yucky regex, but basically parse into a comma-seperated list in this format: 'x', 'x or y', 'x, y, or z', etc.
        if (classArr.length > 0) {
          prereqArr.push(classArr.join(', ').replace(/, ([^,]*)$/, ' or $1'));
        }
      }
      if (jsonPrereq.ability) {
        const abilityArr = [];
        for (const ability of jsonPrereq.ability) {
          abilityArr.push(`${Object.keys(ability)[0].toUpperCase()} ${Object.values(ability)[0]}+`);
        }
        prereqArr.push(abilityArr.join(', ').replace(/, ([^,]*)$/, ' or $1'));
      }
      if (jsonPrereq.feat) {
        prereqArr.push(`{@feat ${capitalize(jsonPrereq.feat[0])}} feat`);
      }
      if (jsonPrereq.feature) {
        prereqArr.push(`${capitalize(jsonPrereq.feature[0])} feature`);
      }
      this.prerequisite = capitalize(prereqArr.join("; "));
    }

    this.searchText = buildSearchText([
      this.name,
      this.source || '',
      featCategory[this.category] || this.category,
      this.asi || '',
      toPlainSearchText(this.prerequisite || ''),
      toPlainSearchText(this.changeNote || ''),
      extractEntryText(this.text)
    ]);
  }
}

const getOrdinal = (number: number): string => {
  if (number > 3 && number < 21) return `${number}th`;
  switch (number % 10) {
    case 1:
      return `${number}st`;
    case 2:
      return `${number}nd`;
    case 3:
      return `${number}rd`;
    default:
      return `${number}th`;
  }
};

const capitalize = (s: string): string => {
    return s && s[0].toUpperCase() + s.slice(1);
}

export const featCategory: Record<string, string> = {
  "O": "Origin",
  "G": "General",
  "FS": "Fighting Style",
  "EB": "Epic Boon"
}