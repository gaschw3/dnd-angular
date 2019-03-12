import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Observable } from "rxjs";
import { DataTableDirective } from "angular-datatables";

import { Class } from '../models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {

	classes: Class[];
	currClass: Class;
	ccId: number = 0; //current class id

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions: any = {};

	constructor(private http: HttpClient) {}

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/classData.json")
  }

	ngOnInit() {
    this.getJSON().subscribe(classes => {
        this.classes = classes;
        this.currClass = classes[0];
    });

    this.dtOptions = {
      columnDefs: [
        { width: '10%', targets: 0 },
        { width: '10%', targets: 1 },
        { width: '60%', targets: 2 },
        { width: '10%', targets: 3 },
        { width: '10%', targets: 4 },
      ],
      dom: 'lftr',
      paging: false,
      ordering: false,
      orderCellsTop: false
    }

    console.log(this.classes);
	}

}
