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
  it('validates 2024/spells-small.json entries and school codes', () => {
    const data = readJson('2024/spells-small.json');
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

  it('validates 2024/classes-small.json entries', () => {
    const classes = readJson('2024/classes-small.json');
    expect(Array.isArray(classes)).toBe(true);
    expect(classes.length).toBeGreaterThan(0);

    for (const entry of classes) {
      expect(Array.isArray(entry.class)).toBe(true);
      expect(entry.class[0]?.name).toBeTruthy();
      expect(Array.isArray(entry.classFeature)).toBe(true);
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

  it('validates 2024/items.json, feats-small.json, epic-boons.json, ancestry-small.json, background-small.json, and otherFeatures.json', () => {
    const files = [
      '2024/items.json',
      '2024/feats-small.json',
      '2024/epic-boons.json',
      '2024/ancestry-small.json',
      '2024/background-small.json',
      '2024/otherFeatures.json'
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
