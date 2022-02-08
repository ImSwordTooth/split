const CracoLessPlugin = require('craco-less')
const path = require('path')

module.exports = {
    webpack: {
      configure: (webpackConfig) => {
          webpackConfig.output.publicPath = process.env.NODE_ENV === 'production' ? '/utils/split/' : ''
          return webpackConfig
      },
      alias: {
          '@action': path.resolve(__dirname, 'src/store/action.js'),
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
    devServer: {
        proxy: {
            '/splitApi': {
                "target": "http://172.30.20.15:3002/api/",
                "changeOrigin": true,
                "pathRewrite": { "/splitApi": "/" }
            },
            "/ucmsApi": {
                "target": "https://test0.ucms.ifeng.com/api/",
                "changeOrigin": true,
                "pathRewrite": { "/ucmsApi": "/" }
            }
        }
    }
}
