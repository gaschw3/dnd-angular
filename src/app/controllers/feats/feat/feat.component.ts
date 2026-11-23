import { Component, Input } from '@angular/core';
import { Feat, featCategory } from 'src/app/models/feat';

@Component({
  standalone: false,
  selector: 'app-feat',
  templateUrl: './feat.component.html',
  styleUrls: ['./feat.component.scss']
})
export class FeatComponent {

  @Input() feat: Feat;
  featCategory = featCategory;
}
