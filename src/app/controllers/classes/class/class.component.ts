import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable } from "rxjs";
import { DataTableDirective } from "angular-datatables";

import { Class, Proficiency } from '../../../models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent implements OnInit {
  
  @Input() class: Class;
  prof: Proficiency;

  ccId: number = 0; //current class id

  // DataTables objects
  @ViewChild(DataTableDirective, {static: true})
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute) {}

  ngOnInit() {
    this.dtOptions = {
      dom: 'lftr',
      ordering: false,
      orderCellsTop: false,
      paging: false
    }
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}
