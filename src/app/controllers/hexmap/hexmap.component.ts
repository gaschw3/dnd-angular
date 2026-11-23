import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DndDataService, MapLocationsData } from '../../shared/services/dnd-data.service';

interface SearchableLocation {
  name: string;
  category: string;
  lat: number;
  lng: number;
  zoom: number;
}

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-hexmap',
  templateUrl: './hexmap.component.html',
  styleUrls: ['./hexmap.component.scss']
})
export class HexmapComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  private destroy$ = new Subject<void>();

  searchQuery = '';
  allLocations: SearchableLocation[] = [];

  constructor(
    private dataService: DndDataService,
    private cdr: ChangeDetectorRef
  ) {}

  get filteredLocations(): SearchableLocation[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return this.allLocations
      .filter(loc => loc.name.toLowerCase().includes(q) || loc.category.toLowerCase().includes(q))
      .slice(0, 12);
  }

  ngAfterViewInit(): void {
    this.dataService.getMapLocations().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.buildSearchIndex(data);
      this.initMap(data);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }

  flyToLocation(loc: SearchableLocation): void {
    if (!this.map) {
      return;
    }
    this.map.flyTo([loc.lat, loc.lng], loc.zoom, { duration: 1.1 });
    this.searchQuery = '';
  }

  private buildSearchIndex(data: MapLocationsData): void {
    const index: SearchableLocation[] = [];
    const pushAll = (entries: [string, number, number][], category: string, zoom: number) => {
      for (const [name, lat, lng] of entries) {
        index.push({ name, category, lat, lng, zoom });
      }
    };
    pushAll(data.continents, 'Continent', 3.5);
    pushAll(data.countries, 'Country', 4.5);
    pushAll(data.seas, 'Sea', 6);
    pushAll(data.cities, 'City', 6.5);
    pushAll(data.towns, 'Town', 7.25);
    pushAll(data.shizomi, 'Shizomi', 6.5);
    this.allLocations = index;
  }

  private initMap(data: MapLocationsData): void {
    const map = L.map('map', { zoomSnap: 0.25 }).setView([52, 5], 4);
    this.map = map;

    const textLabel = L.divIcon({
      className: 'empty-text-icon',
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
    const cityLabel = L.icon({
      iconUrl: 'assets/city-marker.png',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, 25],
      className: 'city-marker-icon'
    });
    const townLabel = L.icon({
      iconUrl: 'assets/town-marker.png',
      iconSize: [25, 25],
      iconAnchor: [15, 15],
      popupAnchor: [0, 0],
      className: 'town-marker-icon'
    });

    L.tileLayer('https://raw.githack.com/gaschw3/dnd-map-tiles/master/{z}/{x}/{y}.png', {
      minZoom: 2,
      maxZoom: 8,
      maxNativeZoom: 6,
      tms: false
    }).addTo(map);

    const continentsLayer = L.layerGroup().addTo(map);
    const countriesLayer = L.layerGroup().addTo(map);
    const seasLayer = L.layerGroup().addTo(map);
    const citiesLayer = L.layerGroup().addTo(map);
    const townsLayer = L.layerGroup().addTo(map);
    const shizomiLayer = L.layerGroup().addTo(map);

    for (const [name, lat, lng] of data.continents) {
      L.marker([lat, lng], { opacity: 1, icon: textLabel })
        .bindTooltip(name, { permanent: true, className: 'continent-label', direction: 'center', offset: [0, 0] })
        .addTo(continentsLayer);
    }
    for (const [name, lat, lng] of data.countries) {
      L.marker([lat, lng], { opacity: 1, icon: textLabel })
        .bindTooltip(name, { permanent: true, className: 'country-label', direction: 'center', offset: [0, 0] })
        .addTo(countriesLayer);
    }
    for (const [name, lat, lng] of data.seas) {
      L.marker([lat, lng], { opacity: 1, icon: textLabel })
        .bindTooltip(name, { permanent: true, className: 'water-label', direction: 'center', opacity: 0, offset: [0, 0] })
        .addTo(seasLayer);
    }
    for (const [name, lat, lng] of data.cities) {
      L.marker([lat, lng], { opacity: 1, icon: cityLabel })
        .bindTooltip(name, { permanent: true, className: 'city-label', direction: 'center', opacity: 1, offset: [0, 20] })
        .addTo(citiesLayer);
    }
    for (const [name, lat, lng] of data.towns) {
      L.marker([lat, lng], { opacity: 1, icon: townLabel })
        .bindTooltip(name, { permanent: true, className: 'town-label', direction: 'center', opacity: 0, offset: [0, 8] })
        .addTo(townsLayer);
    }
    for (const [name, lat, lng] of data.shizomi) {
      L.marker([lat, lng], { opacity: 1, icon: townLabel })
        .bindTooltip(name, { permanent: true, className: 'shizomi-label', direction: 'center', opacity: 0, offset: [0, 8] })
        .addTo(shizomiLayer);
    }

    L.control.layers(undefined, {
      Continents: continentsLayer,
      Countries: countriesLayer,
      Seas: seasLayer,
      Cities: citiesLayer,
      Towns: townsLayer,
      Shizomi: shizomiLayer
    }, { collapsed: true }).addTo(map);

    this.changeZoom(map, '.country-label', 4, 5);
    this.changeZoom(map, '.water-label', 6, 8);
    this.changeZoom(map, '.city-label', 6, 8);
    this.changeZoom(map, '.town-label', 7, 8);
    this.changeZoom(map, '.shizomi-label', 6, 8);
    this.changeZoom(map, '.city-marker-icon', 5.5, 8);
    this.changeZoom(map, '.town-marker-icon', 6.5, 8);
    map.zoomIn();
  }

  private changeZoom(map: L.Map, targetLayer: string, zoomMin: number, zoomMax: number): void {
    const updateOpacity = () => {
      const zoom = map.getZoom();
      const visible = zoom <= zoomMax && zoom >= zoomMin;
      document.querySelectorAll<HTMLElement>(targetLayer).forEach(el => {
        el.style.transition = 'opacity 0.4s ease';
        el.style.opacity = visible ? '1' : '0';
      });
    };
    map.on('zoomend', updateOpacity);
    map.on('overlayadd', updateOpacity);
  }
}
