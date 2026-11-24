import { ViewportScroller } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClassFeature, DndClass, SubclassTableColumn } from 'src/app/models';

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
    const columns = this.dndClass().subclassTableColumns;
    const selected = this.selectedArchetypes();
    if (!columns?.length || !selected.length) {
      return [];
    }

    const normalizedSelected = new Set(selected.map(s => normalizeKey(s)));
    return columns.filter(col => normalizedSelected.has(normalizeKey(col.subclassKey)));
  });

  getFeatures(level: number): ClassFeature[] {
    return this.featuresByLevel().get(level) || [];
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
