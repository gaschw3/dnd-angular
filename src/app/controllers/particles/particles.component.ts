import { Component, Input, OnInit } from '@angular/core';
import { HelperService } from '../../shared/helpers/helper.service';

@Component({
  selector: 'app-particles',
  templateUrl: './particles.component.html',
  styleUrls: ['./particles.component.scss']
})
export class ParticlesComponent implements OnInit {

  @Input() theme: string;
  constructor(public helper: HelperService) { }

  ngOnInit(): void {
  }

}
