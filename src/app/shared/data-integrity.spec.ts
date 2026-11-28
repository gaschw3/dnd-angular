import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { spellSchool } from '../models/spell';
import { crXpMap } from './helpers/monster/experienceMaps';

const readJson = (relativePath: string): any => {
  const fullPath = resolve(process.cwd(), 'src/assets/data', relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf8'));
};

describe('JSON data asset integrity', () => {
  it('validates 2024/spells.json entries and school codes', () => {
    const data = readJson('2024/spells.json');
    expect(Array.isArray(data.spell)).toBe(true);
    expect(data.spell.length).toBeGreaterThan(0);

    const validSchools = new Set(Object.keys(spellSchool));
    for (const spell of data.spell) {
      expect(typeof spell.name).toBe('string');
      expect(spell.name.trim().length).toBeGreaterThan(0);
      expect(validSchools.has(spell.school)).toBe(true);
      expect(spell.level).toBeDefined();
    }
  });

  it('validates 2026/classes/index.json and per-class entries', () => {
    const index = readJson('2026/classes/index.json');
    expect(Array.isArray(index)).toBe(true);
    expect(index.length).toBeGreaterThan(0);

    const existingShortNamesByClass = new Map<string, Set<string>>();
    for (const meta of index) {
      expect(typeof meta.file).toBe('string');
      const entry = readJson(`2026/classes/${meta.file}`);
      expect(Array.isArray(entry.class)).toBe(true);
      expect(entry.class[0]?.name).toBeTruthy();
      expect(Array.isArray(entry.classFeature)).toBe(true);
      existingShortNamesByClass.set(
        entry.class[0].name,
        new Set((entry.subclass || []).map((s: any) => s.shortName))
      );
    }

    const brew = readJson('2026/classes/brew.json');
    expect(Array.isArray(brew.subclass)).toBe(true);
    expect(Array.isArray(brew.subclassFeature)).toBe(true);
    expect(brew.subclass.length).toBeGreaterThan(0);

    const brewKeys = new Set<string>();
    for (const sub of brew.subclass) {
      const existing = existingShortNamesByClass.get(sub.className);
      expect(existing, `Unknown brew target class: ${sub.className}`).toBeDefined();
      expect(existing!.has(sub.shortName), `Duplicate shortName "${sub.shortName}" on ${sub.className}`).toBe(false);
      const key = `${sub.className}|${sub.shortName}`;
      expect(brewKeys.has(key), `Duplicate brew subclass key: ${key}`).toBe(false);
      brewKeys.add(key);
      expect(sub.source).toBe('BREW');
      expect(sub.edition).toBe('brew');
    }

    const featureCountBySub = new Map<string, number>();
    for (const feat of brew.subclassFeature) {
      const key = `${feat.className}|${feat.subclassShortName}`;
      expect(brewKeys.has(key), `Orphan brew feature "${feat.name}" for ${key}`).toBe(true);
      expect(typeof feat.level).toBe('number');
      expect(Array.isArray(feat.entries)).toBe(true);
      expect(feat.entries.length).toBeGreaterThan(0);
      featureCountBySub.set(key, (featureCountBySub.get(key) ?? 0) + 1);
    }

    for (const key of brewKeys) {
      expect(featureCountBySub.get(key) ?? 0, `Brew subclass ${key} has no features`).toBeGreaterThan(0);
    }
  });

  it('validates 2023/beastiary.json monsters and CR values', () => {
    const data = readJson('2023/beastiary.json');
    expect(Array.isArray(data.monsters)).toBe(true);
    expect(data.monsters.length).toBeGreaterThan(0);

    const validCrs = new Set([...crXpMap.map(entry => entry.cr), 'N/A']);
    for (const monster of data.monsters) {
      expect(typeof monster.name).toBe('string');
      expect(monster.name.trim().length).toBeGreaterThan(0);
      const baseCr = typeof monster.cr === 'string' && monster.cr.includes('(')
        ? monster.cr.split(' (')[0]
        : String(monster.cr);
      expect(validCrs.has(baseCr)).toBe(true);
    }
  });

  it('validates items, ancestry, and 2026 feats, epic-boons, backgrounds, and otherFeatures', () => {
    const files = [
      '2024/items.json',
      '2024/ancestry-small.json',
      '2026/feats.json',
      '2026/epic-boons.json',
      '2026/backgrounds.json',
      '2026/otherFeatures.json'
    ];
    for (const file of files) {
      const list = readJson(file);
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
      for (const item of list) {
        expect(typeof item.name).toBe('string');
        expect(item.name.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('validates brew/mapLocations.json coordinate tuples', () => {
    const mapData = readJson('brew/mapLocations.json');
    for (const key of ['continents', 'countries', 'seas', 'cities', 'towns', 'shizomi']) {
      expect(Array.isArray(mapData[key])).toBe(true);
      for (const entry of mapData[key]) {
        expect(entry.length).toBe(3);
        expect(typeof entry[0]).toBe('string');
        expect(typeof entry[1]).toBe('number');
        expect(typeof entry[2]).toBe('number');
      }
    }
  });
});
