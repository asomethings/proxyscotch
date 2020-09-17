import { BaseResponse } from './base-response'

export interface ErrorResponse extends BaseResponse {
  message: string
}
