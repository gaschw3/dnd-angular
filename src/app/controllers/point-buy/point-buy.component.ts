import { Component, OnInit } from '@angular/core';
import { Ancestry } from 'src/app/models/ancestry';

import { Subject, Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  str: number = 8;
  dex: number = 8;
  con: number = 8;
  int: number = 8;
  wis: number = 8;
  cha: number = 8;

  // storage for ancestry related boosts
  anStr: number = 0;
  anDex: number = 0;
  anCon: number = 0;
  anInt: number = 0;
  anWis: number = 0;
  anCha: number = 0;

  constructor(private http: HttpClient,
    private fb: FormBuilder) { this.updatePercentage();}

  ngOnInit() {
    this.updatePercentage();
    this.getJSON().subscribe(ancestries => {
      this.ancestries = ancestries;
    });

    this.ancestryForm = this.fb.group({
      ancestryControl: ['choose']
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
      ancestry.str ? this.anStr = ancestry.str : this.anStr = 0;
      ancestry.dex ? this.anDex = ancestry.dex : this.anDex = 0;
      ancestry.con ? this.anCon = ancestry.con : this.anCon = 0;
      ancestry.int ? this.anInt = ancestry.int : this.anInt = 0;
      ancestry.wis ? this.anWis = ancestry.wis : this.anWis = 0;
      ancestry.cha ? this.anCha = ancestry.cha : this.anCha = 0;
    }
  }

}
