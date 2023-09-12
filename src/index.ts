import { Context, Elysia, TypedSchemaToRoute } from 'elysia'
import lib, { i18n, InitOptions } from 'i18next'

export type I18NextRequest = {
  i18n: i18n
  t: i18n['t']
}

export type I18NextPluginOptions = {
  initOptions: InitOptions
  detectLanguage: LanguageDetector
  instance: null | i18n
}

export type LanguageDetectorOptions = {
  storeParamName: string
  searchParamName: string
  headerName: string
  cookieName: string
  pathParamName: string
}

export type LanguageDetector<
  T extends Context<TypedSchemaToRoute<any, any>> = Context<
    TypedSchemaToRoute<any, any>
  >,
> = (ctx: T) => null | string | Promise<string | null>

function newLanguageDetector(opts: LanguageDetectorOptions): LanguageDetector {
  return ctx => {
    const url = new URL(ctx.request.url)
    if (url.searchParams.has(opts.searchParamName)) {
      return url.searchParams.get(opts.searchParamName)
    }

    const cookie = 'cookie' in ctx ? (ctx.cookie as Record<string, string>) : {}
    if (opts.cookieName in cookie) {
      return cookie[opts.cookieName]
    }

    if (ctx.params && opts.pathParamName in ctx.params) {
      return ctx.params[opts.pathParamName]
    }

    if (opts.storeParamName in ctx.store) {
      // get opts.storeParamName from store
      return (ctx.store as Record<string, unknown>)[opts.storeParamName] as
        | string
        | null
    }

    return ctx.request.headers.get(opts.headerName)
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
}

export const i18next = (userOptions: Partial<I18NextPluginOptions>) => {
  const options: I18NextPluginOptions = {
    ...defaultOptions,
    ...userOptions,
  }

  const _instance = options.instance || lib

  return new Elysia({ name: 'elysia-i18next', seed: userOptions }).derive(
    async (ctx): Promise<I18NextRequest> => {
      if (!_instance.isInitialized) {
        await _instance.init(options.initOptions || {})
      }
      const lng = await options.detectLanguage(ctx)
      if (lng) {
        await _instance.changeLanguage(lng)
      }
      return { i18n: _instance, t: _instance.t }
    }
  )
}
