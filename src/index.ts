import { Elysia, PreContext } from 'elysia'
import lib, { InitOptions } from 'i18next'

export const t = lib.t

export type I18NextPluginOptions = {
  initOptions: InitOptions
  detectLanguage: <T extends PreContext>(
    ctx: T
  ) => null | string | Promise<string | null>
}

export const detectLanguage = (ctx: PreContext) => {
  if ('language' in ctx.store) {
    return ctx.store.language as string | null
  }
  return ctx.request.headers.get('accept-language')
}

const defaultOptions: I18NextPluginOptions = {
  initOptions: {},
  detectLanguage,
}

export const i18next = (userOptions: Partial<I18NextPluginOptions>) => {
  return (app: Elysia) =>
    app.use(
      new Elysia({ name: 'elysia-i18next' }).derive(async ctx => {
        const options: I18NextPluginOptions = {
          ...defaultOptions,
          ...userOptions,
        }
        await lib.init(options.initOptions || {})
        const lng = await options.detectLanguage<typeof ctx>(ctx)
        if (lng) {
          await lib.changeLanguage(lng)
        }
        return { i18next: lib, t: lib.t }
      })
    )
}
