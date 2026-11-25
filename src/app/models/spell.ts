import { HelperService } from "../shared/helpers/helper.service";
import { buildSearchText, extractEntryText } from "../shared/helpers/format.utils";

export interface ISpell {
  name:       string;
  id:         string;
  source:     string;
  level:      string;
  school:     any;
  tableTime:  string;
  time:       string;
  range:      string;
  components: string;
  duration:   string;
  classes:    string[];
  subclasses: string[];
  entries:    string[];
  change?:    string;
  changeNote?: string;
  higher?:    any;
  ritual?:    string;
  roll?:      string[] | string;
  hasCaiusNotes: boolean;
  searchText: string;
}

export class Spell implements ISpell {
  name:       string;
  id:         string;
  source:     string;
  level:      string;
  school:     any;
  tableTime:  string;
  time:       string;
  range:      string;
  components: string;
  duration:   string;
  concentration: boolean;
  classes:    string[] = [];
  subclasses: string[] = [];
  entries:    string[];
  change?:    string;
  changeNote?: string;
  replaced?:  string;
  higher?:    any;
  ritual?:    string;
  roll?:      string[] | string;
  hasCaiusNotes: boolean;
  searchText: string;

  constructor (spellJson: any, spellSource: any) {
        this.name = spellJson.name;
        this.id = HelperService.createIdFromName(spellJson.name);
        this.source = spellJson.source;
        this.level = spellJson.level;
        this.replaced = spellJson.replaced;
        this.school = spellSchool[spellJson.school];
        const time = spellJson.time[0];

        this.time = `${time.number} ${time.unit == 'bonus' ? 'bonus action' : time.unit} ${time.condition ? ', ' + time.condition : ''}`;
        if (time.unit !== 'bonus' && time.unit !== 'action' && time.unit !== 'reaction') {
          this.tableTime = `${time.number} ${time.unit}`;
        } else {
          this.tableTime = `${time.unit}`;
        }
        

        if (spellJson.range.type === 'special') {
          this.range = 'Special';
        } else if (spellJson.range.distance.amount) {
          this.range = `${spellJson.range.distance.amount} ${spellJson.range.distance.type}`;
        } else {
          this.range = spellJson.range.distance.type.charAt(0).toUpperCase() + spellJson.range.distance.type.slice(1);
        }

        this.components = Object.keys(spellJson.components).join(', ').toUpperCase();
        if (spellJson.components.m) {
          this.components += ` (${spellJson.components.m.text ? spellJson.components.m.text : spellJson.components.m})`;
        }

        const duration = spellJson.duration[0];
        this.duration = '';
        this.concentration = false;
        if (duration.concentration) {
          this.duration += "Concentration, up to ";
          this.concentration = true;
        }
        if (duration.type == 'timed') {
          this.duration += `${duration.duration.amount} ${duration.duration.type}`;
          if (duration.duration.amount !== 1)
           this.duration += 's'; //pluralize unites when it's not 1 minutes/hour/day
        } else if (duration.type == 'permanent') {
          this.duration += `${duration.ends[0] == 'dispel' ? 'Until dispelled' : 'Permanent'}`;
          this.duration += `${duration.ends[1] == 'trigger' ? ' or triggered' : ''}`;
        } else {
          this.duration += duration.type;
        }
        if (duration.amount) {
          this.duration += `${duration.amount} `;
        }
        this.duration = this.duration.charAt(0).toUpperCase() + this.duration.slice(1);

        if (spellSource?.["class"]?.["XPHB"]) {
          const seen = new Set<string>();
          for (const rawName in spellSource["class"]["XPHB"]) {
            const trimmed = rawName.trim();
            const key = trimmed.toLowerCase();
            if (trimmed && !seen.has(key)) {
              seen.add(key);
              this.classes.push(trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
            }
          }
        }
        if (spellSource["subclass"] && spellSource["subclass"]["XPHB"]) {
          for (const className in spellSource["subclass"]["XPHB"]) {
            if (spellSource["subclass"]["XPHB"][className]["XPHB"]) {
              for (const subclassName in spellSource["subclass"]["XPHB"][className]["XPHB"]) {
                this.subclasses.push(`${className} (${subclassName})`);
              }
            }
          }
        }
        this.entries = spellJson.entries;
        this.change = spellJson.change;
        this.changeNote = spellJson.changeNote;
        this.higher = spellJson.entriesHigherLevel ? spellJson.entriesHigherLevel[0] : '';
        this.ritual = spellJson.meta?.ritual;
        this.hasCaiusNotes =
          Array.isArray(spellJson.entries) &&
          spellJson.entries.some(
            (e: any) =>
              typeof e === 'object' &&
              e !== null &&
              e.type === 'inset' &&
              typeof e.name === 'string' &&
              e.name.toLowerCase().includes('caius')
          );
        this.searchText = buildSpellSearchText(this);
    }
}

function buildSpellSearchText(spell: Spell): string {
  return buildSearchText([
    spell.name,
    spell.source || '',
    spell.school?.name || '',
    spell.school?.abbrev || '',
    spell.time || '',
    spell.tableTime || '',
    spell.range || '',
    spell.components || '',
    spell.duration || '',
    ...spell.classes,
    ...spell.subclasses,
    extractEntryText(spell.entries),
    extractEntryText(spell.higher)
  ]);
}

export const spellSchool: Record<string, { name: string; abbrev: string }> = {
    "A": {name: "Abjuration", abbrev: "Abj"},
    "T": {name: "Transmutation", abbrev: "Trans"},
    "I": {name: "Illusion", abbrev: "Ill"},
    "N": {name: "Necromancy", abbrev: "Necro"},
    "V": {name: "Evocation", abbrev: "Evo"},
    "C": {name: "Conjuration", abbrev: "Conj"},
    "E": {name: "Enchantment", abbrev: "Ench"},
    "D": {name: "Divination", abbrev: "Div"},
}