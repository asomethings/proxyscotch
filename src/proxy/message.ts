import * as http from 'http'
import { bufferReplace } from '../buffer-replace'
import { stripNewLine } from '../utils'
import { ProxyResponse } from './response'

export class ProxyMessage {
  private _body?: string
  private _bannedOutputs: string[] = []
  private _wantsBinary: boolean = false

  constructor(
    private readonly incomingMessage: http.IncomingMessage,
    private readonly buffer: Buffer
  ) {}

  public get status() {
    return this.incomingMessage.statusCode ?? 500
  }

  public get statusText() {
    return this.incomingMessage.statusMessage ?? 'Internal Server Error'
  }

  public get headers() {
    return this.incomingMessage.headers
  }

  public wantsBinary(value?: boolean): this {
    this._wantsBinary = value ?? false
    return this
  }

  public bannedOutputs(...bannedOutputs: string[]): this {
    this._bannedOutputs = bannedOutputs
    return this
  }

  public get body(): string {
    if (this._body) return this._body
    let buffer = stripNewLine(this.buffer)
    for (const bannedOutput of this._bannedOutputs) {
      buffer = bufferReplace(this.buffer, bannedOutput, '[redacted]')
    }

    this._body = buffer.toString(this._wantsBinary ? 'base64' : 'utf8')

    return this._body
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/\=+$/, '')
  }

  public response(): ProxyResponse {
    return {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      isBinary: this._wantsBinary,
      data: this.body,
    }
  }
}
