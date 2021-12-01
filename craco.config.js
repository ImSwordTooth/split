const CracoLessPlugin = require('craco-less')
const path = require('path')

module.exports = {
    webpack: {
      configure: (webpackConfig) => {
          webpackConfig.output.publicPath = process.env.NODE_ENV === 'production' ? '/doc/split/' : ''
          return webpackConfig
      },
      alias: {
          '@action': path.resolve(__dirname, 'src/store/action.js'),
      },
    },
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: { '@primary-color': '#1890ff' },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
}
