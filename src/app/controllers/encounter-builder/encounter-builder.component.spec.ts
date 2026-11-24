import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EncounterBuilderComponent } from './encounter-builder.component';
import { DndDataService } from 'src/app/shared/services/dnd-data.service';
import { Monster } from 'src/app/models';

const makeMonster = (id: string, name: string, cr: string): Monster =>
  ({
    id,
    name,
    cr,
    size: 'M',
    type: 'humanoid',
    alignment: ['N'],
    source: 'MM'
  }) as unknown as Monster;

describe('EncounterBuilderComponent', () => {
  let component: EncounterBuilderComponent;
  const mockMonsters: Monster[] = [
    makeMonster('goblin', 'Goblin', '1/4'),
    makeMonster('ogre', 'Ogre', '2'),
    makeMonster('aboleth', 'Aboleth', '10 (11 in lair)'),
    makeMonster('dragon', 'Adult Red Dragon', '17'),
    makeMonster('summon', 'Spirit', 'N/A')
  ];

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [EncounterBuilderComponent],
      providers: [
        {
          provide: DndDataService,
          useValue: { getMonsters: () => of(mockMonsters) }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(EncounterBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('filters out N/A CR monsters on init', () => {
    expect(component.monsters().map(m => m.id)).not.toContain('summon');
    expect(component.monsters().length).toBe(4);
  });

  describe('2024 DMG ruleset', () => {
    it('calculates encounter XP without monster-count multipliers', () => {
      component.setRuleset('2024');
      component.setPartySize(4);
      component.setPartyLevel(5); // low: 2000, moderate: 3000, high: 4400

      const ogre = mockMonsters[1]; // CR 2 = 450 XP
      component.addMonster(ogre);
      component.addMonster(ogre);
      component.addMonster(ogre);
      component.addMonster(ogre);
      component.addMonster(ogre); // 5 × 450 = 2250 XP

      expect(component.encounterXp()).toBe(2250);
      expect(component.adjustedXp()).toBe(2250);
      expect(component.currEncounterDifficulty()).toBe('low');

      component.addMonster(ogre);
      component.addMonster(ogre); // 7 × 450 = 3150 XP -> moderate
      expect(component.currEncounterDifficulty()).toBe('moderate');

      component.addMonster(ogre);
      component.addMonster(ogre);
      component.addMonster(ogre); // 10 × 450 = 4500 XP -> high
      expect(component.currEncounterDifficulty()).toBe('high');
    });

    it('parses lair CR strings when calculating encounter XP', () => {
      component.setRuleset('2024');
      component.addMonster(mockMonsters[2]); // CR 10 (11 in lair) = 5900 XP
      expect(component.encounterXp()).toBe(5900);
    });
  });

  describe('2014 DMG ruleset', () => {
    it('applies standard 2014 monster-count multipliers for a 4-player party', () => {
      component.setRuleset('2014');
      component.setPartySize(4);
      component.setPartyLevel(1); // easy: 100, medium: 200, hard: 300, deadly: 400

      expect(component.getMultiplier(1)).toBe(1);
      expect(component.getMultiplier(2)).toBe(1.5);
      expect(component.getMultiplier(4)).toBe(2);
      expect(component.getMultiplier(8)).toBe(2.5);
      expect(component.getMultiplier(12)).toBe(3);
      expect(component.getMultiplier(15)).toBe(4);

      const goblin = mockMonsters[0]; // 50 XP
      component.addMonster(goblin);
      component.addMonster(goblin); // 100 raw * 1.5 = 150 adjusted -> easy
      expect(component.encounterXp()).toBe(100);
      expect(component.adjustedXp()).toBe(150);
      expect(component.currEncounterDifficulty()).toBe('easy');
    });

    it('does not double-apply party-size multiplier for large (6+) or small (<3) parties', () => {
      component.setRuleset('2014');
      component.setPartySize(6);
      component.setPartyLevel(1); // deadly threshold = 6 * 100 = 600

      // 2 Ogres = 900 raw XP; 6-player multiplier for 2 monsters is 1.0 -> 900 adjusted XP >= 600 deadly
      component.addMonster(mockMonsters[1]);
      component.addMonster(mockMonsters[1]);
      expect(component.adjustedXp()).toBe(900);
      expect(component.currEncounterDifficulty()).toBe('deadly');

      // 2-player party, level 1: deadly threshold = 2 * 100 = 200
      // 1 Goblin = 50 raw XP * 1.5 small-party multiplier = 75 adjusted XP -> easy (50..99)
      component.clearEncounter();
      component.setPartySize(2);
      component.addMonster(mockMonsters[0]);
      expect(component.adjustedXp()).toBe(75);
      expect(component.currEncounterDifficulty()).toBe('easy');
    });
  });

  describe('encounter management and persistence', () => {
    it('increments, decrements, removes at zero, and saves/loads/deletes encounters', () => {
      component.addMonster(mockMonsters[0]);
      component.encounterChange(0, 2);
      expect(component.currEncounter()[0].number).toBe(3);

      component.encounterName.set('Goblin Ambush');
      component.saveEncounter();
      expect(component.savedEncounters().length).toBe(1);

      component.clearEncounter();
      expect(component.currEncounter().length).toBe(0);

      component.loadEncounter(component.savedEncounters()[0]);
      expect(component.currEncounter().length).toBe(1);
      expect(component.currEncounter()[0].number).toBe(3);

      component.encounterChange(0, -3);
      expect(component.currEncounter().length).toBe(0);

      component.deleteSavedEncounter(component.savedEncounters()[0].id);
      expect(component.savedEncounters().length).toBe(0);
    });

    it('builds a readable encounter summary and supports removing monsters directly', () => {
      component.setRuleset('2024');
      component.setPartySize(4);
      component.setPartyLevel(5);
      component.encounterName.set('Bridge Ambush');
      component.addMonster(mockMonsters[0]); // Goblin (50 XP)
      component.addMonster(mockMonsters[0]);
      component.addMonster(mockMonsters[1]); // Ogre (450 XP)

      const summary = component.buildEncounterSummary();
      expect(summary).toContain('Bridge Ambush (2024 DMG) — 4× Level 5');
      expect(summary).toContain('- 2× Goblin (CR 1/4, 50 XP)');
      expect(summary).toContain('- 1× Ogre (CR 2, 450 XP)');
      expect(summary).toContain('Total XP: 550');

      component.removeMonster(0);
      expect(component.currEncounter().length).toBe(1);
      expect(component.currEncounter()[0].monster.id).toBe('ogre');
    });

    it('persists party size, level, and ruleset in localStorage', () => {
      component.setPartySize(3);
      component.setPartyLevel(12);
      component.setRuleset('2014');

      const stored = JSON.parse(localStorage.getItem('eotcc_encounter_party_v1') || '{}');
      expect(stored).toEqual({ partySize: 3, partyLevel: 12, ruleset: '2014' });
    });
  });
});
