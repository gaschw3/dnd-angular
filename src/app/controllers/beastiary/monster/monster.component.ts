import { Component, Input } from '@angular/core';
import { Monster } from 'src/app/models/monster';
import { sizeMap } from 'src/app/shared/sizeMap';

@Component({
  selector: 'app-monster',
  templateUrl: './monster.component.html',
  styleUrls: ['./monster.component.scss']
})
export class MonsterComponent {

  @Input() monster: Monster;

  //probably bad, but done for convenience to acces const import in the template
  sizeMap = sizeMap

  alignmentMap = {
    "A": "any alignment",
    "U": "unaligned",
    "N": "neutral",
    "G": "good",
    "E": "evil",
    "L": "lawful",
    "C": "chaotic"
  }

  isObject(val): boolean { return typeof val === 'object'; }

  //get stat mods calculated teh D&D way 10 = 0, 12 = +1, 13 = +1, 14 = +2, 8 = -1, etc.
  getStatMod(stat){
    let sign = "+"
    let mod = Math.floor((parseInt(stat, 10) - 10)/2);
    (mod >= 0) ? sign = "+" : sign = "";
    return sign+mod;
  }

  //convert "alignment": { "L", "E" }  -> "lawful evil"
  translateAlignment(alignment): String {
    return alignment.map(alignment => this.alignmentMap[alignment]).join(' ');
  }

  //type comes in 3 varieties:
  // "type": "typeName"
  // "type": { "type": "typeName", "tags": { "typeSubName"}}
  // "type": { "type": "typeName", "swarmSize": [ "size" ]}
  // this coverts them all to teh appropriate string
  getType(type): String {
    if (type.tags) {
      return `${type.type} (${type.tags[0]})`;
    } else if (type.swarmSize) {
      return `swarm of ${sizeMap[type.swarmSize]} ${type.type}`;
    } else {
      return type;
    }
  }
}
