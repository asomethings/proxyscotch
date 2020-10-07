import * as http from 'http'
import { RequestBody } from '../interfaces/request-body'
import { ErrorResponse } from '../interfaces/response/error-response'
import { ProxyResponse } from '../interfaces/response/proxy-response'
import { ProxyClient } from '../proxy/client'
import { ProxyMessage } from '../proxy/message'
import { App } from './app'

export class RequestHandler {
  private readonly allowedMethods = ['OPTIONS', 'POST']

  constructor(
    private readonly app: App,
    private readonly req: HttpRequest,
    private readonly res: HttpResponse
  ) {}

  public async response(): Promise<void> {
    if (this.req.url !== '/') return this.status(404).send()

    if (this.isMethodNotAllowed()) return this.status(405).send()

    if (this.method === 'OPTIONS') {
      return this.status(200)
        .header('Access-Control-Allow-Headers', '*')
        .header('Access-Control-Allow-Origin', '*')
        .send()
    }

    this.header('Access-Control-Allow-Headers', '*')
    if (!this.isOriginAllowed()) {
      if (this.isContentTypeJSON()) {
        return this.status(200)
          .header('Access-Control-Allow-Origin', '*')
          .send()
      }

      return this.status(301)
        .header('Location', 'https://hoppscotch.io/')
        .send()
    }

    this.header('Access-Control-Allow-Origin', this.origin).header(
      'Content-Type',
      'application/json'
    )

    const body = await this.parseBody()
    if (!body || !this.isRequestBody(body)) {
      return this.status(400).send({ success: false, message: 'Bad Request' })
    }

    if (typeof body.data === 'object') {
      body.data = JSON.stringify(body.data)
    }

    if (this.app.token && this.app.token !== body.accessToken) {
      return this.status(401).send({
        success: false,
        message: 'Unauthorized Request',
      })
    }

    const proxyMessage = await this.requestProxy(body)
    if (!proxyMessage) {
      return this.status(500).send({
        success: false,
        message: 'Internal Server Error',
      })
    }

    const response = proxyMessage
      .wantsBinary(body.wantsBinary)
      .bannedOutputs(...this.app.bannedOutputs)
      .json()

    return this.status(200).send(response)
  }

  /**
   * Parse request body
   *
   * @returns {RequestBody | null}
   */
  private parseBody(): Promise<RequestBody | null> {
    return new Promise((resolve) => {
      const body: string[] = []
      this.req.setEncoding('utf-8')
      this.req.on('data', (ab) => body.push(ab))

      this.req.on('error', () => resolve(null))

      this.req.on('end', () => {
        if (body.length < 1) return resolve(null)

        try {
          resolve(JSON.parse(body.join('')))
        } catch {
          resolve(null)
        }
      })
    })
  }

  private isRequestBody(body: RequestBody): body is RequestBody {
    return 'url' in body && 'method' in body
  }

  /**
   * Creates ProxyClient and makes a request
   *
   * @param {RequestBody} body
   */
  private async requestProxy(body: RequestBody): Promise<ProxyMessage | null> {
    const proxyClient = new ProxyClient(body)
    try {
      return await proxyClient.send()
    } catch {
      return null
    }
  }

  /**
   * Gets request headers
   */
  public get headers(): http.IncomingHttpHeaders {
    return this.req.headers
  }

  /**
   * Gets request method
   */
  public get method(): string | undefined {
    return this.req.method
  }

  /**
   * Gets request origin
   */
  public get origin(): string {
    return this.headers['origin'] ?? ''
  }

  /**
   * Check if request method is allowed
   */
  public isMethodNotAllowed(): boolean {
    return !this.method || !this.allowedMethods.includes(this.method)
  }

  /**
   * Check if request origin is allowed
   */
  public isOriginAllowed(): boolean {
    return this.origin === '*' || this.app.allowedOrigins.includes(this.origin)
  }

  /**
   * Check if request content type is JSON
   */
  public isContentTypeJSON(): boolean {
    return (this.headers['content-type'] ?? '').includes('application/json')
  }

  /**
   * Set response statusCode
   *
   * @param {number} statusCode
   */
  public status(statusCode: number): this {
    this.res.statusCode = statusCode
    return this
  }

  /**
   * Set response header
   *
   * @param {string} key
   * @param {string} value
   */
  public header(key: string, value: string): this {
    this.res.setHeader(key, value)
    return this
  }

  public send(body?: ErrorResponse | ProxyResponse) {
    return this.res.end(JSON.stringify(body) ?? undefined)
  }
}
