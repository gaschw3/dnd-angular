import { describe, it, expect } from 'vitest';

import { normalizeMonster } from './monster';
import { normalizeItem } from './item';
import { normalizeOtherFeature } from './otherFeature';

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
      spellcasting: [{ name: 'Spellcasting (Psionics)' }],
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
      value: 1500
    });
    expect(longsword.category).toBe('weapons');
    expect(longsword.damageText).toBe('1d8 slashing — versatile (1d10)');

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
});
