import { Component, Input, OnInit } from '@angular/core';
import { featureType, OtherFeature, Prerequisite } from 'src/app/models/otherFeature';
import { IdToNamePipe } from 'src/app/pipes/id-to-name.pipe';

@Component({
  standalone: false,
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss']
})
export class FeatureComponent implements OnInit {

  @Input() feature: OtherFeature;
  id: string;

  idPipe = new IdToNamePipe;
  featureType = featureType;

  ngOnInit() {
    this.id = this.idPipe.transform(this.feature.name);
   }

   getPrereq(prereq: Prerequisite[]): string {
    if (!prereq || prereq.length < 1) {
      return "—";
    } else {
      const ret = [];
      const reqs = prereq[0]; // there is always only one entry at this point
      if (typeof reqs.level != "undefined") {
        if (typeof reqs.level.subclass != "undefined") {
          ret.push("Level " + reqs.level.level + " " + reqs.level.subclass.name + " " + reqs.level.class.name);
        } else {
          ret.push("Level " + reqs.level.level + " " + reqs.level.class.name);
        }
      }
      if (typeof reqs.pact != "undefined") {
        ret.push("Pact of the " + reqs.pact );
      }
      if (typeof reqs.spell != "undefined") {
        ret.push(reqs.spell);
      }
      if (typeof reqs.ability != "undefined") {
        reqs.ability.forEach((obj) => {
          const arr = Object.entries(obj);
          ret.push(`${arr[0][0].replace(/^[a-z]/, (firstChar) => firstChar.toUpperCase())} ${arr[0][1]}`);
        })
      }
      if (typeof reqs.item != "undefined") {
        ret.push(reqs.item[0]);
      }
      if (typeof reqs.feature != "undefined") {
        ret.push(reqs.feature[0]);
      }
      return ret.join(", ");
    }
  }
}

