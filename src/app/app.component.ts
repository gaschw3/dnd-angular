import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare var gtag

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dnd-angular';
  defaultTheme = "royal";
  particles = false;

  theme = this.getCookie("theme");

  constructor(router: Router) {
    const navEndEvent$ = router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    );
    navEndEvent$.subscribe((e: NavigationEnd) => {
      gtag('config', 'G-BKMXZP7BG0', {'page_path':e.urlAfterRedirects});
    });
  }

  setCookie (name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  getCookie (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) {
          var themeName = c.substring(nameEQ.length,c.length);
          if (themeName == 'rainbow') {
            return 'royal'
          }
          else {
            return themeName;
          }
        }
    }
    return this.defaultTheme; //use dark mode if no cookie is set
  }

  changeTheme() {
    this.setCookie("theme", this.theme, 7); //set "theme" cookie, expires in 7 days
  }

}