## D&D Angular App
More or less a test/personal site that I use to play/run D&D 5e except this time made with Angular and a view towards using components and JSON as if things were coming from an API instead of just local files. It is mostly up to date with current play material but small changes/additions/subtractions have been made throughout based mostly on my whims.

## To-Do
* Update to 2024 version of data (mostly done now)
* Nice but unlikely would be some kind of Markdown -> JSON converter to type up homebrew
* Code cleanup around modules and routing.
  * Now mostly done with 2026 Angular+TS update, could still use a pass on data and models that are messy to turn 'strict' back on

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