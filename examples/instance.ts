import { Elysia } from 'elysia'
import { createInstance } from 'i18next'
import { i18next } from 'elysia-i18next'

const i18n = createInstance()

new Elysia().use(i18next({ instance: i18n })).listen(3000)
