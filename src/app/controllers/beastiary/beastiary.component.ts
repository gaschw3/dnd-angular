import { Component, OnInit, ViewChild } from '@angular/core';
import {Location} from '@angular/common';
import { Observable, Subject } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Params } from '@angular/router';
import { MonsterComponent } from './monster/monster.component';
import { DataTableDirective } from 'angular-datatables';
import { Monster } from 'src/app/models/monster';
import { sizeMap } from 'src/app/shared/helpers/monster/sizeMap';
import { ADTSettings } from 'angular-datatables/src/models/settings';

@Component({
  selector: 'app-beastiary',
  templateUrl: './beastiary.component.html',
  styleUrls: ['./beastiary.component.scss']
})
export class BeastiaryComponent implements OnInit {

  monsters: Monster[];
  currMonster: Monster;
  monsterName: string;

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/beastiary.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location) {}

  @ViewChild(MonsterComponent) child: MonsterComponent ;

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<ADTSettings> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      columnDefs: [
        { width: '30%', targets: 0 },
        { width: '10%', targets: 1 },
        { width: '30%', targets: 2 },
        { width: '25%', orderable: false, targets: 3 },
        { width: '5%', targets: 4 }
      ],
      autoWidth: false,
      scrollX: true,
      dom: 'trpl',
      paging: true,
      orderMulti: true,
      pagingType: "full_numbers",
      searching: true,
      language: {
        lengthMenu: 'Show <select>'+
        '<option value="10">10</option>'+
        '<option value="15">15</option>'+
        '<option value="20">30</option>'+
        '<option value="60">60</option>'+
        '<option value="-1">All</option>'+
        '</select> monsters',
        paginate: {
          first:      "<<",
          last:       ">>",
          next:       ">",
          previous:   "<"
        }
      },
      initComplete: function(settings, json) {
        const api = this.api();
        api.columns().every(function() {
          const column = this;
          const $head = $(column.header());
          const inputContainer = $head.parent().prev().children().get($head.index());
          $(':input', inputContainer).off('keyup change search').on('keyup change search', function(e) {
            const $this = $(this);
            const value = <string>$this.val();
            if (column.search() !== value) {
              column.search(value).draw();
            }
          }).trigger('change');
        });
      }
    };

    this.getJSON().subscribe(beastiary => {
        this.monsters = beastiary.monsters;
        this.monsters.forEach(monster => monster.id ? null : monster.id = monster.name.toLowerCase().replace(/['\/]/g,'').replace(/\W/g, '-')); //TODO: this is yucky, should be done in monster.ts class Monster
        this.route.paramMap.subscribe(params => {
          this.currMonster = this.monsters.find(f => f.id == this.route.snapshot.params.monsterName);
        });
        setTimeout(() => {
          this.dtTrigger.next(this.dtOptions);
        });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setCurrMonster(clickedMonster): void {
    this.currMonster = clickedMonster;
    this.location.go("/beastiary/" + this.currMonster.id)
  }

  getType(type): String {
    if (type) {
      if (type.tags) {
        return `${type.type} (${type.tags[0]})`;
      } else if (type.swarmSize) {
        return `swarm of ${sizeMap[type.swarmSize]} ${type.type}`;
      } else if (type.type) {
        return type.type;
      } else {
        return type;
      }
    }
  }

  goBack() {
    this.location.back();
  }
}