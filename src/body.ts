import * as http from 'http'
import { RequestBody } from './request'

export const body = (
  req: http.IncomingMessage
): Promise<RequestBody | Record<string, any>> => {
  let buffer: Buffer
  return new Promise((resolve, reject) => {
    req.on('data', (ab) => {
      const chunk = Buffer.from(ab)
      buffer = Buffer.concat(buffer ? [buffer, chunk] : [chunk])
    })
    req.on('end', () => {
      if (buffer) {
        resolve(JSON.parse(buffer.toString()))
      } else {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}
