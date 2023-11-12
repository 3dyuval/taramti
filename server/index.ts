/// <reference types="vite/client" />

import express from 'express'
import { renderPage } from 'vike/server'
import httpDevServer from 'vavite/http-dev-server'
import compression from 'compression'
import { root } from './root'

startServer()

async function startServer() {
  const app = express()

  app.use(compression())

  if (!httpDevServer) {
    app.use(express.static(root() + '/client'))
  }

  app.get('*', async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl,
    }


    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) return next()
    const { statusCode, body } = httpResponse
    res.status(statusCode).send(body)
  })

  if (httpDevServer) {
    httpDevServer!.on('request', app)
  } else {
    const port = process.env.PORT || 3000
    app.listen(port)
    console.log(`Server running at http://localhost:${port}`)
  }
}
