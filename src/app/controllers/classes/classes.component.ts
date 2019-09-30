import { Component, OnInit, ViewChild } from '@angular/core';
import {Location} from '@angular/common'; 
import { Subject, Observable } from "rxjs";

import { Class } from '../../models';
import { HttpClient } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {

  classes: Class[];
  currClass: Class;

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/classData.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location) {}

  // DataTables objects
  @ViewChild(DataTableDirective, {static: false})
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<any> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      autoWidth: false,
      dom: 'tr',
      paging: false,
      ordering: false,
      searching: true,
      initComplete: function(settings, json) {
        const api = this.api();
        api.columns().every(function() {
          const column = this;
          const $head = $(column.header());
          if ($head.index() == 0) {
            const inputContainer = $head.parent().prev().children().get($head.index());
            $(':input', inputContainer).off('keyup change search').on('keyup change search', function(e) {
              const $this = $(this);
              const value = <string>$this.val();
              if (column.search() !== value) {
                column.search(value).draw();
              }
            }).trigger('change');
          }
        });
      }
    };

    this.getJSON().subscribe(classes => {
        this.classes = classes;
        this.currClass = this.classes.find(f => f.id == this.route.snapshot.params.className);
        setTimeout(() => {
          this.dtTrigger.next();
        });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setCurrClass(clickedClass): void {
    this.currClass = clickedClass;
    this.location.replaceState("/classes/" + this.currClass.id)
  }

}
