import { describe, it, expect, beforeEach } from 'vitest';
import { SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ReferenceTableColumn, ReferenceTableComponent } from './reference-table.component';

interface TestRow {
  id: string;
  name: string;
  level: number;
  school: string;
}

describe('ReferenceTableComponent', () => {
  let component: ReferenceTableComponent<TestRow>;

  const rows: TestRow[] = [
    { id: 'fireball', name: 'Fireball', level: 3, school: 'Evocation' },
    { id: 'shield', name: 'Shield', level: 1, school: 'Abjuration' },
    { id: 'wish', name: 'Wish', level: 9, school: 'Conjuration' },
    { id: 'acid-splash', name: 'Acid Splash', level: 0, school: 'Evocation' }
  ];

  const columns: ReferenceTableColumn<TestRow>[] = [
    { key: 'name', label: 'Name', filterId: 'name-filter', filterType: 'regex', value: r => r.name },
    {
      key: 'level',
      label: 'Level',
      filterType: 'number-range',
      value: r => r.level,
      sortValue: r => r.level
    },
    { key: 'school', label: 'School', value: r => r.school }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenceTableComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(ReferenceTableComponent<TestRow>);
    component = fixture.componentInstance;
    component.data = rows;
    component.columns = columns;
    component.rowKey = r => r.id;
    component.defaultSortKey = 'name';
    component.pageSize = 2;
    component.ngOnChanges({
      data: new SimpleChange(null, rows, true),
      columns: new SimpleChange([], columns, true),
      defaultSortKey: new SimpleChange(null, 'name', true)
    });
  });

  it('sorts by defaultSortKey and paginates rows', () => {
    expect(component.filteredRows.map(r => r.id)).toEqual(['acid-splash', 'fireball', 'shield', 'wish']);
    expect(component.totalPages).toBe(2);
    expect(component.pagedRows.map(r => r.id)).toEqual(['acid-splash', 'fireball']);

    component.goToPage(2);
    expect(component.pagedRows.map(r => r.id)).toEqual(['shield', 'wish']);
  });

  it('filters by text, regex (with graceful invalid-regex fallback), and number range', () => {
    component.filters['name'] = '^f|w';
    component.onFilterChange();
    expect(component.filteredRows.map(r => r.id)).toEqual(['fireball', 'wish']);

    // Invalid regex falls back to case-insensitive substring match
    component.filters['name'] = '[invalid';
    component.onFilterChange();
    expect(component.filteredRows.length).toBe(0);

    component.clearFilters();
    expect(component.hasActiveFilters).toBe(false);

    component.rangeFilters['level'] = { min: 1, max: 3 };
    component.onFilterChange();
    expect(component.hasActiveFilters).toBe(true);
    expect(component.filteredRows.map(r => r.id)).toEqual(['fireball', 'shield']);
  });

  it('toggles numeric column sorting ascending and descending', () => {
    const levelCol = columns[1];
    component.toggleSort(levelCol);
    expect(component.filteredRows.map(r => r.level)).toEqual([0, 1, 3, 9]);

    component.toggleSort(levelCol);
    expect(component.filteredRows.map(r => r.level)).toEqual([9, 3, 1, 0]);
  });

  it('applies initialFilters by filterId and tracks active row key', () => {
    component.initialFilters = { 'name-filter': 'shield' };
    component.ngOnChanges({
      initialFilters: new SimpleChange({}, component.initialFilters, false)
    });
    expect(component.filteredRows.map(r => r.id)).toEqual(['shield']);

    component.selectedKey = 'shield';
    expect(component.isRowActive(rows[1])).toBe(true);
    expect(component.isRowActive(rows[0])).toBe(false);
  });
});
