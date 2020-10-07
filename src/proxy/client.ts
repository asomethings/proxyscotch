import got from 'got'
import { RequestBody } from '../interfaces/request-body'
import { ProxyMessage } from './message'

export class ProxyClient {
  private readonly url: string
  private readonly method: string
  private readonly headers: Record<string, string>
  private readonly body?: string
  private readonly username?: string
  private readonly password?: string

  constructor(options: RequestBody) {
    this.method = options.method
    this.url = options.url
    this.headers = {
      ...(options.headers || {}),
      'User-Agent': 'Proxyscotch/1.0',
    }
    this.body = options.data

    if (options.auth) {
      this.username = options.auth.username
      this.password = options.auth.password
    }
  }

  public async send(): Promise<ProxyMessage> {
    const response = await got(this.url, {
      method: <any>this.method,
      headers: this.headers,
      body: this.body,
      username: this.username,
      password: this.password,
      http2: true,
      responseType: 'buffer',
      timeout: 3000,
      retry: {
        limit: 0,
      },
    })

    return new ProxyMessage(response)
  }
}
