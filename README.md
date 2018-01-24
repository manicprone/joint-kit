# Joint Kit

A server-side toolset for building data layers and RESTful endpoints with NodeJS.

Joint Kit solutions are configuration-driven — allowing you to quickly implement
robust data operation logic, using a JSON-based configuration syntax.

Designed to be flexible. Mix it with existing code (programmatically) -_or_- use it to dynamically
generate an entire server-side method library and RESTful API router from JSON configs.

<br />

## WIP

Not ready for public use until version 0.1.0 - Syntax and logic are in frequent flux.

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

## Install

``` sh
$ npm install joint-kit --save
```

<br />

## Docs

Guides and API Reference can be found at [jointkit.org][link-joint-docs-site].

**NOTE** The online docs are not yet complete. They are actively being developed,
to coincide with the public release of Joint Kit.

<br />

## License

[MIT](LICENSE)


[link-joint-docs-site]: http://www.jointkit.org

[link-bookshelf-site]: http://bookshelfjs.org
[link-bookshelf-plugin-registry]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Model-Registry
[link-bookshelf-plugin-pagination]: https://github.com/bookshelf/bookshelf/wiki/Plugin:-Pagination

[link-express-site]: http://expressjs.com
