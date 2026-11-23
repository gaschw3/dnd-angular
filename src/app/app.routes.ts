import { Routes } from '@angular/router';
import { NotFoundComponent } from './error/not-found/not-found.component';
import { ServerErrorComponent } from './error/server-error/server-error.component';

const loadClasses = () =>
  import('./controllers/classes/classes.component').then(m => m.ClassesComponent);
const loadSpells = () =>
  import('./controllers/spells/spells.component').then(m => m.SpellsComponent);
const loadBeastiary = () =>
  import('./controllers/beastiary/beastiary.component').then(m => m.BeastiaryComponent);
const loadBackgrounds = () =>
  import('./controllers/backgrounds/backgrounds.component').then(m => m.BackgroundsComponent);
const loadAncestries = () =>
  import('./controllers/ancestries/ancestries.component').then(m => m.AncestriesComponent);
const loadFeats = () =>
  import('./controllers/feats/feats.component').then(m => m.FeatsComponent);
const loadEpicBoons = () =>
  import('./controllers/epic-boons/epic-boons.component').then(m => m.EpicBoonsComponent);
const loadItems = () =>
  import('./controllers/items/items.component').then(m => m.ItemsComponent);
const loadPointBuy = () =>
  import('./controllers/point-buy/point-buy.component').then(m => m.PointBuyComponent);
const loadOtherFeatures = () =>
  import('./controllers/other-features/other-features.component').then(m => m.OtherFeaturesComponent);

export const routes: Routes = [
  { path: '', redirectTo: 'classes', pathMatch: 'full' },
  { path: 'classes', loadComponent: loadClasses },
  { path: 'classes/:className', loadComponent: loadClasses },
  { path: 'spells', loadComponent: loadSpells },
  { path: 'spells/:spellName', loadComponent: loadSpells },
  { path: 'beastiary', loadComponent: loadBeastiary },
  { path: 'beastiary/:monsterName', loadComponent: loadBeastiary },
  { path: 'backgrounds', loadComponent: loadBackgrounds },
  { path: 'backgrounds/:backgroundName', loadComponent: loadBackgrounds },
  { path: 'ancestries', loadComponent: loadAncestries },
  { path: 'ancestries/:ancestryName', loadComponent: loadAncestries },
  { path: 'feats', loadComponent: loadFeats },
  { path: 'feats/:featName', loadComponent: loadFeats },
  { path: 'epic-boons', loadComponent: loadEpicBoons },
  { path: 'epic-boons/:featName', loadComponent: loadEpicBoons },
  { path: 'items', loadComponent: loadItems },
  { path: 'items/:itemName', loadComponent: loadItems },
  { path: 'point-buy', loadComponent: loadPointBuy },
  { path: 'other-features', loadComponent: loadOtherFeatures },
  { path: 'other-features/:feature', loadComponent: loadOtherFeatures },
  { path: 'other-features/:type/:feature', loadComponent: loadOtherFeatures },
  {
    path: 'encounter-builder',
    loadComponent: () =>
      import('./controllers/encounter-builder/encounter-builder.component').then(
        m => m.EncounterBuilderComponent
      )
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./controllers/hexmap/hexmap.component').then(m => m.HexmapComponent)
  },
  { path: '404', component: NotFoundComponent },
  { path: '500', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent }
];
