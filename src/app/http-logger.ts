export class HttpLogger {
  private readonly start: number
  private readonly remoteAddress?: string
  private readonly method?: string
  private readonly url?: string

  constructor(
    private readonly req: HttpRequest,
    private readonly res: HttpResponse
  ) {
    this.start = this.now()

    this.url = `"${this.req.url}"`
    this.method = this.req.method
    this.remoteAddress = this.req.connection.remoteAddress

    res.on('error', this.finish.bind(this))
    res.on('finish', this.finish.bind(this))
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

  private get httpVersion(): string {
    return `HTTP/${this.req.httpVersion}`
  }

  private get statusCode(): string {
    return String(this.res.statusCode)
  }

  private now(): number {
    var ts = process.hrtime()
    return ts[0] * 1e3 + ts[1] / 1e6
  }

  public static register(req: HttpRequest, res: HttpResponse): HttpLogger {
    return new HttpLogger(req, res)
  }
}
