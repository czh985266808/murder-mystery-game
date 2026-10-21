/* ------------------------------------------------------------
   jpegenc.mjs —— 纯 JS 基线 JPEG 编码器（4:2:0，无外部依赖）
   用途：把网站在公网上发的 1MB+ PNG 现场转成 100~200KB 的 JPEG。
   输入是 RGB 像素（3 字节/像素），输出 JPEG Buffer。
   ------------------------------------------------------------ */

/* 编码器版本标记：写进 JPEG 的 COM 段。
   换了编码算法（比如修掉 8x8 块转置）之后，旧图能被识别出来作废重画。 */
export const CODEC_TAG = "dsh-jpeg-v2";

/* JPEG 标准量化表（K.1） */
const STD_LUMA_Q = [
  16, 11, 10, 16, 24, 40, 51, 61,
  12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77,
  24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103, 99,
];
const STD_CHROMA_Q = [
  17, 18, 24, 47, 99, 99, 99, 99,
  18, 21, 26, 66, 99, 99, 99, 99,
  24, 26, 56, 99, 99, 99, 99, 99,
  47, 66, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
];

/* 之字形扫描顺序（由标准定义直接生成，避免手写数组出错） */
const ZIGZAG = (() => {
  const z = new Int32Array(64);
  let k = 0;
  for (let s = 0; s < 15; s++) {
    if (s % 2 === 0) {
      for (let r = Math.min(s, 7); r >= Math.max(0, s - 7); r--) z[k++] = r * 8 + (s - r);
    } else {
      for (let r = Math.max(0, s - 7); r <= Math.min(s, 7); r++) z[k++] = r * 8 + (s - r);
    }
  }
  return z;
})();

const COS = new Float64Array(64);
for (let u = 0; u < 8; u++) for (let x = 0; x < 8; x++) COS[u * 8 + x] = Math.cos((2 * x + 1) * u * Math.PI / 16);
const CSC = new Float64Array(8);
for (let u = 0; u < 8; u++) CSC[u] = u === 0 ? Math.SQRT1_2 : 1;

function quantTables(quality) {
  const q = Math.max(1, Math.min(100, quality | 0));
  const scale = q < 50 ? Math.floor(5000 / q) : 200 - q * 2;
  const mk = (base) => {
    const t = new Int32Array(64);
    for (let i = 0; i < 64; i++) {
      let v = Math.floor((base[i] * scale + 50) / 100);
      if (v < 1) v = 1;
      else if (v > 255) v = 255;
      t[i] = v;
    }
    return t;
  };
  return { luma: mk(STD_LUMA_Q), chroma: mk(STD_CHROMA_Q) };
}

/* ---- 标准霍夫曼表（JPEG Annex K）----
   之前按频率现算的等长表会被严格解码器判成 Bogus（DC 符号出现 12~15 这类非法类别）。
   这里直接用标准表，任何浏览器 / libjpeg 都能收。 */
const DC_LUMA_BITS = [0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0];
const DC_LUMA_VALS = [0,1,2,3,4,5,6,7,8,9,10,11];
const DC_CHROMA_BITS = [0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0];
const DC_CHROMA_VALS = [0,1,2,3,4,5,6,7,8,9,10,11];
const AC_LUMA_BITS = [0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];
const AC_LUMA_VALS = [
  0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,
  0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,
  0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,
  0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,
  0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,
  0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,
  0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,
  0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,
  0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,
  0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,
  0xf9,0xfa,
];
const AC_CHROMA_BITS = [0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,0x77];
const AC_CHROMA_VALS = [
  0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21,0x31,0x06,0x12,0x41,0x51,0x07,0x61,0x71,
  0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91,0xa1,0xb1,0xc1,0x09,0x23,0x33,0x52,0xf0,
  0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34,0xe1,0x25,0xf1,0x17,0x18,0x19,0x1a,0x26,
  0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,
  0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,
  0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x82,0x83,0x84,0x85,0x86,0x87,
  0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,
  0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,
  0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,
  0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,
  0xf9,0xfa,
];

function stdTable(bits, vals) {
  const b = new Int32Array(17);
  for (let l = 1; l <= 16; l++) b[l] = bits[l - 1];
  const code = new Int32Array(256).fill(-1);
  const size = new Int32Array(256);
  let c = 0, p = 0;
  for (let l = 1; l <= 16; l++) {
    for (let i = 0; i < b[l]; i++) { const s = vals[p++]; code[s] = c++; size[s] = l; }
    c <<= 1;
  }
  return { bits: b, vals: Buffer.from(vals), code, size };
}
const DC_LUMA_T = stdTable(DC_LUMA_BITS, DC_LUMA_VALS);
const DC_CHROMA_T = stdTable(DC_CHROMA_BITS, DC_CHROMA_VALS);
const AC_LUMA_T = stdTable(AC_LUMA_BITS, AC_LUMA_VALS);
const AC_CHROMA_T = stdTable(AC_CHROMA_BITS, AC_CHROMA_VALS);


const SIZE_BITS = new Int32Array(4100);

for (let i = 1; i < SIZE_BITS.length; i++) SIZE_BITS[i] = Math.floor(Math.log2(i)) + 1;
const catOf = (v) => {
  const a = v < 0 ? -v : v;
  return a < 4096 ? SIZE_BITS[a] : Math.floor(Math.log2(a)) + 1;
};

/* ---- 位写入器：JPEG 要求 0xFF 后面补 0x00 ---- */
class Bits {
  constructor() { this.buf = Buffer.alloc(1 << 16); this.len = 0; this.acc = 0; this.n = 0; }
  push(code, size) {
    this.acc = (this.acc << size) | code;
    this.n += size;
    while (this.n >= 8) {
      this.n -= 8;
      const b = (this.acc >>> this.n) & 0xff;
      if (this.len + 2 > this.buf.length) { const nb = Buffer.alloc(this.buf.length * 2); this.buf.copy(nb); this.buf = nb; }
      this.buf[this.len++] = b;
      if (b === 0xff) this.buf[this.len++] = 0x00;
    }
    this.acc &= (1 << this.n) - 1;
  }
  end() {
    if (this.n > 0) this.push((1 << (8 - this.n)) - 1, 8 - this.n);
    return this.buf.subarray(0, this.len);
  }
}

function seg(marker, payload) {
  const out = Buffer.alloc(4 + payload.length);
  out.writeUInt16BE(marker, 0);
  out.writeUInt16BE(payload.length + 2, 2);
  payload.copy(out, 4);
  return out;
}

function dqt(id, table) {
  const p = Buffer.alloc(65);
  p[0] = id;
  for (let i = 0; i < 64; i++) p[1 + i] = table[ZIGZAG[i]];
  return seg(0xffdb, p);
}

function dht(cls, id, table) {
  const p = Buffer.alloc(1 + 16 + table.vals.length);
  p[0] = (cls << 4) | id;
  for (let l = 1; l <= 16; l++) p[l] = table.bits[l];
  table.vals.copy(p, 17);
  return seg(0xffc4, p);
}

/**
 * 把 RGB 像素编码成基线 JPEG。
 * @param {number} w 宽度
 * @param {number} h 高度
 * @param {Buffer|Uint8Array} rgb RGB 像素，3 字节/像素
 * @param {number} quality 1~100，越大越清晰、文件越大
 */
export function encodeJpeg(w, h, rgb, quality = 82) {
  if (!w || !h || !rgb || rgb.length < w * h * 3) return null;
  const { luma, chroma } = quantTables(quality);
  const mw = Math.ceil(w / 16) * 16;
  const mh = Math.ceil(h / 16) * 16;
  const mcusX = mw / 16, mcusY = mh / 16;
  const cw = mw >> 1, ch = mh >> 1;

  /* 1) 转 YCbCr（减 128），色度 2x2 平均下采样；出界像素复制边缘 */
  const yPlane = new Float32Array(mw * mh);
  const cbPlane = new Float32Array(cw * ch);
  const crPlane = new Float32Array(cw * ch);
  for (let y = 0; y < mh; y++) {
    const sy = y < h ? y : h - 1;
    const rowOff = sy * w * 3;
    for (let x = 0; x < mw; x++) {
      const sx = x < w ? x : w - 1;
      const i = rowOff + sx * 3;
      const r = rgb[i], g = rgb[i + 1], b = rgb[i + 2];
      yPlane[y * mw + x] = 0.299 * r + 0.587 * g + 0.114 * b - 128;
    }
  }
  for (let cy = 0; cy < ch; cy++) {
    for (let cx = 0; cx < cw; cx++) {
      const x0 = cx * 2, y0 = cy * 2;
      let sr = 0, sg = 0, sb = 0;
      for (let dy = 0; dy < 2; dy++) {
        const y = Math.min(mh - 1, y0 + dy);
        for (let dx = 0; dx < 2; dx++) {
          const x = Math.min(mw - 1, x0 + dx);
          const i = (y < h ? y : h - 1) * w * 3 + (x < w ? x : w - 1) * 3;
          sr += rgb[i]; sg += rgb[i + 1]; sb += rgb[i + 2];
        }
      }
      sr /= 4; sg /= 4; sb /= 4;
      cbPlane[cy * cw + cx] = -0.168736 * sr - 0.331264 * sg + 0.5 * sb;
      crPlane[cy * cw + cx] = 0.5 * sr - 0.418688 * sg - 0.081312 * sb;
    }
  }

  /* 2) 分块 DCT + 量化，系数按 MCU 顺序存下来（Yx4、Cb、Cr） */
  const blocksPerMcu = 6;
  const coef = new Int16Array(mcusX * mcusY * blocksPerMcu * 64);
  const tmp = new Float32Array(64);
  const dct = (src, off, stride, out, outOff, qt) => {
    for (let u = 0; u < 8; u++) {
      for (let y = 0; y < 8; y++) {
        let s = 0;
        const cy = off + y * stride;
        for (let x = 0; x < 8; x++) s += src[cy + x] * COS[u * 8 + x];
        tmp[u * 8 + y] = s;
      }
    }
    for (let u = 0; u < 8; u++) {
      const cu = CSC[u];
      for (let v = 0; v < 8; v++) {
        let s = 0;
        for (let y = 0; y < 8; y++) s += tmp[u * 8 + y] * COS[v * 8 + y];
        // JPEG 的自然序号是 v*8+u（行 = 垂直频率 v，列 = 水平频率 u），量化表也按这个序号查。
        // 存成 u*8+v 会让解码端把每个 8x8 块的系数当成转置矩阵，画面上就是一块块的马赛克。
        let val = 0.25 * cu * CSC[v] * s / qt[v * 8 + u];
        val = val > 0 ? Math.round(val) : -Math.round(-val);
        if (val > 1023) val = 1023; else if (val < -1023) val = -1023;   // 基线 JPEG 系数上限，避免出现表里没有的类别
        out[outOff + v * 8 + u] = val;
      }
    }
  };
  let bp = 0;
  for (let my = 0; my < mcusY; my++) {
    for (let mx = 0; mx < mcusX; mx++) {
      const bx = mx * 16, by = my * 16;
      const bOff = bp * 64;
      dct(yPlane, by * mw + bx, mw, coef, bOff, luma);
      dct(yPlane, by * mw + bx + 8, mw, coef, bOff + 64, luma);
      dct(yPlane, (by + 8) * mw + bx, mw, coef, bOff + 128, luma);
      dct(yPlane, (by + 8) * mw + bx + 8, mw, coef, bOff + 192, luma);
      const cOff = (my * 8) * cw + mx * 8;
      dct(cbPlane, cOff, cw, coef, bOff + 256, chroma);
      dct(crPlane, cOff, cw, coef, bOff + 320, chroma);
      bp += 6;
    }
  }

  /* 3) 6 个块在 MCU 里的分量归属（Yx4 / Cb / Cr） */
  const compOf = [0, 0, 0, 0, 1, 2];

  /* 4) 熵编码 */
  const bits = new Bits();
  const prevDc = new Int32Array(3);
  const emit = (v, dcTable) => {
    const k = catOf(v);
    bits.push(dcTable.code[k], dcTable.size[k]);
    if (k) bits.push(v > 0 ? v : v + (1 << k) - 1, k);
  };
  for (let b = 0; b < bp; b++) {
    const base = b * 64;
    const comp = compOf[b % 6];
    const isChroma = comp !== 0;
    const dcT = isChroma ? DC_CHROMA_T : DC_LUMA_T;
    const acT = isChroma ? AC_CHROMA_T : AC_LUMA_T;
    const dc = coef[base];
    emit(dc - prevDc[comp], dcT);
    prevDc[comp] = dc;
    let run = 0;
    for (let k = 1; k < 64; k++) {
      const v = coef[base + ZIGZAG[k]];
      if (v === 0) { run++; continue; }
      const kk = catOf(v);
      while (run > 15) { bits.push(acT.code[0xf0], acT.size[0xf0]); run -= 16; }
      const sym = (run << 4) | kk;
      bits.push(acT.code[sym], acT.size[sym]);
      bits.push(v > 0 ? v : v + (1 << kk) - 1, kk);
      run = 0;
    }
    if (run > 0) bits.push(acT.code[0x00], acT.size[0x00]);
  }
  const scan = bits.end();

  const jfif = Buffer.alloc(14);
  jfif.write("JFIF\0", 0, "ascii");
  jfif[5] = 1; jfif[6] = 1; jfif[7] = 0;
  jfif.writeUInt16BE(1, 8);
  jfif.writeUInt16BE(1, 10);
  jfif[12] = 0; jfif[13] = 0;

  const sof = Buffer.alloc(6 + 9);
  sof[0] = 8;
  sof.writeUInt16BE(h, 1);
  sof.writeUInt16BE(w, 3);
  sof[5] = 3;
  sof[6] = 1; sof[7] = 0x22; sof[8] = 0;
  sof[9] = 2; sof[10] = 0x11; sof[11] = 1;
  sof[12] = 3; sof[13] = 0x11; sof[14] = 1;

  const sos = Buffer.alloc(10);
  sos[0] = 3;              // 3 个分量
  sos[1] = 1; sos[2] = 0x00;
  sos[3] = 2; sos[4] = 0x11;
  sos[5] = 3; sos[6] = 0x11;
  sos[7] = 0; sos[8] = 63; sos[9] = 0;   // Ss / Se / AhAl

  return Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    seg(0xfffe, Buffer.from(CODEC_TAG)),   // 自己的版本标记（COM 段），解码器会忽略
    seg(0xffe0, jfif),
    dqt(0, luma),
    dqt(1, chroma),
    seg(0xffc0, sof),
    dht(0, 0, DC_LUMA_T),
    dht(1, 0, AC_LUMA_T),
    dht(0, 1, DC_CHROMA_T),
    dht(1, 1, AC_CHROMA_T),
    seg(0xffda, sos),
    scan,
    Buffer.from([0xff, 0xd9]),
  ]);
}
