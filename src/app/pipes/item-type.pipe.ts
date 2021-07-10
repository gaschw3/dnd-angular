import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'itemType'
})
export class ItemTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return typeTable[value] ? typeTable[value] : value;
  }

}

const typeTable = {
  "RD": "Rod",
  "WD": "Wand",
  "S": "Shield",
  "FD": "Food & Drink",
  "WON": "Wondrous Item",
  "AT": "Artisan's Tools",
  "HA": "Heavy Armor",
  "RG": "Ring",
  "TAH": "Tack & Harness",
  "MA": "Medium Armor",
  "LA": "Light Armor",
  "P": "Potion",
  "EXP": "Explosive",
  "SHP": "Vehicle (water)",
  "VEH": "Vehicle (land)",
  "AIR": "Vehicle (air)",
  "GS": "Gaming Set",
  "MNT": "Mount",
  "T": "Tool",
  "M": "Melee Weapon",
  "R": "Ranged Weapon",
  "A": "Ammunition",
  "SC": "Scroll",
  "INS": "Musical Instrument",
  "SCF": "Spellcasting Focus",
  "G": "Adventuring Gear",
  "TG": "Trade Good",
  "$": "Treasure",
  "OTH": "Other"
}
