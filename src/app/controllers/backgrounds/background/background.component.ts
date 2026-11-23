import { Component, input } from '@angular/core';

import { Background } from 'src/app/models/background';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';

@Component({
  imports: [DetailHeaderComponent, EntryRendererComponent, LinkmakerPipe],
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent {
  readonly background = input.required<Background>();
}
