import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-hexmap',
  templateUrl: './hexmap.component.html',
  styleUrls: ['./hexmap.component.css']
})
export class HexmapComponent implements AfterViewInit {
  private map;

  constructor() {  }

  private initMap(): void {
    var map = L.map('map').setView([30, -120.0], 5.0);
    L.tileLayer('assets/map-tiles/{z}/{x}/{y}.png', {
      minZoom: 2,
      maxZoom: 7,
      tms: false,
      attributionControl: false
    }).addTo(map);
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
}