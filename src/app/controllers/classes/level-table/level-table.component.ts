import { ViewportScroller } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClassFeature, DndClass } from 'src/app/models';

export interface SubclassTableColumn {
  index: number;
  label: string;
  subclassKey: string;
}

@Component({
  imports: [RouterModule],
  selector: 'app-level-table',
  templateUrl: './level-table.component.html',
  styleUrls: ['./level-table.component.scss']
})
export class LevelTableComponent {
  readonly dndClass = input.required<DndClass>();
  readonly selectedArchetypes = input<string[]>([]);
  readonly talk = output<string>();

  private viewport = inject(ViewportScroller);

  constructor() {
    this.viewport.setOffset([0, 85]);
  }

  readonly levelRows = computed(() => this.dndClass().levelTable.slice(1));

  readonly featuresByLevel = computed(() => {
    const map = new Map<number, ClassFeature[]>();
    for (const feature of this.dndClass().classFeature) {
      const list = map.get(feature.level) || [];
      list.push(feature);
      map.set(feature.level, list);
    }
    return map;
  });

  readonly visibleSubclassCols = computed<SubclassTableColumn[]>(() => {
    const headers = this.dndClass().subclassLevelTable?.[0];
    const selected = this.selectedArchetypes();
    if (!headers?.length || !selected.length) {
      return [];
    }

    const normalizedSelected = new Set(selected.map(s => normalizeKey(s)));
    const cols: SubclassTableColumn[] = [];

    headers.forEach((rawHeader, index) => {
      const [prefix, label] = rawHeader.split('|');
      if (prefix && normalizedSelected.has(normalizeKey(prefix))) {
        cols.push({
          index,
          label: label || rawHeader,
          subclassKey: prefix
        });
      }
    });

    return cols;
  });

  getFeatures(level: number): ClassFeature[] {
    return this.featuresByLevel().get(level) || [];
  }

  getSubclassCell(levelIndex: number, colIndex: number): string {
    const row = this.dndClass().subclassLevelTable?.[levelIndex + 1];
    const value: unknown = row?.[colIndex];
    if (value === undefined || value === null || String(value) === '0') {
      return '—';
    }
    return String(value);
  }

  jumpToFeature(id: string): void {
    this.viewport.setOffset([0, 85]);
    this.viewport.scrollToAnchor(id);
    this.talk.emit(id);
  }
}

function normalizeKey(value: string): string {
  return value.replace(/\s+/g, '').toLowerCase();
}
