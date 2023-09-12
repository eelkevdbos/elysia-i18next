import { Elysia } from 'elysia'
import { i18next, newLanguageDetector, LanguageDetector } from 'elysia-i18next'

const myDetector = newLanguageDetector({
  searchParamName: 'x-lang',
  cookieName: 'x-lang',
  headerName: 'x-lang',
  pathParamName: 'x-lang',
  storeParamName: 'x-lang',
})

new Elysia().use(i18next({ detectLanguage: myDetector })).listen(3000)

const brokenDetector: LanguageDetector = ctx => 'en'

new Elysia().use(i18next({ detectLanguage: brokenDetector })).listen(3000)
