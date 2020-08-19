import { Component, OnInit, Input } from '@angular/core';
import { Monster } from 'src/app/models/monster';

@Component({
  selector: 'app-monster',
  templateUrl: './monster.component.html',
  styleUrls: ['./monster.component.css']
})
export class MonsterComponent implements OnInit {
  
  @Input() monster: Monster;

  ccId: number = 0; //current class id

  constructor() {
  }

  ngOnInit() {
  }

  getStatMod(stat){
    let sign = "+"
    let mod = Math.floor((parseInt(stat, 10) - 10)/2);
    (mod >= 0) ? sign = "+" : sign = "";
    return sign+mod;
  }
}
