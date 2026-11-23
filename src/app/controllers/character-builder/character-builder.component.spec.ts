import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CharacterBuilderComponent } from './character-builder.component';
import { DndDataService } from '../../shared/services/dnd-data.service';
import { Background } from '../../models/background';
import { Feat } from '../../models/feat';

const mockFeats: Feat[] = [
  new Feat({ name: 'Magic Initiate', source: "PHB'24", category: 'O', entries: ['Learn cantrips.'] }),
  new Feat({ name: 'Savage Attacker', source: "PHB'24", category: 'O', entries: ['Reroll damage.'] }),
  new Feat({ name: 'Alert', source: "PHB'24", category: 'O', entries: ['Initiative bonus.'] }),
  new Feat({ name: 'War Caster', source: "PHB'24", category: 'G', entries: ['General feat.'] })
];

const mockBackgrounds: Background[] = [
  new Background({
    name: 'Acolyte',
    source: "PHB'24",
    skill: 'Insight, Religion',
    tool: "Calligrapher's Supplies",
    feat: 'Magic Initiate',
    info: 'Temple service',
    entries: [
      {
        type: 'list',
        items: [
          { type: 'item', name: 'Ability Score Options:', entry: 'Intelligence, Wisdom, Charisma' }
        ]
      }
    ]
  }),
  new Background({
    name: 'Soldier',
    source: "PHB'24",
    skill: 'Athletics, Intimidation',
    tool: 'Gaming Set',
    feat: 'Savage Attacker',
    info: 'Battlefield training',
    entries: [
      {
        type: 'list',
        items: [
          { type: 'item', name: 'Ability Score Options:', entry: 'Strength, Dexterity, Constitution' }
        ]
      }
    ]
  })
];

describe('CharacterBuilderComponent', () => {
  let component: CharacterBuilderComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CharacterBuilderComponent],
      providers: [
        {
          provide: DndDataService,
          useValue: {
            getBackgrounds: () => of(mockBackgrounds),
            getFeats: () => of(mockFeats)
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CharacterBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('calculates standard and extended point costs accurately', () => {
    expect(component.pointCost(8)).toBe(0);
    expect(component.pointCost(13)).toBe(5);
    expect(component.pointCost(14)).toBe(7);
    expect(component.pointCost(15)).toBe(9);
    expect(component.pointCost(6)).toBe(-2);
    expect(component.pointCost(18)).toBe(19);
  });

  it('tracks resettable changes and overflow points in extended range', () => {
    expect(component.hasChanges).toBe(false);
    expect(component.isOverMax).toBe(false);

    component.extendedRange = true;
    component.stepBase(component.stats[0], -2); // STR 6 (-2 pts -> 29/27 remaining)
    expect(component.hasChanges).toBe(true);
    expect(component.pointsRemaining).toBe(29);
    expect(component.isOverMax).toBe(true);
    expect(component.overflowProgress).toBeGreaterThan(0);

    component.resetAll();
    expect(component.hasChanges).toBe(false);
    expect(component.isOverMax).toBe(false);
  });

  it('enforces background ASI restrictions and unlocks when freeform is toggled', () => {
    component.selectedBackgroundId = 'acolyte';
    component.onBackgroundChange();

    const str = component.stats[0];
    const wis = component.stats[4];
    const cha = component.stats[5];

    expect(component.isStatBonusAllowed('str')).toBe(false);
    expect(component.isStatBonusAllowed('wis')).toBe(true);

    component.stepBonus(str, 1);
    expect(str.bonus).toBe(0); // blocked by Acolyte

    component.stepBonus(wis, 1);
    component.stepBonus(wis, 1);
    component.stepBonus(wis, 1); // capped at +2 per stat
    expect(wis.bonus).toBe(2);

    component.stepBonus(cha, 1);
    component.stepBonus(cha, 1); // capped at +3 total
    expect(cha.bonus).toBe(1);
    expect(component.bonusSpent).toBe(3);

    // Switching to Soldier clears non-Soldier bonuses
    component.selectedBackgroundId = 'soldier';
    component.onBackgroundChange();
    expect(wis.bonus).toBe(0);
    expect(cha.bonus).toBe(0);

    // Enabling freeform unlocks all stats
    component.freeformAsi = true;
    component.onFreeformChange();
    expect(component.isStatBonusAllowed('wis')).toBe(true);
    component.stepBonus(wis, 1);
    expect(wis.bonus).toBe(1);
  });

  it('clamps extended scores back to 8-15 when extended range is disabled', () => {
    component.extendedRange = true;
    const str = component.stats[0];
    const cha = component.stats[5];
    component.stepBase(str, 10); // 18
    component.stepBase(cha, -2); // 6
    expect(str.base).toBe(18);
    expect(cha.base).toBe(6);

    component.extendedRange = false;
    component.onExtendedRangeChange();
    expect(str.base).toBe(15);
    expect(cha.base).toBe(8);
  });

  it('resolves suggested origin feat from background and allows custom override', () => {
    expect(component.originFeats.map(f => f.name)).toEqual(['Magic Initiate', 'Savage Attacker', 'Alert']);

    component.selectedBackgroundId = 'acolyte';
    expect(component.activeOriginFeat?.name).toBe('Magic Initiate');

    component.customOriginFeat = true;
    component.onCustomOriginFeatChange();
    expect(component.selectedOriginFeatId).toBe('magic-initiate');

    component.selectedOriginFeatId = 'alert';
    expect(component.activeOriginFeat?.name).toBe('Alert');
  });

  it('formats a readable summary string with specific bonus ASIs and origin feat', () => {
    component.selectedBackgroundId = 'acolyte';
    component.stepBase(component.stats[4], 7); // WIS 15 (9 pts)
    component.stepBonus(component.stats[4], 2);
    component.stepBonus(component.stats[5], 1);

    const summary = component.buildSummaryText();
    expect(summary).toContain('Background: Acolyte | Origin Feat: Magic Initiate');
    expect(summary).toContain('Points: 9/27');
    expect(summary).toContain('Bonus ASI: WIS +2, CHA +1');
  });
});
