import { HelperService } from "../shared/helpers/helper.service";

export class Feat {
  name:          string;
  id:            string;
  source:        string;
  asi?:          string;
  text:          any[];
  prerequisite?: string;

  constructor(feat) {
    this.name = feat.name;
    this.id = HelperService.createIdFromName(feat.name);
    this.source = feat.source;
    this.text = feat.entries;

    if (feat.ability) {
      if (feat.ability[0].choose) {
        if (feat.ability[0].choose.from.length == 6) {
          if (feat.ability[0].choose.amount == 2)
            this.asi = `Any +1, Any +1`;
          else 
            this.asi = `Any +1`;
        } else {
          this.asi = `${feat.ability[0].choose.from.join(", ").replace(/, ([^,]*)$/, ' or $1')} +${feat.ability[0].choose.amount}`;
        }
      } else {
        this.asi = `${Object.keys(feat.ability[0])[0]} + ${Object.values(feat.ability[0])[0]}`;
      }
    }

    if (feat.prerequisite) {
      let jsonPrereq = feat.prerequisite[0];
      let prereqArr = [];
      if (jsonPrereq.level) {
        prereqArr.push(`${getOrdinal(jsonPrereq.level)} level`);
      }
      if (jsonPrereq.spellcasting == true) {
        prereqArr.push("Spellcasting or pact magic feature");
      }
      if (jsonPrereq.race) {
        let ancestryArr = [];
        for (let ancestry of jsonPrereq.race) {
          ancestryArr.push(ancestry.name);
        }
        //kind of yucky regex, but basically parse into a comma-seperated list in this format: 'x', 'x or y', 'x, y, or z', etc.
        prereqArr.push(ancestryArr.join(', ').replace(/, ([^,]*)$/, ' or $1'));
      }
      if (jsonPrereq.class) {
        let classArr = [];
        for (let clazz of jsonPrereq.class) {
          classArr.push(clazz.name);
        }
        //kind of yucky regex, but basically parse into a comma-seperated list in this format: 'x', 'x or y', 'x, y, or z', etc.
        prereqArr.push(classArr.join(', ').replace(/, ([^,]*)$/, ' or $1'));
      }
      if (jsonPrereq.ability) {
        let abilityArr = [];
        for (let ability of jsonPrereq.ability) {
          abilityArr.push(`${Object.keys(ability)[0].toUpperCase()} ${Object.values(ability)[0]}+`);
        }
        prereqArr.push(abilityArr.join(', ').replace(/, ([^,]*)$/, ' or $1'));
      }
      if (jsonPrereq.feat) {
        prereqArr.push(`{@feat ${capitalize(jsonPrereq.feat[0])}} feat`);
      }
      this.prerequisite = capitalize(prereqArr.join("; "));
    }
  }
}

const getOrdinal = (number) => {
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

const capitalize = (s) => {
    return s && s[0].toUpperCase() + s.slice(1);
}