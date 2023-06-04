import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { FeatureComponent } from './feature/feature.component';
import { featureType, OtherFeature, Prerequisite } from 'src/app/models/otherFeature';
import { IdToNamePipe } from 'src/app/pipes/id-to-name.pipe';

@Component({
  selector: 'app-other-features',
  styleUrls: ['./other-features.component.scss'],
  templateUrl: './other-features.component.html'
})
export class OtherFeaturesComponent implements OnInit {

  idPipe = new IdToNamePipe;
  otherFeatures: OtherFeature[];
  shownFeatures: OtherFeature[];
  currFeature: OtherFeature;

  selected: string = "all";

  featureType = featureType;

  public getJSON(): Observable<any> {
      return this.http.get("assets/data/otherFeatures.json")
  }

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location) {}

  @ViewChild(FeatureComponent) child: FeatureComponent ;

  // DataTables objects
  @ViewChild(DataTableDirective)
  private dtElement: DataTableDirective;
  dtOptions:  {};
  dtTrigger: Subject<void> = new Subject();

  ngOnInit(): void {
    this.dtOptions = {
      columnDefs: [
        { width: '30%', targets: 0 },
        { width: '30%', targets: 1 },
        { width: '30%', targets: 2 },
        { width: '5%', targets: 3, type: "num" },
        { width: '5%', targets: 4 }
      ],
      autoWidth: false,
      scrollX: true,
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
        '</select> otherFeatures',
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

    this.getJSON().subscribe(otherFeatures => {
        this.otherFeatures = otherFeatures;
        this.route.paramMap.subscribe(params => {
          this.currFeature = this.otherFeatures.find(f => this.idPipe.transform(f.name) == this.route.snapshot.params.feature);
          if (this.route.snapshot.params.type) {
            this.selected = this.route.snapshot.params.type;
          }
          if (this.selected != "all" && this.selected != undefined) {
            this.shownFeatures =  this.otherFeatures.filter(f => f.featureType ? f.featureType[0].includes(this.selected) : false);
          } else {
            this.shownFeatures = this.otherFeatures;
          }
        });
        setTimeout(() => {
          this.dtTrigger.next();
        });
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  setCurrFeature(clicked): void {
    this.currFeature = clicked;
    if (this.selected == "all") {
      this.location.go("/other-features/" + this.idPipe.transform(this.currFeature.name));
    } else {
      this.location.go("/other-features/" + this.selected + "/" + this.idPipe.transform(this.currFeature.name));
    }
  }

  setFilter(clicked): void {
    this.selected = clicked;
    if (clicked == "all") {
      this.shownFeatures = this.otherFeatures;
    } else {
      this.shownFeatures = this.otherFeatures.filter(f => f.featureType ? f.featureType[0].includes(clicked) : false);
    }
    if (this.shownFeatures.indexOf(this.currFeature) > 0) {
      this.location.go("/other-features/" + clicked + "/" + this.idPipe.transform(this.currFeature.name))
    } else {
      this.currFeature = this.shownFeatures[0];
      this.location.go("/other-features/" + clicked + "/" + this.idPipe.transform(this.shownFeatures[0].name))
    }
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy and redraw table with new filtered items
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  getPrereq(prereq: Prerequisite[]): string {
    if (!prereq || prereq.length < 1) {
      return "—";
    } else {
      let ret = [];
      let reqs = prereq[0]; // there is always only one entry at this point
      if (typeof reqs.pact != "undefined") {
        ret.push("Pact of the " + reqs.pact );
      }
      if (typeof reqs.spell != "undefined") {
        ret.push(reqs.spell);
      }
      if (typeof reqs.item != "undefined") {
        ret.push(reqs.item[0]);
      }
      if (typeof reqs.level != "undefined") {
        if (typeof reqs.level.subclass != "undefined") {
          ret.push(reqs.level.subclass.name + " " + reqs.level.class.name);
        } else {
          ret.push(reqs.level.class.name);
        }
      }
      return ret.join(", ");
    }
  }

  getLevelPrereq(prereq: Prerequisite[]): string {
    if (!prereq || prereq.length < 1) {
      return "—";
    } else {
      let ret = [];
      let reqs = prereq[0]; // there is always only one entry at this point
      if (typeof reqs.level != "undefined") {
        if (typeof reqs.level.level == "undefined") {
          return "—"
        } else {
          ret.push(reqs.level.level);
        }
      } else {
        return "—";
      }
      return ret.join(", ");
    }
  }
}

