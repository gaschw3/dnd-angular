import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from "rxjs";
import { Subject } from 'angular-datatables/node_modules/rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';

import { Item } from 'src/app/models/item';
import { ItemComponent } from './item/item.component';
import { typeTable } from '../../shared/itemTypes';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {

  magic: Item[];
  normal: Item[];
  treasure: Item[];
  items: Item[];
  shownItems: Item[];

  currItem: Item;
  selected: string;

  public getJSON(): Observable<any> {
    return this.http.get("assets/data/items.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location) { }

  @ViewChild(ItemComponent) child: ItemComponent;

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions: {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      columnDefs: [
        { width: '60%', targets: 0 },
        { width: '20%', targets: 1 },
        { width: '20%', targets: 2 },
      ],
      autoWidth: false,
      dom: 'trlp',
      orderMulti: true,
      pagingType: "full_numbers",
      searching: true,
      language: {
        lengthMenu: 'Show <select>' +
          '<option value="10">10</option>' +
          '<option value="15">15</option>' +
          '<option value="20">30</option>' +
          '<option value="60">60</option>' +
          '<option value="-1">All</option>' +
          '</select> items',
        paginate: {
          first: "<<",
          last: ">>",
          next: ">",
          previous: "<"
        }
      },
      initComplete: function (settings, json) {
        const api = this.api();
        api.columns().every(function () {
          const column = this;
          const $head = $(column.header());
          const inputContainer = $head.parent().prev().children().get($head.index());
          $(':input', inputContainer).off('keyup change search').on('keyup change search', function (e) {
            const $this = $(this);
            const value = <string>$this.val();
            if (column.search() !== value) {
              column.search(value).draw();
            }
          }).trigger('change');
        });
      }
    };

    this.getJSON().subscribe(items => {
      this.items = items;
      this.items.sort(function (a, b) {
        return (a.name < b.name) ? -1 : 1;
      });
      this.treasure = this.items.filter(f => f.type ? f.type.includes("$") : false);
      this.normal = this.items.filter(f => f.type ? (!f.type.includes("$") && f.rarity.includes("none")) : false);
      this.magic = this.items.filter(f => f.type ? (!f.type.includes("$") && !f.rarity.includes("none")) : true)
      this.shownItems = this.magic;
      this.selected = 'magic';
      this.route.paramMap.subscribe(params => {
        this.currItem = this.items.find(f => f.id == this.route.snapshot.params.itemName);
      });
      setTimeout(() => {
        this.dtTrigger.next();
      });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setCurrItem(clicked): void {
    this.currItem = clicked;
    this.location.go("/items/" + this.currItem.id)
  }

  setItems(choice): void {
    if (choice != this.selected) {
      switch (choice) {
        case 'magic':
          this.shownItems = this.magic;
          break;
        case 'normal':
          this.shownItems = this.normal;
          break;
        case 'treasure':
          this.shownItems = this.treasure;
          break;
        case 'all':
          this.shownItems = this.items;
          break;
      }
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger.next();
      });
      this.selected = choice;
    }
  }

  getValueSort(value): number {
    if (value) {
      return value;
    } else {
      return 1;
    }
  }

  getRaritySort(rarity): number {
    switch (rarity) {
      case "none":
        return 0;
        break;
      case "common":
        return 1;
        break;
      case "uncommon":
        return 2;
        break;
      case "rare":
        return 3;
        break;
      case "very rare":
        return 4;
        break;
      case "legendary":
        return 5;
        break;
      case "artifact":
        return 6;
        break;
    }
    return 0;
  }

  getItemType(item): string {
    let returnType = "";

    if (item.wondrous && item.type) {
      returnType += "Wondrous Item, ";
    } else if (item.wondrous) {
      return "Wondrous Item";
    }

    switch (item.type) {
      case "M": {
        if (item.weaponCategory && item.baseItem) {
          returnType += item.weaponCategory + " Melee Weapon (" + item.baseItem + ")";
        } else if (item.weaponCategory) {
          returnType += item.weaponCategory + " Melee Weapon";
        } else if (item.baseItem) {
          returnType += "Melee Weapon(" + item.baseItem + ")";
        }
        break;
      }
      case "R": {
        if (item.weaponCategory && item.baseItem) {
          returnType += item.weaponCategory + " Ranged Weapon (" + item.baseItem + ")";
        } else if (item.weaponCategory) {
          returnType += item.weaponCategory + " Ranged Weapon";
        } else if (item.baseItem) {
          returnType += "Ranged Weapon(" + item.baseItem + ")";
        }
        break;
      }
      default: {
        returnType += typeTable[item.type];
        break;
      }
    }
    return returnType;
  }
}
