import { Injectable } from '@angular/core';
import { sizeMap } from 'src/app/shared/sizeMap';
import { alignmentMap } from 'src/app/shared/alignmentMap';

@Injectable({
  providedIn: 'root'
})
export class MonsterHelperService {

  constructor() { }

  sizeMap = sizeMap;
  alignmentMap = alignmentMap;

  //convert "alignment": { "L", "E" }  -> "lawful evil"
  translateAlignment(alignment): string {
    return alignment.map(alignment => this.alignmentMap[alignment]).join(' ');
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
    } else {
      return type;
    }
  }
}
