export interface ProxyResponse {
  status: number

  statusText: string

  headers: Record<string, any>

  data: Buffer | string

  isBinary: boolean
}
