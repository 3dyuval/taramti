import type { UserConfigExport } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import ssr, { UserConfig } from 'vike/plugin'
import vuetify from 'vite-plugin-vuetify'
import { vavite } from 'vavite'
import { compression } from 'vite-plugin-compression2'
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import sitemap from 'vite-plugin-sitemap'
import { onBeforeRender } from './src/_getData'
import { localesTranslated } from './src/i18n'

export default defineConfig(async ({ mode }) => {
  let dynamicRoutes = []
  if (mode === 'production') {
    const response = await onBeforeRender().catch(console.error)
    if (response) {
      response.pageContext.pageProps.rows.forEach((row) => {
        dynamicRoutes.push(...Object.keys(localesTranslated)
          //TODO - add  <xhtml:link> to sitemap.xml
            .map(locale => `${locale}/donation-location/${row.id}`)
        );
      })
    }
  }


  return {
    buildSteps: [
      { name: 'client' },
      {
        name: 'server',
        config: {
          build: {
            emptyOutDir: true,
            ssr: true
          }
        }
      }
    ],
    plugins: [
      vue(),
      sitemap(
        {
          hostname: process.env.HOST_URL || 'http://localhost/',
          readable: true,
          generateRobotsTxt: true,
          robots: [{
            userAgent: '*',
            disallow: '/all'
          }],
          dynamicRoutes,
          exclude: ['/all']
        }),
      vuetify(),
      vueI18nPlugin({
        ssr: true,
        include: [path.resolve(__dirname, './src/i18n/*.json')]
      }),
      ssr({ disableAutoFullBuild: true } satisfies UserConfig),
      vavite({
        serverEntry: '/server/index.ts',
        serveClientAssetsInDev: true
      }),
      compression()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    ssr: {
      noExternal: [
        'primevue',
        '@fawmi/vue-google-maps',
        'vuetify',
        '@googlemaps/markerclusterer'
      ]
    },
    optimizeDeps: {
      include: ['@fawmi/vue-google-maps', 'fast-deep-equal']
    }
  } satisfies UserConfigExport
})