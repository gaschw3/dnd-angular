import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  // return absolute value so that positive and negative things can use the same calc methods
  abs(number: number): number {
    return Math.abs(number);
  }

  //used to generate ngFor sections with a known fixed number of outputs
  counter(i: number): number[] {
    return new Array(i);
  }

  //get stat mods calculated the D&D way 10 = 0, 12 = +1, 13 = +1, 14 = +2, 8 = -1, etc.
  getStatMod(stat: string): string {
    const mod = Math.floor((parseInt(stat, 10) - 10) / 2);
    const sign = mod > 0 ? '+' : '';
    return sign + mod;
  }

  static createIdFromName(name: string): string {
    return name.replace(/['/]/g,'').replace(/\W/g, '-').toLowerCase();
  }
}
