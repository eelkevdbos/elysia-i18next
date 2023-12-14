import { Context, Elysia, RouteSchema } from 'elysia'
import lib, { i18n, InitOptions } from 'i18next'

export type I18NextRequest = {
  i18n: i18n
  t: i18n['t']
}

export type I18NextPluginOptions = {
  initOptions: InitOptions
  detectLanguage: LanguageDetector
  instance: null | i18n
  useLngAsDefault: boolean
}

export type LanguageDetectorOptions = {
  storeParamName: string
  searchParamName: string
  headerName: string
  cookieName: string
  pathParamName: string
}

export type LanguageDetector<
  T extends Context<RouteSchema> = Context<RouteSchema>,
> = (ctx: T) => null | string | Promise<string | null>

function newLanguageDetector(opts: LanguageDetectorOptions): LanguageDetector {
  return ({ set, request, params, store }) => {
    const url = new URL(request.url)

    const searchParamValue = url.searchParams.get(opts.searchParamName)
    if (searchParamValue) {
      return searchParamValue
    }

    const cookie = set.cookie ? set.cookie[opts.cookieName] : null
    if (cookie && cookie.value) {
      return cookie.value
    }

    if (params && opts.pathParamName in params) {
      return params[opts.pathParamName]
    }

    if (opts.storeParamName in store) {
      // get opts.storeParamName from store
      return (store as Record<string, unknown>)[opts.storeParamName] as
        | string
        | null
    }

    return request.headers.get(opts.headerName)
  }
}

const defaultOptions: I18NextPluginOptions = {
  instance: null,
  initOptions: {},
  detectLanguage: newLanguageDetector({
    searchParamName: 'lang',
    storeParamName: 'language',
    headerName: 'accept-language',
    cookieName: 'lang',
    pathParamName: 'lang',
  }),
  useLngAsDefault: true,
}

export const i18next = (userOptions: Partial<I18NextPluginOptions>) => {
  const options: I18NextPluginOptions = {
    ...defaultOptions,
    ...userOptions,
  }

  const _instance = options.instance || lib

  return new Elysia({ name: 'elysia-i18next', seed: userOptions })
    .derive(async () => {
      if (!_instance.isInitialized) {
        await _instance.init(options.initOptions || {})
      }
      return { i18n: _instance, t: _instance.t }
    })
    .onBeforeHandle(async ctx => {
      const detectedLanguage = await options.detectLanguage(ctx)
      if (detectedLanguage) {
        await _instance.changeLanguage(detectedLanguage)
        return
      }

      const { options: { lng }, language: currentLanguage } = _instance

      if (options.useLngAsDefault && lng && currentLanguage !== lng) {
        await _instance.changeLanguage(lng)
	    }
    })
}
