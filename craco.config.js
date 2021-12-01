const CracoLessPlugin = require('craco-less')

module.exports = {
    webpack: {
      configure: (webpackConfig) => {
          webpackConfig.output.publicPath = '/doc/split/'
          return webpackConfig
      }
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
