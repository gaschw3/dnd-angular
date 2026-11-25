import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { QuickSearchComponent } from './quick-search.component';
import { DndDataService } from '../services/dnd-data.service';
import { DndClass } from 'src/app/models/dnd-class';

describe('QuickSearchComponent', () => {
  let component: QuickSearchComponent;
  let navigateByUrl: ReturnType<typeof vi.fn>;

  const mockClasses = [
    {
      id: 'barbarian',
      name: 'Barbarian',
      source: "PHB'24",
      subclassTitle: 'Barbarian Subclass',
      subclass: [
        { name: 'Path of the Berserker', shortName: 'Berserker', source: "PHB'24" },
        { name: 'Path of Wild Magic', shortName: 'Wild Magic', source: 'TCE' }
      ]
    },
    {
      id: 'artificer',
      name: 'Artificer',
      source: 'EFA',
      subclassTitle: 'Artificer Subclass',
      subclass: [
        { name: 'Battle Smith', shortName: 'Battle Smith', source: 'EFA' }
      ]
    }
  ] as unknown as DndClass[];

  beforeEach(async () => {
    localStorage.clear();
    navigateByUrl = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [QuickSearchComponent],
      providers: [
        {
          provide: DndDataService,
          useValue: {
            getSpells: () => of([]),
            getClasses: () => of(mockClasses),
            getMonsters: () => of([]),
            getItems: () => of([]),
            getFeats: () => of([]),
            getEpicBoons: () => of([]),
            getAncestries: () => of([]),
            getBackgrounds: () => of([]),
            getOtherFeatures: () => of([])
          }
        },
        {
          provide: Router,
          useValue: { navigateByUrl }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(QuickSearchComponent);
    component = fixture.componentInstance;
    component.open();
    fixture.detectChanges();
  });

  it('indexes subclasses and supports filtering by Subclass category', () => {
    component.setCategory('Subclass');
    expect(component.results().map(r => r.name)).toEqual([
      'Path of the Berserker',
      'Path of Wild Magic',
      'Battle Smith'
    ]);
  });

  it('ranks subclass shortName prefix matches ahead of other matches', () => {
    component.onQueryChange('berserk');
    const results = component.results();
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Path of the Berserker');
    expect(results[0].category).toBe('Subclass');
    expect(results[0].subtitle).toBe("Barbarian · PHB'24");
  });

  it('finds subclasses by parent class name', () => {
    component.setCategory('Subclass');
    component.onQueryChange('barbarian');
    expect(component.results().map(r => r.name)).toEqual([
      'Path of the Berserker',
      'Path of Wild Magic'
    ]);
  });

  it('navigates to the parent class with encoded subclass query param', () => {
    component.onQueryChange('wild magic');
    const match = component.results()[0];
    expect(match.route).toBe('/classes/barbarian?subclass=Wild%20Magic');

    component.select(match);
    expect(navigateByUrl).toHaveBeenCalledWith('/classes/barbarian?subclass=Wild%20Magic');
    expect(component.isOpen()).toBe(false);
    expect(component.query()).toBe('');
  });

  it('selects the active result when pressing Enter in the search input', () => {
    component.onQueryChange('berserk');
    const input = document.querySelector('.qs-input') as HTMLInputElement;
    expect(input).toBeTruthy();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(navigateByUrl).toHaveBeenCalledWith('/classes/barbarian?subclass=Berserker');
    expect(component.isOpen()).toBe(false);
  });
});
