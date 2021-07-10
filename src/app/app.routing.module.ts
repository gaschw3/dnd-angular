import { PointBuyModule } from './controllers/point-buy/point-buy.module';
import { NgModule } from '@angular/core';
//import { ForbiddenComponent, NotAuthorizedComponent, NotFoundComponent, ServerErrorComponent } from './error';

import { HexmapComponent } from './controllers/hexmap/hexmap.component'
import { PointBuyComponent } from './controllers/point-buy/point-buy.component';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';

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
  {path: 'map', component: HexmapComponent}
  //{ path: 'redirect', component: RedirectionComponent },
  //{ path: '401', component: NotAuthorizedComponent },
  //{ path: '403', component: ForbiddenComponent },
  //{ path: '404', component: NotFoundComponent },
  //{ path: '500', component: ServerErrorComponent },
  //{ path: '**', component: NotFoundComponent },
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