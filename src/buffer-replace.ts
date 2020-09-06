export const bufferReplace = (
  buffer: Buffer,
  left: string,
  right: string
): Buffer => {
  const index = buffer.indexOf(left)
  if (index === -1) return buffer
  const newLeft = buffer.slice(0, index)
  const newRight = bufferReplace(buffer.slice(index + left.length), left, right)
  const length = index + right.length + newRight.length
  return Buffer.concat([newLeft, Buffer.from(right), newRight], length)
}
