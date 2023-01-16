import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { forkJoin, Observable, Subject } from 'rxjs';

import { Class, Spell } from 'src/app/models';
import { HelperService } from 'src/app/shared/helpers/helper.service';

@Component({
  templateUrl: './spellbook.component.html',
  styleUrls: ['./spellbook.component.scss']
})
export class SpellbookComponent implements OnInit, AfterViewInit, OnDestroy {

  spells: Spell[] = [];
  currSpells: Spell[];

  level: number = 4;
  spellMod: number = 3;
  levelTable: number[] = [];
  levelKey: string[] = [];
  Math: any = Math;
  showSpellTable: boolean = true;

  classes: Class[];
  currClass: Class;
  subclasses: any;
  currSubclass: string;

  public getClassJSON(): Observable<any> {
      return this.http.get("assets/data/classData.json")
  }

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/spellData.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    public helper: HelperService) {

    }

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      columnDefs: [
        { width: '5%', sortable: false, orderable: false, targets: 0 },
        { width: '55%', targets: 1 },
        { width: '15%', targets: 2 },
        { width: '15%', targets: 3 },
        { width: '10%', targets: 4 }
      ],
      autoWidth: false,
      scrollX: true,
      dom: 'trpl',
      paging: true,
      orderMulti: true,
      pagingType: "full_numbers",
      searching: true,
      pageLength: -1,
      order: [2, "asc"],
      language: {
        lengthMenu: 'Show <select>'+
        '<option value="-1">All</option>'+
        '<option value="10">10</option>'+
        '<option value="15">15</option>'+
        '<option value="20">30</option>'+
        '<option value="60">60</option>'+
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
          const inputContainer = $head.parent().prev().children().get($head.index()+1);
          $('table :input', inputContainer).off('keyup change search').on('keyup change search', function(e) {
            const $this = $(this);
            const value = <string>$this.val();
            if (column.search() !== value) {
              console.log(value);
              column.search(value).draw();
            }
          }).trigger('change');
        });
      }
    };

    const combined = forkJoin([
        this.getJSON(),
        this.getClassJSON()
    ]);
    combined.subscribe((response) => {
        let spells = response[0];
        let classes = response[1];
        spells.spell.forEach(spell => this.spells.push(new Spell(spell)));
        this.classes = classes.filter(c => c.name != "Barbarian" && c.name != "Monk");
        this.currClass = this.classes[0];
        this.levelKey = this.currClass.levelTable[0];
        this.currClass.levelTable[this.level].forEach(cell => {
          this.levelTable.push(parseInt(cell));
        });
        this.setSubclassOptions();
        this.setClassSpellList();
        setTimeout(() => {
          this.dtTrigger.next();
        });
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setClassSpellList() {
    let classSpellLevel = 0;
    if (this.currClass.name == "Rogue" || this.currClass.name == "Fighter") {
      classSpellLevel = Math.ceil(this.level/6);
    } else if (this.currClass.name == "Paladin" || this.currClass.name == "Ranger") {
      classSpellLevel = Math.ceil(this.level/4);
    } else {
      classSpellLevel = Math.ceil(this.level/2);
    }
    this.currSpells = this.spells.filter(f =>
      ((f.classes.indexOf(this.currClass.name) != -1) || (f.classes.indexOf(this.currClass.name + " (" + this.currSubclass + ")") != -1))
      && (parseInt(f.level) <= classSpellLevel));
  }

  redrawTable() {
    this.levelKey = this.currClass.levelTable[0];
    this.levelTable = [];
    this.currClass.levelTable[this.level].forEach(cell => {
      this.levelTable.push(parseInt(cell));
    });
    this.setSubclassOptions();
    this.setClassSpellList();
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // This causes an annoying screen flash, but I can't find any other way to do it that works
      // ideally I'd 'pause' rendering, finish this, then actually redraw the screen but I can't figure out if that easily possible
      dtInstance.destroy(false);
      this.dtTrigger.next();
    });
  }

  setSubclassOptions() {
    if (this.currClass.name == "Fighter") {
      this.subclasses = {'name':'Eldritch Knight', 'val':'E.Knight'};
      this.currSubclass = "E.Knight";
    } else if (this.currClass.name == "Rogue") {
      this.subclasses = {'name':'Arcane Trickster', 'val':'Trickster'};
      this.currSubclass = "Trickster";
    } else {
      this.subclasses = this.currClass.features.filter(f => f.filter == "yes").map(f =>
        {
          let rObj = {};
          rObj["name"] = f.title;
          rObj["val"] = this.titlecase(f.name);
          if (this.spells.findIndex(s => s.classes.includes(this.currClass.name + ' (' + rObj["val"] + ')' )) > -1) {
            return rObj;
          }
        }
      ).filter(f => f !== undefined);
    }
  }

  hasSubclassSpells(): boolean {
    return ["Cleric","Druid","Paladin","Ranger","Sorcerer","Warlock"].indexOf(this.currClass.name) > -1;
  }

  titlecase(str): string {
    return str.toLowerCase().split(' ').map(function(word) {
      return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
  }

  addSpell(spell) {

  }

}