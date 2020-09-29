//@ts-ignore
import * as selfsigned from 'selfsigned'
import request from 'supertest'
import { App } from '../src/app'

describe('Https App', () => {
  const host = '127.0.0.1'
  let port: number
  let server: HttpServer
  let agent: request.SuperAgentTest
  const allowedOrigins = ['https://hoppscotch.io']
  const bannedOutputs = ['Proxyscotch']

  beforeAll(async () => {
    const pems = selfsigned.generate(null, {
      keySize: 2048,
      algorithm: 'sha256',
    })
    port = Math.floor(Math.random() * 65535) + 1
    const app = new App({
      host,
      port,
      allowedOrigins,
      bannedOutputs,
      ssl: {
        key: pems.private,
        cert: pems.cert,
      },
    })
    server = await app.listen()
    agent = request.agent('https://' + host + ':' + port)
  })

  test('Host and port parse', async () => {
    expect(server.address()).toMatchObject({ address: host, port })
  })

  test('HTTP/1 Connection', async () => {
    const res: any = await agent.get('/').trustLocalhost()

    expect(res.res.constructor.name).toBe('IncomingMessage')
    expect(res.status).toBe(405)
  })

  test('HTTP/2 Connection', async () => {
    const res: any = await agent.get('/').trustLocalhost().http2()

    expect(res.res.constructor.name).toBe('ClientHttp2Stream')
    expect(res.status).toBe(405)
  })

  afterAll(() => {
    server && server.close()
  })
})
