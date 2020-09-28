import * as http from 'http'
import {
  Http2SecureServer,
  Http2ServerRequest,
  Http2ServerResponse,
} from 'http2'

declare global {
  type HttpServer = http.Server | Http2SecureServer
  type HttpRequest = http.IncomingMessage | Http2ServerRequest
  type HttpResponse = http.ServerResponse | Http2ServerResponse
}
