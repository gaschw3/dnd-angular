import { MonsterHelperService } from './../../shared/helpers/monster-helper.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'angular-datatables/node_modules/rxjs';

import { Observable } from 'rxjs';
import { Monster } from 'src/app/models';
import { HelperService } from '../../shared/helpers/helper.service';

@Component({
  selector: 'app-encounter-builder',
  templateUrl: './encounter-builder.component.html',
  styleUrls: ['./encounter-builder.component.scss']
})
export class EncounterBuilderComponent implements OnInit, OnDestroy {

  levelXp: Budget[] = [
    { level: 1,   daily: 100,	  easy: 10,	  medium: 20,		hard: 30,	  deadly: 40 },
    { level: 1,   daily: 300,	  easy: 25,	  medium: 50,		hard: 75,	  deadly: 100 },
    { level: 2,   daily: 600,	  easy: 50,	  medium: 100,	hard: 150,	deadly: 200 },
    { level: 3,   daily: 1200,	easy: 75,	  medium: 150,	hard: 225,	deadly: 400 },
    { level: 4,   daily: 1700,	easy: 125,	medium: 250,	hard: 375,	deadly: 500 },
    { level: 5,   daily: 3500,	easy: 250,	medium: 500,	hard: 750,	deadly: 1100 },
    { level: 6,   daily: 4000,	easy: 300,	medium: 600,	hard: 900,	deadly: 1400 },
    { level: 7,   daily: 5000,	easy: 350,	medium: 750,	hard: 1100,	deadly: 1700 },
    { level: 8,   daily: 6000,	easy: 450,	medium: 900,	hard: 1400,	deadly: 2100 },
    { level: 9,   daily: 7500,	easy: 550,	medium: 1100,	hard: 1600,	deadly: 2400 },
    { level: 10,  daily: 9000,	easy: 600,	medium: 1200,	hard: 1900,	deadly: 2800 },
    { level: 11,  daily: 10500,	easy: 800,	medium: 1600,	hard: 2400,	deadly: 3600 },
    { level: 12,  daily: 11500,	easy: 1000,	medium: 2000,	hard: 3000,	deadly: 4500 },
    { level: 13,  daily: 13500,	easy: 1100,	medium: 2200,	hard: 3400,	deadly: 5100 },
    { level: 14,  daily: 15000,	easy: 1250,	medium: 2500,	hard: 3800,	deadly: 5700 },
    { level: 15,  daily: 18000,	easy: 1400,	medium: 2800,	hard: 4300,	deadly: 6400 },
    { level: 16,  daily: 20000,	easy: 1600,	medium: 3200,	hard: 4800,	deadly: 7200 },
    { level: 17,  daily: 25000,	easy: 2000,	medium: 3900,	hard: 5900,	deadly: 8800 },
    { level: 18,  daily: 27000,	easy: 2100,	medium: 4200,	hard: 6300,	deadly: 9500 },
    { level: 19,  daily: 30000,	easy: 2400,	medium: 4900,	hard: 7300,	deadly: 10900 },
    { level: 20,  daily: 40000,	easy: 2800,	medium: 5700,	hard: 8500,	deadly: 12700 }
  ];

  partySize: any = 1;
  partyLevel: any = 1;
  monsters: Monster[];
  currMonster: Monster;
  monsterName: string;
  min: number;
  max: number;

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/beastiary.json")
  }

  constructor(
    private http: HttpClient,
    public helper: HelperService,
    public monsterHelper: MonsterHelperService) {}

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {

    // Add a new search method to be used on the CR column for a range of numbers
    $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
      const id = parseFloat(data[2]) || 0; // data[2] is the CR column, this should in unit tests
      if ((isNaN(this.min) && isNaN(this.max)) ||
        (isNaN(this.min) && id <= this.max) ||
        (this.min <= id && isNaN(this.max)) ||
        (this.min <= id && id <= this.max)) {
        return true;
      }
      return false;
    });

    this.dtOptions = {
      columnDefs: [
        { width: '5%', orderable: false, targets: 0 },
        { width: '30%', targets: 1 },
        { width: '15%', targets: 2 },
        { width: '15%', targets: 3 },
        { width: '30%', targets: 4 },
        { width: '5%', targets: 5 }
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
        this.monsters = beastiary.monsters;
        setTimeout(() => {
          this.dtTrigger.next();
        });
    });
  }

  ngOnDestroy(): void {
      // We remove the last function in the global ext search array so we do not add the fn each time the component is drawn
      // /!\ This is not the ideal solution as other components may add other search function in this array, so be careful when
      // handling this global variable
      $.fn['dataTable'].ext.search.pop();
    }

  complexCrFilter(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  setCurrMonster(clickedMonster): void {
    this.currMonster = clickedMonster;
  }

}

interface Budget {
  level: number;
  daily: number;
  easy: number;
  medium: number;
  hard: number;
  deadly: number;
}
