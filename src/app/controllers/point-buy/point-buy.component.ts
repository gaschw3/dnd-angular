import { Component, OnInit, ViewChild } from '@angular/core';
import { Ancestry } from '../../models/ancestry';

import { Subject, Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';


interface Stat {
  name: string,
  value: number
}

@Component({
  selector: 'app-point-buy',
  templateUrl: './point-buy.component.html',
  styleUrls: ['./point-buy.component.css']
})
export class PointBuyComponent implements OnInit {

  ancestryForm: FormGroup;

  ancestries: Ancestry[];
  selectedAncestry: Ancestry;

  public getJSON(): Observable<any> {
    return this.http.get("assets/data/ancestryData.json")
  }

  // default value for point buy is 27
  pointsSpent : number = 0;
  totalPoints: number = 27;

  // stats start at 8 by default
  stats: Array<Stat> = [
    {name: "str", value: 8},
    {name: "dex", value: 8},
    {name: "con", value: 8},
    {name: "int", value: 8},
    {name: "wis", value: 8},
    {name: "cha", value: 8},
  ]

  // storage for ancestry related boosts
  ancestryStats: Array<Stat> = [
    {name: "str", value: 0},
    {name: "dex", value: 0},
    {name: "con", value: 0},
    {name: "int", value: 0},
    {name: "wis", value: 0},
    {name: "cha", value: 0},
  ]

  //starting values and store for races where you choose stat bonuses
  anChoose: number = 0;
  choose: number = 0;

  constructor(private http: HttpClient,
    private fb: FormBuilder) { this.updatePercentage();}

  ngOnInit() {
    this.updatePercentage();
    this.getJSON().subscribe(ancestries => {
      this.ancestries = ancestries;
    });
  }

  updatePercentage() {
    $(".progress").each(function () {
      var value = $(this).attr('data-value');
      var left = $(this).find('.progress-left .progress-bar');
      var right = $(this).find('.progress-right .progress-bar');

      if (parseInt(value) > 0) {
        if (parseInt(value) <= 50) {
          right.css('transform', 'rotate(' + percentageToDegrees(value) + 'deg)')
        } else {
          right.css('transform', 'rotate(180deg)')
          left.css('transform', 'rotate(' + percentageToDegrees(parseInt(value) - 50) + 'deg)')
        }
      }

    })

    function percentageToDegrees(percentage) {
      return percentage / 100 * 360
    }
  }

  getPercentage() {
    return Math.floor(((this.totalPoints - this.pointsSpent) / this.totalPoints) * 100);
  }

  getMod(stat) {
    return Math.floor( (stat-10)/2 );
  }

  setCurrAncestry(ancestry) {
    if (ancestry) {
      for (let anStat of this.ancestryStats) {
        ancestry[anStat.name] ? anStat.value = ancestry[anStat.name] : anStat.value = 0;
      }
      ancestry.choose ? this.choose = ancestry.choose : this.choose = 0;
    }
  }

  chooseStats(event) {
    this.anChoose = $('input:checkbox:checked').length;
    if(event.target.checked === true){
      if (this.anChoose <= this.choose) {
        this.anChoose++;
        for (let anStat of this.ancestryStats) {
          if (event.target.value == anStat.name) {
            anStat.value += 1;
          }
        }
      } else {
          event.target.checked = false;
      }
    } else if (this.anChoose > -1) {
      this.anChoose--;
      for (let anStat of this.ancestryStats) {
        if (event.target.value == anStat.name) {
          anStat.value -= 1;
        }
      }
    }
  }

  calculatePoints() {
    this.pointsSpent = 0;
    for (let stat of this.stats) {
      this.validateStat(stat);
      this.pointsSpent += this.pointCost(stat.value);
    }
    this.updatePercentage();
  }

  pointCost(stat) {
    if (stat > 7 && stat < 14) {
        return stat - 8;
    } else if (stat == 14) {
        return 7;
    } else if (stat == 15) {
        return 9;
    }
  }

  // don't allow illegal values in the input fields
  validateStat(stat) {
    if (stat.value < 8) {
      stat.value = 8;
    } else if (stat.value > 15) {
      stat.value = 15;
    } else {
      return;
    }
  }

  // don't allow illegal values in the input fields
  getAnStat(statName) {
    return (this.ancestryStats.filter(anStat => anStat.name == statName))[0].value;
  }

  // return absolute value so that positive and negative stats can use same 'over50' calc
  abs(number) {
    return Math.abs(number);
  }

}
