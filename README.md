## D&D Angular App
More or less a test/personal site that I use to play/run D&D 5e except this time made with Angular and a view towards using xomponents and JSON as if things were comeing from an API instead of just local files. It is mostly up to date with current play material but small changes/additions/subtractions have been made throughout based mostly on my whims.

## To-Do
* Most sections.
* Host on github sites and switch over from the old page.
* New section for tracking locations/characters/etc.

## Running Locally
Ostensibly you could run this locally if you have npm and node installed (I don't have steps for that process). Just pull from this repo and then in the same directory as package.json run:

`npm update`

`npm start`

Pages should be served up at `http://localhost:4200/

## Deploying to gh-pages
Just because I'll probably forget:

`npm install -g angular-cli-ghpages` (don't need this one anymore, but maybe on a different machine)

`ng build --prod --base-href "https://gaschw3.github.io/dnd-angular"`

`ngh --dir dist/dnd-angular` (differs slightly from the norm because of changes from Ang6 -> 8)

Should update withing a few minutes to most recent version.