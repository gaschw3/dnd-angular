import { PointBuyModule } from './controllers/point-buy/point-buy.module';
import { NgModule } from '@angular/core';
//import { ForbiddenComponent, NotAuthorizedComponent, NotFoundComponent, ServerErrorComponent } from './error';

import { HexmapComponent } from './controllers/hexmap/hexmap.component'
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { EncounterBuilderComponent } from './controllers/encounter-builder/encounter-builder.component';
import { NotFoundComponent } from './error/not-found/not-found.component';
import { ServerErrorComponent } from './error/server-error/server-error.component';

const routes: Routes = [
  {
    path: 'classes',
    loadChildren: () => import('./controllers/classes/classes.module').then(m => m.ClassesModule)
  },
  {
    path: 'spells',
    loadChildren: () => import('./controllers/spells/spells.module').then(m => m.SpellsModule)
  },
  {
    path: 'beastiary',
    loadChildren: () => import('./controllers/beastiary/beastiary.module').then(m => m.BeastiaryModule)
  },
  {
    path: 'backgrounds',
    loadChildren: () => import('./controllers/backgrounds/backgrounds.module').then(m => m.BackgroundsModule)
  },
  {
    path: 'ancestries',
    loadChildren: () => import('./controllers/ancestries/ancestries.module').then(m => m.AncestriesModule)
  },
  {
    path: 'feats',
    loadChildren: () => import('./controllers/feats/feats.module').then(m => m.FeatsModule)
  },
  {
    path: 'items',
    loadChildren: () => import('./controllers/items/items.module').then(m => m.ItemsModule)
  },
  {
    path: 'point-buy',
    loadChildren: () => import('./controllers/point-buy/point-buy.module').then(m => m.PointBuyModule)
  },
  {
    path: 'other-features',
    loadChildren: () => import('./controllers/other-features/other-features.module').then(m => m.OtherFeaturesModule)
  },
  {
    path: 'encounter-builder',
    component: EncounterBuilderComponent
  },
  {
    path: 'map',
    component: HexmapComponent
  },
  { path: '404', component: NotFoundComponent },
  { path: '500', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent }
];

const routerOptions: ExtraOptions = {
    useHash: false,
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    scrollOffset: [0, 80],
    relativeLinkResolution: 'legacy'
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})

export class AppRoutingModule { }