import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-hexmap',
  templateUrl: './hexmap.component.html',
  styleUrls: ['./hexmap.component.scss']
})
export class HexmapComponent implements AfterViewInit {
  private map;

  private countries;
  private continents;
  private cities;
  private towns;
  private seas;

  private shizomi;

  constructor() {
    this.continents = [
      ['Ilia', 50, -77],
      ['Ischia', 41, 15],
    ];
    this.countries = [
      ['Denari', 30, -120],
      ['Florin', 29, -105],
      ['Pfennig', 19, -105],
      ['Arkhos', 25, 20],
      ['Seven Cities', 65, -90],
      ['Hokai', 37, -212],
    ];
    this.seas = [
      ['Starfall Sea', 28, -88],
      ['Illian Sea', 30, -113.5],
      ['Devil\'s Eye', 36, -101],
      ['The Darkslick', 24.5,-103],
      ['Shimmerbay', 19.5, -95],

      ['Cerulean Sea', 23, 20],
      ['Siren Sea', 21.5, 22.5],

      ['Sea of Moving Ice', 66.13, -93.01],
    ];
    this.cities = [
      ['Avon', 30, -120.6],
      ['Noctus', 27.4, -117.9],
      ['Tarraktur', 32.7, -116.5],

      ['Arden', 16.57, -100],
      ['Dalgrange', 22.3, -105.91],
      ['Tramere', 17.05, -101.18],
      ['Avonshire', 24.69, -109.4],

      ['Reliqa', 28.4, -110.5],
      ['Kintalla', 31.6, -106.4],
      ['Hieraxa', 25.5, -104.79],

      ['Scythia', 23.7, 22],
      ['Melos', 24.3, 20.5],
      ['Pylea', 27, 17.8],
      ['Themis', 25.2, 18.7],

      ['Bryn Sturgis', 64.82, -89.65],
      ["Bryn Nonig", 65.216, -86.29],

      ['Shizomi', 34.23, -211.59],
    ];
    this.towns = [
      ['Borderland Keep', 30.2, -119.7],
      ['Norton\'s Point', 30.6, -120.8],
      ['Ralsburg Ruins', 30, -119.13],
      ['Elfhome', 29.955, -121.4],
      ["S. Terminus", 30.29, -118.444],
      ["N. Terminus", 32.6, -116.95],
      ["Stag Lord's Fort", 29.47, -120.48 ],
      ["Sorrow's Furnace", 26.98, -118.416],
      ["Falurin's Filter", 31.5, -116.565],
      ["Marv's", 30.5, -120.059],
      ["Vespid Hive", 30.935, -121.99],
      ["Volung's Gate", 31.78, -119.267],
      ["Volung's Gate", 31.51, -120.24],
      ["Sungaze Monastery", 31.23, -118.92],
      ["Wordless Word Temple", 29.38, -119.322],
      ["Druid of Swarms", 29.27, -119.32],

      ["Mornrise", 21.32, -109.86],
      ["Penkirk", 22.42, -102.44],
      ["Trest", 17.93, -104.17],
      ["Spitemaw", 21.61, -107.02],
      ["Golden Isle", 21.19, -111.57],
      ["Bristad", 23.18, -109.32],
      ["Iverness", 22.34, -109],
      ["Belhoff", 19.425, -100.57],
      ["Dale", 19.94, -104.06],

      ["Fairpoint", 29.4, -108.3],
      ["Arborback Ferry", 29.1, -104],
      ["Whistlefen", 28.2, -106.3],
      ["Greenspan", 33.4, -105.24],
      ["Adler Larkspur Manor", 29.07, -108.677],
      ["Bone Dam", 29.76, -103.92],
      ["Volungfist", 32.3, -104.1],
      ["Empty Mountain", 30.83, -110.42],
      ["Caer Kaan", 28.5, -103.4],
      ["Endless Stairs", 31.8, -104.17],

      ["Zodanii", 26, 19.8],
      ["Olynthos", 27, 23],
      ["Kydonia", 21.8, 19.6],
      ["Megara", 24.6, 21.7],
      ["Mount Pantheus", 25.7, 23],

      ["Wile's Home", 65.08, -90.42],
      ["Tamerlaine", 65.18, -89.1],
      ["Lostwood", 65.595, -87.7],
      ["Cold Mead", 64.77, -88.07],
      ["Targon", 64.86, -86.915],
      ["Estwall", 64.95, -88.77],
      ["Ymir's Cairn", 65.48, -86.5],
    ];
    this.shizomi = [
      ['Imperial Palace', 29.71, -210.63],
      ['World Tree', 30.22, -211.42],
      ['Zudun Jade', 27.66, -211.305],
      ['Tori Dam', 31.33, -208.855],
      ['Yokai Forest', 31.39, -212.5],
      ['Old City', 29.88, -211.997],
    ]
   }

  private initMap(): void {
    let map = L.map('map', {zoomSnap: 0.25}).setView([31, -211], 5.5);
    let textLabel = L.icon({
      iconUrl: 't',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, 0],
      shadowUrl: '',
      shadowSize: [0, 0],
      shadowAnchor: [0, 0]
    });
    let cityLabel = L.icon({
      iconUrl: 'assets/city-marker.png',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, 25],
      shadowUrl: '',
      shadowSize: [0, 0],
      shadowAnchor: [0, 0]
    });
    let townLabel = L.icon({
      iconUrl: 'assets/town-marker.png',
      iconSize: [25, 25],
      iconAnchor: [15, 15],
      popupAnchor: [0, 0],
      shadowUrl: '',
      shadowSize: [0, 0],
      shadowAnchor: [0, 0]
    });

    L.tileLayer('https://raw.githack.com/gaschw3/dnd-map-tiles/master/{z}/{x}/{y}.png', {
      minZoom: 2,
      maxZoom: 8,
      maxNativeZoom: 6,
      tms: false,
      attributionControl: false
    }).addTo(map);

    map.on('click', function (e) {
      var coord = e.latlng;
      console.log("[" + coord.lat + ", " + coord.lng + "]");
    });

    for (let i = 0; i < this.continents.length; i++) {
      let continent = this.continents[i];
      let marker = new L.marker([continent[1], continent[2]], { opacity: 1, icon: textLabel });
      marker.bindTooltip(continent[0], { permanent: true, className: "continent-label", direction: "center", offset: [0, 0] });
      marker.addTo(map);
    }
    for (let i = 0; i < this.countries.length; i++) {
      let country = this.countries[i];
      let marker = new L.marker([country[1], country[2]], { opacity: 1, icon: textLabel });
      marker.bindTooltip(country[0], { permanent: true, className: "country-label", direction: "center", offset: [0, 0] });
      marker.addTo(map);
    }
    for (let i = 0; i < this.seas.length; i++) {
      let water = this.seas[i];
      let marker = new L.marker([water[1], water[2]], { opacity: 1, icon: textLabel });
      marker.bindTooltip(water[0], { permanent: true, className: "water-label", direction: "center", opacity: 0, offset: [0, 0] });
      marker.addTo(map);
    }
    for (let i = 0; i < this.cities.length; i++) {
      let city = this.cities[i];
      let marker = new L.marker([city[1], city[2]], { opacity: 1, icon: cityLabel, className: "cityLabel" });
      marker.bindTooltip(city[0], { permanent: true, className: "city-label", direction: "center", opacity: 1, offset: [0, 20] });
      marker.addTo(map);
    }
    for (let i = 0; i < this.towns.length; i++) {
      let town = this.towns[i];
      let marker = new L.marker([town[1], town[2]], { opacity: 1, icon: townLabel, className: "townLabel" });
      marker.bindTooltip(town[0], { permanent: true, className: "town-label", direction: "center", opacity: 0, offset: [0, 8] });
      marker.addTo(map);
    }
    for (let i = 0; i < this.shizomi.length; i++) {
      let town = this.shizomi[i];
      let marker = new L.marker([town[1], town[2]], { opacity: 1, icon: townLabel, className: "shizomiLabel" });
      marker.bindTooltip(town[0], { permanent: true, className: "shizomi-label", direction: "center", opacity: 0, offset: [0, 8] });
      marker.addTo(map);
    }

    this.changeZoom(map, ".country-label", 4, 5);
    this.changeZoom(map, ".water-label", 6, 8);
    this.changeZoom(map, ".city-label", 5, 8);
    this.changeZoom(map, ".town-label", 7, 8);
    this.changeZoom(map, ".shizomi-label", 6, 8);
    this.changeZoom(map, ".leaflet-marker-icon", 6, 8);
    map.zoomIn();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  changeZoom(map, targetLayer, zoomMin, zoomMax) {
    map.on('zoom', function () {
      let zoom = map.getZoom();
      if (zoom > zoomMax || zoom < zoomMin) {
        $(targetLayer).fadeTo(500, 0, function () {  });
      } else if (zoom <= zoomMax && zoom >= zoomMin) {
        $(targetLayer).fadeTo(500, 1, function () { });
      }
    });
  }
}