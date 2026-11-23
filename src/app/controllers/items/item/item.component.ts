import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Item } from 'src/app/models/item';
import { DetailHeaderComponent } from 'src/app/shared/detail-header/detail-header.component';
import { EntryRendererComponent } from 'src/app/shared/entry-renderer/entry-renderer.component';

@Component({
  imports: [DecimalPipe, DetailHeaderComponent, EntryRendererComponent],
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent {
  readonly item = input.required<Item>();

  readonly rarityClass = computed(() => {
    const r = this.item().rarity;
    if (!r || r === 'none') {
      return '';
    }
    return `item-rarity-accent-${r.replace(/\s+/g, '-')}`;
  });
}
