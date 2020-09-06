export interface RequestBody {
  accessToken?: string

  wantsBinary?: boolean

  method: string

  url: string

  auth?: {
    username: string

    password: string
  }

  headers?: Record<string, any>

  data?: string
}
