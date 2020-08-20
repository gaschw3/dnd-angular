import { Component, OnInit, ViewChild } from '@angular/core';
import {Location} from '@angular/common'; 
import { Subject, Observable } from "rxjs";

import { HttpClient } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';
import { BackgroundComponent } from './background/background.component';
import { Background } from 'src/app/models/background';

@Component({
  selector: 'app-backgrounds',
  templateUrl: './backgrounds.component.html',
  styleUrls: ['./backgrounds.component.css']
})
export class BackgroundsComponent implements OnInit {

  backgrounds: Background[];
  currBackground: Background;

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/backgroundData.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location) {}

  @ViewChild(BackgroundComponent, {static: false}) child: BackgroundComponent ; 

  // DataTables objects
  @ViewChild(DataTableDirective, {static: false})
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      columnDefs: [
        { width: '30%', targets: 0 },
        { width: '30%', targets: 1 },
        { width: '30%', targets: 2 },
        { width: '10%', targets: 3 }
      ],
      autoWidth: false,
      dom: 'trlp',
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
        '</select> backgrounds',
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

    this.getJSON().subscribe(backgrounds => {
        this.backgrounds = backgrounds;
        this.route.paramMap.subscribe(params => {
          this.currBackground = this.backgrounds.find(f => f.id == this.route.snapshot.params.backgroundName);
        });
        setTimeout(() => {
          this.dtTrigger.next();
        });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setCurrBackground(clicked): void {
    this.currBackground = clicked;
    this.location.go("/backgrounds/" + this.currBackground.id)
  }
}
