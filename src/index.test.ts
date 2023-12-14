import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import Elysia from 'elysia'
import { i18next } from './index.ts'
import { createInstance, InitOptions, i18n } from 'i18next'

export const req = (path: string, requestInit?: RequestInit) =>
  new Request(`http://localhost${path}`, requestInit)

const initOptions: InitOptions = {
  lng: 'nl',
  resources: {
    nl: {
      translation: {
        greeting: 'Hallo!',
      },
    },
    en: {
      translation: {
        greeting: 'Hello!',
      },
    },
    fr: {
      translation: {
        greeting: 'Bonjour!',
      },
    },
  },
  fallbackLng: false,
}

describe('i18next', () => {
  let instance: i18n

  beforeEach(() => {
    instance = createInstance(initOptions)
  })

  it('translates', async () => {
    const app = new Elysia()
      .use(i18next({ instance }))
      .get('/', ({ t }) => t('greeting'))

    const response = await app.handle(req('/'))
    expect(await response.text()).toEqual('Hallo!')
  })

  it('changes language based on query parameter', async () => {
    const app = new Elysia()
      .use(i18next({ instance }))
      .get('/', ({ t }) => t('greeting'))
    const response = await app.handle(req('/?lang=en'))
    expect(await response.text()).toEqual('Hello!')
  })

  it('changes language based on accept-language header', async () => {
    const app = new Elysia()
      .use(i18next({ instance }))
      .get('/', ({ t }) => t('greeting'))
    const response = await app.handle(
      req('/', { headers: { 'accept-language': 'en' } })
    )
    expect(await response.text()).toEqual('Hello!')
  })

  it('changes language based on property in store', async () => {
    const app = new Elysia()
      .state('language', 'en')
      .use(i18next({ instance }))
      .get('/', ({ t }) => t('greeting'))
    const response = await app.handle(req('/'))
    expect(await response.text()).toEqual('Hello!')
  })

  it('allows to override language detection', async () => {
    const app = new Elysia()
      .use(i18next({ instance, detectLanguage: () => 'fr' }))
      .get('/', ({ t }) => t('greeting'))
    const response = await app.handle(req('/'))
    expect(await response.text()).toEqual('Bonjour!')
  })

  it('changes language based on cookie', async () => {
    const app = new Elysia()
      .onBeforeHandle(({ cookie: { lang } }) => {
        lang.value = 'en'
      })
      .use(i18next({ instance }))
      .get('/', ({ t }) => t('greeting'))
    const response = await app.handle(req('/'))
    expect(await response.text()).toEqual('Hello!')
  })

  it('changes language based on path param', async () => {
    const app = new Elysia()
      .use(i18next({ instance }))
      .get('/:lang/', ({ t }) => t('greeting'))

    const response = await app.handle(req('/fr/'))
    expect(await response.text()).toEqual('Bonjour!')
  })

  it('accepts an i18next instance', async () => {
    instance = createInstance({
      ...initOptions,
      lng: 'fr',
    })
    const app = new Elysia()
      .use(i18next({ instance }))
      .get('/', ({ t }) => t('greeting'))
    const response = await app.handle(req('/'))
    expect(await response.text()).toEqual('Bonjour!')
  })

  it('should fall back to initOptions.lng after a request with specified language', async () => {
    instance = createInstance({
		  ...initOptions,
		  lng: 'en',
	  })
	
	  const app = new Elysia()
      .use(i18next({ instance }))
      .get('/', ({ t }) => t('greeting'))

	  // language is specified in the first request
    let response = await app.handle(req('/?lang=fr'))
    expect(await response.text()).toEqual('Bonjour!')

	  // language is not specified in the next request
    response = await app.handle(req('/'))
    expect(await response.text()).toEqual('Hello!')
  })

  it('should not fall back to initOptions.lng after a request with specified language if useLngAsDefault is false', async () => {
	  instance = createInstance({
	  	...initOptions,
	  	lng: 'en',
	  })

	  const app = new Elysia()
	    .use(i18next({ instance, useLngAsDefault: false }))
	    .get('/', ({ t }) => t('greeting'))

	  let response = await app.handle(req('/?lang=fr'))
	  expect(await response.text()).toEqual('Bonjour!')

	  response = await app.handle(req('/'))
	  expect(await response.text()).toEqual('Bonjour!')
  })
})
