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
  { path: 'classes', title: 'Classes — EotCC 5e', loadComponent: loadClasses },
  { path: 'classes/:className', loadComponent: loadClasses },
  { path: 'spells', title: 'Spells — EotCC 5e', loadComponent: loadSpells },
  { path: 'spells/:spellName', loadComponent: loadSpells },
  { path: 'beastiary', title: 'Bestiary — EotCC 5e', loadComponent: loadBeastiary },
  { path: 'beastiary/:monsterName', loadComponent: loadBeastiary },
  { path: 'backgrounds', title: 'Backgrounds — EotCC 5e', loadComponent: loadBackgrounds },
  { path: 'backgrounds/:backgroundName', loadComponent: loadBackgrounds },
  { path: 'ancestries', title: 'Ancestries — EotCC 5e', loadComponent: loadAncestries },
  { path: 'ancestries/:ancestryName', loadComponent: loadAncestries },
  { path: 'feats', title: 'Feats — EotCC 5e', loadComponent: loadFeats },
  { path: 'feats/:featName', loadComponent: loadFeats },
  { path: 'epic-boons', title: 'Epic Boons — EotCC 5e', loadComponent: loadEpicBoons },
  { path: 'epic-boons/:featName', loadComponent: loadEpicBoons },
  { path: 'items', title: 'Items — EotCC 5e', loadComponent: loadItems },
  { path: 'items/:itemName', loadComponent: loadItems },
  { path: 'point-buy', title: 'Point Buy — EotCC 5e', loadComponent: loadPointBuy },
  { path: 'other-features', title: 'Misc. Features — EotCC 5e', loadComponent: loadOtherFeatures },
  { path: 'other-features/:feature', loadComponent: loadOtherFeatures },
  { path: 'other-features/:type/:feature', loadComponent: loadOtherFeatures },
  {
    path: 'encounter-builder',
    title: 'Encounter Builder — EotCC 5e',
    loadComponent: () =>
      import('./controllers/encounter-builder/encounter-builder.component').then(
        m => m.EncounterBuilderComponent
      )
  },
  {
    path: 'map',
    title: 'Map — EotCC 5e',
    loadComponent: () =>
      import('./controllers/hexmap/hexmap.component').then(m => m.HexmapComponent)
  },
  { path: '404', title: 'Not Found — EotCC 5e', component: NotFoundComponent },
  { path: '500', title: 'Server Error — EotCC 5e', component: ServerErrorComponent },
  { path: '**', title: 'Not Found — EotCC 5e', component: NotFoundComponent }
];
