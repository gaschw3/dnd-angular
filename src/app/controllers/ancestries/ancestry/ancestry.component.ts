import { Component, OnInit, Input } from '@angular/core';
import { Ancestry } from 'src/app/models/ancestry';

@Component({
  selector: 'app-ancestry',
  templateUrl: './ancestry.component.html',
  styleUrls: ['./ancestry.component.css']
})
export class AncestryComponent implements OnInit {

  @Input() ancestry: Ancestry;

  ngOnInit() {}
}

