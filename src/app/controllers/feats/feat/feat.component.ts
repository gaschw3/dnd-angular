import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Feat, featCategory } from 'src/app/models/feat';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';
import { LinkmakerPipe } from 'src/app/pipes/linkmaker.pipe';

@Component({
  imports: [CommonModule, EntryRendererComponent, LinkmakerPipe],
  selector: 'app-feat',
  templateUrl: './feat.component.html',
  styleUrls: ['./feat.component.scss']
})
export class FeatComponent {

  @Input() feat: Feat;
  featCategory = featCategory;
}
