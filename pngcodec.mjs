/* ------------------------------------------------------------
   PNG 解码 / 编码：原本写在 images.mjs 里，现在独立出来给「压缩转码」复用。
   只处理 8bit RGB、非隔行的 PNG（服务器自己生成的图都是这种）。
   ------------------------------------------------------------ */
import zlib from "node:zlib";

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([len, name, data, crc]);
}

export function pngInfo(buf) {
  if (!buf || buf.length < 24 ||
      buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;
  let o = 8;
  while (o + 8 <= buf.length) {
    const size = buf.readUInt32BE(o);
    if (buf.toString("ascii", o + 4, o + 8) === "IHDR" && size >= 13) {
      const w = buf.readUInt32BE(o + 8);
      const h = buf.readUInt32BE(o + 12);
      if (buf[o + 16] !== 8 || buf[o + 17] !== 2 || buf[o + 20] !== 0) return null;   // 只处理 8bit RGB 非隔行 PNG
      return { w, h };
    }
    o += 12 + size;
  }
  return null;
}

export function decodePng(buf) {
  const info = pngInfo(buf);
  if (!info) return null;
  const ids = [];
  const { w, h } = info;
  let o = 8;
  while (o + 8 <= buf.length) {
    const size = buf.readUInt32BE(o);
    const type = buf.toString("ascii", o + 4, o + 8);
    if (type === "IEND") break;
    if (type === "IDAT") ids.push(buf.subarray(o + 8, o + 8 + size));
    o += 12 + size;
  }
  if (!ids.length) return null;
  let raw;
  try { raw = zlib.inflateSync(Buffer.concat(ids)); } catch (e) { return null; }
  const stride = w * 3;
  const pixels = Buffer.alloc(h * stride);
  const prev = Buffer.alloc(stride);
  let at = 0;
  if (raw.length < h * (stride + 1)) return null;
  for (let y = 0; y < h; y++) {
    const f = raw[at++];
    const row = raw.subarray(at, at + stride);
    at += stride;
    const rec = pixels.subarray(y * stride, (y + 1) * stride);
    if (f === 0) {
      rec.set(row);
    } else if (f === 1) {
      for (let i = 0; i < stride; i++) rec[i] = (row[i] + (i >= 3 ? rec[i - 3] : 0)) & 255;
    } else if (f === 2) {
      for (let i = 0; i < stride; i++) rec[i] = (row[i] + prev[i]) & 255;
    } else if (f === 3) {
      for (let i = 0; i < stride; i++) {
        const a = i >= 3 ? rec[i - 3] : 0;
        rec[i] = (row[i] + ((a + prev[i]) >> 1)) & 255;
      }
    } else if (f === 4) {
      for (let i = 0; i < stride; i++) {
        const a = i >= 3 ? rec[i - 3] : 0;
        const b = prev[i];
        const c = i >= 3 ? prev[i - 3] : 0;
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : ((pb <= pc) ? b : c);
        rec[i] = (row[i] + pr) & 255;
      }
    } else {
      return null;
    }
    prev.set(rec);
  }
  return { w, h, pixels };
}

export function encodePng(w, h, pixels) {
  const out = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) out[y * (w * 3 + 1)] = 0;
  for (let y = 0; y < h; y++) pixels.copy(out, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[12] = 0;
  return Buffer.concat([
    PNG_SIG,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(out, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}
