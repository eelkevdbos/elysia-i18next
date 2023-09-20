Elysia i18next ![test status](https://github.com/eelkevdbos/elysia-i18next/actions/workflows/test.yml/badge.svg)
===

I18n for [Elysia.js](https://elysiajs.com/) via [i18next](https://www.i18next.com/).

Install
---

```
bun add elysia-i18next i18next
```

Usage
---

Check out full samples at [`examples`](./examples/) or check out the tests [`tests`](src/index.test.ts).

```ts
import { Elysia } from "elysia";
import { i18next } from "elysia-i18next";

new Elysia()
  .use(
    i18next({
      initOptions: {
        lng: "nl",
        resources: {
          en: {
            translation: {
              greeting: "Hi",
            },
          },
          nl: {
            translation: {
              greeting: "Hallo",
            },
          },
        },
      },
    }),
  )
  .get("/", ({ t }) => t("greeting")) // returns "Hallo"
  .listen(3000);
```

Configuration
---

### initOptions

`i18next.InitOptions`

Default: `{}`

Check out the [i18next documentation](https://www.i18next.com/overview/configuration-options) for more information.

### detectLanguage

`LanguageDetector`

default:
```ts
newLanguageDetector({
  searchParamName: 'lang',
  storeParamName: 'language',
  headerName: 'accept-language',
  cookieName: 'lang',
  pathParamName: 'lang',
})
```

A language detection function based on the current request context. By default, it checks the `language` property on the store, `lang` param in the query string, a cookie named `lang`, a path parameter named `lang` or the `accept-language` header.

### instance

`null | i18next.i18n`

Default: `null`

An existing i18next instance. If not provided, the global (module level) i18next instance will be used. The instance will be initialized if it not already was initialized.
