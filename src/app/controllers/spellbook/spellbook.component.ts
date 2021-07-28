import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Observable } from 'rxjs';
import { Subject } from 'angular-datatables/node_modules/rxjs';

import { Spell } from 'src/app/models';

@Component({
  templateUrl: './spellbook.component.html',
  styleUrls: ['./spellbook.component.scss']
})
export class SpellbookComponent implements OnInit {

  spells: Spell[];
  currSpells: Spell[];

  level: number = 1;
  showSpellTable: boolean = true;

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/spellData.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute) {

    }

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      columnDefs: [
        { width: '60%', targets: 0 },
        { width: '15%', targets: 1 },
        { width: '15%', targets: 2 },
        { width: '10%', targets: 3 }
      ],
      autowidth: false,
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
        '</select> spells',
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
          $('table :input', inputContainer).off('keyup change search').on('keyup change search', function(e) {
            const $this = $(this);
            const value = <string>$this.val();
            if (column.search() !== value) {
              column.search(value).draw();
            }
          }).trigger('change');
        });
      }
    };

    this.getJSON().subscribe(spells => {
        this.spells = spells;
        this.setClassSpellList();
        setTimeout(() => {
          this.dtTrigger.next();
        });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setClassSpellList() {
    this.currSpells = this.spells.filter(f => (f.classes.indexOf("Cleric") != -1));
    this.currSpells = this.currSpells.filter(f => parseInt(f.level) <= this.level);
  }

}

class spellObject {
  constructor(type: casterType, mod: number, level: number) {
    //
   }

  class: string;
  subclass: string;
  spellList: Spell[];
  selectedSpells: Spell[];
  freeSpells:Spell[];
  spelLevels: SpellLevel[];
}

enum casterType {
  FULL = "full",
  HALF = "half",
  THIRD = "third"
}

interface SpellLevel {
  level: number;
  slots?: number;
}