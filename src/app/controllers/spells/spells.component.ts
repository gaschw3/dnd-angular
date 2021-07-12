import { Component, OnInit, ViewChild } from '@angular/core';
import {Location} from '@angular/common'; 
import { Observable } from 'rxjs';
import { Subject } from 'angular-datatables/node_modules/rxjs';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Params } from '@angular/router';
import { SpellComponent } from './spell/spell.component';
import { DataTableDirective } from 'angular-datatables';
import { Spell } from 'src/app/models/spell';

@Component({
  selector: 'app-spells',
  templateUrl: './spells.component.html',
  styleUrls: ['./spells.component.scss']
})
export class SpellsComponent implements OnInit {

  spells: Spell[];
  currSpell: Spell;
  spellName: string;

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/spellData.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location) {}

  @ViewChild(SpellComponent) child: SpellComponent ; 

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      columnDefs: [
        { width: '45%', targets: 0 },
        { width: '7%', targets: 1 },
        { width: '10%', targets: 2 },
        { width: '35%', orderable: false, targets: 3 },
        { width: '5%', targets: 4 }
      ],
      autoWidth: false,
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

    this.getJSON().subscribe(spells => {
        this.spells = spells;
        this.route.paramMap.subscribe(params => {
          this.currSpell = this.spells.find(f => f.id == this.route.snapshot.params.spellName);
        });
        setTimeout(() => {
          this.dtTrigger.next();
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
