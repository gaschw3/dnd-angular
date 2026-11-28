import { Component, computed, input, output } from '@angular/core';
import { Subclass, SubclassEdition } from 'src/app/models';

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

  readonly has2024 = computed(() => this.archetypes().some(sub => this.is2024(sub)));
  readonly hasLegacy = computed(() => this.archetypes().some(sub => this.isLegacy(sub)));
  readonly hasBrew = computed(() => this.archetypes().some(sub => this.isBrew(sub)));

  readonly hasMixedEditions = computed(
    () => [this.has2024(), this.hasLegacy(), this.hasBrew()].filter(Boolean).length > 1
  );

  getCategory(sub: Subclass): SubclassEdition {
    if (sub.edition === 'brew' || sub.source?.toUpperCase() === 'BREW') {
      return 'brew';
    }
    if (sub.edition) {
      return sub.edition;
    }
    return SOURCES_2024.has(sub.source) ? '2024' : '2014';
  }

  is2024(sub: Subclass): boolean {
    return this.getCategory(sub) === '2024';
  }

  isLegacy(sub: Subclass): boolean {
    return this.getCategory(sub) === '2014';
  }

  isBrew(sub: Subclass): boolean {
    return this.getCategory(sub) === 'brew';
  }

  getTooltip(sub: Subclass): string {
    const category = this.getCategory(sub);
    if (category === 'brew') {
      return sub.source ? `${sub.source} · Homebrew` : 'Homebrew';
    }
    const ruleset = category === '2024' ? '2024 rules' : '2014 legacy';
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
