import { App } from './app'
import { HttpLogger } from './http-logger'
import { RequestHandler } from './request-handler'

export class Listener {
  constructor(private readonly app: App) {}

  public async handle(req: HttpRequest, res: HttpResponse) {
    HttpLogger.register(req, res)
    const requestHandler = new RequestHandler(this.app, req, res)
    await requestHandler.response()
  }
}
