import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Class } from 'src/app/models';

@Component({
  selector: 'app-archetypes',
  templateUrl: './archetypes.component.html',
  styleUrls: ['./archetypes.component.scss']
})
export class ArchetypesComponent implements OnInit {

  @Input() archetypes: any;
  @Input() selectedArchetypes: any;
  @Input() allSelected: boolean = false;
  @Output() check: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  clickArchetype(name) {
    if (this.selectedArchetypes.includes(name)) {
      this.selectedArchetypes.splice(this.selectedArchetypes.indexOf(name), 1);
      $("."+name.replace(" ","")).hide();
     }
    else {
      this.selectedArchetypes.push(name);
       $("."+name.replace(" ","")).show();
    }
    if (this.selectedArchetypes.length == $('.btn-archetype').length){
      this.allSelected = true;
    } else {
      this.allSelected = false;
    }
  }

  selectAll() {
    this.allSelected = true;
    const that = this;
    $('.btn-archetype').each(function(index, item) {
      const currName = $(item).data('name');
      if (!that.selectedArchetypes.includes(currName)) {
        that.selectedArchetypes.push(currName);
      }
    });
    this.selectedArchetypes;
  }

  selectNone() {
    this.allSelected = false;
    this.selectedArchetypes.splice(0, 100);
    this.selectedArchetypes.push('none')
  }
}
