import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Observable } from "rxjs";
import { DataTableDirective } from "angular-datatables";

import { Class } from '../../../models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent implements OnInit {
  
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

  private getFeatures(level) {
    return this.currClass.features.filter(f => f.level == level && f.subclass == "base");
  }

  ngOnInit() {
    this.getJSON().subscribe(classes => {
        this.classes = classes;
        this.currClass = classes[0];
    });

    this.dtOptions = {
      dom: 'lftr',
      paging: false,
      ordering: false,
      orderCellsTop: false
    }
  }
}
