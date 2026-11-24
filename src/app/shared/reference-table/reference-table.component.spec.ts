import { describe, it, expect, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  ReferenceTableCellDirective,
  ReferenceTableColumn,
  ReferenceTableComponent
} from './reference-table.component';

interface TestRow {
  id: string;
  name: string;
  level: number;
  school: string;
}

@Component({
  imports: [ReferenceTableComponent, ReferenceTableCellDirective],
  template: `
    <app-reference-table [data]="rows" [columns]="columns" [paging]="false">
      <ng-template appTableCell="name" let-row>
        <span class="custom-pill">{{ row.name }}!</span>
      </ng-template>
    </app-reference-table>
  `
})
class CustomCellHostComponent {
  rows: TestRow[] = [{ id: 'fireball', name: 'Fireball', level: 3, school: 'Evocation' }];
  columns: ReferenceTableColumn<TestRow>[] = [
    { key: 'name', label: 'Name', value: r => r.name }
  ];
}

describe('ReferenceTableComponent', () => {
  let fixture: ComponentFixture<ReferenceTableComponent<TestRow>>;
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
      imports: [ReferenceTableComponent, CustomCellHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReferenceTableComponent<TestRow>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', rows);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rowKey', (r: TestRow) => r.id);
    fixture.componentRef.setInput('defaultSortKey', 'name');
    fixture.componentRef.setInput('pageSize', 2);
    fixture.detectChanges();
  });

  it('sorts by defaultSortKey and paginates rows', () => {
    expect(component.filteredRows().map(r => r.id)).toEqual(['acid-splash', 'fireball', 'shield', 'wish']);
    expect(component.totalPages()).toBe(2);
    expect(component.pagedRows().map(r => r.id)).toEqual(['acid-splash', 'fireball']);

    component.goToPage(2);
    expect(component.pagedRows().map(r => r.id)).toEqual(['shield', 'wish']);
  });

  it('filters by text, regex (with graceful invalid-regex fallback), and number range', () => {
    component.setFilter('name', '^f|w');
    expect(component.filteredRows().map(r => r.id)).toEqual(['fireball', 'wish']);

    // Invalid regex falls back to case-insensitive substring match
    component.setFilter('name', '[invalid');
    expect(component.filteredRows().length).toBe(0);

    component.clearFilters();
    expect(component.hasActiveFilters()).toBe(false);

    component.setRangeFilter('level', 'min', 1);
    component.setRangeFilter('level', 'max', 3);
    expect(component.hasActiveFilters()).toBe(true);
    expect(component.filteredRows().map(r => r.id)).toEqual(['fireball', 'shield']);
  });

  it('toggles numeric column sorting ascending and descending', () => {
    const levelCol = columns[1];
    component.toggleSort(levelCol);
    expect(component.filteredRows().map(r => r.level)).toEqual([0, 1, 3, 9]);

    component.toggleSort(levelCol);
    expect(component.filteredRows().map(r => r.level)).toEqual([9, 3, 1, 0]);
  });

  it('applies initialFilters by filterId and tracks active row key', () => {
    fixture.componentRef.setInput('initialFilters', { 'name-filter': 'shield' });
    fixture.detectChanges();
    expect(component.filteredRows().map(r => r.id)).toEqual(['shield']);

    fixture.componentRef.setInput('selectedKey', 'shield');
    fixture.detectChanges();
    expect(component.isRowActive(rows[1])).toBe(true);
    expect(component.isRowActive(rows[0])).toBe(false);
  });

  it('jumps to the page containing selectedKey on selection change or initial load', () => {
    expect(component.currentPage()).toBe(1);

    fixture.componentRef.setInput('selectedKey', 'wish');
    fixture.detectChanges();
    expect(component.currentPage()).toBe(2);
    expect(component.pagedRows().map(r => r.id)).toEqual(['shield', 'wish']);

    // Manual pagination away does not snap back
    component.goToPage(1);
    expect(component.currentPage()).toBe(1);

    // Non-existent or filtered-out key leaves current page untouched
    fixture.componentRef.setInput('selectedKey', 'non-existent');
    fixture.detectChanges();
    expect(component.currentPage()).toBe(1);
  });

  it('renders custom cell templates via appTableCell', () => {
    const hostFixture = TestBed.createComponent(CustomCellHostComponent);
    hostFixture.detectChanges();
    const pill = hostFixture.nativeElement.querySelector('.custom-pill') as HTMLElement | null;
    expect(pill?.textContent?.trim()).toBe('Fireball!');
  });
});
