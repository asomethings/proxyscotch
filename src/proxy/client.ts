import * as http from 'http'
import * as https from 'https'
import { RequestBody } from '../interfaces/request-body'
import { ProxyMessage } from './message'

// TODO: Implement HTTP/2 protocol requests. Including ALPN Negotiation
export class ProxyClient {
  private readonly options: https.RequestOptions

  constructor(private readonly body: RequestBody) {
    this.options = {
      method: body.method,
      timeout: 4500,
    }

    this.options.headers = {
      ...(body.headers || {}),
      'User-Agent': 'Proxyscotch/1.0',
    }

    if (body.auth) {
      this.options.auth = `${body.auth.username}:${body.auth.password}`
    }

    if (body.data) {
      this.options.headers['Content-Length'] = Buffer.byteLength(body.data)
    }
  }

  private get request() {
    if (this.body.url.startsWith('https')) {
      return https.request
    }

    return http.request
  }

  public send(): Promise<ProxyMessage> {
    return new Promise((resolve, reject) => {
      const req = this.request(
        this.body.url,
        this.options,
        this.callback(resolve)
      )

      req.on('error', reject)
      req.on('timeout', req.abort)

      if (this.body.data) {
        req.write(this.body.data)
      }

      req.end()
    })
  }

  private callback(resolve: (value: ProxyMessage) => void) {
    return (res: http.IncomingMessage) => {
      const buffer: Buffer[] = []
      res
        .on('data', (chunk: Buffer) => {
          buffer.push(chunk)
        })
        .on('end', () => {
          resolve(new ProxyMessage(res, Buffer.concat(buffer)))
        })
    }
  }
}
