import { Spell } from './spell';
import { commonFeatures } from './consts'

export interface IClass {
  canripProgression?: number[];
  casterProgression?: string;
  classFeatureList:   any[];
  levelTable:         string[][];
  classTableGroups:   any[];
  fluff:              any[];
  hd:                 string; // {face: 8, number: 1}
  multiclassing:      newMulticlass;
  name:               string;
  saves:              string; // ['wis', 'cha']
  source:             string;
  spellcastingAbility?:     string;
  startingEquipment:  string[];
  startingGold:       string;
  startingProficiencies?:   any;
  subclassTitle:      string;

  classFeature:       ClassFeature[]
  subclass:           Subclass[]
  subclassFeature:    ClassFeature[];
}

export class ClassFeature {
  className: string;
	classSource: string;
	entries: any[]
	level: number;
	name: string;
  id: string;
	source: string;

  subclassShortName: string;
  subclassSource: string;
  header: number;

  constructor (feat) {
    this.className = feat.className;
    this.classSource = feat.classSource;
    this.entries = feat.entries;
    this.level = feat.level;
    this.name = feat.name;
    this.id = this.name.toLowerCase().replace(/['\/]/g,'').replace(/\W/g, '-');
    this.source = feat.source; 

    this.subclassShortName = feat.subclassShortName ? feat.subclassShortName : '';
    this.subclassSource = feat.subclassSource ? feat.subclassSource : '';
    this.header = feat.header ? feat.header : 0;
  }
}

export interface Subclass {
	additionalSpells: Spell[];
	className: string;
	classSource: string;
	name: string;
	shortName: string;
	subclassFeature: ClassFeature[];
  source: string;
}

export class newMulticlass {
  requirements: string;
  proficiencies: Proficiencies;

  constructor (mc) {
    let reqArr = []
    for (const [key, value] of Object.entries(mc.requirements)) {
      reqArr.push(`${key.toUpperCase()} ${value}`);
    }
    this.requirements = reqArr.join(", ");
    if (mc.proficienciesGained) {
      this.proficiencies = new Proficiencies(mc.proficienciesGained, '');
    } else {//some multiclasses provide no extra proficiencies
      this.proficiencies = new Proficiencies({}, '');
    }
  }
}

export class Proficiencies {
  armor?: string;
  skills?: string;
  weapons?: string;
  tools?: string;

  constructor (prof, fallback) {
    this.armor = prof.armor ? (prof.armor).join(", ") : fallback;
    if (prof.skills && prof.skills[0].any) {
      this.skills = `Choose any ${prof.skills[0].any.count}`
    } else {
      this.skills = prof.skills ? `Choose ${prof.skills[0].choose.count} from ${(prof.skills[0].choose.from).join(", ")}` : fallback;
    }
    this.weapons = prof.weapons ? (prof.weapons).join(", ") : fallback;
    this.tools = prof.tools ? (prof.tools).join(", ") : fallback;
  }
}

export class newClass implements IClass{
  canripProgression?: number[];
  casterProgression?: string;
  classFeatureList:   ClassFeature[];
  levelTable:         string[][];
  classTableGroups:   any[];
  fluff:              any;
  hd:                 string; // {face: 8, number: 1}
  multiclassing:      newMulticlass;
  name:               string;
  id:                 string;
  preparedSpells:     string; // "<$level$> + <$wis_mod$>"
  saves:              string; // ['wis', 'cha']
  source:             string;
  spellcastingAbility?:   string;
  startingEquipment:  any;
  startingGold:       string;
  startingProficiencies:  Proficiencies;
  subclassTitle:      string;

  classFeature: ClassFeature[] = [];
  subclass: Subclass[];
  subclassFeature: ClassFeature[] = [];

  constructor (classJson) {
    var currClass = classJson.class[0];
    this.name = currClass.name;
    this.id = currClass.name.toLowerCase().replace(/['\/]/g,'').replace(/\W/g, '-');
    this.canripProgression = currClass.cantripProgression;
    this.casterProgression = currClass.casterProgression;
    this.classFeatureList = currClass.classFeatures;
    this.fluff = currClass.fluff[0];
    this.hd = `${currClass.hd?.number}d${currClass.hd?.faces}`;

    this.multiclassing = new newMulticlass(currClass.multiclassing);
    this.saves = currClass.proficiency.join(", ").toUpperCase(); // ['wis', 'cha']
    this.source = currClass.source;
    this.spellcastingAbility = currClass.spellcastingAbility;
    this.startingEquipment = currClass.startingEquipment.default;
    this.startingGold = currClass.startingEquipment.goldAlternative;
    this.startingProficiencies = new Proficiencies(currClass.startingProficiencies, 'none');
    this.subclassTitle = currClass.subclassTitle;

    classJson.classFeature.forEach(inFeat => this.classFeature.push(new ClassFeature(inFeat)));
    this.subclass = classJson.subclass;
    classJson.subclassFeature.forEach(inFeat => this.subclassFeature.push(new ClassFeature(inFeat)));

    //create levelTable[][] from JOSN.classTableGroups
    this.levelTable = new Array<Array<string>>();
    //all classes start with the same 3 columns
    this.levelTable = JSON.parse(JSON.stringify(commonFeatures)); //this is some goofy javascript witchcraft, 2D arrays get shallow copied in 95% of the normal scenarios I would use, this makes a deep copy to reset it for each new class.
    this.classTableGroups = currClass.classTableGroups;
    for (let i = 0; i < this.classTableGroups.length; i++) {
      this.levelTable[0] = this.levelTable[0].concat(this.classTableGroups[i].colLabels)
      for (let j = 0; j < this.classTableGroups[i].rows.length; j++) {
        this.levelTable[j+1] = this.levelTable[j+1].concat(this.classTableGroups[i].rows[j]);
      }
    }
  }
}