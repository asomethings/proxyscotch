import * as http from 'http'

export const now = () => {
  var ts = process.hrtime()
  return ts[0] * 1e3 + ts[1] / 1e6
}

const logger = (
  remoteAddress: string,
  method: string = '',
  url: string,
  httpVersion: string,
  statusCode: number,
  responseTime: string
) => {
  const date = new Date().toISOString()
  console.log(
    `${remoteAddress} - [${date}] ${method} ${url} HTTP/${httpVersion} ${statusCode} ${responseTime}`
  )
}

export const registerLogger = (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  const start = now()

  const onFinish = () => {
    const responseTime = now() - start
    logger(
      req.connection.remoteAddress ?? '',
      req.method,
      `"${req.url}"`,
      req.httpVersion,
      res.statusCode,
      `${responseTime.toFixed(3)}ms`
    )
  }

  res.on('finish', onFinish)
  res.on('error', onFinish)
}
