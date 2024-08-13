import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, Subject } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';

import { FeatComponent } from './feat/feat.component';
import { Feat } from 'src/app/models/feat';
import { ADTSettings } from 'angular-datatables/src/models/settings';

@Component({
  selector: 'app-feats',
  templateUrl: './feats.component.html',
  styleUrls: ['./feats.component.scss']
})
export class FeatsComponent implements OnInit {

  feats: Feat[];
  currFeat: Feat;

  public getJSON(): Observable<any> {
    return this.http.get("assets/data/2023/featData.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location) { }

  @ViewChild(FeatComponent) child: FeatComponent;

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions: {};
  dtTrigger: Subject<ADTSettings> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      columnDefs: [
        { width: '55%', targets: 0 },
        { width: '35%', targets: 1 },
        { width: '10%', targets: 2 },
      ],
      autoWidth: false,
      scrollX: true,
      dom: 'trlp',
      orderMulti: true,
      pageLength: 20,
      pagingType: "full_numbers",
      searching: true,
      language: {
        lengthMenu: 'Show <select>' +
          '<option value="20">20</option>' +
          '<option value="45">45</option>' +
          '<option value="-1">All</option>' +
          '</select> feats',
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

    this.getJSON().subscribe(feats => {
      this.feats = feats;
      this.feats.sort(function (a, b) {
        return (a.name < b.name) ? -1 : 1;
      });
      this.route.paramMap.subscribe(params => {
        this.currFeat = this.feats.find(f => f.id == this.route.snapshot.params.featName);
      });
      setTimeout(() => {
        this.dtTrigger.next(this.dtOptions);
      });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setCurrAncestry(clicked): void {
    this.currFeat = clicked;
    this.location.go("/feats/" + this.currFeat.id)
  }
}
