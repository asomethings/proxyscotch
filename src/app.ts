import * as http from 'http'
import * as https from 'https'
import { body } from './body'
import { registerLogger } from './logger'
import { ProxyClient } from './proxy/client'
import { getFile, isRequestBody } from './utils'

export interface AppOptions {
  token?: string

  host?: string

  port?: number

  allowedOrigins?: string[]

  bannedOutputs?: string[]

  ssl?: {
    key: string
    cert: string
  }
}

export const handler = (options: AppOptions) => async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  registerLogger(req, res)
  if (req.url !== '/') {
    return res.writeHead(404).end()
  }

  if (req.method === 'OPTIONS') {
    return res
      .writeHead(200, {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
      })
      .end()
  }

  if (req.method === 'POST') {
    const headers: Record<string, any> = { 'Access-Control-Allow-Headers': '*' }

    const origin = req.headers['origin']
    if (!origin || origin === '') {
      if ((req.headers['content-type'] || '').includes('application/json')) {
        return res
          .writeHead(200, {
            ...headers,
            'Access-Control-Allow-Origin': '*',
          })
          .end()
      }

      return res
        .writeHead(301, {
          ...headers,
          Location: 'https://hoppscotch.io/',
        })
        .end()
    } else {
      headers['Access-Control-Allow-Origin'] = origin
    }

    headers['Content-Type'] = 'application/json'
    let json
    try {
      json = await body(req)
    } catch (e) {
      return res
        .writeHead(400)
        .end(JSON.stringify({ success: false, message: 'Bad Request' }))
    }
    if (!isRequestBody(json)) {
      return res
        .writeHead(400)
        .end(JSON.stringify({ success: false, message: 'Bad Request' }))
    }

    if (options.token && json.accessToken != options.token) {
      return res
        .writeHead(401)
        .end(
          JSON.stringify({ success: false, message: 'Unauthorized Request' })
        )
    }

    let proxyResponse
    try {
      proxyResponse = await new ProxyClient(json).send()
    } catch {
      return res
        .writeHead(500, headers)
        .end(
          JSON.stringify({ success: false, message: 'Internal Server Error' })
        )
    }

    const response = proxyResponse
      .wantsBinary(json.wantsBinary)
      .bannedOutputs(...(options.bannedOutputs ?? []))
      .response()

    return res
      .writeHead(200, headers)
      .end(JSON.stringify({ success: true, ...response }))
  }

  return res.writeHead(404).end()
}

export const App = async (options?: AppOptions) => {
  const host = options?.host ?? '0.0.0.0'
  const port = options?.port ?? 80

  const listener = handler(options ?? {})
  let server: http.Server | https.Server
  if (options?.ssl && options.ssl.key && options.ssl.cert) {
    const cert = (await getFile(options.ssl.cert)) ?? options.ssl.cert
    const key = (await getFile(options.ssl.key)) ?? options.ssl.key

    server = https.createServer(
      {
        key: key,
        cert: cert,
      },
      listener
    )
  } else {
    server = http.createServer(listener)
  }

  return server.listen(port, host, () => {
    console.log(`Starting server on ${host}:${port}`)
  })
}
