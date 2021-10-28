var path = require('path')

module.exports = {
  pages: {
    config: {
      // entry for the page
      entry: 'src/pages/config/config.js',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'config.html'
    },
    viewer: {
      // entry for the page
      entry: 'src/pages/viewer/viewer.js',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'viewer.html'
    },
    mobile: {
      // entry for the page
      entry: 'src/pages/mobile/mobile.js',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'mobile.html'
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
  },
  filenameHashing: false,
  transpileDependencies: [
    'vuetify'
  ],
  chainWebpack: config => {
    config.optimization.minimize(false);
  },
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          outputStyle: 'expanded'
        }
      }
    }
  }
}
