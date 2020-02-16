# Joint Kit

A server-side toolset for building authorized data layers and RESTful endpoints with NodeJS.

Joint Kit solutions are configuration-driven. Use a JSON-based syntax to rapidly
implement operation logic on top of your data schema.

Designed to be flexible. Mix it with existing code (programmatically) -_or_- use
it to dynamically generate an entire server-side method library and RESTful API
router with minimal programming.

<br />

## WIP

Not ready for public use until version 0.1.0 - Syntax and logic are in frequent flux.

<br />

## Table of Contents

* [Prerequisites][section-prerequisites]
* [How to Use][section-how-to-use]
* [For Developers][section-for-developers]

<br />

## Prerequisites

To use the Joint Kit, you need:

* a supported persistence solution (_e.g. Postgres_)
* a configured data schema (_e.g. database & tables_)
* a supported service interface / ORM

The Joint Kit currently supports:

| Service | Required Plugins | Persistence Options |
| ------- | ---------------- | ------------------- |
| [Bookshelf][link-bookshelf-site] | [registry][link-bookshelf-plugin-registry], [pagination][link-bookshelf-plugin-pagination] | Postgres, MySQL, SQLite3 |

<span>---</span>

If you want to generate a RESTful API, you need:

* a supported server framework

The Joint Kit currently supports:

| Server | Required Middleware |
| ------ | ------------------- |
| [Express][link-express-site] | body-parser, cookie-parser |

<br />

## How to Use

### Install

``` sh
$ yarn add joint-kit
```

[TBC]

<br />

## For Developers

### Dev Lint

The app uses [ESLint][link-eslint-site] for source code linting (specifically, the [standard style][link-eslint-standard-site]). The linting will run automatically on `git commit`.
> You can run the command with flag `--fix`, or an alternate command `flint`, to trigger auto fixing (e.g. `yarn flint`).

``` sh
$ yarn lint
```

### Dev Test

The app uses [Mocha][link-mocha-site] for the unit testing framework,
and [Chai][link-chai-site] for its assertions.

### Run Unit Tests
``` sh
$ yarn test:unit
```

### Run Functional Tests
``` sh
$ yarn test:functional
```

#### Run All Tests (Unit + Functional)
``` sh
$ yarn test
```

<br />

## License

[MIT](LICENSE)


[section-prerequisites]: #prerequisites
[section-how-to-use]: #how-to-use
[section-for-developers]: #for-developers

[link-joint-docs-site]: http://www.jointkit.org
[link-bookshelf-site]: http://bookshelfjs.org
[link-bookshelf-plugin-registry]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Model-Registry
[link-bookshelf-plugin-pagination]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Pagination
[link-express-site]: http://expressjs.com
[link-eslint-standard-site]: https://standardjs.com
[link-eslint-site]: https://eslint.org
[link-mocha-site]: https://mochajs.org
[link-chai-site]: http://chaijs.com
