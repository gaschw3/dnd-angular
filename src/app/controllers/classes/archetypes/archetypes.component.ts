import { Component, computed, input, output } from '@angular/core';
import { Subclass } from 'src/app/models';

const SOURCES_2024 = new Set(["PHB'24", 'XPHB', 'FRHoF', 'AU', 'EFA', 'RHW', 'WoW']);

@Component({
  selector: 'app-archetypes',
  templateUrl: './archetypes.component.html',
  styleUrls: ['./archetypes.component.scss']
})
export class ArchetypesComponent {
  readonly archetypes = input<Subclass[]>([]);
  readonly selectedArchetypes = input<string[]>([]);
  readonly subclassTitle = input<string>('Subclasses');
  readonly inline = input<boolean>(false);
  readonly selectionChange = output<string[]>();

  readonly allSelected = computed(() => {
    const list = this.archetypes();
    const selected = this.selectedArchetypes();
    return list.length > 0 && selected.length === list.length;
  });

  readonly hasSelection = computed(() => this.selectedArchetypes().length > 0);

  readonly hasMixedEditions = computed(() => {
    const list = this.archetypes();
    let has2024 = false;
    let hasLegacy = false;
    for (const sub of list) {
      if (this.is2024(sub)) {
        has2024 = true;
      } else {
        hasLegacy = true;
      }
      if (has2024 && hasLegacy) {
        return true;
      }
    }
    return false;
  });

  is2024(sub: Subclass): boolean {
    if (sub.edition) {
      return sub.edition === '2024';
    }
    return SOURCES_2024.has(sub.source);
  }

  getTooltip(sub: Subclass): string {
    const ruleset = this.is2024(sub) ? '2024 rules' : '2014 legacy';
    return sub.source ? `${sub.source} · ${ruleset}` : ruleset;
  }

  isSelected(shortName: string): boolean {
    return this.selectedArchetypes().includes(shortName);
  }

  toggleArchetype(shortName: string): void {
    const current = this.selectedArchetypes();
    const next = current.includes(shortName)
      ? current.filter(name => name !== shortName)
      : [...current, shortName];
    this.selectionChange.emit(next);
  }

  selectAll(): void {
    this.selectionChange.emit(this.archetypes().map(a => a.shortName));
  }

  clearAll(): void {
    this.selectionChange.emit([]);
  }
}
