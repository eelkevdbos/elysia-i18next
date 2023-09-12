import { Context, Elysia, TypedSchemaToRoute } from 'elysia'
import lib, { i18n, InitOptions } from 'i18next'

export type DerivedTypes = {
  i18n: i18n
  t: i18n['t']
}

export type LanguageDetectorOptions = {
  storeParamName: string
  searchParamName: string
  headerName: string
}

export type LanguageDetector<
  T extends Context<TypedSchemaToRoute<any, any>> = Context<
    TypedSchemaToRoute<any, any>
  >,
> = (ctx: T) => null | string | Promise<string | null>

export type I18NextPluginOptions = {
  initOptions: InitOptions
  detectLanguage: LanguageDetector
}

function newLanguageDetector(opts: LanguageDetectorOptions): LanguageDetector {
  return ctx => {
    const url = new URL(ctx.request.url)
    if (url.searchParams.has(opts.searchParamName)) {
      return url.searchParams.get(opts.searchParamName)
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
  initOptions: {},
  detectLanguage: newLanguageDetector({
    searchParamName: 'lang',
    storeParamName: 'language',
    headerName: 'accept-language',
  }),
}

export const i18next = (userOptions: Partial<I18NextPluginOptions>) => {
  const options: I18NextPluginOptions = {
    ...defaultOptions,
    ...userOptions,
  }

  const plugin = new Elysia({ name: 'elysia-i18next' }).derive(
    async (ctx): Promise<DerivedTypes> => {
      await lib.init(options.initOptions || {})
      const lng = await options.detectLanguage(ctx)
      if (lng) {
        await lib.changeLanguage(lng)
      }
      return { i18n: lib, t: lib.t }
    }
  )

  return (app: Elysia) => app.use(plugin)
}
