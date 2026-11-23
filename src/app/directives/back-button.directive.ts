import { Directive, HostListener, inject } from '@angular/core';
import { Location } from '@angular/common';

@Directive({
    selector: '[appBackButton]'
})
export class BackButtonDirective {
    private location = inject(Location);

    @HostListener('click')
    onClick() {
        this.location.back();
    }
}