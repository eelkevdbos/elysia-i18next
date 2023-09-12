import dts from 'bun-plugin-dts'

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: true,
  target: 'node',
  sourcemap: 'external',
  external: ['i18next', 'elysia'],
  plugins: [dts()],
})
