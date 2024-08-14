import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  // return absolute value so that positive and negative things can use the same calc methods
  abs(number) {
    return Math.abs(number);
  }

  //used to generate ngFor sections with a known fixed number of outputs
  counter(i: number): Array<number> {
    return new Array(i);
  }

  //get stat mods calculated the D&D way 10 = 0, 12 = +1, 13 = +1, 14 = +2, 8 = -1, etc.
  getStatMod(stat: string): string {
    let sign;
    let mod = Math.floor((parseInt(stat, 10) - 10)/2);
    if (mod == 0) {
      sign = "";
    } else 
      (mod >= 0) ? sign = "+" : sign = "";
    
    return sign+mod;
  }

  static createIdFromName(name: string): string {
    return name.replace(/['\/]/g,'').replace(/\W/g, '-').toLowerCase();
  }
}
