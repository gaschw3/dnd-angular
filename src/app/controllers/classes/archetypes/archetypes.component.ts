import { Component, computed, input, output } from '@angular/core';
import { Subclass } from 'src/app/models';

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
