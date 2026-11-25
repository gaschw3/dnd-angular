import { Spell } from './spell';
import { commonFeatures } from './consts';
import { HelperService } from '../shared/helpers/helper.service';
import { toPlainSearchText } from '../shared/helpers/format.utils';
import { ChangeType, normalizeChangeType } from '../shared/change-badge/change-badge.component';

export interface SubclassTableColumn {
  subclassKey: string;
  label: string;
  tooltip?: string;
  rows: string[];
}

export interface IDndClass {
  cantripProgression?: number[];
  casterProgression?: string;
  classFeatureList: any[];
  levelTable: string[][];
  classTableGroups: any[];
  fluff: any[];
  hd: string; // {face: 8, number: 1}
  multiclassing: ClassMulticlass;
  name: string;
  saves: string; // ['wis', 'cha']
  source: string;
  spellcastingAbility?: string;
  startingEquipment: string[];
  startingGold: string;
  startingProficiencies?: any;
  subclassTitle: string;

  classFeature: ClassFeature[];
  subclass: Subclass[];
  subclassFeature: ClassFeature[];
}

export class ClassFeature {
  className: string;
  classSource: string;
  entries: any[];
  level: number;
  name: string;
  id: string;
  source: string;

  subclassShortName: string;
  subclassSource: string;
  header: number;
  cost: string;
  change?: ChangeType;
  changeNote?: string;

  constructor(feat: any) {
    this.className = feat.className;
    this.classSource = feat.classSource;
    this.entries = feat.entries;
    this.level = feat.level;
    this.name = feat.name;
    this.id = HelperService.createIdFromName(this.name);
    this.source = feat.source;

    this.subclassShortName = feat.subclassShortName ? feat.subclassShortName : '';
    this.subclassSource = feat.subclassSource ? feat.subclassSource : '';
    this.header = feat.header ? feat.header : 0;
    this.cost = feat.cost ? feat.cost : '';
    this.change = normalizeChangeType(feat.change);
    this.changeNote = feat.changeNote;
  }
}

export interface Subclass {
  additionalSpells: Spell[];
  className: string;
  classSource: string;
  edition?: '2024' | '2014';
  name: string;
  shortName: string;
  subclassFeature: ClassFeature[];
  subclassTableGroups: any[];
  source: string;
}

export class ClassMulticlass {
  requirements: string;
  proficiencies: Proficiencies;

  constructor(mc: any) {
    const reqArr = [];
    if (mc.requirements) {
      for (const [key, value] of Object.entries(mc.requirements)) {
        reqArr.push(`${key.toUpperCase()} ${value}`);
      }
      this.requirements = reqArr.join(', ');
    } else {
      this.requirements =
        'To qualify for a new class, you must have a score of at least 13 in the primary ability of the new class and your current classes.';
    }
    if (mc.proficienciesGained) {
      this.proficiencies = new Proficiencies(mc.proficienciesGained, '');
    } else {
      //some multiclasses provide no extra proficiencies
      this.proficiencies = new Proficiencies({}, '');
    }
  }
}

export class Proficiencies {
  armor?: string;
  skills?: string;
  weapons?: string;
  tools?: string;

  constructor(prof: any, fallback: string) {
    this.armor = prof.armor ? prof.armor.join(', ') : fallback;
    if (prof.skills && prof.skills[0].any) {
      this.skills = `Choose any ${prof.skills[0].any.count}`;
    } else {
      this.skills = prof.skills
        ? `Choose ${prof.skills[0].choose.count} from ${prof.skills[0].choose.from.join(', ')}`
        : fallback;
    }
    this.weapons = prof.weapons ? prof.weapons.join(', ') : fallback;
    this.tools = prof.tools ? prof.tools.join(', ') : fallback;
  }
}

export class DndClass implements IDndClass {
  cantripProgression?: number[];
  casterProgression?: string;
  classFeatureList: ClassFeature[];
  levelTable: string[][];
  subclassTableColumns: SubclassTableColumn[];
  classTableGroups: any[];
  subclassTableGroups: any[];
  fluff: any;
  hd: string; // {face: 8, number: 1}
  hdNumber: number;
  hdFaces: number;
  hpAtFirstLevel: string;
  hpAtHigherLevels: string;
  multiclassing: ClassMulticlass;
  name: string;
  id: string;
  preparedSpells: string; // "<$level$> + <$wis_mod$>"
  primaryAbility: string;
  saves: string; // ['wis', 'cha']
  source: string;
  spellcastingAbility?: string;
  startingEquipment: string[];
  startingEquipmentEntries: string[];
  startingGold: string;
  startingProficiencies: Proficiencies;
  subclassTitle: string;

  classFeature: ClassFeature[] = [];
  subclass: Subclass[];
  subclassFeature: ClassFeature[] = [];

  constructor(classJson: any) {
    const currClass = classJson.class[0];
    this.name = currClass.name;
    this.id = HelperService.createIdFromName(currClass.name);
    this.cantripProgression = currClass.cantripProgression;
    this.casterProgression = currClass.casterProgression;
    this.classFeatureList = currClass.classFeatures;
    this.fluff = currClass.fluff?.[0];
    this.hdNumber = currClass.hd?.number ?? 1;
    this.hdFaces = currClass.hd?.faces ?? 8;
    this.hd = `${this.hdNumber}d${this.hdFaces}`;
    const maxHp = this.hdNumber * this.hdFaces;
    const avgHp = this.hdNumber * (Math.floor(this.hdFaces / 2) + 1);
    this.hpAtFirstLevel = `${maxHp} + CON`;
    this.hpAtHigherLevels = `${this.hd} (or ${avgHp}) + CON`;
    this.primaryAbility = formatPrimaryAbility(currClass.primaryAbility);

    this.multiclassing = new ClassMulticlass(currClass.multiclassing || {});
    this.saves = (currClass.proficiency || []).join(', ').toUpperCase(); // ['wis', 'cha']
    this.source = currClass.source;
    this.spellcastingAbility = currClass.spellcastingAbility;
    this.startingEquipment = currClass.startingEquipment?.default || [];
    this.startingEquipmentEntries = currClass.startingEquipment?.entries || [];
    this.startingGold = currClass.startingEquipment?.goldAlternative || '';
    this.startingProficiencies = new Proficiencies(currClass.startingProficiencies || {}, 'none');
    this.subclassTitle = currClass.subclassTitle || 'Subclasses';

    (classJson.classFeature || []).forEach((inFeat: any) => this.classFeature.push(new ClassFeature(inFeat)));
    this.subclass = classJson.subclass || [];
    (classJson.subclassFeature || []).forEach((inFeat: any) => this.subclassFeature.push(new ClassFeature(inFeat)));

    //create levelTable[][] from JSON.classTableGroups
    //all classes start with the same 3 columns
    this.levelTable = JSON.parse(JSON.stringify(commonFeatures)); //this is some goofy javascript witchcraft, 2D arrays get shallow copied in 95% of the normal scenarios I would use, this makes a deep copy to reset it for each new class.
    this.classTableGroups = currClass.classTableGroups || [];
    for (const group of this.classTableGroups) {
      this.levelTable[0] = this.levelTable[0].concat(group.colLabels);
      for (let j = 0; j < group.rows.length; j++) {
        this.levelTable[j + 1] = this.levelTable[j + 1].concat(group.rows[j]);
      }
    }

    this.subclassTableGroups = currClass.subclassTableGroups || [];
    this.subclassTableColumns = [
      ...extractSubclassTableColumns(this.subclassTableGroups),
      ...this.subclass.flatMap(sub => extractSubclassTableColumns(sub.subclassTableGroups, sub.shortName))
    ];
  }
}

function extractSubclassTableColumns(groups: any[] | undefined, subclassShortName?: string): SubclassTableColumn[] {
  if (!Array.isArray(groups) || groups.length === 0) {
    return [];
  }

  const columns: SubclassTableColumn[] = [];
  for (const group of groups) {
    const labels: string[] = Array.isArray(group.colLabels) ? group.colLabels : [];
    const rawRows: any[][] = Array.isArray(group.rows)
      ? group.rows
      : Array.isArray(group.rowsSpellProgression)
        ? group.rowsSpellProgression
        : [];

    labels.forEach((rawHeader, colIdx) => {
      let subclassKey = subclassShortName || '';
      let rawLabel = String(rawHeader ?? '');

      // Support class-level legacy format ("PsiWarrior|Psi Die Size")
      if (!subclassKey && rawLabel.includes('|') && !rawLabel.includes('{@')) {
        const [prefix, rest] = rawLabel.split('|');
        subclassKey = prefix.trim();
        rawLabel = (rest || prefix).trim();
      }

      if (!subclassKey) {
        return;
      }

      const { label, tooltip } = parseTableHeaderLabel(rawLabel, subclassKey, group.title);
      const rows = rawRows.map(row => formatTableCellValue(row?.[colIdx]));
      columns.push({ subclassKey, label, tooltip, rows });
    });
  }

  return columns;
}

function parseTableHeaderLabel(
  rawLabel: string,
  subclassName: string,
  groupTitle?: string
): { label: string; tooltip?: string } {
  const tipMatch = rawLabel.match(/^\{@tip\s+([^|}]+)\|([^}]+)\}$/);
  if (tipMatch) {
    return { label: tipMatch[1].trim(), tooltip: tipMatch[2].trim() };
  }
  const cleanLabel = toPlainSearchText(rawLabel).trim();
  const tooltip = groupTitle ? `${subclassName} — ${groupTitle}` : subclassName;
  return { label: cleanLabel, tooltip };
}

function formatTableCellValue(value: unknown): string {
  if (value === undefined || value === null || String(value) === '0') {
    return '—';
  }
  const text = toPlainSearchText(String(value)).trim();
  return text || '—';
}

function formatPrimaryAbility(primaryAbility?: Record<string, boolean>[]): string {
  if (!Array.isArray(primaryAbility) || primaryAbility.length === 0) {
    return '';
  }
  return primaryAbility
    .map(group =>
      Object.entries(group)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([ability]) => ability.toUpperCase())
        .join(' & ')
    )
    .filter(Boolean)
    .join(' or ');
}
