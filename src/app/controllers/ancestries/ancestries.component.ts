import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, Subject } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';

import { AncestryComponent } from './ancestry/ancestry.component';
import { Ancestry } from 'src/app/models/ancestry';

@Component({
  selector: 'app-ancestries',
  templateUrl: './ancestries.component.html',
  styleUrls: ['./ancestries.component.scss']
})
export class AncestriesComponent implements OnInit {

  ancestries: Ancestry[];
  currAncestry: Ancestry;

  public getJSON(): Observable<any> {
    return this.http.get("assets/data/ancestryData.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location) {}

  @ViewChild(AncestryComponent) child: AncestryComponent ;

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      columnDefs: [
        { width: '70%', targets: 0 },
        { width: '30%', targets: 1 },
      ],
      autoWidth: false,
      scrollX: true,
      dom: 'trlp',
      orderMulti: true,
      pageLength: 20,
      pagingType: "full_numbers",
      searching: true,
      language: {
        lengthMenu: 'Show <select>'+
        '<option value="20">20</option>'+
        '<option value="-1">All</option>'+
        '</select> ancestries',
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

    this.getJSON().subscribe(ancestries => {
      this.ancestries = ancestries;
      this.route.paramMap.subscribe(params => {
        this.currAncestry = this.ancestries.find(f => f.id == this.route.snapshot.params.ancestryName);
      });
      setTimeout(() => {
        this.dtTrigger.next();
      });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setCurrAncestry(clicked): void {
    this.currAncestry = clicked;
    this.location.go("/ancestries/" + this.currAncestry.id)
  }
}
