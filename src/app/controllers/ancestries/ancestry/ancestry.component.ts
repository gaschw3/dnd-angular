import { Component, Input } from '@angular/core';
import { Ancestry } from 'src/app/models/ancestry';

@Component({
  standalone: false,
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

