export class HttpLogger {
  private readonly start: number

  constructor(
    private readonly req: HttpRequest,
    private readonly res: HttpResponse
  ) {
    this.start = this.now()
    res.on('finish', this.finish.bind(this))
    res.on('error', this.finish.bind(this))
  }

  private finish(): void {
    const date = new Date().toISOString()
    console.log(
      `${this.remoteAddress} - [${date}] ${this.method} ${this.url} ${this.httpVersion} ${this.statusCode} ${this.responseTime}`
    )
  }

  private get responseTime(): string {
    return String((this.now() - this.start).toFixed(3)) + 'ms'
  }

  private get remoteAddress(): string {
    return String(this.req.connection.remoteAddress ?? undefined)
  }

  private get method(): string {
    return String(this.req.method ?? undefined)
  }

  private get url(): string {
    return `"${String(this.req.url ?? undefined)}"`
  }

  private get httpVersion(): string {
    return `HTTP/${this.req.httpVersion}`
  }

  private get statusCode(): string {
    return String(
      'statusCode' in this.req ? this.req.statusCode : this.res.statusCode
    )
  }

  private now(): number {
    var ts = process.hrtime()
    return ts[0] * 1e3 + ts[1] / 1e6
  }

  public removeAllListener() {
    this.res.removeAllListeners()
  }
}
