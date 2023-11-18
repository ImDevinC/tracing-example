const esbuild = require('esbuild')

const build = async (entrypoint) => {
  await esbuild.build({
    entryPoints: [entrypoint],
    bundle: true,
    outdir: './dist',
    minify: false,
    platform: 'node',
  })
}

build('./src/consume.ts')
build('./src/publish.ts')