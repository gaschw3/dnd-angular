import { Component, OnInit, Input } from '@angular/core';
import { Item } from 'src/app/models/item';
import { typeTable } from '../../../shared/itemTypes';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  @Input() item: Item;

  damageType = {
    "B": "bludgeoning",
    "P": "piercing",
    "S": "slashing",
    "Y": "psychic"
  }

  itemProps = {
    "A": "ammunition",
    "F": "finesse",
    "2H": "two-handed",
    "L": "light",
    "H": "heavy",
    "R": "reach",
    "S": "special",
    "LD": "loading",
    "V": "versatile"
  }

  isSimpleList(items): boolean {
    if (typeof items[0] === 'string') {
      return true;
    } else {
      return false;
    }
  }

  getEntryType(entry): string {
    if (entry.type) {
      if (entry.type == "list") {
        return "list";
      } else if (entry.type == "table") {
        return "table";
      } else if (entry.type == "item") {
        return "item";
      } else if (entry.type == "entries") {
        return "entries";
      }
    } else {
      return "";
    }
  }

  getItemDamage(item): string {
    let dmgString = "";
    dmgString += item.dmg1;
    dmgString += " " + this.damageType[item.dmgType];
    if (item.property) {
      let properties = [];
      item.property.forEach(element => {
        switch(element) {
          case "A":
            properties.push("ammunition (" + item.range + ")");
            break;
          case "T":
            properties.push("thrown (" + item.range + ")");
            break;
          case "V":
            properties.push("versatile (" + item.dmg2 + ")");
            break;
          default:
            properties.push(this.itemProps[element]);
        }
      })
      dmgString += " - " + properties.join(", ");
    }
    return dmgString;
  }

  getItemInfo(item): string {
    let itemInfo = [];
    itemInfo.push(this.getItemType(item));
    itemInfo.push(this.getItemRarity(item));
    return itemInfo.filter(Boolean).join(", ");
  }

  getItemType(item): string {
    let itemInfo = "";

    if (item.wondrous && item.type) {
      itemInfo += "Wondrous item, ";
    } else if (item.wondrous) {
      return "Wondrous item";
    }

    switch (item.type) {
      case "M": {
        if (item.weaponCategory && item.baseItem) {
          itemInfo += item.weaponCategory + " melee weapon (" + item.baseItem + ")";
        } else if (item.weaponCategory) {
          itemInfo += item.weaponCategory + " melee weapon";
        } else if (item.baseItem) {
          itemInfo += "melee weapon(" + item.baseItem + ")";
        }
        break;
      }
      case "R": {
        if (item.weaponCategory && item.baseItem) {
          itemInfo += item.weaponCategory + " ranged weapon (" + item.baseItem + ")";
        } else if (item.weaponCategory) {
          itemInfo += item.weaponCategory + " ranged weapon";
        } else if (item.baseItem) {
          itemInfo += "ranged weapon (" + item.baseItem + ")";
        }
        break;
      }
      case "HA":
      case "MA":
      case "LA": {
        if (item.baseItem) {
          itemInfo += typeTable[item.type] + " (" + item.baseItem + ")";
        } else {
          itemInfo += typeTable[item.type];
        }
        break;
      }
      default: {
        itemInfo += typeTable[item.type];
        break;
      }
    }
    return itemInfo.charAt(0).toUpperCase() + itemInfo.slice(1);
  }

  getItemRarity(item) {
    let itemRarity = "";
    if (item.rarity && item.rarity !== "none") {
      itemRarity += item.rarity;
    }
    if (item.reqAttune) {
      if (item.reqAttune == true) {
        itemRarity += " (requires attunement)";
      } else {
        itemRarity += " (requires attunement " + item.reqAttune + ")"
      }
    }
    return itemRarity;
  }

  ngOnInit() { }
}

