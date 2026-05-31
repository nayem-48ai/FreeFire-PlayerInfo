import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function build() {
  const outdir = path.join(__dirname, 'dist')

  // Build JS
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/main.jsx')],
    bundle: true,
    outdir,
    jsx: 'automatic',
    jsxImportSource: 'react',
    format: 'esm',
    minify: true,
    sourcemap: false,
    target: ['es2020'],
    loader: {
      '.jsx': 'jsx',
      '.js': 'jsx',
      '.svg': 'dataurl',
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.gif': 'dataurl',
      '.woff': 'dataurl',
      '.woff2': 'dataurl',
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  })

  // Copy index.html
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
  fs.writeFileSync(path.join(outdir, 'index.html'), html)

  console.log('Build complete! Output in:', outdir)
}

build().catch((e) => {
  console.error(e)
  process.exit(1)
})