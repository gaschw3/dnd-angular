import { Component, input } from '@angular/core';
import { OtherFeature } from 'src/app/models/otherFeature';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';

@Component({
  imports: [DetailHeaderComponent, EntryRendererComponent],
  selector: 'app-feature',
  templateUrl: './feature.component.html'
})
export class FeatureComponent {
  readonly feature = input.required<OtherFeature>();
}
