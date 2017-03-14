import istanbul from 'rollup-plugin-istanbul';
import config from './rollup.config'

config.plugins = (config.plugins || []).concat([
  istanbul({
    exclude: ['test/**/*', 'node_modules/**/*']
  })
])

export default config
