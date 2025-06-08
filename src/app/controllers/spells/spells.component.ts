import { Component, OnInit, ViewChild } from '@angular/core';
import {Location} from '@angular/common';
import { forkJoin, Observable, Subject } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { SpellComponent } from './spell/spell.component';
import { DataTableDirective } from 'angular-datatables';
import { Spell } from 'src/app/models/spell';
import { ADTSettings } from 'angular-datatables/src/models/settings';

@Component({
  selector: 'app-spells',
  templateUrl: './spells.component.html',
  styleUrls: ['./spells.component.scss']
})
export class SpellsComponent implements OnInit {

  spells: Spell[] = [];
  currSpell: Spell;
  spellName: string;

  public getSourceJSON(): Observable<any> {
    return this.http.get("assets/data/2024/spellSource.json")
}

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/2024/spells-small.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location) {}

  @ViewChild(SpellComponent) child: SpellComponent;

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<ADTSettings> = new Subject();

  ngOnInit(): void {
    let route = this.route.queryParams;
    this.dtOptions = {
      columnDefs: [
        { width: '30%', targets: 0 },
        { width: '7%', targets: 1 },
        { width: '5%', targets: 2 },
        { width: '7%', targets: 3 },
        { width: '7%', targets: 4 },
        { width: '41%', orderable: false, targets: 5 },
        { width: '5%', targets: 6 }
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

        route.subscribe(params => {
          for (var param in params) {
            $(`#${param}`).val(params[param]); //fill in text boxes with query params
          }
        });
        api.columns().every(function() {
          const column = this;
          const $head = $(column.header());
          const inputContainer = $head.parent().prev().children().get($head.index());
          $(':input', inputContainer).off('keyup change search').on('keyup change search', function(e) {
            const $this = $(this);
            const value = <string>$this.val();
            if (column.search() !== value) {
              column.search(value,true,false).draw(); //text, regex, smartSearch
            }
          }).trigger('change');
        });
      }
    };

    const combined = forkJoin([
      this.getJSON(),
      this.getSourceJSON()
    ]);
    combined.subscribe((response) => {
      let spells = response[0];
      let spellSource = response[1];
      spells.spell.forEach(spell => this.spells.push(new Spell(spell, spellSource[spell.name.toLowerCase()])));
      this.route.paramMap.subscribe(params => {
        this.currSpell = this.spells.find(f => f.id == this.route.snapshot.params.spellName);
      });
      setTimeout(() => {
        this.dtTrigger.next(this.dtOptions);
      });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setCurrSpell(clickedSpell): void {
    this.currSpell = clickedSpell;
    this.location.go("/spells/" + this.currSpell.id)
  }

  goBack() {
    this.location.back();
  }
}
