import { Component, OnInit, Input } from '@angular/core';
import { Ancestry } from 'src/app/models/ancestry';

@Component({
  selector: 'app-ancestry',
  templateUrl: './ancestry.component.html',
  styleUrls: ['./ancestry.component.scss']
})
export class AncestryComponent implements OnInit {

  @Input() ancestry: Ancestry;

  sizeTable = {
    "S": "Small",
    "M": "Medium",
    "L": "Large",
    "S/M": "Medium or Small, choose at creation"
  }

  ngOnInit() {}

  renderSize(size) {
    return this.sizeTable[size];
  }
}

