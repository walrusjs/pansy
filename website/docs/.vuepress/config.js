module.exports = (ctx) => ({
  title: 'Pansy',
  description: 'A zero configuration library bundler.',
  theme: '@vuepress/vue',
  themeConfig: {
    editLinks: true,
    smoothScroll: true,
    nav: [
      {
        text: '指南',
        link: '/guide/'
      },
      {
        text: '配置',
        link: '/config/'
      },
      {
        text: 'GitHub',
        link: 'https://github.com/vuejs/vuepress/blob/master/CHANGELOG.md'
      }
    ],
    sidebar: {
      '/guide/': [
        {
          title: '指南',
          collapsable: false,
          children: ['', 'installation', 'configuration-file', 'plugins']
        },
        {
          title: '高级',
          collapsable: false,
          children: [
            'javascript',
            'css',
            'vue-component',
            'environment-variables',
            'update-package'
          ]
        }
      ]
    }
  },
  plugins: [
    ['@vuepress/back-to-top', true],
    [
      '@vuepress/pwa',
      {
        serviceWorker: true,
        updatePopup: true
      }
    ],
    ['@vuepress/medium-zoom', true]
  ]
});
