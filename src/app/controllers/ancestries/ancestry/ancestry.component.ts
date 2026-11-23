import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ancestry } from 'src/app/models/ancestry';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';

@Component({
  imports: [CommonModule, EntryRendererComponent],
  selector: 'app-ancestry',
  templateUrl: './ancestry.component.html',
  styleUrls: ['./ancestry.component.scss']
})
export class AncestryComponent {

  @Input() ancestry: Ancestry;

  sizeTable: Record<string, string> = {
    "T": "Tiny",
    "S": "Small",
    "M": "Medium",
    "L": "Large",
    "S/M": "Medium or Small, choose at creation"
  }

  renderSize(size: string): string {
    return this.sizeTable[size];
  }
}

