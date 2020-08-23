import { Component, OnInit, Input } from '@angular/core';
import { Feat } from 'src/app/models/feat';

@Component({
  selector: 'app-feat',
  templateUrl: './feat.component.html',
  styleUrls: ['./feat.component.css']
})
export class FeatComponent implements OnInit {

  @Input() feat: Feat;

  ngOnInit() { }
}
