Elysia i18next ![test status](https://github.com/eelkevdbos/elysia-i18next/actions/workflows/test.yml/badge.svg)
===

I18n for [Elysia.js](https://elysiajs.com/) via [i18next](https://www.i18next.com/).

Install
---

```
bun add elysia-i18next
```

Usage
---

Check out full samples at [`examples`](./examples/) or check out the tests [`tests`](src/index.test.ts).

```ts
import { Elysia } from 'elysia'
import { i18next } from 'elysia-i18next'

new Elysia()
  .use(
    i18next({
      lng: 'nl',
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
    })
  )
  .get('/', ({t}) => t('greeting')) // returns "Hallo"
  .listen(3000)
```

Configuration
---

### initOptions

`i18next.InitOptions`

Default: `{}`

Check out the [i18next documentation](https://www.i18next.com/overview/configuration-options) for more information.

### detectLanguage

`(ctx: PreContext) => string`

default:
```ts
(ctx: PreContext) => {
  if ('language' in ctx.store) {
    return ctx.store.language as string | null
  }
  return ctx.request.headers.get('accept-language')
}
```

A language detection function, by default it checks the `language` property on the store, or the `accept-language` header.
