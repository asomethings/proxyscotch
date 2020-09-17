import * as http from 'http'
import { App } from './app'
import { HttpLogger } from './http-logger'
import { RequestHandler } from './request-handler'

export class Listener {
  constructor(private readonly app: App) {}

  public handle() {
    return async (req: http.IncomingMessage, res: http.ServerResponse) => {
      const logger = new HttpLogger(req, res)
      const requestHandler = new RequestHandler(this.app, req, res)
      await requestHandler.response()
      logger.removeAllListener()
    }
  }
}
