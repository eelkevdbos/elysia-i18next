import Elysia, { PreContext } from 'elysia'
import lib, { InitOptions } from 'i18next'

type I18NextPluginOptions = {
  initOptions: InitOptions
  detectLanguage: <T extends PreContext>(
    ctx: T
  ) => null | string | Promise<string | null>
}

const detectLanguage = (ctx: PreContext) => {
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
  const options: I18NextPluginOptions = {
    ...defaultOptions,
    ...userOptions,
  }
  const i18next = new Elysia({ name: 'elysia-i18next' }).derive(async ctx => {
    await lib.init(options.initOptions || {})
    const lng = await options.detectLanguage<typeof ctx>(ctx)
    if (lng) {
      await lib.changeLanguage(lng)
    }
    return { i18next: lib, t: lib.t }
  })
  return (app: Elysia) => app.use(i18next)
}
