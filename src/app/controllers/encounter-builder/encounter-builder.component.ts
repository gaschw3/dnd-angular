import { MonsterHelperService } from '../../shared/helpers/monster/monster-helper.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';

import { Observable, Subject } from 'rxjs';
import { Monster } from 'src/app/models';
import { HelperService } from '../../shared/helpers/helper.service';
import { crXpMap, levelXp } from 'src/app/shared/helpers/monster/experienceMaps';
import { ActivatedRoute } from '@angular/router';
import { ADTSettings } from 'angular-datatables/src/models/settings';

@Component({
  selector: 'app-encounter-builder',
  templateUrl: './encounter-builder.component.html',
  styleUrls: ['./encounter-builder.component.scss']
})
export class EncounterBuilderComponent implements OnInit, OnDestroy {

  levelXp = levelXp;
  crXp = crXpMap;

  //bound variables for party size
  partySize: any = 5;
  partyLevel: any = 9;
  //derived variables used to calculate and show total XP values
  singleMultiplier:number = 1;
  pairMultiplier: number = 1;
  groupMultiplier: number = 1;
  hordeMultiplier: number = 1;
  encounterXp: number = 0;
  adjustedXp: number = 0;
  currEncounterDifficulty: string = "trivial";
  currPartyDifficulty: PartyDifficulty;

  //used for sorting on CR more complexly
  min: number = null;
  max: number = null;

  //toggle show/hide monster table to change button text
  showMonsterTable: boolean = true;

  //various monsters show in table, card, or encounter areas
  currMonster: Monster;
  monsters: Array<Monster>;
  currEncounter: Array<EncounterMonster> = [];

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/beastiary.json")
  }

  constructor(
    private http: HttpClient,
    public helper: HelperService,
    private route: ActivatedRoute,
    public monsterHelper: MonsterHelperService) {}

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<ADTSettings> = new Subject();

  ngOnInit(): void {

    // Add a new search method to be used on the CR column for a range of numbers
    $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
      const id = parseFloat(data[2]) || 0; // data[2] is the CR column, this should in unit tests
      if ( (this.min == null && this.max == null)
        || (this.min == null && id <= this.max)
        || (this.min <= id && this.max == null)
        || (this.min <= id && id <= this.max)) {
        return true;
      }
      return false;
    });

    this.dtOptions = {
      columnDefs: [
        { width: '5%', sortable: false, orderable: false, targets: 0 },
        { width: '30%', targets: 1 },
        { width: '15%', targets: 2 },
        { width: '15%', targets: 3 },
        { width: '30%', targets: 4 },
        { width: '5%', targets: 5 }
      ],
      autoWidth: false,
      scrollX: true,
      dom: 'trpl',
      paging: true,
      orderMulti: true,
      pagingType: "full_numbers",
      searching: true,
      order: [1, "asc"],
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
          if ($head.index() === 0 || $head.index() === 2) {
            return true;
          }
          const inputContainer = $head.parent().prev().children().get($head.index());
          $(':input', inputContainer).off('keyup change search').on('keyup change search', function(e) {
            const $this = $(this);
            const colIndex = $(column.header()).index();
            if (colIndex === 2) {
              //intentionally blank, I don't want this search method for the CR column
            } else {
              const value = <string>$this.val();
              if (column.search() !== value) {
                column.search(value).draw();
              }
            }
          }).trigger('change');
        });
      }
    };

    this.getJSON().subscribe(beastiary => {
        this.monsters = beastiary.monsters.filter(f => f.cr !== "N/A");
        setTimeout(() => {
          this.dtTrigger.next(this.dtOptions);
        });
    });
    this.recalcPartyDifficulty();
  }

  ngOnDestroy(): void {
    // We remove the last function in the global ext search array so we do not add the fn each time the component is drawn
    // /!\ This is not the ideal solution if other components add search function in this array, so be careful
    $.fn['dataTable'].ext.search.pop();
    this.dtTrigger.unsubscribe();
  }

  complexCrFilter(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  setCurrMonster(clickedMonster): void {
    this.currMonster = clickedMonster;
  }

  addMonster(clickedMonster: Monster): void {
    let newMonster = { monster: clickedMonster, number:1 };
    let monsterInCurrEncounter = this.currEncounter.find(encEntry => encEntry.monster == clickedMonster);
    if (monsterInCurrEncounter) {
      monsterInCurrEncounter.number++;
    } else {
      this.currEncounter.push(newMonster);
    }
    this.recalcEncounterXp()
  }

  encounterChange(index:number, change: number) {
    this.currEncounter[index].number += change;
    if (this.currEncounter[index].number < 1) {
      this.currEncounter.splice(index, 1);
    }
    this.recalcEncounterXp();
  }

  clearEncounter(): void {
    //reset current counter, is this okay?
    this.currEncounter = [];
    this.recalcEncounterXp();
  }

  //this function is so complex, why is D&D experience calculated this way? It's actually insane.
  recalcPartyDifficulty() {
    let mediumXp = levelXp[this.partyLevel].medium * this.partySize
    if ( this.partySize < 3 ) { // For small groups, increase multiplier
      this.singleMultiplier  = 1.5;
      this.groupMultiplier   = 2;
      this.groupMultiplier   = 2.5;
      this.hordeMultiplier   = 3;
    } else if ( this.partySize > 5 ) { // For large groups, reduce multiplier
      this.singleMultiplier  = 0.5;
      this.pairMultiplier    = 1;
      this.groupMultiplier   = 1.5;
      this.hordeMultiplier   = 2;
    } else { //default for more standard party sizes
      this.singleMultiplier  = 1;
      this.pairMultiplier    = 1.5;
      this.groupMultiplier   = 2;
      this.hordeMultiplier   = 2.5;
    }

    this.currPartyDifficulty = {
      deadly: (levelXp[this.partyLevel].deadly * this.partySize) / this.singleMultiplier,
      hard: (levelXp[this.partyLevel].hard * this.partySize) / this.singleMultiplier,
      medium: mediumXp / this.singleMultiplier,
      easy: (levelXp[this.partyLevel].easy * this.partySize) / this.singleMultiplier,
      pair: mediumXp / (2 * this.pairMultiplier),
      group: mediumXp / (4 * this.groupMultiplier),
      trivial: mediumXp / (8 * this.hordeMultiplier),
    }
    this.recalcEncounterXp();
  }

  //this function is so complex, why is D&D experience calculated this way? It's actually insane.
  recalcEncounterDifficulty(adjXp: number) {
    if (adjXp < this.currPartyDifficulty.easy) {
      return "trivial"
    } else if (adjXp < this.currPartyDifficulty.medium) {
      return "easy"
    } else if (adjXp < this.currPartyDifficulty.hard) {
      return "medium"
    } else if (adjXp < this.currPartyDifficulty.deadly) {
      return "hard"
    } else if (adjXp >= this.currPartyDifficulty.deadly) {
      return "deadly"
    }
  }

  recalcEncounterXp(): void {
    let totalXp = 0, totalMonters = 0;
    for (let m of this.currEncounter) {
      let matchingCr = (this.crXp.find(i => i.cr === m.monster.cr));
      totalXp += matchingCr.xp * m.number;
      totalMonters += m.number;
    }
    this.encounterXp = totalXp;
    this.adjustedXp = totalXp * this.getMultiplier(totalMonters);
    this.currEncounterDifficulty = this.recalcEncounterDifficulty(this.adjustedXp);
  }

  getMultiplier(monsterCount: number) {
    let partySize = this.partySize
    let multiplierCategory,
      multipliers = [
        0.5,
        1,
        1.5,
        2,
        2.5,
        3,
        4,
        5,
      ];

    if ( monsterCount === 0 ) {
      return 0;
    } else if ( monsterCount === 1 ) {
      multiplierCategory = 1;
    } else if ( monsterCount === 2 ) {
      multiplierCategory = 2;
    } else if ( monsterCount < 7 ) {
      multiplierCategory = 3;
    } else if ( monsterCount < 11 ) {
      multiplierCategory = 4;
    } else if ( monsterCount < 15 ) {
      multiplierCategory = 5;
    } else {
      multiplierCategory = 6;
    }

    if ( partySize < 3 ) { // Increase multiplier for parties of one and two
      multiplierCategory++;
    } else if ( partySize > 5 ) { // Decrease multiplier for parties of six through eight
      multiplierCategory--;
    }

    return multipliers[multiplierCategory];
  }

  getMonsterDifficulty(cr: string) {
    if (cr === "N/A") {
      return "trivial"
    }
    if (cr.includes("(")) { //contains extra text for lair or coven or etc.
      cr = cr.split(' (')[0];
    }

    let monsterXp = (this.crXp.find(i => i.cr === cr)).xp;
    if ( monsterXp >  this.currPartyDifficulty.deadly ) {
        return "deadly";
    } else if ( monsterXp >  this.currPartyDifficulty.hard ) {
        return "hard";
    } else if ( monsterXp >  this.currPartyDifficulty.medium ) {
        return "medium";
    } else if ( monsterXp > this.currPartyDifficulty.easy ) {
        return "easy";
    } else if ( monsterXp >  this.currPartyDifficulty.pair ) {
        return "pair";
    } else if ( monsterXp > this.currPartyDifficulty.group ) {
        return "group";
    } else {
        return "trivial";
    }
  }
}

interface EncounterMonster {
  monster: Monster;
  number: number;
}

interface PartyDifficulty {
  deadly: number,
  hard: number,
  medium: number,
  easy: number,
  pair: number,
  group: number,
  trivial: number,
}