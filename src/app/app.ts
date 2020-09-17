import { promises as fs } from 'fs'
import * as http from 'http'
import * as https from 'https'
import { AppOptions } from '../interfaces/app-options'
import { Listener } from './listener'

export class App {
  private _server?: https.Server | http.Server
  private listener: Listener

  constructor(private readonly options: AppOptions) {
    this.listener = new Listener(this)
  }

  public async listen(): Promise<https.Server | http.Server> {
    const server = await this.server()
    return new Promise((resolve) => {
      server.listen(this.port, this.host, () => {
        this.listeningListener()
        resolve(server)
      })
    })
  }

  /**
   * @returns {Promise<http.Server | https.Server>}
   */
  public async server(): Promise<http.Server | https.Server> {
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
   * @returns {typeof http | typeof https}
   */
  private get client(): typeof http | typeof https {
    if (!this.isSSL) return http

    return http
  }

  /**
   * @returns {Promise<http.Server | https.Server>}
   */
  private async createServer(): Promise<http.Server | https.Server> {
    if (!this.isSSL) return this.client.createServer(this.listener.handle())

    return this.client.createServer(
      {
        key: await this.getSSLKey(),
        cert: await this.getSSLCert(),
      },
      this.listener.handle()
    )
  }

  /**
   * @param {string} path
   * @returns {Promise<string>}
   */
  private async readFile(path: string): Promise<string | null> {
    try {
      return fs.readFile(path, { encoding: 'utf8', flag: 'r' })
    } catch {
      return null
    }
  }

  private listeningListener(): void {
    console.log(`Starting server on ${this.host}:${this.port}`)
  }
}
