import * as http from 'http'
import * as https from 'https'
import * as ip from 'ip'
import supertest from 'supertest'
import { App } from '../src/app'

describe('App', () => {
  const host = '127.0.0.1'
  let port: number
  let app: http.Server | https.Server
  const allowedOrigins = ['https://hoppscotch.io']
  const bannedOutputs = [ip.address()]

  beforeAll(async () => {
    port = Math.floor(Math.random() * 65535) + 1
    app = await App({ host, port, allowedOrigins, bannedOutputs })
  })

  test('Host and port parse', async () => {
    expect(app.address()).toMatchObject({ address: host, port })
  })

  test('Allowed origins', async () => {
    const res = await supertest(app).post('').set({ origin: allowedOrigins[0] })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ success: false, message: 'Bad Request' })
    expect(res.headers).toMatchObject({
      'access-control-allow-headers': '*',
      'access-control-allow-origin': allowedOrigins[0],
      'content-type': 'application/json',
    })
  })

  test('Not allowed origin without json content-type', async () => {
    const res = await supertest(app)
      .post('')
      .set({ origin: 'https://github.com' })

    expect(res.status).toBe(301)
    expect(res.headers).toMatchObject({
      'access-control-allow-headers': '*',
      location: 'https://hoppscotch.io/',
    })
  })

  test('Not allowed origin with json content-type', async () => {
    const res = await supertest(app)
      .post('')
      .set({ origin: 'https://github.com', 'content-type': 'application/json' })

    expect(res.status).toBe(200)
    expect(res.headers).toMatchObject({
      'access-control-allow-headers': '*',
      'access-control-allow-origin': '*',
    })
  })

  test('Replace banned outputs', async () => {
    const res = await supertest(app)
      .post('')
      .set({ origin: '*', 'content-type': 'application/json' })
      .send({
        url: 'http://httpbin.org/get',
        method: 'GET',
        wantsBinary: false,
      })

    const body = JSON.stringify(res.body)
    expect(res.status).toBe(200)
    expect(body).not.toMatch(new RegExp('/' + bannedOutputs[0] + '/', 'gi'))
    expect(body).toMatch(/\[redacted\]/)
  })

  test('OPTIONS method', async () => {
    const res = await supertest(app).options('')

    expect(res.status).toBe(200)
    expect(res.headers).toMatchObject({
      'access-control-allow-headers': '*',
      'access-control-allow-origin': '*',
    })
  })

  test('Post method (wantsBinary = false)', async () => {
    const res = await supertest(app)
      .post('')
      .set({ origin: '*', 'content-type': 'application/json' })
      .send({
        url: 'http://httpbin.org/get',
        method: 'GET',
        wantsBinary: false,
      })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      status: 200,
      statusText: 'OK',
      headers: expect.any(Object),
      data: expect.any(String),
      isBinary: false,
    })
    expect(() => JSON.parse(res.body.data)).not.toThrow()
  })

  test('Post method (wantsBinary = true)', async () => {
    const res = await supertest(app)
      .post('')
      .set({ origin: '*', 'content-type': 'application/json' })
      .send({
        url: 'http://httpbin.org/get',
        method: 'GET',
        wantsBinary: true,
      })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      status: 200,
      statusText: 'OK',
      headers: expect.any(Object),
      data: expect.any(String),
      isBinary: true,
    })
    const data = new Buffer(res.body.data, 'base64').toString('utf8')
    expect(() => JSON.parse(data)).not.toThrow()
    expect(JSON.parse(data)).toBeInstanceOf(Object)
  })

  afterAll(() => {
    app && app.close()
  })
})
