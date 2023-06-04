export interface ISpell {
  name:       string;
  id:         string;
  source:     string;
  level:      string;
  school:     string;
  time:       string;
  range:      string;
  components: string;
  duration:   string;
  classes:    string[];
  entries:    string[];
  change?:    string;
  higher?:    any;
  ritual?:    string;
  roll?:      string[] | string;
}

export class Spell implements ISpell {
  name:       string;
  id:         string;
  source:     string;
  level:      string;
  school:     string;
  time:       string;
  range:      string;
  components: string;
  duration:   string;
  classes:    string[] = [];
  entries:    string[];
  change?:    string;
  higher?:    any;
  ritual?:    string;
  roll?:      string[] | string;

  constructor (spellJson) {
        this.name = spellJson.name;
        this.id = spellJson.name.toLowerCase().replace(/['\/]/g,'').replace(/\W/g, '-');
        this.source = spellJson.source;
        this.level = spellJson.level;
        this.school = spellSchool[spellJson.school];
        let time = spellJson.time[0];

        this.time = `${time.number} ${time.unit == 'bonus' ? 'bonus action' : time.unit} ${time.condition ? ', ' + time.condition : ''}`;

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

        let duration = spellJson.duration[0];
        this.duration = '';
        if (duration.concentration) {
          this.duration += "Concentration, up to ";
        }
        if (duration.type == 'timed') {
          this.duration += `${duration.duration.amount} ${duration.duration.type}`;
          if (duration.duration.amount !== 1)
           this.duration += 's'; //pluralize unites when it's not 1 minutes/hour/day
        } else if (duration.type == 'permanent') {
          this.duration += `${duration.ends[0] == 'dispelled' ? 'Until dispelled' : 'Permanent'}`;
          this.duration += `${duration.ends[1] == 'trigger' ? ' or triggered' : ''}`;
        } else {
          this.duration += duration.type;
        }
        if (duration.amount) {
          this.duration += `${duration.amount} `;
        }
        this.duration = this.duration.charAt(0).toUpperCase() + this.duration.slice(1);

        if (spellJson.classes.fromClassList) {
          spellJson.classes.fromClassList.map((item) => {
            if (!(item.source.includes('UA')) && !(item.source === 'PSA')) {
              this.classes.push(item.name);
            }
          }).filter(n => n); // filter n=>n to remove null/undefined/empties
        }
        if (spellJson.classes.fromClassListVariant) {
          spellJson.classes.fromClassListVariant.map((item) => {
            if (!(item.source.includes('UA')) && !(item.source === 'PSA')) {
              this.classes.push(item.name);
            }
          }).filter(n => n); // filter n=>n to remove null/undefined/empties
        }
        if (spellJson.classes.fromSubclass) {
          spellJson.classes.fromSubclass.map((item) => {
            if (!(item.subclass.source.includes('UA')) && !(item.subclass.source == 'PSA')
              && !(item.class.source.includes('UA'))) {
              this.classes.push(`${item.class.name} (${item.subclass.name})`);
            }
          });
        }
        this.classes = [...new Set(this.classes)]; //remove potential dupes from classes/variantClasses
        this.entries = spellJson.entries;
        this.change = spellJson.change;
        this.higher = spellJson.entriesHigherLevel ? spellJson.entriesHigherLevel[0] : '';
        this.ritual = spellJson.meta?.ritual;
    }
}

export const spellSchool = {
    "A": "Abjuration",
    "C": "Conjuration",
    "D": "Divination",
    "E": "Enchantment",
    "V": "Evocation",
    "I": "Illusion",
    "N": "Necromancy",
    "T": "Transmutation"
}