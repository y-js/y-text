var pkg = require('./package.json')

export default {
  entry: 'src/y-text.js',
  moduleName: 'yText',
  format: 'umd',
  dest: 'y-text.node.js',
  sourceMap: true,
  banner: `
/**
 * ${pkg.name} - ${pkg.description}
 * @version v${pkg.version}
 * @license ${pkg.license}
 */
`
}
