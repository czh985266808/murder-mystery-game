// ============================================================
//  AI 实景图：只生成一次，之后一直走本地缓存
//
//  ★ 生成一次就落盘到 cache/img/，下一次任何玩家打开都直接读文件。
//  ★ 服务器启动时**整批预生成**：每一本剧本的封面 + 六个角色头像 + 十二张场景图，
//    再加一张全局网页底图，全都排队画好——玩家进来之前就该在缓存里（需求 2）。
//  ★ 出图只走 Agnes（本地 DSH 插件里的账号，或环境变量 AGNES_API_KEY），
//    不再使用 pollinations / a0 这类免费服务——它们画质与稳定性都不够。
//    接口失败时按 0s / 12s / 30s / 60s 退避重试。
//  ★ 全部失败 → 给一张本地 SVG 占位图（绝不白屏），过几分钟自动再试。
//  ★ 零依赖：只用 node:fs / node:path / node:crypto 和内置 fetch。
// ============================================================

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { encodeJpeg, CODEC_TAG } from "./jpegenc.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const IMG_DIR = path.join(ROOT, "cache", "img");
fs.mkdirSync(IMG_DIR, { recursive: true });

const TIMEOUT_MS = 90000;
const MAX_PARALLEL = 1;          // 免费服务一次只允许一张在飞
const RETRY_AFTER_MS = 180000;   // 彻底失败之后，多久才允许再试
const GAP_MS = 1200;             // 两张图之间歇一下
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 六个人物的肖像提示词（中文人设写在 data/characters.mjs 里）
   ★ 头像规则（用户需求）：每一条都要写全【时代 · 国别/人种 · 年龄 · 性别 · 身份职业 ·
     服饰发型 · 神态】；中国 / 民国题材一律 Chinese，不能出现欧美面孔；奇幻玄幻
     （童话、仙侠、志怪）可以脱离现实，但整本要用同一套画风，并且跟题材对得上。
   ★ 新剧本加角色时，照着下面每一条的字段顺序写，缺一项都算不合格。 */
export const PORTRAIT_PROMPTS = {
  // 《雪夜急诊室》：2024 雪夜急诊科，六人本（bare id 覆盖旧表同名键）
  hsy: "portrait photograph of a 44-year-old Chinese man, 1940s Shanghai, an accountant and steward, dark long robe, round glasses, groomed moustache, nervous guarded expression, age 44, cinematic film still",
  san: "portrait photograph of a 58-year-old Chinese man, 1940s Shanghai, a traditional medicine doctor, grey long gown, small round glasses, thin white hair, calm face, age 58, cinematic film still",
  zha: "portrait photograph of a 33-year-old Chinese man, 1940s Shanghai, a comprador, slicked hair, navy suit and gold watch chain, sharp salesman smile, age 33, cinematic film still",
  ou: "portrait photograph of a 31-year-old Chinese woman, 2024, hospital pharmacist, white coat and low bun, uneasy thoughtful expression, age 31, cinematic film still",
  wu: "portrait photograph of a 46-year-old Chinese woman, 1940s Chinese night train, a dining car cook, hair in a low bun, blue cotton jacket and apron, round honest face, age 46, cinematic film still",
  rong: "portrait photograph of a 39-year-old Chinese woman, 1940s Chinese night train, a train stewardess, neat low bun, dark blue train uniform, steady wary face, age 39, cinematic film still",
  // 旧本提示词
  shen: "portrait photograph of a 32-year-old Chinese man, 1990s mainland China, a businessman in a sharp dark suit, short black hair, tired and angry eyes, standing in a dim hallway",
  mu: "portrait photograph of a 27-year-old Chinese woman, 1990s mainland China, soft features, paint-stained fingers, oversized wool sweater, anxious wary look",
  su: "portrait photograph of a 30-year-old Chinese woman, 1990s mainland China, a professional secretary, thin glasses, neat hair bun, notepad held to her chest, composed expression",
  zhou: "portrait photograph of a 41-year-old Chinese man, 1990s mainland China, a family doctor, short black hair, wire-rimmed glasses, dark wool coat, black medical bag, unreadable calm face",
  he: "portrait photograph of a 34-year-old Chinese man, 2024, emergency resident physician, white coat and round glasses, restrained anxious expression, age 34, cinematic film still",
  ye: "portrait photograph of a 29-year-old Chinese man, 1990s mainland China, a writer, short tousled hair, worn leather jacket, a cassette recorder hanging from a shoulder strap",
  // 《锦华戏院 · 末场》的六个人（id 不和雾港重名，所以放同一个表里就行）
  luo: "portrait photograph of a 34-year-old Chinese man, 1990s mainland China, a Peking opera wu sheng actor, strong build, short cropped hair, stage makeup half wiped off, dark padded jacket over his costume, hard unreadable stare",
  liu: "portrait photograph of a 37-year-old Chinese woman, 1990s mainland China, a Peking opera qingyi actress, hair pulled back, faint stage makeup, dark 1990s wool coat, tired sorrowful eyes",
  wen: "portrait photograph of a 57-year-old Chinese man, 1990s mainland China, an opera troupe jinghu fiddler, thin grey hair, deep wrinkles, worn grey wool jacket, a two-stringed fiddle tucked under his arm",
  cheng: "portrait photograph of a 62-year-old Chinese woman, 1990s mainland China, a troupe manager and costume mistress, white hair, dark jacket, qipao collar, stern matriarchal look",
  qin: "portrait photograph of a 23-year-old Chinese woman, 1990s mainland China, a jingju performer in training, high ponytail, padded leotard, full face makeup excuse, bright uneasy eyes",
  kang: "portrait photograph of a 48-year-old Chinese man, 1990s mainland China, a stagehand and security guard, rugged face, cloth cap, worn padded jacket, watchful expression",
  // 《雪夜急诊室》
  zhang: "portrait photograph of a 36-year-old Chinese man, 2024, emergency doctor, white coat and short black hair, calm exhausted expression, age 36, cinematic film still",
  wei: "portrait photograph of a 45-year-old Chinese woman, 2024, hospital medical administration director, dark professional suit and short hair, composed scrutinizing expression, age 45, cinematic film still",
  // 旧占位（不再使用，但保留防止其它历史数据索引缺 key）
  qisu: "portrait photograph of a 29-year-old Chinese woman, 2024, ER nurse, nurse uniform and ponytail, tired alert expression, age 29, cinematic film still",
  sa: "portrait photograph of a 42-year-old Chinese man, 2024, head nurse supervisor, head-nurse uniform and short hair, stern watchful expression, age 42, cinematic film still",
  hren: "old portrait placeholder",
  zsen: "old portrait placeholder",
  oqiu: "old portrait placeholder",
  wyun: "old portrait placeholder",
  hemore: "old portrait placeholder",
  // 《戏台惊梦》
  "xi1": "cinematic portrait of a 35-year-old Chinese male opera drummer in 1928, thin face, hair in short braid, blue cotton long gown, drumming arm guards, guarded eyes, soft key light, film grain",
  "xi2": "cinematic portrait of a 26-year-old Chinese female opera actress in 1928, oval face, hair with stage ornaments, blue cape, silver earring, film grain",
  "xi3": "cinematic portrait of a 31-year-old Chinese male opera clown in 1928, round face, hair cropped short, old robes, flat cloth shoes, playful nervous eyes, film grain",
  "xi4": "cinematic portrait of a 42-year-old Chinese female costume mistress in 1928, hair in a round bun, apron with needles, measuring tape, film grain",
  "xi5": "cinematic portrait of a 48-year-old Chinese male theater manager in 1928, square face, hair in short comb, round glasses, black wool long robe, keys, film grain",
  "xi6": "cinematic portrait of a 29-year-old Chinese female opera musician in 1928, hair tied up, moon-white gown, holding a huqin, film grain",
  // 《千灯古镇》
  "qd1": "cinematic portrait of a 34-year-old Chinese male lantern maker in an ancient town, hair tied in a short queue, old cloth gown, hands with calluses, paper knife at waist, paper lanterns behind, film grain",
  "qd2": "cinematic portrait of a 27-year-old Chinese female embroiderer in an ancient town, hair bun with wooden hairpin, blue cloth dress with plum embroidery, white jade button, film grain",
  "qd3": "cinematic portrait of a 41-year-old Chinese male incense shop owner in an ancient town, short hair, dark cotton jacket with patched sleeves, ash-stained hands, incense shelves behind, film grain",
  "qd4": "cinematic portrait of a 45-year-old Chinese female dumpling vendor in an ancient town, blue cloth headscarf, apron with flour stains, sugar jars behind, film grain",
  "qd5": "cinematic portrait of a 52-year-old Chinese male accountant in an ancient town, thin face, copper-rimmed glasses, black cotton gown, old ledger under arm, film grain",
  // 《星海归途》
  "xh1": "cinematic portrait of a 33-year-old Chinese male deep-space engineer in a near-future starship, short hair, dark blue work uniform, old scar on left hand, oil-stained sleeves, film grain",
  "xh2": "cinematic portrait of a 29-year-old Chinese female starship doctor, shoulder-length hair, white medical coat over grey suit, old fountain pen, film grain",
  "xh3": "cinematic portrait of a 38-year-old Chinese male starship navigator, low ponytail, dark grey uniform, navigation badge on sleeve, film grain",
  "xh4": "cinematic portrait of a 31-year-old Chinese female cargo manager in a starship, short hair, orange work uniform, key chain on chest, film grain",
  "xh5": "cinematic portrait of a 27-year-old Chinese female starship ecologist, twin braids, pale green uniform with leaf patch, film grain",
  "xh6": "cinematic portrait of a 44-year-old Chinese female starship cook, short hair, white chef uniform, apron with spoons, film grain",
  "xh7": "cinematic portrait of a 36-year-old Chinese male starship security officer, buzz cut, black uniform, access card and stun baton, film grain",
};


/** 网页底图：全局一张，不跟剧本走（需求 3：符合剧本杀气质的背景，生成一次就一直用） */
export const BG_ID = "mm-bg";
export const BG_PROMPT = "modern Chinese hospital night corridor during a snowstorm, cold fluorescent lighting, dark snow-covered windows, a single warm desk lamp at the nursing station far away, no people, cinematic film still";

/** 需求 9：地图不再用前端手画的方块图，改成 AI 画一张平面图（和头像一样生成一次就永久缓存），点开能看大图。
    ★ 图里绝不出现文字：房间名由前端的文字图例给出，图上带字一定是乱码。
    ★ 提示词里写清"单层、俯视、墙体、门、走廊、楼梯、院子"，画出来才像平面图而不是风景画。 */
//   ★ 这里只写"画法"，不写"这是什么建筑"——老宅 / 医院 / 飞船各写各的才对。
export const MAP_PROMPT = "top-down architectural floor plan, hand-drawn ink linework with light watercolour washes on warm paper, seen from directly above, single floor, clearly separated rooms with walls, doorways, corridors and simple furniture silhouettes, readable and uncluttered layout, muted palette, aged paper texture, no text, no letters, no labels, no legend, no compass, no scale bar, no grid, no people";

/** "这是什么建筑"从剧本自己的场景提示词里推出来：每个地点 img 的第一段取公共前缀。
    雪夜急诊室 → "a modern hospital"、千灯古镇 → "ancient Chinese"、星海归途 → "near-future starship"、
    戏台惊梦 → "1928 Chinese opera"。这样医院不会被画成老宅、飞船不会被画成四合院。
    剧本里自己写了 pack.mapPrompt 就优先用它。 */
export function mapSettingOf(pack) {
  if (pack && pack.mapPrompt) return String(pack.mapPrompt);
  const firsts = (((pack && pack.locations) || []).map((l) => String((l && l.img) || "").split(",")[0].trim())).filter(Boolean);
  if (!firsts.length) return "the building where this story takes place";
  let common = firsts[0].split(/\s+/);
  for (const f of firsts.slice(1)) {
    const w = f.split(/\s+/);
    let k = 0;
    while (k < common.length && k < w.length && common[k].toLowerCase() === w[k].toLowerCase()) k++;
    common = common.slice(0, k);
  }
  return common.join(" ") || firsts[0];
}

export function mapPromptOf(pack) {
  const n = (pack && pack.locations ? pack.locations.length : 0);
  const lay = pack && pack.layout;
  let extra = "";
  if (lay && Array.isArray(lay.areas) && lay.areas.length) {
    // 需求 1：地图形状要跟剧本里定好的建筑分区对得上，前端叠的房间名才不会落错地方
    extra = lay.areas.map((a) => {
      const rooms = ((lay.slots ? Object.keys(lay.slots) : []) || [])
        .filter((id) => lay.slots[id] && lay.slots[id].area === a.id)
        .length;
      return (a.nameEn || a.name) + " (" + rooms + " room" + (rooms === 1 ? "" : "s") + ")";
    }).join(", ");
  }
  return "the building in this story: " + mapSettingOf(pack) + ", " + MAP_PROMPT +
    (extra ? " The plan is drawn as one continuous building whose layout follows this exact arrangement, area by area in this order: " + extra + ", with corridors and doorways joining them, every room a clearly separate space with its own walls." : "") +
    (n ? " The plan reads as one single building divided into about " + n + " separate rooms, every room clearly distinct and easy to tell apart, matching the rooms of the story." : "");
}


/** 统一风格后缀——所有图看起来像同一部电影里的 */
const STYLE = {
  bg: "cinematic dark wide shot, deep shadows, moody teal and amber light, drifting fog, 1990s Chinese period setting, 35mm film grain, empty scene, no people, atmospheric, highly detailed",
  // 场景图也跟着剧本走：年代 / 国别对得上（雾港是 1998 年冬的山庄，戏院是 1997 年秋的戏园子），
  // 所以这里不写死年代与天气——那属于每条 loc 提示词自己的事。
  loc: "cinematic film still, moody dim interior lighting, cold blue and amber palette, period-accurate set dressing matching the stated era and country, 35mm film grain, muted desaturated colors, empty room, atmospheric, highly detailed",
  clue: "close-up evidence photograph on a dark surface, harsh direct flash, shallow depth of field, police case file aesthetic, 35mm film grain, dark background, highly detailed",
  map: "clean architectural plan illustration, even lighting, crisp ink outlines over soft watercolour, flat paper texture, top-down orthographic view, no text, no letters, no numbers",
  char: "cinematic film still, half-length portrait of one person, period-accurate costume hairstyle and props matching the stated era and country, soft directional key light with gentle falloff, shallow depth of field with a clean softly blurred background, natural skin texture with visible pores and fine lines, catchlight in the eyes, muted film color grading, 35mm film grain, photorealistic, slightly desaturated, no illustration, no cartoon, no 3d render, no studio beauty retouch",
};

/* 画风可选：二次元 / 电影剧照 / 美式写实漫画 / 水墨写意，也可以选更贴近题材与人物设定的画风。
   头像提示词或剧本包里写明了画风时按它走；没写明才退回默认电影剧照。地图保持原方案不动。 */
const ART_STYLE = {
  animeChar: "anime style, clean bold line art, soft cel shading, expressive vibrant colors, half-length portrait of one person, clean detailed illustration",
  comicChar: "American realistic comic book style, bold confident ink linework, expressive painterly shading, half-length portrait of one person, detailed character rendering",
  inkChar: "Chinese ink wash painting style, free expressive brush strokes, wet ink gradation, delicate paper texture, minimal restrained color, half-length portrait of one person, elegant traditional artwork",
  animeLoc: "anime background artwork, clean bold line art, soft cel shading, detailed scenery, atmospheric, highly detailed, no people",
  comicLoc: "American realistic comic background artwork, expressive ink linework, painterly shading, detailed scenery, atmospheric, highly detailed, no people",
  inkLoc: "Chinese ink wash scenery painting, expressive brush strokes, wet ink gradation, minimal color accents, detailed scenery, atmospheric, no people",
};
const isAnime = (t) => /anime|二次元|日漫|日本动画|manga|动画风|卡通风/i.test(t);
const isComic = (t) => /american realistic comic|美式.{0,8}漫画|漫画风|comic style|ink linework.*painterly/i.test(t);
const isInk = (t) => /chinese ink wash|watercolour painting|watercolor painting|水墨|写意|水彩画|墨韵/i.test(t);

function styleChoice(kind, prompt, preferred) {
  const t = String(prompt || "") + " " + String(preferred || "");
  if (kind === "char") {
    if (isAnime(t)) return ART_STYLE.animeChar;
    if (isComic(t)) return ART_STYLE.comicChar;
    if (isInk(t)) return ART_STYLE.inkChar;
    return STYLE.char;
  }
  if (kind === "loc") {
    if (isAnime(t)) return ART_STYLE.animeLoc;
    if (isComic(t)) return ART_STYLE.comicLoc;
    if (isInk(t)) return ART_STYLE.inkLoc;
    return STYLE.loc;
  }
  return STYLE[kind] || STYLE.loc;
}

const NEGATIVE = "no text, no letters, no watermark, no signature, no logo";
const SIZE = {
  bg: { width: 1280, height: 720 },
  loc: { width: 512, height: 288 },
  clue: { width: 768, height: 768 },
  char: { width: 258, height: 344 },
  cover: { width: 1024, height: 576 },
  map: { width: 1024, height: 768 },
};
const RESIZE_KINDS = new Set(["char", "loc", "bg", "cover"]);
const JPEG_QUALITY = 88;

export function buildPrompt(kind, prompt, preferredStyle) {
  return [String(prompt || "a dim empty room in an old mansion").trim(), styleChoice(kind, prompt, preferredStyle), NEGATIVE].join(", ");
}

/* ------------------------------------------------------------
   缓存文件
   ------------------------------------------------------------ */

const safe = (s) => String(s).replace(/[^a-zA-Z0-9_.-]/g, "_");
const baseName = (kind, id) => safe(kind) + "__" + safe(id);
const EXTS = ["png", "jpg", "webp"];
const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** 已经落盘的那张图（找不到就给默认的 .jpg 路径） */
export function fileOf(kind, id) {
  for (const e of EXTS) {
    const p = path.join(IMG_DIR, baseName(kind, id) + "." + e);
    try { if (fs.statSync(p).size > 1024) return p; } catch {}
  }
  return path.join(IMG_DIR, baseName(kind, id) + ".jpg");
}

export function mimeOf(file) {
  const e = String(file).split(".").pop().toLowerCase();
  return MIME[e] || "image/jpeg";
}

export function placeholderOf(kind, id) {
  return path.join(IMG_DIR, baseName(kind, id) + ".ph.svg");
}

/**
 * 本地缓存版本号。0 = 还没有真图；>0 = 图已经生成好了。
 * 用文件修改时间当版本号，前端把版本拼进 URL，天然避开浏览器缓存。
 */
const versionCache = new Map();   // "kind:id" -> 版本号（每次给玩家算 state 都要问几十张图，不能次次 statSync）
const versionMiss = new Set();    // 确定还没生成好的，也记住，免得反复 statSync 失败的路径

/** 读 JPEG 的 SOF 尺寸（只读文件头，不整图解码） */
function jpegDims(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1]; i += 2;
    if (m === 0xd8 || m === 0xd9) continue;
    const len = buf.readUInt16BE(i);
    if ((m >= 0xc0 && m <= 0xc3) || (m >= 0xc5 && m <= 0xc7) || (m >= 0xc9 && m <= 0xcb) || (m >= 0xcd && m <= 0xcf)) {
      return { h: buf.readUInt16BE(i + 3), w: buf.readUInt16BE(i + 5) };
    }
    i += len;
  }
  return null;
}

/** 旧图作废：编码器换过版本，或尺寸规格变过，都要按新规格重画（PNG 是兜底，别删） */
function staleFile(kind, file) {
  if (process.env.NO_IMG === "1") return false;   // 测试/只读模式下不出新图，旧图继续用，别让封面掉成底图
  if (!/\.jpe?g$/i.test(file)) return false;      // 非 JPEG 的兜底文件不判废
  let fd;
  try {
    fd = fs.openSync(file, "r");
    const head = Buffer.alloc(4096);
    const n = fs.readSync(fd, head, 0, head.length, 0);
    const buf = head.subarray(0, n);
    // 旧编码器（8x8 块转置 bug）画的图没有这个标记，一律作废重画
    if (buf.indexOf(CODEC_TAG) < 0) return true;
    const size = SIZE[kind];
    if (size && RESIZE_KINDS.has(kind)) {
      const d = jpegDims(buf);
      if (d && (d.w !== size.width || d.h !== size.height)) return true;
    }
    return false;
  } catch { return false; } finally { if (fd !== undefined) try { fs.closeSync(fd); } catch {} }
}

export function versionOf(kind, id) {
  const k = kind + ":" + id;
  if (versionCache.has(k)) return versionCache.get(k);
  if (versionMiss.has(k)) return 0;
  const file = fileOf(kind, id);
  try {
    const st = fs.statSync(file);
    if (st.size > 1024) {
      if (staleFile(kind, file)) { versionMiss.add(k); return 0; }   // 不删旧文件，等重画时原子覆盖，避免服务端读到空档
      const v = Math.round(st.mtimeMs); versionCache.set(k, v); return v;
    }
  } catch {}
  versionMiss.add(k);
  return 0;
}

/** 图生成好之后必须把旧结论忘掉，否则会一直读到 0 */
function forget(kind, id) {
  const k = kind + ":" + id;
  versionMiss.delete(k);
  versionCache.delete(k);
  try { versionCache.set(k, Math.round(fs.statSync(fileOf(kind, id)).mtimeMs)); } catch {}
}

/* ------------------------------------------------------------
   任务队列
   ------------------------------------------------------------ */

const jobs = new Map();   // "kind:id" -> { status, waiters, lastError, attempts, at }
const queue = [];
let active = 0;
let onDone = null;

/** 服务器注册：有图生成好时回调，用来把新版本号推给房间里的所有人 */
export function setOnDone(fn) { onDone = fn; }
const keyOf = (kind, id) => kind + ":" + id;

function pump() {
  while (active < MAX_PARALLEL && queue.length) {
    const job = queue.shift();
    active++;
    Promise.resolve()
      .then(() => run(job))
      .catch(() => {})
      .finally(() => {
        active--;
        const j = jobs.get(job.key);
        if (j) { j.status = "done"; for (const w of j.waiters) { try { w(); } catch {} } j.waiters = []; }
        try { if (onDone) onDone(job.kind, job.id, versionOf(job.kind, job.id)); } catch {}
        pump();
      });
  }
}

/**
 * 确保这张图正在生成或已经生成好。**立刻返回**，不阻塞任何请求。
 * 返回 { status: "ready" | "generating", version }
 */
export function ensure(kind, id, prompt, style) {
  // 关掉出图（测试、或者你在用流量上网）：只读缓存，不再联网要图
  if (process.env.NO_IMG === "1") return { status: "off", version: versionOf(kind, id) };
  const v = versionOf(kind, id);
  if (v > 0) return { status: "ready", version: v };
  const key = keyOf(kind, id);
  const j = jobs.get(key);
  if (j) {
    if (j.status === "failed") {
      if (Date.now() - j.at < RETRY_AFTER_MS) return { status: "generating", version: 0 };  // 冷静期
      jobs.delete(key);
    } else if (j.status !== "done") {
      return { status: "generating", version: 0 };
    } else {
      jobs.delete(key);   // 上一轮的记录，重开一次
    }
  }
  const final = buildPrompt(kind, prompt, style);
  jobs.set(key, { status: "queued", waiters: [], attempts: 0, at: Date.now(), prompt: final });
  queue.push({ key, kind, id, style, prompt: final });
  pump();
  return { status: "generating", version: 0 };
}

/** 等到这张图真的生成好（测试用；网页端不需要） */
export function whenReady(kind, id) {
  if (versionOf(kind, id) > 0) return Promise.resolve(true);
  const j = jobs.get(keyOf(kind, id));
  if (!j) return Promise.resolve(false);
  return new Promise((res) => j.waiters.push(() => res(versionOf(kind, id) > 0)));
}

/** 后台慢慢把一批图排上队 */
export function warm(list) {
  for (const it of list || []) {
    try { ensure(it.kind, it.id, it.prompt, it.style); } catch {}
  }
}

/** 一本剧本要用到的全部图：封面 + 六个角色头像 + 十二张场景图 */
export function packImages(pack) {
  const packStyle = String((pack && (pack.artStyle || pack.style)) || "");
  const list = [{ kind: "cover", id: pack.id + "-cover", prompt: pack.cover }];
  for (const c of pack.characters || []) {
    list.push({
      kind: "char",
      id: pack.id + "-" + c.id,
      prompt: c.portrait || c.img || PORTRAIT_PROMPTS[c.id] || ("portrait of " + (c.name || c.id)),
      style: (c.avatarSpec && c.avatarSpec.style) || c.style || packStyle,
    });
  }
  for (const l of pack.locations || []) list.push({ kind: "loc", id: pack.id + "-" + l.id, prompt: l.img, style: packStyle });
  return list;
}

/** 删除一本剧本时把属于它的图也删掉（封面、头像、场景），不动其它剧本和全局底图 */
export function deletePackAssets(packId) {
  const safeId = safe(packId);
  const prefixes = ["cover__" + safeId + "-cover.", "char__" + safeId + "-", "loc__" + safeId + "-", "map__" + safeId + "-"];
  let removed = 0;
  let files = [];
  try { files = fs.readdirSync(IMG_DIR); } catch {}
  for (const f of files) {
    if (prefixes.some((x) => f.startsWith(x))) {
      try { fs.unlinkSync(path.join(IMG_DIR, f)); removed++; } catch {}
    }
  }
  return removed;
}

/** 一本剧本要用到的图 + 全局底图，合成一张清单（缓存状态、预热、进度都看它） */
export function allImages(packs) {
  const all = [{ kind: "bg", id: BG_ID, prompt: BG_PROMPT }];
  for (const pk of packs || []) all.push(...packImages(pk));
  return all;
}

/** 服务器一起来就把所有剧本的图排上队（需求 2：玩之前必须已经生成完） */
export function prewarm(packs) {
  const all = allImages(packs);
  warm(all);
  return all.length;
}

/* ------------------------------------------------------------
   出图进度：需求「首次创建房间之前，头像 / 搜证场景 / 局内底图必须已经缓存好」
   ------------------------------------------------------------ */

/** 这批图里还有几张没落盘（含正在生成、排队中、失败待重试） */
export function pendingOf(list) {
  let pending = 0;
  const missing = [];
  for (const it of list || []) {
    if (versionOf(it.kind, it.id) > 0) continue;
    pending++;
    if (missing.length < 24) missing.push(it.kind + ":" + it.id);
  }
  return { total: (list || []).length, pending, missing };
}

/** 只统计某一类（char / loc / cover / bg）：用来在等待页上说清"头像好了几张" */
export function pendingByKind(list) {
  const out = { total: 0, pending: 0, char: 0, charPending: 0, loc: 0, locPending: 0, cover: 0, coverPending: 0, bg: 0, bgPending: 0 };
  for (const it of list || []) {
    const k = it.kind === "char" ? "char" : it.kind === "loc" ? "loc" : it.kind === "cover" ? "cover" : it.kind === "bg" ? "bg" : null;
    const miss = versionOf(it.kind, it.id) > 0 ? 0 : 1;
    out.total++; out.pending += miss;
    if (k) { out[k]++; out[k + "Pending"] += miss; }
  }
  return out;
}

/** 这批图是不是已经全部在 cache/img 里了（真图，不是占位 SVG） */
export function imagesReady(list) {
  for (const it of list || []) if (versionOf(it.kind, it.id) <= 0) return false;
  return true;
}

/* ------------------------------------------------------------
   真正去要图：两家服务，按顺序试
   ------------------------------------------------------------ */

function seedOf(kind, id) {
  return crypto.createHash("sha1").update(kind + "/" + id).digest().readUInt32BE(0) % 1000000;
}

/* ---------- Agnes 出图：唯一外部出图方案，不用 pollinations / a0 ---------- */

const AGNES_MODEL = "agnes-image-2.1-flash";
const AGNES_CN_ENDPOINT = "https://api.agnes-ai.cn/v1";

function agnesHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
}

function agnesStateFile() {
  return path.join(agnesHome(), "ag-multimodal.json");
}

function findAgnesPluginDefault() {
  const base = agnesHome();
  const roots = [path.join(base, "node_modules"), path.join(base, "profiles")];
  const out = { endpoint: AGNES_CN_ENDPOINT, key: "" };
  for (const root of roots) {
    let names = [];
    try { names = fs.readdirSync(root); } catch {}
    const dirs = root === path.join(base, "profiles")
      ? names.map((n) => path.join(root, n, "node_modules", "dsh-agnes-multimodal", "lib", "index.js"))
      : [path.join(root, "dsh-agnes-multimodal", "lib", "index.js")];
    for (const idx of dirs) {
      try {
        const src = fs.readFileSync(idx, "utf8");
        const ep = src.match(/DEFAULT_ENDPOINT\s*=\s*"([^"]+)"/);
        const key = src.match(/DEFAULT_API_KEY\s*=\s*"([^"]+)"/);
        if (key) out.key = key[1];
        if (ep) out.endpoint = ep[1];
        if (out.key) return out;
      } catch {}
    }
  }
  return out;
}

function agnesAccount() {
  try {
    const st = JSON.parse(fs.readFileSync(agnesStateFile(), "utf8"));
    if (st && Array.isArray(st.accounts)) {
      for (const a of st.accounts) {
        if (a && typeof a.endpoint === "string" && typeof a.key === "string" && a.key.trim()) {
          return { endpoint: a.endpoint.trim(), key: a.key.trim() };
        }
      }
    }
    if (st && typeof st.agnesApiKey === "string" && st.agnesApiKey.trim()) {
      return { endpoint: AGNES_CN_ENDPOINT, key: st.agnesApiKey.trim() };
    }
  } catch {}
  const fromPlugin = findAgnesPluginDefault();
  if (fromPlugin.key) return fromPlugin;
  return { endpoint: AGNES_CN_ENDPOINT, key: process.env.AGNES_API_KEY || "" };
}

function agnesSize(kind) {
  if (kind === "char") return "258x344";
  if (kind === "clue") return "1024x1024";
  if (kind === "bg") return "1280x720";
  if (kind === "cover") return "1024x576";
  if (kind === "map") return "1024x768";
  return "512x288";
}

const PROVIDERS = [{ name: "agnes" }];

/** Agnes 出图按同一账号重试；只有 Agnes，没有免费图站兜底 */
const PLAN = [
  { p: 0, wait: 0 },
  { p: 0, wait: 12000 },
  { p: 0, wait: 30000 },
  { p: 0, wait: 60000 },
];

async function run(job) {
  let lastErr = null;
  for (const step of PLAN) {
    if (step.wait) await sleep(step.wait);
    const rec = jobs.get(job.key);
    if (rec) { rec.attempts = (rec.attempts || 0) + 1; rec.provider = PROVIDERS[step.p].name; }
    try {
      const file = await fetchInto(job, step.p);
      if (rec) { rec.lastError = null; rec.provider = PROVIDERS[step.p].name; }
      await sleep(GAP_MS);
      return file;
    } catch (e) {
      lastErr = e;
      if (rec) rec.lastError = (PROVIDERS[step.p].name + "：" + String(e.message || e)).slice(0, 120);
    }
  }
  const rec = jobs.get(job.key);
  if (rec) { rec.status = "failed"; rec.at = Date.now(); }
  console.log("[图片] " + job.kind + "/" + job.id + " 最终失败：" + (lastErr && lastErr.message));
  throw lastErr;
}

const MAGIC = [
  { ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 },
  { ext: "png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e },
  { ext: "webp", test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
];

async function fetchInto(job) {
  const { kind, id } = job;
  const acc = agnesAccount();
  if (!acc.key) throw new Error("Agnes 没有可用账号。请在 DSH 设置里配置 dsh-agnes-multimodal，或设置 AGNES_API_KEY。");
  const endpoint = acc.endpoint.replace(/\/+$/, "") + "/images/generations";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: "Bearer " + acc.key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AGNES_MODEL,
      prompt: buildPrompt(job.kind, job.prompt),
      size: agnesSize(job.kind),
      extra_body: { response_format: "url" },
    }),
    signal: AbortSignal.timeout(360000),
  });
  if (!res.ok) {
    const text = String((await res.text().catch(() => "")) || "").slice(0, 300);
    throw new Error("Agnes HTTP " + res.status + (text ? "：" + text : ""));
  }
  const body = await res.json().catch(() => null);
  const item = body && Array.isArray(body.data) ? body.data[0] : undefined;
  if (!item) throw new Error("Agnes 没返回图片数据");
  let buf;
  if (item.b64_json) buf = Buffer.from(item.b64_json, "base64");
  else if (item.url) {
    const dl = await fetch(item.url, { signal: AbortSignal.timeout(60000) });
    if (!dl.ok) throw new Error("下载 Agnes 图片失败 HTTP " + dl.status);
    buf = Buffer.from(await dl.arrayBuffer());
  } else throw new Error("Agnes 返回里既没有 url 也没有 b64_json");
  if (buf.length < 1024) throw new Error("图太小了：" + buf.length + " 字节");
  const hit = MAGIC.find((m) => m.test(buf));
  if (!hit) throw new Error("不是图片格式，前四字节 " + buf.subarray(0, 4).toString("hex"));
  let outBuf = buf;
  let outExt = hit.ext;
  if (RESIZE_KINDS.has(kind) && hit.ext === "png") {
    const jpeg = exactJpegFromPng(kind, buf);
    if (jpeg) {
      outBuf = jpeg;
      outExt = "jpg";
    }
  }
  for (const e of EXTS) {                       // 换格式时把旧文件清掉，别留两个版本
    if (e === outExt) continue;
    try { fs.unlinkSync(path.join(IMG_DIR, baseName(kind, id) + "." + e)); } catch {}
  }
  const target = path.join(IMG_DIR, baseName(kind, id) + "." + outExt);
  const tmp = target + "." + process.pid + ".part";
  fs.writeFileSync(tmp, outBuf);
  fs.renameSync(tmp, target);                   // 原子落盘，别让别的请求读到半截图
  try { fs.unlinkSync(placeholderOf(kind, id)); } catch {}
  forget(kind, id);                             // 图好了，赶紧让 state 里的版本号跟着变
  return target;
}

/* ------------------------------------------------------------
   占位图：出图失败也不能白屏
   ------------------------------------------------------------ */

const XML = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function placeholderSVG(kind, id, label, sub) {
  const h = crypto.createHash("sha1").update(kind + "/" + id).digest();
  const hue = h[0] % 360;
  const cx = 20 + (h[1] % 60), cy = 20 + (h[2] % 60);
  const w = (SIZE[kind] || SIZE.loc).width, ht = (SIZE[kind] || SIZE.loc).height;
  const lines = [];
  for (let i = 0; i < 7; i++) {
    const y = 40 + Math.round((h[(i + 3) % 20] * (ht - 80)) / 255);
    lines.push('<line x1="0" y1="' + y + '" x2="' + w + '" y2="' + y + '" stroke="rgba(216,169,77,0.10)" stroke-width="1"/>');
  }
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + ht + '" viewBox="0 0 ' + w + ' ' + ht + '">'
    + '<defs><radialGradient id="g" cx="' + cx + '%" cy="' + cy + '%" r="80%">'
    + '<stop offset="0%" stop-color="hsl(' + hue + ',18%,16%)"/><stop offset="100%" stop-color="#0b0d12"/></radialGradient></defs>'
    + '<rect width="100%" height="100%" fill="url(#g)"/>' + lines.join("")
    + '<text x="50%" y="' + (ht / 2 - 6) + '" text-anchor="middle" fill="#d8a94d" font-family="Noto Sans SC,Microsoft YaHei,sans-serif" font-size="' + Math.round(ht / 14) + '">' + XML(label || "现场照片") + '</text>'
    + '<text x="50%" y="' + (ht / 2 + Math.round(ht / 11)) + '" text-anchor="middle" fill="#8b8577" font-family="Noto Sans SC,Microsoft YaHei,sans-serif" font-size="' + Math.round(ht / 26) + '">' + XML(sub || "照片正在冲洗……") + '</text>'
    + '</svg>';
  try { fs.writeFileSync(placeholderOf(kind, id), svg, "utf8"); } catch {}
  return svg;
}

/* ------------------------------------------------------------
   给 HTTP 层用：把一张图当响应发出去
   ------------------------------------------------------------ */

export function send(kind, id, res, label, sub) {
  const v = versionOf(kind, id);
  if (v > 0) {
    const f = fileOf(kind, id);
    const buf = fs.readFileSync(f);
    res.writeHead(200, {
      "Content-Type": mimeOf(f),
      "Content-Length": buf.length,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    res.end(buf);
    return true;
  }
  let svg;
  try { svg = fs.readFileSync(placeholderOf(kind, id), "utf8"); }
  catch { svg = placeholderSVG(kind, id, label, sub); }
  res.writeHead(202, { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "no-store" });
  res.end(svg);
  return false;
}

/* ------------------------------------------------------------
   头像小图：公网玩家进房时只拉 160px 宽的小图，不再每人下载 1MB+ 原图
   ------------------------------------------------------------ */

const THUMB_CACHE = new Map();   // "kind:id:版本号" -> 小图 Buffer
const THUMB_MAX_W = 160;

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

function pngInfo(buf) {
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

function decodePng(buf) {
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

function encodePng(w, h, pixels) {
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

/** 面积平均缩放：原图比目标大时按覆盖区域取平均，比最近邻清楚得多 */
function resampleRGB(src, sw, sh, dw, dh) {
  if (sw === dw && sh === dh) return src;
  const out = Buffer.alloc(dw * dh * 3);
  const xr = sw / dw, yr = sh / dh;
  for (let y = 0; y < dh; y++) {
    const y0 = Math.floor(y * yr);
    const y1 = Math.max(y0 + 1, Math.min(sh, Math.ceil((y + 1) * yr)));
    for (let x = 0; x < dw; x++) {
      const x0 = Math.floor(x * xr);
      const x1 = Math.max(x0 + 1, Math.min(sw, Math.ceil((x + 1) * xr)));
      let r = 0, g = 0, b = 0, n = 0;
      for (let sy = y0; sy < y1; sy++) {
        let si = (sy * sw + x0) * 3;
        for (let sx = x0; sx < x1; sx++) {
          r += src[si]; g += src[si + 1]; b += src[si + 2]; si += 3; n++;
        }
      }
      const di = (y * dw + x) * 3;
      out[di] = ((r / n) + 0.5) | 0;
      out[di + 1] = ((g / n) + 0.5) | 0;
      out[di + 2] = ((b / n) + 0.5) | 0;
    }
  }
  return out;
}

function exactJpegFromPng(kind, src) {
  const size = SIZE[kind];
  if (!size || !RESIZE_KINDS.has(kind)) return null;
  const d = decodePng(src);
  if (!d || !d.w || !d.h) return null;
  let pixels = d.pixels;
  let w = d.w, h = d.h;
  if (w !== size.width || h !== size.height) {
    pixels = resampleRGB(d.pixels, d.w, d.h, size.width, size.height);
    w = size.width;
    h = size.height;
  }
  return encodeJpeg(w, h, pixels, JPEG_QUALITY);
}

function thumbBuffer(kind, id) {
  if (kind !== "char") return null;
  const v = versionOf(kind, id);
  if (!v) return null;
  const key = kind + ":" + id + ":" + v;
  const hit = THUMB_CACHE.get(key);
  if (hit) return hit;
  const f = fileOf(kind, id);
  if (!/.png$/i.test(f)) return null;
  let src;
  try { src = fs.readFileSync(f); } catch (e) { return null; }
  const d = decodePng(src);
  if (!d || !d.w || !d.h) return null;
  const tw = Math.min(THUMB_MAX_W, d.w);
  const th = Math.max(1, Math.round(d.h * tw / d.w));
  const ss = d.w * 3;
  const out = Buffer.alloc(th * tw * 3);
  for (let y = 0; y < th; y++) {
    const sy = Math.min(d.h - 1, Math.floor((y + 0.5) * d.h / th));
    for (let x = 0; x < tw; x++) {
      const sx = Math.min(d.w - 1, Math.floor((x + 0.5) * d.w / tw));
      const si = sy * ss + sx * 3;
      const di = y * tw * 3 + x * 3;
      out[di] = d.pixels[si];
      out[di + 1] = d.pixels[si + 1];
      out[di + 2] = d.pixels[si + 2];
    }
  }
  const small = encodePng(tw, th, out);
  THUMB_CACHE.set(key, small);
  return small;
}

export function sendSmall(kind, id, res, label, sub) {
  if (kind === "char") {
    const small = thumbBuffer(kind, id);
    if (small) {
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": small.length,
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      res.end(small);
      return true;
    }
  }
  return send(kind, id, res, label, sub);
}

export function errors() {
  const out = [];
  for (const [k, v] of jobs) if (v.status === "failed" || v.lastError) out.push(k + " → " + (v.lastError || "(重试中)") + "（试了 " + (v.attempts || 0) + " 次）");
  return out;
}

export function stats() {
  let real = 0, ph = 0, bytes = 0;
  try {
    for (const f of fs.readdirSync(IMG_DIR)) {
      if (/\.(jpg|png|webp)$/i.test(f)) { real++; try { bytes += fs.statSync(path.join(IMG_DIR, f)).size; } catch {} }
      else if (f.endsWith(".ph.svg")) ph++;
    }
  } catch {}
  return { real, placeholder: ph, mb: Math.round((bytes / 1048576) * 10) / 10, pending: queue.length + active };
}
