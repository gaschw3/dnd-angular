import { NgModule } from '@angular/core';
//import { ForbiddenComponent, NotAuthorizedComponent, NotFoundComponent, ServerErrorComponent } from './error';
import { ClassesComponent } from './classes/classes.component'
import { HexmapComponent } from './hexmap/hexmap.component'
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{path: 'classes', component: ClassesComponent},
  {path: 'map', component: HexmapComponent}
  //{ path: 'redirect', component: RedirectionComponent },
  //{ path: '401', component: NotAuthorizedComponent },
  //{ path: '403', component: ForbiddenComponent },
  //{ path: '404', component: NotFoundComponent },
  //{ path: '500', component: ServerErrorComponent },
  //{ path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }