export interface AppOptions {
  token?: string

  host?: string

  port?: number

  allowedOrigins?: string[]

  bannedOutputs?: string[]

  ssl?: {
    key: string
    cert: string
  }
}
