import { Component, computed, input } from '@angular/core';
import { Feat, featCategory } from 'src/app/models/feat';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';
import { TitlecaseExceptPipe } from 'src/app/pipes/titlecase-except.pipe';

@Component({
  imports: [DetailHeaderComponent, EntryRendererComponent, LinkmakerPipe, TitlecaseExceptPipe],
  selector: 'app-feat',
  templateUrl: './feat.component.html'
})
export class FeatComponent {
  readonly feat = input.required<Feat>();

  readonly categoryName = computed(() => featCategory[this.feat().category] || '');
}
