import { Injectable } from '@angular/core';
import { sizeMap } from 'src/app/shared/helpers/monster/sizeMap';
import { alignmentMap } from 'src/app/shared/helpers/monster/alignmentMap';
import { crXpMap } from './experienceMaps';

@Injectable({
  providedIn: 'root'
})
export class MonsterHelperService {

  constructor() { }

  sizeMap = sizeMap;
  alignmentMap = alignmentMap;
  crXp = crXpMap;

  //convert CR fractions into usable numbers for sorting
  getSortCr(cr: string): number {
    if (cr.match("/")) {
      if (cr == "N/A") {
        return 10000; //some summons don't have a CR, return arbitrary high val so they go to 'bottom'
      } else if (cr.match(/\d\/\d/)) {
        let split = cr.split('/');
        return (parseInt(split[0]) / parseInt(split[1]));
      } else {
        //this is an error state and something bad has happened in the JSON
        console.log("Gound problem CR, returning -1: " + cr);
        return -1;
      }
    } else {
      return parseInt(cr); //non fractional, just use the normal one
    }
  }

  getXpByCr(passedCr: string): number {
    return (this.crXp.find(i => i.cr === passedCr)).xp;
  }

  //convert "alignment": { "L", "E" }  -> "lawful evil"
  translateAlignment(alignment): string {
    let alignString = alignment.map(alignment => this.alignmentMap[alignment]).join(' ');
    return alignString.replace("- ", "-"); //hacky way to remove slashed in "any non-X" situations (
    // eg. alignment: ["NX", "E"] -> 'any non-evil' instead of 'any non- evil')
  }

  translateSize(size): string {
    return this.sizeMap[size];
  }

  //type comes in 3 varieties:
  // "type": "typeName"
  // "type": { "type": "typeName", "tags": { "typeSubName"}}
  // "type": { "type": "typeName", "swarmSize": [ "size" ]}
  // this coverts them all to the appropriate string
  getType(type): string {
    if (type.tags) {
      return `${type.type} (${type.tags[0]})`;
    } else if (type.swarmSize) {
      return `swarm of ${sizeMap[type.swarmSize]} ${type.type}`;
    } else if (type.type && type.type.choose) {
      return type.type.choose.join(", ").replace(/, ([^,]*)$/, ' or $1');
    } else {
      return type;
    }
  }
}
