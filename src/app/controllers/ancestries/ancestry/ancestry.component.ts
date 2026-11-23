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

  sizeTable = {
    "T": "Tiny",
    "S": "Small",
    "M": "Medium",
    "L": "Large",
    "S/M": "Medium or Small, choose at creation"
  }

  renderSize(size) {
    return this.sizeTable[size];
  }
}

