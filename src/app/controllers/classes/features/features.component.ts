import { Component, OnInit, Input } from '@angular/core';
import { ClassFeature } from 'src/app/models/class-feature';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {

  @Input() features: ClassFeature[];

  constructor() {}

  ngOnInit() {}

  getEntryType(entry): string {
    if (entry.list) {
      return "list";
    } else {
      return "";
    }
  }

}
