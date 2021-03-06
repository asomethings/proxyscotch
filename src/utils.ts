export const stripNewLine = (buffer: Buffer) => {
  const LF = '\n'.charCodeAt(0)
  const CR = '\r'.charCodeAt(0)

  let result: Buffer = buffer
  if (buffer[buffer.length - 1] === LF) {
    result = result.slice(0, result.length - 1)
  }

  if (buffer[buffer.length - 1] === CR) {
    result = result.slice(0, result.length - 1)
  }

  return result
}
