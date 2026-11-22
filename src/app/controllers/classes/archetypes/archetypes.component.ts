import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-archetypes',
  templateUrl: './archetypes.component.html',
  styleUrls: ['./archetypes.component.scss']
})
export class ArchetypesComponent implements OnInit {
  @Input() archetypes: any[] = [];
  @Input() selectedArchetypes: string[] = [];
  @Input() allSelected = false;
  @Output() check: EventEmitter<string> = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

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
