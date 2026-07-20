# ROT — Agent Guide

Aviation pilot records and evaluation management app. Tracks pilot evaluations, SIC hours, OME/OTZ records, PDFs, and related training data.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | AngularJS 1.x, ui-router, ui-grid, Bootstrap |
| Backend | Express 4, Sequelize 3 |
| Database | SQLite (dev), PostgreSQL (prod via `SEQUELIZE_URI`) |
| Auth | Passport local JWT + Firebase client login |
| Build | Grunt, Bower, Babel (ES2015 + class properties) |
| Tests | Karma/Mocha (client), Mocha/Supertest (server) |

Generated from [generator-angular-fullstack](https://github.com/DaftMonk/generator-angular-fullstack) v3.8.0. Preserve existing patterns unless modernization is explicitly requested.

## Repository Layout

```
client/           AngularJS app (app/, components/)
server/           Express API, auth, Sequelize models
  api/            REST resources (evaluation, pilot, raw, user, thing)
  auth/           Passport + JWT
  config/         Environment config (development, production, test)
  sqldb/          Sequelize init and model registration
e2e/              Protractor end-to-end tests
Gruntfile.js      Build, serve, test tasks
```

## Domain Modules (client routes)

| Route | Purpose |
|-------|---------|
| `/` (main) | Primary pilot records table, PDF generation |
| `/pilotEvals` | Pilot evaluation history and attachments |
| `/sicHours` | SIC hours tracking |
| `/ome`, `/otz` | OME / OTZ record views |
| `/records` | Record management |
| `/xml`, `/pdf` | XML import and PDF utilities |
| `/admin` | Admin-only features |

## API Resources

REST endpoints under `/api/`:

- `/api/evaluations` — pilot check rides / evaluations
- `/api/pilots` — pilot metadata
- `/api/raws` — raw imported data
- `/api/users` — user accounts
- `/auth` — authentication

File serving routes: `/pdf`, `/fileserver`, `/recordPDFs` (query param `filename`).

## Development

```bash
npm install
bower install
grunt serve          # dev server on port 9000
grunt build          # production build to dist/
npm test             # runs grunt test
```

Copy `server/config/local.env.sample.js` to `server/config/local.env.js` for local secrets (not tracked in git).

## Conventions

- **Server**: ES6 `import`/`export` with `babel-register` in dev/test. Controllers follow Rails-like REST naming (`index`, `show`, `create`, `update`, `destroy`).
- **Models**: Sequelize models in `server/api/<resource>/<resource>.model.js`; register new models in `server/sqldb/index.js`.
- **Routes**: Register new API routers in `server/routes.js`.
- **Client**: Angular module `rotApp`. Feature areas use ui-router states. Newer components use ES6 classes with `$onInit`.
- **Field names**: Database columns use legacy names (e.g. `Pilot_Name`, `Date_af_date`). Match existing casing when adding fields.
- **Soft deletes**: Use `isArchived: true` rather than hard deletes where the pattern exists.
- **Style**: 2-space indent, single quotes, `'use strict'`, trailing commas per JSHint/JSCS config.

## What to Avoid

- Do not upgrade Angular, Express, or Sequelize major versions without explicit request.
- Do not refactor unrelated files when fixing a targeted bug.
- Do not commit `local.env.js`, SQLite databases, or uploaded PDFs/attachments.
- Do not remove dual Firebase + navbar login flow without understanding auth dependencies.
