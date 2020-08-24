import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { ItemsRoutingModule } from './items-routing.module';
import { ItemComponent } from './item/item.component';
import { ItemsComponent } from './items.component';

@NgModule({
  declarations: [
    ItemComponent,
    ItemsComponent
  ],
  imports: [
    SharedModule,
    ItemsRoutingModule
  ]
})
export class ItemsModule { }
