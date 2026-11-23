import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-archetypes',
  templateUrl: './archetypes.component.html',
  styleUrls: ['./archetypes.component.scss']
})
export class ArchetypesComponent {
  @Input() archetypes: any[] = [];
  @Input() selectedArchetypes: string[] = [];
  @Input() allSelected = false;
  @Output() check: EventEmitter<string> = new EventEmitter<string>();

  clickArchetype(name: string): void {
    const idx = this.selectedArchetypes.indexOf(name);
    if (idx !== -1) {
      this.selectedArchetypes.splice(idx, 1);
    } else {
      this.selectedArchetypes.push(name);
    }
    this.allSelected = this.archetypes.length > 0 && this.selectedArchetypes.length === this.archetypes.length;
  }

  selectAll(): void {
    this.allSelected = true;
    for (const archetype of this.archetypes) {
      if (!this.selectedArchetypes.includes(archetype.shortName)) {
        this.selectedArchetypes.push(archetype.shortName);
      }
    }
  }

  selectNone(): void {
    this.allSelected = false;
    this.selectedArchetypes.splice(0, this.selectedArchetypes.length);
    this.selectedArchetypes.push('none');
  }
}
