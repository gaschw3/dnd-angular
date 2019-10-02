import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { ClassFeature } from 'src/app/models/class-feature';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {

  @Input() features: ClassFeature[];
  @Output() messageEvent = new EventEmitter<string>();

  public currActive: string = "test";

  constructor() {this.currActive = "test";}

  ngOnInit() {}

  getEntryType(entry): string {
    if (entry.list) {
      return "list";
    } else {
      return "";
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    var scroll = $(window).scrollTop();
    var elements = $(".feature"); // VERY VERY bad performance tho, watch out!
    var el;
    for (var i=0; i<elements.length; i++) {
        el = $(elements[i]);
        if (el.offset().top >= scroll ){
            if (this.currActive != el.attr('id')) {
              if (!el.hasClass('subclass') && !el.hasClass('archetype')) {
                this.currActive = el.attr('id');
              }
            }
            break;
        }
    }
  }

}
