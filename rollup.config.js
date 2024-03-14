import { nodeResolve } from '@rollup/plugin-node-resolve'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  input: 'src/SVGMotionPath.js',
  output: {
    file: 'packages/SVGMotionPath.js',
    format: 'esm'
  },
  plugins: [
    nodeResolve(),
    serve({
      host: 'localhost',
      port: 3000,
      open: true,
      openPage: '/index.html',
      contentBase: ''
    }),
    livereload()
  ]
}