import { describe, it, expect } from 'vitest';

import { normalizeMonster } from './monster';
import { normalizeItem } from './item';
import { normalizeOtherFeature } from './otherFeature';
import { Spell } from './spell';
import { DndClass } from './dnd-class';
import { Feat } from './feat';
import { matchesPhrase } from '../shared/helpers/format.utils';

describe('Model normalizers', () => {
  it('normalizes Monster array sizes, structured resistances, AC, and HP', () => {
    const monster = normalizeMonster({
      name: 'Aartuk Elder',
      source: 'BAM',
      size: ['L'],
      type: 'plant',
      alignment: ['L', 'E'],
      ac: [{ ac: 16, from: ['natural armor'] }],
      hp: { average: 75, formula: '10d10 + 20' },
      speed: { walk: 20, climb: 20 },
      save: { wis: '+4' },
      skill: { perception: '+4' },
      resist: ['cold', { resist: ['bludgeoning', 'piercing'], note: 'from nonmagical attacks' }],
      spellcasting: [{ name: 'Spellcasting (Psionics)', will: ['{@spells ray of frost}'] }],
      action: [
        { name: 'Breath Weapon {@recharge 5}', entries: ['{@atk mw} {@hit 6} to hit, {@h} {@damage 2d6} cold damage.'] }
      ],
      legendary: []
    });

    expect(monster.id).toBe('aartuk-elder');
    expect(monster.size).toBe('L');
    expect(monster.baseType).toBe('plant');
    expect(monster.acText).toBe('16 (natural armor)');
    expect(monster.hpText).toBe('75 (10d10 + 20)');
    expect(monster.speedText).toBe('walk 20 ft., climb 20 ft.');
    expect(monster.savesText).toBe('Wis +4');
    expect(monster.skillsText).toBe('Perception +4');
    expect(monster.resistText).toBe('cold; bludgeoning, piercing from nonmagical attacks');
    expect(monster.isSpellcaster).toBe(true);
    expect(monster.isLegendary).toBe(false);
    expect(monster.searchText).toContain('melee weapon attack');
    expect(monster.searchText).toContain('recharge 5–6');
    expect(monster.searchText).toContain('ray of frost');
    expect(monster.searchText).not.toContain('{@atk');
  });

  it('normalizes Item HTML names, capitalized rarities, categories, and currency', () => {
    const occultum = normalizeItem({
      name: "<span class='text--op'>Occultum (op)</span>",
      rarity: 'Rare',
      type: '$',
      value: 100000,
      source: 'BREW'
    });
    expect(occultum.plainName).toBe('Occultum (op)');
    expect(occultum.hasHtmlName).toBe(true);
    expect(occultum.id).toBe('occultum-op');
    expect(occultum.rarity).toBe('rare');
    expect(occultum.category).toBe('treasure');
    expect(occultum.valueFormatted).toBe('1,000 gp');

    const longsword = normalizeItem({
      name: 'Longsword',
      type: 'M',
      weaponCategory: 'martial',
      rarity: 'none',
      dmg1: '1d8',
      dmg2: '1d10',
      dmgType: 'S',
      property: ['V'],
      value: 1500,
      entries: ['Can cast {@spells fly} once per day.']
    });
    expect(longsword.category).toBe('weapons');
    expect(longsword.damageText).toBe('1d8 slashing — versatile (1d10)');
    expect(longsword.searchText).toContain('versatile');
    expect(longsword.searchText).toContain('fly');
    expect(longsword.searchText).not.toContain('{@spells');

    const shield = normalizeItem({ name: 'Shield', type: 'S', rarity: 'none', ac: '2' });
    expect(shield.category).toBe('armor');
  });

  it('normalizes OtherFeature type labels and prerequisites', () => {
    const feat = normalizeOtherFeature({
      name: 'Agonizing Blast',
      source: 'PHB',
      featureType: ['EI'],
      prerequisite: [{ level: { level: 2, class: { name: 'Warlock' } }, spell: 'Eldritch Blast' }],
      entries: []
    });

    expect(feat.id).toBe('agonizing-blast');
    expect(feat.typeLabel).toBe('Eldritch Invocation');
    expect(feat.levelPrereq).toBe('2');
    expect(feat.prereqSummary).toBe('Eldritch Blast, Warlock');
    expect(feat.prereqFull).toBe('Level 2 Warlock, Eldritch Blast');
  });

  it('builds plain-text full-text search index for Spells with inline tags stripped', () => {
    const spell = new Spell(
      {
        name: 'Fireball',
        source: "PHB'24",
        level: 3,
        school: 'V',
        time: [{ number: 1, unit: 'action' }],
        range: { type: 'point', distance: { type: 'feet', amount: 150 } },
        components: { v: true, s: true, m: 'a tiny ball of bat guano and sulfur' },
        duration: [{ type: 'instant' }],
        entries: [
          'A bright streak flashes to deal {@damage 8d6} fire damage on a failed Dexterity saving throw.',
          { type: 'entries', name: 'Ignite', entries: ['Flammable objects {@condition burning|ignite}.'] },
          'Summons a {@filter Tiny Beast|bestiary|size=T|type=beast}.'
        ],
        entriesHigherLevel: [
          { type: 'entries', name: 'At Higher Levels', entries: ['Damage increases by {@scaledamage 1d6}.'] }
        ]
      },
      { class: { XPHB: { Sorcerer: true, Wizard: true } } }
    );

    expect(spell.searchText).toContain('fireball');
    expect(spell.searchText).toContain('8d6 fire damage');
    expect(spell.searchText).toContain('bat guano');
    expect(spell.searchText).toContain('ignite');
    expect(spell.searchText).toContain('tiny beast');
    expect(spell.searchText).toContain('1d6');
    expect(spell.searchText).not.toContain('{@damage');
    expect(matchesPhrase(spell.searchText, 'fire damage')).toBe(true);
    expect(matchesPhrase(spell.searchText, 'fire   damage')).toBe(true);
    expect(matchesPhrase(spell.searchText, 'fire saving')).toBe(false);
  });

  it('extracts subclassTableGroups from both class-level and subclass-level definitions', () => {
    const dndClass = new DndClass({
      class: [
        {
          name: 'Fighter',
          source: "PHB'24",
          hd: { number: 1, faces: 10 },
          subclassTableGroups: [
            { colLabels: ['LegacySub|Legacy Col'], rows: [[0], [1]] }
          ]
        }
      ],
      subclass: [
        {
          name: 'Psi Warrior',
          shortName: 'Psi Warrior',
          subclassTableGroups: [
            {
              colLabels: ['{@tip Die Size|Psionic Energy Die Size}', '{@tip Number|Psionic Energy Die Number}'],
              rows: [
                [0, 0],
                ['{@dice d6}', 4]
              ]
            }
          ]
        },
        {
          name: 'Eldritch Knight',
          shortName: 'Eldritch Knight',
          subclassTableGroups: [
            {
              title: 'Spell Slots per Spell Level',
              colLabels: ['1st'],
              rows: [[0], [2]]
            }
          ]
        }
      ]
    });

    expect(dndClass.subclassTableColumns).toEqual([
      {
        subclassKey: 'LegacySub',
        label: 'Legacy Col',
        tooltip: 'LegacySub',
        rows: ['—', '1']
      },
      {
        subclassKey: 'Psi Warrior',
        label: 'Die Size',
        tooltip: 'Psionic Energy Die Size',
        rows: ['—', 'd6']
      },
      {
        subclassKey: 'Psi Warrior',
        label: 'Number',
        tooltip: 'Psionic Energy Die Number',
        rows: ['—', '4']
      },
      {
        subclassKey: 'Eldritch Knight',
        label: '1st',
        tooltip: 'Eldritch Knight — Spell Slots per Spell Level',
        rows: ['—', '2']
      }
    ]);
  });

  it('extracts Feat asiAbilities, change metadata, and searchText', () => {
    const dual = new Feat({
      name: 'Athlete',
      source: "PHB'24",
      category: 'G',
      change: 'buff',
      changeNote: 'Added extra climb speed.',
      ability: [{ choose: { from: ['str', 'dex'], amount: 1 } }],
      entries: ['You gain a Climb Speed.']
    });
    expect(dual.asiAbilities).toEqual(['str', 'dex']);
    expect(dual.change).toBe('buff');
    expect(dual.changeNote).toBe('Added extra climb speed.');
    expect(dual.searchText).toContain('climb speed');

    const anyFeat = new Feat({
      name: 'Ability Score Improvement',
      source: "PHB'24",
      category: 'G',
      ability: [{ choose: { from: ['str', 'dex', 'con', 'int', 'wis', 'cha'], amount: 2 } }],
      entries: []
    });
    expect(anyFeat.asiAbilities).toEqual(['any']);
    expect(anyFeat.asi).toBe('Any +1, Any +1');

    const single = new Feat({
      name: 'Durable',
      source: "PHB'24",
      category: 'G',
      change: 'nerf',
      ability: [{ con: 1 }],
      entries: []
    });
    expect(single.asiAbilities).toEqual(['con']);
    expect(single.change).toBe('nerf');

    const singleClassPrereq = new Feat({
      name: 'Test Single Class',
      source: "PHB'24",
      prerequisite: [{ class: 'Wizard' }],
      entries: []
    });
    expect(singleClassPrereq.prerequisite).toBe('{@class Wizard}');
    expect(singleClassPrereq.searchText).toContain('wizard');

    const multiClassPrereq = new Feat({
      name: 'Initiate of High Sorcery',
      source: 'DSotDQ',
      prerequisite: [{ class: ['Sorcerer', 'Wizard'] }],
      entries: []
    });
    expect(multiClassPrereq.prerequisite).toBe('{@class Sorcerer} or {@class Wizard}');

    const objClassPrereq = new Feat({
      name: 'Legacy Class Obj',
      source: 'PHB',
      prerequisite: [{ class: [{ name: 'Bard' }, { name: 'Sorcerer' }, { name: 'Wizard' }] }],
      entries: []
    });
    expect(objClassPrereq.prerequisite).toBe('{@class Bard}, {@class Sorcerer} or {@class Wizard}');
  });
});
