import { Component, input } from '@angular/core';

@Component({
  selector: 'app-detail-header',
  templateUrl: './detail-header.component.html',
  styleUrls: ['./detail-header.component.scss']
})
export class DetailHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | undefined>(undefined);
}
