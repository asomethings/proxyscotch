import { BaseResponse } from './base-response'

export interface ProxyResponse extends BaseResponse {
  status: number

  statusText: string

  headers: Record<string, any>

  data: Buffer | string

  isBinary: boolean
}
