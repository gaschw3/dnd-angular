import { Component, OnInit } from '@angular/core';
import { Subject, Observable } from "rxjs";
import { Class } from '../../models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {

  classes: Class[];

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/classData.json")
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getJSON().subscribe(classes => {
        this.classes = classes;
    });
  }

}
