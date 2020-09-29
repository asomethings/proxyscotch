import { promises as fs } from 'fs'
import * as http from 'http'
import * as http2 from 'http2'
import { AppOptions } from '../interfaces/app-options'
import { Listener } from './listener'

export class App {
  private _server?: HttpServer
  private listener: Listener

  constructor(private readonly options: AppOptions) {
    this.listener = new Listener(this)
  }

  public async listen(): Promise<HttpServer> {
    const server = await this.server()
    return new Promise((resolve) => {
      server.listen(this.port, this.host, () => {
        this.listeningListener()
        resolve(server)
      })
    })
  }

  /**
   * @returns {Promise<HttpServer>}
   */
  public async server(): Promise<HttpServer> {
    if (!this._server) {
      this._server = await this.createServer()
    }

    return this._server
  }

  /**
   * @returns {boolean}
   */
  public get listening(): boolean {
    return !!(this._server && this._server.listening)
  }

  /**
   * @returns {string}
   */
  public get host(): string {
    return this.options.host ?? '0.0.0.0'
  }

  /**
   * @returns {number}
   */
  public get port(): number {
    return this.options.port ?? 80
  }

  /**
   * @returns {string[]}
   */
  public get allowedOrigins(): string[] {
    return this.options.allowedOrigins ?? []
  }

  /**
   * @returns {string | null}
   */
  public get token(): string | null {
    return this.options.token ?? null
  }

  /**
   * @returns {string[]}
   */
  public get bannedOutputs(): string[] {
    return this.options.bannedOutputs ?? []
  }

  /**
   * @returns {boolean}
   */
  public get isSSL(): boolean {
    return !!(this.options.ssl && this.options.ssl.cert && this.options.ssl.key)
  }

  /**
   * @returns {string}
   */
  public async getSSLCert(): Promise<string> {
    const cert = this.options.ssl!.cert
    const file = await this.readFile(cert)
    return file ?? cert
  }

  /**
   * @returns {string}
   */
  public async getSSLKey(): Promise<string> {
    const key = this.options.ssl!.key
    const file = await this.readFile(key)
    return file ?? key
  }

  /**
   * @returns {Promise<HttpServer>}
   */
  private async createServer(): Promise<HttpServer> {
    const listener = this.listener.handle.bind(this.listener)
    if (this.isSSL) {
      return http2.createSecureServer(
        {
          key: await this.getSSLKey(),
          cert: await this.getSSLCert(),
          allowHTTP1: true,
        },
        listener
      )
    }

    return http.createServer(listener)
  }

  /**
   * @param {string} path
   * @returns {Promise<string>}
   */
  private async readFile(path: string): Promise<string | null> {
    try {
      return await fs.readFile(path, { encoding: 'utf8', flag: 'r' })
    } catch {
      return null
    }
  }

  private listeningListener(): void {
    console.log(`Starting server on ${this.host}:${this.port}`)
  }
}
