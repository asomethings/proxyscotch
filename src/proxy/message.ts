import { Response } from 'got'
import { bufferReplace } from '../buffer-replace'
import { ProxyResponse } from '../interfaces/response/proxy-response'
import { stripNewLine } from '../utils'

export class ProxyMessage {
  private _body?: string
  private _bannedOutputs: string[] = []
  private _wantsBinary: boolean = false

  constructor(private readonly response: Response<Buffer>) {}

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
    let buffer = stripNewLine(this.response.body)
    for (const bannedOutput of this._bannedOutputs) {
      buffer = bufferReplace(this.response.body, bannedOutput, '[redacted]')
    }

    this._body = buffer.toString(this._wantsBinary ? 'base64' : 'utf8')

    return this._body
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/\=+$/, '')
  }

  public json(): ProxyResponse {
    return {
      success: true,
      status: this.response.statusCode,
      statusText: this.response.statusMessage ?? '',
      headers: this.response.headers,
      isBinary: this._wantsBinary,
      data: this.body,
    }
  }
}
