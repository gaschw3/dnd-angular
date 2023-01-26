import { Component, OnInit, ViewChild } from '@angular/core';
import {Location} from '@angular/common';
import { Observable, Subject } from "rxjs";

import { Class } from '../../models';
import { HttpClient } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';
import { ClassComponent } from './class/class.component';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
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

  @ViewChild(ClassComponent) child: ClassComponent;

  // DataTables objects
  @ViewChild(DataTableDirective)
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
        this.route.paramMap.subscribe(params => {
          this.currClass = this.classes.find(f => f.id == this.route.snapshot.params.className);
        });
        setTimeout(() => {
          this.dtTrigger.next();
        });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setCurrClass(clickedClass): void {
    if (this.child) {
      this.child.selectedArchetypes.splice(0,100); //clear out archetypes when you change classes
    }
    this.currClass = clickedClass;
    this.location.go("/classes/" + this.currClass.id)
  }

  shake(id: string): void {
    $( '#'+id )
    .animate({ "left": "-=5px" }, "fast" )
    .animate({ "left": "+=10px" }, "fast" )
    .animate({ "left": "-=10px" }, "fast" )
    .animate({ "left": "+=5px" }, "fast" );
   }

}
