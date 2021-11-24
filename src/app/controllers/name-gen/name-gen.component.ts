import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { PouchdbService } from 'src/app/services/pouchdb.service';

@Component({
  selector: 'app-name-gen',
  templateUrl: './name-gen.component.html',
  styleUrls: ['./name-gen.component.scss']
})
export class NameGenComponent implements OnInit {

  lengthLowVal: number = 4;
  lengthHighVal: number = 11;
  lengthOptions: Options = {
    floor: 3,
    ceil: 15,
    noSwitching: true
  };

  lookbackVal: number = 4;
  lookbackOptions: Options = {
    floor: 1,
    ceil: 5
  };

  constructor(private dbService: PouchdbService) {
    dbService.getDictionaries();
  }

  ngOnInit(): void {
  }

}
