export class BufferCursor {
  view: DataView

  offset = 0

  constructor(public buffer: Buffer, public littleEndian = true) {
    this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  }

  setUint8(value: number) {
    this.view.setUint8(this.offset, value)
    this.offset += 1
  }

  getUint8() {
    const value = this.view.getUint8(this.offset)
    this.offset += 1

    return value
  }

  setUint16(value: number, littleEndian = this.littleEndian) {
    this.view.setUint16(this.offset, value, littleEndian)
    this.offset += 2
  }

  getUint16(littleEndian = this.littleEndian) {
    const value = this.view.getUint16(this.offset, littleEndian)
    this.offset += 2

    return value
  }

  setUint32(value: number, littleEndian = this.littleEndian) {
    this.view.setUint32(this.offset, value, littleEndian)
    this.offset += 4
  }

  getUint32(littleEndian = this.littleEndian) {
    const value = this.view.getUint32(this.offset, littleEndian)
    this.offset += 4

    return value
  }

  setInt32(value: number, littleEndian = this.littleEndian) {
    this.view.setInt32(this.offset, value, littleEndian)
    this.offset += 4
  }

  getInt32(littleEndian = this.littleEndian) {
    const value = this.view.getInt32(this.offset, littleEndian)
    this.offset += 4

    return value
  }

  setFloat32(value: number, littleEndian = this.littleEndian) {
    this.view.setFloat32(this.offset, value, littleEndian)
    this.offset += 4
  }

  getFloat32(littleEndian = this.littleEndian) {
    const value = this.view.getFloat32(this.offset, littleEndian)
    this.offset += 4

    return value
  }

  setFourCC(value: string) {
    this.view.setUint32(
      this.offset,
      value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24),
      true
    )
    this.offset += 4
  }

  getFourCC() {
    const value = this.view.getUint32(this.offset, true)
    this.offset += 4

    return String.fromCharCode(
      value & 0xff,
      (value >> 8) & 0xff,
      (value >> 16) & 0xff,
      (value >> 24) & 0xff
    )
  }
}
