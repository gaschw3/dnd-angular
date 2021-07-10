## D&D Angular App
More or less a test/personal site that I use to play/run D&D 5e except this time made with Angular and a view towards using components and JSON as if things were coming from an API instead of just local files. It is mostly up to date with current play material but small changes/additions/subtractions have been made throughout based mostly on my whims.

## To-Do
* Updates for map.
* Consolidating old JSONs around new entry-renderer.component
  * Especially bad in classData.json, since it's the oldest 
* New section for tracking locations/characters/etc.
* Nice but unlikely would to have some kind of Markdown -> JSON converter to type up homebrew more quickly
* Code cleanup around modules and routing, but that'll probably just have to moulder, it's not worth the struggle.

## Running Locally
Ostensibly you could run this locally if you have npm and node installed. Just pull from this repo and then in the same directory as package.json run:

`npm update`

`npm start`

Pages should be served up at `http://localhost:4200/

## Deploying to gh-pages
Just because I'll probably forget:

`npm install -g angular-cli-ghpages` (don't need this one anymore, but maybe on a different machine)

`ng deploy --base-href="https://gaschw3.github.io/dnd-angular/"` (base-href is required like this, it doesn't work per the cli-githubpage docs)

Should update within a few minutes to most recent version.