import { NgModule } from '@angular/core';
//import { ForbiddenComponent, NotAuthorizedComponent, NotFoundComponent, ServerErrorComponent } from './error';

import { HexmapComponent } from './controllers/hexmap/hexmap.component'
import { Routes, RouterModule, ExtraOptions } from '@angular/router';

const routes: Routes = [
  {
    path: 'classes',
    loadChildren: './controllers/classes/classes.module#ClassesModule'
  },
  {
    path: 'spells',
    loadChildren: './controllers/spells/spells.module#SpellsModule'
  },
  {
    path: 'beastiary',
    loadChildren: './controllers/beastiary/beastiary.module#BeastiaryModule'
  },
  {
    path: 'backgrounds',
    loadChildren: './controllers/backgrounds/backgrounds.module#BackgroundsModule'
  },
  {
    path: 'ancestries',
    loadChildren: './controllers/ancestries/ancestries.module#AncestriesModule'
  },
  {
    path: 'feats',
    loadChildren: './controllers/feats/feats.module#FeatsModule'
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
  scrollOffset: [0, 80]
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }