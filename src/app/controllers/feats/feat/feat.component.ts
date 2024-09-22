import { Component, OnInit, Input } from '@angular/core';
import { Feat, featCategory } from 'src/app/models/feat';

@Component({
  selector: 'app-feat',
  templateUrl: './feat.component.html',
  styleUrls: ['./feat.component.scss']
})
export class FeatComponent implements OnInit {

  @Input() feat: Feat;
  featCategory = featCategory;

  ngOnInit() { }
}
