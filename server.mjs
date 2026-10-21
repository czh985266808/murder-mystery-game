// ============================================================
//  剧本杀 · 多人联机服务器（多剧本 / 真人 + AI）
//
//  ★ 公网可玩：启动时自动开一条隧道，把公网地址挂在控制台和网页大厅上
//  ★ 真人 + AI 混合：房主可以随时补 AI 玩家，真人也能随时接替 AI 的位置
//  ★ 实景图：AI 生成一次就落盘缓存（cache/img/）；服务器一起来就把所有剧本的图整批生成好
//  ★ 分阶段搜证：搜证一只搜人物房间（搜不了自己的），搜证二只搜公共场景
//
//  零依赖：只用 node:http / node:fs / node:path / node:os / node:crypto / node:zlib / node:child_process
//  用法：  node server.mjs [端口]        默认端口 8899
//          NO_TUNNEL=1 node server.mjs  只开本地，不折腾公网
//
//  ★ 云端部署（Render / 云服务器）环境变量：
//      PORT        平台注入，服务监听它（不要写死 8899）
//      NO_TUNNEL=1 不开内网穿透隧道（云端不需要）
//      NO_IMG=1    不联网生成图片，只读 cache/img 里已有的图
//      NO_OPEN=1   不自动打开浏览器
// ============================================================
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// 阶段表 / 计分 / 行动点这些"规则"是所有剧本共用的一份
import { PHASES, PHASE_INDEX, SEARCH_PHASES, apPerRound } from "./data/flow.mjs";
// 剧本库：每一本剧本是一个"包"，房间开起来时选一本，整局都用它
import { PACKS, LISTED, PACK_BY_ID, DEFAULT_PACK, auditPacks, deletePack, DELETE_PASSWORD } from "./data/library.mjs";
import { auditPack } from "./data/audit.mjs";
import * as images from "./images.mjs";
import * as npc from "./npc.mjs";
import { startTunnel, restartTunnels } from "./tunnel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const MAPS_DIR = path.join(__dirname, "maps");

const ARG_PORT = Number(process.argv[2]);
const ENV_PORT = Number(process.env.PORT);
const EXPLICIT_PORT = (Number.isInteger(ARG_PORT) && ARG_PORT > 0 && ARG_PORT < 65536)
  || (Number.isInteger(ENV_PORT) && ENV_PORT > 0 && ENV_PORT < 65536);
const DEFAULT_PORT = 8899;
// 8787 在部分 Windows 机器上会被系统 / Hyper-V 保留，绑不上；默认改用 8899，
// 万一 8899 也被占，下面会自动往后挪几个端口，并把真正的地址打印出来。
let PORT = (Number.isInteger(ARG_PORT) && ARG_PORT > 0 && ARG_PORT < 65536) ? ARG_PORT
  : ((Number.isInteger(ENV_PORT) && ENV_PORT > 0 && ENV_PORT < 65536) ? ENV_PORT : DEFAULT_PORT);

/* ============================================================
   0. 小工具
   ============================================================ */
const now = () => Date.now();
/** 这个房间玩的是哪一本剧本 */
const packOf = (room) => (room && room.pack) || DEFAULT_PACK;
/** 每本剧本用自己封面做大厅/房间背景；封面缺失时退回全局底图 */
function packBg(P) {
  const iid = P.id + "-cover";
  const v = images.versionOf("cover", iid);
  if (v) return "/api/img/coverthumb/" + encodeURIComponent(iid) + "?v=" + v;
  return "/api/img/bgthumb/" + images.BG_ID + "?v=" + images.versionOf("bg", images.BG_ID);
}

// maps/ 目录：外部改好的地图图片直接放这里；一个剧本允许多张，命名用「剧本ID-map.png」、
// 「剧本ID-map-1.png」「剧本ID-map-2.png」等格式即可
const MAP_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"];
/** maps/ 下同一剧本的全部外接地图：sangeng-map.png、sangeng-map-2.png 等按文件名排好。 */
function externalMaps(P) {
  try {
    const base = String(P.id).toLowerCase() + "-map";
    const files = fs.readdirSync(MAPS_DIR)
      .filter((f) => {
        const lo = String(f).toLowerCase();
        return (lo === base || lo.startsWith(base + ".") || lo.startsWith(base + "-")) &&
          MAP_EXTS.some((ext) => lo.endsWith(ext));
      })
      .sort((a, b) => {
        const al = String(a).toLowerCase(), bl = String(b).toLowerCase();
        const plainA = al === base || al.startsWith(base + ".");
        const plainB = bl === base || bl.startsWith(base + ".");
        if (plainA && !plainB) return -1;
        if (plainB && !plainA) return 1;
        return al.localeCompare(bl, undefined, { numeric: true });
      });
    return files.map((file) => {
      const full = path.join(MAPS_DIR, file);
      if (!full.startsWith(MAPS_DIR)) return null;
      const st = fs.statSync(full);
      if (!st.isFile()) return null;
      const stem = String(file).replace(/\.[^.]+$/, "").toLowerCase().replace(new RegExp("^" + base + "[-.]?"), "");
      const label = stem ? "地图 " + stem : "公知地图";
      return {
        image: "/maps/" + encodeURIComponent(file) + "?v=" + Math.floor(st.mtimeMs),
        file,
        label,
        title: (P.title || "") + " · " + label,
      };
    }).filter(Boolean);
  } catch (e) { return null; }
}
function externalMap(P) {
  const maps = externalMaps(P) || [];
  if (!maps.length) return null;
  return Object.assign({}, maps[0], {
    images: maps,
    title: maps.length > 1 ? (P.title || "") + " · " + maps.length + " 张地图" : maps[0].title,
  });
}
/** 公知平面图：有外部图优先显示 maps/ 下的图片，否则保留旧平面数据兜底 */
function publicMap(P) {
  const ext = externalMap(P);
  if (ext) return {
    title: ext.title, image: ext.image, images: ext.images || [], file: ext.file, custom: true,
    floors: [], groups: [], plan: (P.layout && P.layout.plan) || "", multi: false, stairs: [],
  };
  const locs = P.locations || [];
  const layout = P.layout && Array.isArray(P.layout.areas) ? P.layout : null;
  const floorName = (a) => {
    if (a && a.floorName != null && a.floorName !== "") return String(a.floorName);
    if (a && a.floor != null && a.floor !== "") return String(a.floor);
    return "一楼";
  };
  if (layout) {
    const byFloor = new Map();
    for (const area of layout.areas) {
      const fid = floorName(area);
      if (!byFloor.has(fid)) byFloor.set(fid, { id: fid, name: fid, groups: [], y: 10 });
      const floor = byFloor.get(fid);
      const nodes = [];
      let rowsUsed = 1, colsUsed = 1;
      for (const l of locs) {
        const at = (layout.slots || {})[l.id];
        if (!at || at.area !== area.id) continue;
        const name = String(l.name || l.id);
        const col = Math.max(1, Number(at.col) || 1);
        const row = Math.max(1, Number(at.row) || 1);
        if (col > colsUsed) colsUsed = col;
        if (row > rowsUsed) rowsUsed = row;
        nodes.push({
          id: l.id, name, short: name.length > 6 ? name.slice(0, 6) + "…" : name,
          x: 6 + ((col - 1) % 4) * 23, y: 10 + (row - 1) * 33 + (Math.floor((col - 1) / 4)) * 11,
          w: 21, h: 27, zone: area.name,
        });
      }
      if (nodes.length) {
        const bandH = 27 + (rowsUsed - 1) * 33 + (Math.floor((colsUsed - 1) / 4)) * 11 + 12;
        const off = floor.y;
        for (const nd of nodes) nd.y += off;
        floor.groups.push({ zone: area.name, note: area.note || "", nodes, band: { y: off, h: bandH }, floor: fid });
        floor.y += bandH + 12;
      }
    }
    const floors = [...byFloor.values()].filter((f) => f.groups.length).map((f) => ({ id: f.id, name: f.name, groups: f.groups }));
    if (floors.length) {
      return {
        title: (P.title || "") + " · 公知平面图",
        floors, groups: floors[0].groups || [], plan: layout.plan || "",
        multi: floors.length > 1, stairs: Array.isArray(layout.stairs) ? layout.stairs : [],
      };
    }
  }
  const personal = locs.filter((l) => String(l.phase).indexOf("search1") === 0);
  const shared = locs.filter((l) => String(l.phase).indexOf("search1") !== 0);
  const cols = 4, cellW = 21, cellH = 27, gapX = 2, gapY = 6;
  const groups = [];
  let bandY = 10;
  for (const [zone, list] of [["个人房间", personal], ["公共区域", shared]]) {
    const nodes = [];
    list.forEach((l, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const name = String(l.name || l.id);
      nodes.push({
        id: l.id, name, short: name.length > 6 ? name.slice(0, 6) + "…" : name,
        x: 6 + col * (cellW + gapX), y: bandY + row * (cellH + gapY), w: cellW, h: cellH, zone,
      });
    });
    if (nodes.length) {
      const rows = Math.max(1, Math.ceil(list.length / cols));
      const h = rows * cellH + (rows - 1) * gapY + 12;
      groups.push({ zone, nodes, band: { y: bandY, h } });
      bandY += h + 12;
    }
  }
  return {
    title: (P.title || "") + " · 公知平面图",
    groups, floors: [{ id: "1", name: "一楼", groups }], multi: false, stairs: [],
  };
}
/** 线索 / 技能材料 / 伪造线索的统一取用（都挂在剧本包上） */
function clueDef(room, id) {
  const P = packOf(room);
  return P.clueById[id] || P.extrasById[id] || null;
}
// 隧道拿到公网地址后写这里（网页大厅要靠它告诉玩家把哪个链接发出去）
let PUBLIC_URL = null;
// 交给 npc.mjs 的两个钩子：AI 和真人走完全同一套行动 / 视角，规则上不开天眼
const NPC_API = {
  act: (room, player, type, body) => doAction(room, player, type, body),
  view: (room, player) => viewFor(room, player),
};
const CODE_CHARS = "ACDEFGHJKLMNPQRSTUVWXY34679";
function makeCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  return s;
}
const token = () => crypto.randomBytes(16).toString("hex");
function lanIPs() {
  const ifs = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(ifs)) {
    for (const ni of ifs[name] || []) {
      if (ni.family !== "IPv4" || ni.internal) continue;
      candidates.push({ name, address: ni.address });
    }
  }
  // 给每张网卡打分：无线网卡 > 有线，家庭网段 > 其他，虚拟网卡降权
  const score = (c) => {
    let s = 0;
    if (/wi-?fi|wlan|无线|wlp/i.test(c.name)) s += 100;
    else if (/ethernet|以太网|eth|en0/i.test(c.name)) s += 60;
    if (/^192\.168\./.test(c.address)) s += 30;
    else if (/^10\./.test(c.address)) s += 20;
    else if (/^172\.(1[6-9]|2\d|3[01])\./.test(c.address)) s += 15;
    if (/virtual|vmware|vbox|hyper-?v|bluetooth|docker|wsl|tap|tun|loopback/i.test(c.name)) s -= 50;
    if (/^169\.254\./.test(c.address)) s -= 200;   // 没拿到 DHCP
    return s;
  };
  candidates.sort((a, b) => score(b) - score(a));
  return candidates.map((c) => ({ name: c.name, address: c.address, url: "http://" + c.address + ":" + PORT + "/" }));
}
function lanIP() {
  const list = lanIPs();
  return list.length ? list[0].address : "127.0.0.1";
}

/* ============================================================
   1. 房间与玩家状态
   ============================================================ */
const rooms = new Map();   // code -> room
// ★ 本轮修复 3：视角帧的全局序号。HTTP 响应和 SSE 推送可能乱序到达，
//   前端只认序号更大的那一帧，旧帧直接丢掉（详见 viewFor 里的注释）。
let VIEW_SEQ = 0;
// ★ 本轮修复 4：公网通道自检状态（/healthz 和 /api/lan 都会报出去）
const TUNNEL_STATE = { ok: true, fails: 0, at: 0, restarts: 0, busy: false, nextAt: 0 };
function newRoom(pack) {
  const P = pack || DEFAULT_PACK;
  let code;
  do { code = makeCode(); } while (rooms.has(code));
  const room = {
    code,
    pack: P,                 // ★ 这一局玩的是哪一本剧本（整局不变）
    createdAt: now(),
    phase: "lobby",
    players: [],
    searchCount: Object.fromEntries(P.locations.map((l) => [l.id, 0])),
    // ★ 本轮修复 1：每人每轮"实际花掉的行动点"单独记账。
    //   只信 player.ap 这一份数字的话，任何一次漏扣 / 重发都能让 4 点变成 5 条线索；
    //   这里跟 baseAp() 硬对上，谁都不可能多搜一条（见 doAction 的 search）。
    apUsed: Object.create(null),
    clueStates: new Map(),   // clueId -> { id, by, at, mode, isFake, publishedAt }
    chat: [],
    dms: [],                 // 私聊：{ by, to, text, t, ... }
    quizAnswers: {},         // playerId -> { qid: choice }
    votes: {},               // playerId -> { killer }
    log: [],
    scores: null,
  };
  rooms.set(code, room);
  return room;
}
function newPlayer(room, name) {
  const p = {
    id: "p" + crypto.randomBytes(5).toString("hex"),
    token: token(),
    name: String(name || "无名氏").slice(0, 12),
    charId: null,
    joinedAt: now(),
    ap: 0,
    ready: false,
    intro: "",
    conns: new Set(),
    // ★ 本轮修复 2：同一类操作带序号，公网乱序到达时服务器只认"后点的那一次"。
    //   没有它就会出现"点了 B 又被慢半拍到达的 A 盖回去"。
    actSeq: Object.create(null),
    recentActs: new Map(),   // cid -> { t, result }：同一次点击的重发（双击 / 断线重试）只算一次
    quizDone: false,
    quizSubmitted: false,   // 本轮要求 3：交卷之后不能再改
    voteDone: false,
    lastSeen: now(),
  };
  room.players.push(p);
  return p;
}
const hosted = (room) => room.players.find((p) => p.conns.size > 0) || room.players[0] || null;
function pushLog(room, text, kind) {
  room.log.push({ t: now(), text, kind: kind || "info" });
  if (room.log.length > 120) room.log.splice(0, room.log.length - 120);
}
/**
 * 个人房间 / 随身线索：第一轮搜证搜的是"某个人的房间和他身上的东西"，
 * 里面的线索是私物，不是摆在案发现场的客观事实。用户本轮要求 1：
 * 这些线索不参与尸体线索判定，免得谁在自己屋里写了句"血泊"就被引擎强制公开。
 * 判定：地点带 owner、地点 id 是 r_<角色id>、或者该地点属于第一轮搜证名单。
 */
function isPersonalLoc(P, locId) {
  if (!locId) return false;
  const id = String(locId);
  if (P && P.personalLocs && typeof P.personalLocs.has === "function" && P.personalLocs.has(id)) return true;
  const loc = P && P.locById ? P.locById[id] : null;
  if (loc && loc.owner) return true;
  if (P && Array.isArray(P.characters) && P.characters.some((c) => "r_" + c.id === id)) return true;
  if (P && Array.isArray(P.search1) && P.search1.indexOf(id) >= 0) return true;
  return false;
}
/**
 * 尸体线索判定：剧本里"当场躺在现场的那具尸体"那一条。
 * 判定顺序：① 剧本显式标了 `corpse: true` ② 剧本显式标了 `corpseClue: "<id>"` ③ 兜底——
 * 公共场景里 depth 0 且文案含尸体特征词的第一条。尸体线索强制公开，不能藏。
 * 注意：个人房间与随身线索整段排除（用户本轮要求 1），只有剧本显式标注才认。
 */
function isCorpseClue(def, room) {
  if (!def) return false;
  const explicit = def.corpse === true || def.isCorpse === true;
  let P = null;
  try { P = room ? packOf(room) : null; } catch (e) { P = null; }
  // 显式标注是作者的意思，照认；其余一切自动判定都不碰个人房间与随身线索
  if (explicit) return true;
  if (P && isPersonalLoc(P, def.location)) return false;
  if (P) {
    const marked = (P.case && (P.case.corpseClue || P.case.corpseClueId)) || P.corpseClueId;
    if (marked && marked === def.id) return true;
  }
  // 兜底：剧本压根没标尸体线索时，才按"公共场景 + depth 0 + 文案描述尸体本身"认一条。
  // 已经标过就只认那一条，免得同一个本子里好几条都因为文案带"血"被强制公开。
  if (P && P.corpseClueId) return false;
  const looks = /尸|遗体|咽气|毙命|僵|血泊|仰面|俯身|死在/.test(String(def.text || ""));
  if (looks && (def.depth || 0) === 0) return true;
  return false;
}
/** 该地点是否还有"未被发现"的线索 */
function remainingIn(room, locId) {
  return packOf(room).cluesOf(locId).filter((c) => !room.clueStates.has(c.id));
}
/** 该地点当前门槛下能搜出来的线索（按定义顺序） */
function availableIn(room, locId) {
  const P = packOf(room);
  const n = room.searchCount[locId] || 0;
  return P.cluesOf(locId).filter((c) => !room.clueStates.has(c.id) && (P.depthGate[c.depth] || 0) <= n);
}
/** 揭示一条线索 */
function revealClue(room, def, player, mode, extra) {
  const st = Object.assign(
    {
      id: def.id,
      by: player ? player.id : null,
      at: now(),
      mode: mode || (def.private ? "private" : "board"),
      isFake: !!(extra && extra.isFake),
      fromAbility: (extra && extra.fromAbility) || null,
      publishedAt: null,
    },
    extra || {}
  );
  room.clueStates.set(def.id, st);
  return st;
}

/* ============================================================
   2. 玩家视角的状态（防作弊核心：每个人看到的东西不一样）
   ============================================================ */
function viewFor(room, me) {
  const revealMode = room.phase === "reveal";
  const host = hosted(room);
  // ★ 整局的数据都从"这一局用的那本剧本"里取
  const P = packOf(room);
  const { charById: CHAR_BY_ID, characters: CHARACTERS, locations: LOCATIONS, locById: LOC_BY_ID, clues: CLUES, quiz: QUIZ, voting: VOTING, fakeClues: FAKE_CLUES } = P;
  const CASE = P.case;
  const myChar = me.charId ? CHAR_BY_ID[me.charId] : null;
  // 选角名单（大厅用）
  const chars = CHARACTERS.map((c) => {
    const owner = room.players.find((p) => p.charId === c.id);
    return { id: c.id, name: c.name, role: c.role, age: c.age, bio: c.bio || "", appearance: c.appearance || c.avatarSpec?.dress || "", relation: c.relation || c.relationToVictim || "", avatar: c.avatar, color: c.color, taken: !!owner, takenBy: owner ? owner.name : null, takenByNPC: owner ? !!owner.isNPC : false };
  });
  // --- 公开板：所有人可见的线索（public 自动上板 + 私密线索被公开 + 伪造线索）
  const board = [];
  const myClues = [];
  for (const st of room.clueStates.values()) {
    const def = clueDef(room, st.id);
    if (!def) continue;
    const entry = {
      id: st.id,
      title: def.title,
      text: def.text,
      by: st.by,
      byName: (room.players.find((p) => p.id === st.by) || {}).name || "系统",
      at: st.at,
      fromAbility: st.fromAbility,
    };
    entry.visibility = st.mode === "board" ? "public" : "private";
    entry.isCorpse = isCorpseClue(def, room);            // 尸体线索：强制公开，前端不给"公开/不公开"开关
    entry.canPublish = st.by === me.id && st.mode !== "board" && !entry.isCorpse;   // 是否还能选择公开
    entry.keptPrivate = !!st.keptPrivate;                // 玩家明确选过"不公开"
    entry.isFake = revealMode ? !!st.isFake : false;   // 揭晓前绝不能泄漏哪条是伪造的
    entry.location = def.location;
    entry.locationName = LOC_BY_ID[def.location] ? LOC_BY_ID[def.location].name : def.location;
    entry.locationOwner = LOC_BY_ID[def.location] ? (LOC_BY_ID[def.location].owner || null) : null;   // AI 靠这个判断"线索是在谁房间里找到的"
    // 需求 5：上了公开板的所有人都看得见；我自己摸到的（公开的 + 私密的）都进「我的线索」
    // ★ 本轮修复 1：「我的线索」只算我自己亲手翻出来的。
    //   以前这里还有一句 `|| corpse`——尸体线索虽然不是我找到的，也被塞进每个人的私密列表，
    //   于是玩家只花 1 点行动点搜出 1 条线索，「我的线索（N）」却从 1 跳到 2，
    //   看上去就是"1 点行动点换回 2 条线索"。尸体线索本来就摆在公开板上、人人看得见，
    //   不必再复制一份进私密列表。
    if (st.mode === "board") board.push(entry);
    if (st.by === me.id) myClues.push(Object.assign({ published: !!st.publishedAt, mine: true }, entry));
  }
  board.sort((a, b) => a.at - b.at);
  myClues.sort((a, b) => a.at - b.at);
  // ★ 本轮修复 1：把"这一轮用掉几点、摸出几条"摊给前端对账。
  //   两个数字由服务器同一份记账算出来，永远相等；玩家一眼就能看出行动点有没有被多扣。
  const roundStart = room.roundStart || 0;
  const myApUsed = room.apUsed[me.id] || 0;
  const myRoundFound = [...room.clueStates.values()].filter((s) => s.by === me.id && (s.at || 0) >= roundStart).length;
  // --- 地点
  const locations = LOCATIONS.map((l) => {
    const all = P.cluesOf(l.id);
    const found = all.filter((c) => room.clueStates.has(c.id)).length;
    const mine = all.filter((c) => room.clueStates.has(c.id) && room.clueStates.get(c.id).by === me.id).length;
    const exhausted = found >= all.length;
    const ownerChar = l.owner ? CHAR_BY_ID[l.owner] : null;
    const isOwn = !!l.owner && l.owner === me.charId;              // 自己的房间 / 自己身上搜不了
    const inPhase = l.phase === room.phase;                        // 需求 6：搜证一人物线索、搜证二公共场景
    return {
      id: l.id, name: l.name, desc: l.desc,
      phase: l.phase, owner: l.owner,
      ownerName: ownerChar ? ownerChar.name : null,
      isOwn,
      inPhase,
      searchCount: room.searchCount[l.id] || 0,
      totalClues: all.length,
      found,
      mine,
      exhausted,
      canSearch: SEARCH_PHASES.includes(room.phase) && inPhase && !isOwn && me.ap > 0 && !exhausted,
    };
  });
  // --- 其他玩家
  const players = room.players.map((p, i) => {
    const ch = p.charId ? CHAR_BY_ID[p.charId] : null;
    const foundCount = [...room.clueStates.values()].filter((s) => s.by === p.id).length;
    return {
      id: p.id,
      index: i,
      name: p.name,
      charId: p.charId,
      charName: ch ? ch.name : null,
      charRole: ch ? ch.role : null,
      avatar: ch ? ch.avatar : "？",
      color: ch ? ch.color : "#6b7280",
      connected: p.conns.size > 0,
      isNPC: !!p.isNPC,
      ready: p.ready,
      intro: p.intro,
      foundCount,
      quizDone: p.quizDone,
      voteDone: p.voteDone,
      isHost: host ? host.id === p.id : false,
      isMe: p.id === me.id,
    };
  });
  // --- 我自己的角色卡全文
  let myScript = null;
  if (myChar) {
    myScript = {
      id: myChar.id,
      name: myChar.name,
      role: myChar.role,
      age: myChar.age,
      gender: myChar.gender,
      avatar: myChar.avatar,
      color: myChar.color,
      room: myChar.room,
      publicInfo: myChar.publicInfo,
      background: myChar.script.background,
      tonight: myChar.script.tonight,
      hide: myChar.script.hide,
      know: myChar.script.know,
      mission: myChar.script.mission,
      isKiller: !!myChar.isKiller,
    };
  }
  // --- 推理问答
  const myAnswers = room.quizAnswers[me.id] || {};
  const quiz = {
    questions: QUIZ.map((q) => ({
      id: q.id,
      q: q.q,
      options: q.options,
      myChoice: myAnswers[q.id] || null,
      answer: revealMode ? q.answer : null,
      correct: revealMode ? myAnswers[q.id] === q.answer : null,
      explain: revealMode ? q.explain : null,
      clue: revealMode ? q.clue : null,
    })),
    answeredCount: Object.keys(myAnswers).length,
    total: QUIZ.length,
    submitted: !!me.quizSubmitted,
    submittedCount: room.players.filter((p) => p.quizSubmitted).length,
    allDone: room.players.filter((p) => p.quizSubmitted).length,
  };
  // --- 投票
  const myVote = room.votes[me.id] || null;
  const voteTally = {};
  for (const v of Object.values(room.votes)) voteTally[v.killer] = (voteTally[v.killer] || 0) + 1;
  const vote = {
    killerTitle: "谁是凶手？",
    myVote,
    doneCount: Object.keys(room.votes).length,
    tally: revealMode ? voteTally : null,
  };
  // --- 揭晓
  let reveal = null;
  if (revealMode) {
    const allClues = CLUES.map((c) => {
      const st = room.clueStates.get(c.id);
      return {
        id: c.id, title: c.title, text: c.text,
        location: LOC_BY_ID[c.location] ? LOC_BY_ID[c.location].name : c.location,
        private: !!c.private, depth: c.depth,
        found: !!st, byName: st ? ((room.players.find((p) => p.id === st.by) || {}).name || "系统") : null,
      };
    });
    const fakes = [...room.clueStates.values()].filter((s) => s.isFake);
    const falsified = fakes.map((s) => s.id);
    const fakeBy = fakes.length ? ((room.players.find((p) => p.id === fakes[0].by) || {}).name || null) : null;
    const truth = P.truth;
    const killerPid = (room.players.find((x) => x.charId === truth.killerId) || {}).id || null;
    const labelOf = (list, id) => { const o = (list || []).find((x) => x.id === id); return o ? (o.label || o.name || null) : null; };
    const whoOf = (pid) => {
      const t0 = room.players.find((x) => x.id === pid);
      if (!t0) return { id: null, name: null, charName: null };
      const c0 = t0.charId ? CHAR_BY_ID[t0.charId] : null;
      return { id: t0.id, name: t0.name, charName: c0 ? c0.name : null, color: c0 ? c0.color : "#6b7280" };
    };
    reveal = {
      truth,
      victim: P.victim,
      scores: room.scores,
      allClues,
      falsified,
      forgedBy: fakeBy,
      // 真凶是谁：由服务器按"这一局玩的是哪一本剧本"算，前端不再写死（修复需求 9）
      killerId: truth.killerId,
      killerPid,
      killerCharName: (CHAR_BY_ID[truth.killerId] || {}).name || null,
      killerRole: (CHAR_BY_ID[truth.killerId] || {}).role || null,
      killerColor: (CHAR_BY_ID[truth.killerId] || {}).color || "#6b7280",
      killerName: killerPid ? whoOf(killerPid).name : null,
      methodName: labelOf(VOTING.methods, truth.methodId),
      motiveName: labelOf(VOTING.motives, truth.motiveId),
      voteTotal: Object.keys(room.votes).length,
      // 需求 10：整张票型——谁把票投给了谁（可折叠展开）
      votes: room.players.map((p) => {
        const v = room.votes[p.id] || null;
        const c = p.charId ? CHAR_BY_ID[p.charId] : null;
        const target = v ? whoOf(v.killer) : null;
        return {
          id: p.id, name: p.name, isMe: p.id === me.id, isNPC: !!p.isNPC,
          charId: p.charId, charName: c ? c.name : "未选角", color: c ? c.color : "#6b7280",
          voted: !!v, votedId: v ? v.killer : null,
          votedName: target ? target.name : null, votedCharName: target ? target.charName : null,
          isKiller: p.id === killerPid,
          correct: !!(v && killerPid && v.killer === killerPid),
        };
      }),
      // 需求 10：自己的答题对错（别人的选择不公开，只公开正确答案）
      quiz: {
        questions: QUIZ.map((q) => ({ id: q.id, q: q.q, answer: q.answer, explain: q.explain || "", clue: q.clue || null })),
        mine: QUIZ.map((q) => ({ id: q.id, choice: (room.quizAnswers[me.id] || {})[q.id] || null, answer: q.answer, correct: (room.quizAnswers[me.id] || {})[q.id] === q.answer })),
        correctCount: QUIZ.filter((q) => (room.quizAnswers[me.id] || {})[q.id] === q.answer).length,
        total: QUIZ.length,
      },
    };
  }
  // --- 实景图：只给「人物肖像」和「搜证场景」出图（线索只用文字）。
  //     图片 id 带剧本前缀（wugang-study），两本剧本里同名的地点不会串图。
  //     谁先看到谁触发生成，生成一次以后永远走缓存（需求 2）。
  const imgv = {};
  const imgURL = (kind, imgId) => {
    const v = images.versionOf(kind, imgId);
    // 头像走小图路由：公网玩家进房只下载约 1/20 的体量，原图仍保留在 cache/img
    const route = kind === "char" ? "charthumb" : kind === "loc" ? "locthumb" : kind;
    return "/api/img/" + route + "/" + encodeURIComponent(imgId) + "?v=" + v;
  };
  for (const c of P.characters) {
    const iid = P.id + "-" + c.id;
    images.ensure("char", iid, c.portrait || c.img || (images.PORTRAIT_PROMPTS && images.PORTRAIT_PROMPTS[c.id]) || ("portrait of " + c.name), (c.avatarSpec && c.avatarSpec.style) || c.style || P.artStyle || "");
    imgv["char:" + c.id] = imgURL("char", iid);
  }
  for (const l of P.locations) {
    const iid = P.id + "-" + l.id;
    images.ensure("loc", iid, l.img, P.artStyle || "");
    imgv["loc:" + l.id] = imgURL("loc", iid);
  }
  // 公知平面图不再出 AI 图片：前端用 layout 信息画纯文字地图
  // ★ 本轮修复 2/3：每一帧视角带一个全局单调递增的序号。
  //   HTTP 响应里的 view 和 SSE 推来的那一帧在公网上可能乱序到达，
  //   前端只认序号更大的那帧，旧帧直接丢掉 —— 于是"刚点中的 B 被几分钟前的 A 顶回去"
  //   这种鬼现象就没有了。同时 /api/action 用它判断"这个请求是不是太旧了"。
  VIEW_SEQ += 1;
  return {
    seq: VIEW_SEQ,
    case: { id: P.id, title: CASE.title, subtitle: CASE.subtitle, meta: CASE.meta, intro: CASE.intro, common: P.common || "", map: publicMap(P) },
    room: { code: room.code, phase: room.phase, phaseIdx: PHASE_INDEX[room.phase], hostId: host ? host.id : null, seats: P.characters.length,
            npcCount: room.players.filter((p) => p.isNPC).length, humanCount: room.players.filter((p) => !p.isNPC).length },
    images: imgv,
    net: { publicUrl: PUBLIC_URL || null, lanUrl: "http://" + lanIP() + ":" + PORT + "/" },
    bg: packBg(P),
    phases: PHASES,
    me: {
      id: me.id,
      name: me.name,
      isHost: host ? host.id === me.id : false,
      charId: me.charId,
      ap: me.ap,
      maxAp: baseAp(room),
      apUsed: myApUsed,          // 本轮已经花掉的行动点
      roundFound: myRoundFound,  // 本轮已经摸出来的线索条数（应当与 apUsed 相等）
      ready: me.ready,
      intro: me.intro,
      script: myScript,
      isNPC: !!me.isNPC,
      canSearch: SEARCH_PHASES.includes(room.phase) && me.ap > 0,
    },
    chars,
    players,
    locations,
    board,
    myClues,
    chat: room.chat.slice(-60),
    // 私聊：只把我参与的那些线程推给我（按人分组）
    dm: (() => {
      const map = new Map();
      for (const m of room.dms) {
        if (m.by !== me.id && m.to !== me.id) continue;
        const peerId = m.by === me.id ? m.to : m.by;
        if (!map.has(peerId)) map.set(peerId, []);
        map.get(peerId).push({ mine: m.by === me.id, text: m.text, t: m.t });
      }
      return [...map.entries()].map(([peerId, msgs]) => {
        const peer = room.players.find((x) => x.id === peerId) || { name: "（已离开）" };
        const pc = peer.charId ? CHAR_BY_ID[peer.charId] : null;
        return { with: peerId, name: peer.name, charName: pc ? pc.name : peer.name, color: pc ? pc.color : "#6b7280", msgs: msgs.slice(-50) };
      });
    })(),
    log: room.log.slice(-40),
    quiz,
    vote,
    reveal,
  };
}

/* ============================================================
   3. SSE 推送
   ============================================================ */
/**
 * 需求 4：等待房间（大厅）里的座位变动要"秒到"。
 * 大厅不需要搜证/线索那套重活，只把"谁坐在哪个角色上"这几十字节推出去，
 * 选角、进出房间都能立刻在别人屏幕上出现；整份视角随后再补一帧，保证不丢字段。
 */
function playerBrief(room, p, me) {
  const ch = p.charId ? packOf(room).charById[p.charId] : null;
  const host = hosted(room);
  return {
    id: p.id, name: p.name, charId: p.charId,
    charName: ch ? ch.name : null, charRole: ch ? ch.role : null,
    color: ch ? ch.color : "#6b7280", avatar: ch ? ch.avatar : "？",
    isNPC: !!p.isNPC, ready: p.ready,
    connected: !!(p.conns && p.conns.size),
    isHost: host ? host.id === p.id : false,
    isMe: me ? p.id === me.id : false,
  };
}
/** 同一份座位表按人各发一份：只有收件人自己那一行 isMe 是 true */
function seatUpdate(room, me) {
  return {
    kind: "playerUpdate",
    phase: room.phase,
    players: room.players.map((p) => playerBrief(room, p, me || null)),
    chars: (packOf(room).characters || []).map((c) => {
      const owner = room.players.find((p) => p.charId === c.id);
      return { id: c.id, taken: !!owner, takenBy: owner ? owner.name : null, takenByNPC: owner ? !!owner.isNPC : false };
    }),
  };
}
/**
 * 轻量推送：只发座位表（选角 / 进出房间用），随后补一帧完整视角。
 * 以前这里在大厅之外直接 return，于是"游戏中有人加入 / 顶掉 AI 座位"谁都不知道，
 * 要等下一次别的状态变化才看得到——现在任何阶段都立刻推。
 * 座位表按人各序列化一份（几十字节），收件人自己那行 isMe 才是 true。
 */
function broadcastSeats(room) {
  const lines = new Map();
  for (const p of room.players) {
    if (!p.conns || !p.conns.size) continue;
    let line = lines.get(p.id);
    if (line === undefined) { line = "data: " + JSON.stringify(seatUpdate(room, p)) + "\n\n"; lines.set(p.id, line); }
    for (const res of p.conns) { try { res.write(line); } catch (e) {} }
  }
  broadcast(room);
}
function sendTo(room, player) {
  // 没有开着的连接就不用算视角了（多人联机时这一步最贵）
  if (!player.conns || !player.conns.size) return;
  const payload = "data: " + JSON.stringify(viewFor(room, player)) + "\n\n";
  for (const res of player.conns) {
    try { res.write(payload); } catch (e) { /* 断线由 close 事件清理 */ }
  }
}
// 一批变更合并成一次推送：搜证连着点几下，不会再一人算一遍视角
const pendingPush = new Map();
function broadcast(room) {
  if (pendingPush.has(room.code)) return;
  const timer = setTimeout(() => {
    pendingPush.delete(room.code);
    for (const p of room.players) sendTo(room, p);
  }, 30);
  if (timer.unref) timer.unref();
  pendingPush.set(room.code, timer);
}

/* ============================================================
   4. 行动处理
   ============================================================ */
const ok = (extra) => Object.assign({ ok: true }, extra || {});
const bad = (msg) => ({ ok: false, error: msg });
function findPlayer(room, tk) {
  return room.players.find((p) => p.token === tk) || null;
}
/**
 * ★ 本轮修复 2：哪些操作要"按序号只认最后一次点击"。
 * 只对"同一个东西被反复改"的操作设序号——问答的同一道题、投票、搜证。
 * 其它操作（聊天、准备、推进阶段）本来就不该被丢弃。
 */
function actSeqKey(type, body) {
  if (type === "quizAnswer") return "q:" + String(body.qid || "");
  if (type === "vote") return "vote";
  if (type === "search") return "search";
  if (type === "publish" || type === "keepPrivate") return "clue:" + String(body.clueId || "");
  return null;
}
/**
 * 每个搜证轮的行动点：**人人相同** = 总线索数 / 角色数（取整）+ 1（需求 7）。
 * 雾港：49 条 / 6 个角色 = 8 + 1 = 每人 9 点；锦华：48 条 / 6 个角色 = 8 + 1 = 每人 9 点。
 */
function baseAp(room) {
  const P0 = packOf(room);
  return apPerRound(P0.clues.length, P0.characters.length);
}
/** 本轮要求 2：离开任一搜证轮时，这一轮还没被翻出来的线索由系统翻出来，全部公开上板 */
function systemSweep(room, phase) {
  const P0 = packOf(room);
  const locIds = (phase === "search1" ? P0.search1Locations : P0.search2Locations).map((l) => l.id);
  let n = 0;
  for (const def of P0.clues) {
    if (locIds.indexOf(def.location) < 0) continue;
    if (room.clueStates.has(def.id)) continue;
    room.clueStates.set(def.id, { id: def.id, by: null, at: now(), mode: "board", isFake: false, fromAbility: null, publishedAt: now(), bySystem: true });
    n++;
  }
  if (n) pushLog(room, "【系统】搜证时间到，还有 " + n + " 条线索没被翻出来，由工作人员一并翻出、摆在公开板上。", "publish");
  return n;
}
function enterPhase(room, nextPhase) {
  const prev = room.phase;
  // 本轮要求 2：离开任一搜证轮时，这一轮剩下的线索自动搜出并公开；没有讨论一后，
  // 第一轮结束即进入第二轮搜证，两轮线索都会在圆桌讨论前全部上板
  if (SEARCH_PHASES.includes(prev)) systemSweep(room, prev);
  room.phase = nextPhase;
  room.scores = null;
  // 新的一轮搜证：人人发满行动点（角色技能已经整体拿掉，这里不再有任何"每轮刷新"的计数）
  if (SEARCH_PHASES.includes(nextPhase)) {
    const cap = baseAp(room);
    // ★ 本轮修复 1：进新一轮时把"本轮已花行动点"的记账一起清零，
    //   否则第二轮的额度会被第一轮的旧账吃掉。
    room.apUsed = Object.create(null);
    // ★ 本轮修复 1：记下这一轮从什么时候开始，viewFor 用它统计"本轮我自己摸出几条"，
    //   和 apUsed 一起摊在搜证页上给玩家对账（点数 = 条数这条不变量必须看得见）。
    room.roundStart = now();
    for (const p of room.players) p.ap = cap;
  }
  if (nextPhase === "reveal") {
    computeScores(room);
  }
  // 每进一个新阶段，所有人都回到"未准备"（投票/揭晓不需要准备，直接标满）
  for (const p of room.players) {
    p.ready = nextPhase === "vote" || nextPhase === "reveal";
    if (p.npc) p.npc.hostSince = 0;   // 房主计时清零
  }
  pushLog(room, "【" + (PHASES[PHASE_INDEX[nextPhase]] || {}).name + "】" + (PHASES[PHASE_INDEX[nextPhase]] || {}).desc, "phase");
  return prev;
}
/**
 * 用户本轮要求 9：所有人都点了「我准备好了」，就自动跳到下一阶段。
 * 只认准备键——AI 在大厅/读本/自我介绍里会自动准备，所以这几个阶段人齐了就会自己往下走；
 * 搜证和讨论里 AI 不点准备，仍然由房主点「继续」。返回 true 表示真的跳了。
 */
function maybeAutoAdvance(room) {
  const i = PHASE_INDEX[room.phase];
  if (i === undefined || i >= PHASES.length - 1) return false;
  if (!room.players.length) return false;
  if (room.phase === "lobby") {
    const P0 = packOf(room);
    if (room.players.length < P0.characters.length) return false;
    if (room.players.some((p) => !p.charId)) return false;
  }
  // 准备键只认真人：AI 玩家不会点按钮（房主点「继续」时另有通道）
  if (!room.players.every((p) => p.isNPC || p.ready)) return false;
  enterPhase(room, PHASES[i + 1].id);
  return true;
}
function computeScores(room) {
  const P = packOf(room);
  const { charById: CHAR_BY_ID, quiz: QUIZ } = P;
  const truth = P.truth;
  const SCORE = P.score;
  // 投票里存的是玩家 id，而真相里写的是角色 id，必须先换成同一种东西
  const killerPlayer = room.players.find((p) => p.charId === truth.killerId) || null;
  const killerPid = killerPlayer ? killerPlayer.id : null;
  const rows = room.players.map((p) => {
    const detail = [];
    let total = 0;
    // ★ 搜到线索本身不计分（线索是工具，不是奖品）。
    //   唯一和线索有关的惩罚性结算：投放伪造线索的凶手，一分也没有。
    // 问答分
    const ans = room.quizAnswers[p.id] || {};
    let qc = 0;
    for (const q of QUIZ) if (ans[q.id] === q.answer) qc++;
    if (qc > 0) {
      total += qc * SCORE.quizCorrect;
      detail.push({ label: "推理问答答对 " + qc + " 题", pts: qc * SCORE.quizCorrect });
    }
    // 投票分：非真凶玩家投中真凶 +3 分（真凶自己投自己不算）
    const mv = room.votes[p.id];
    if (mv && killerPid && p.id !== killerPid && mv.killer === killerPid) {
      total += SCORE.killerCorrect;
      detail.push({ label: "投中真凶", pts: SCORE.killerCorrect });
    }
    return { id: p.id, name: p.name, charId: p.charId, charName: p.charId ? CHAR_BY_ID[p.charId].name : "未选角", color: p.charId ? CHAR_BY_ID[p.charId].color : "#6b7280", total, detail, isKiller: p.charId === truth.killerId };
  });
  // 真凶有没有被抓（需求 12）：得票 ≥ 整体票数的一半就算被抓住。
  //   5 人局 3 票及以上、6 人局 3 票及以上 → 抓住；不到一半 → 真凶逃脱。
  const tally = {};
  for (const v of Object.values(room.votes)) tally[v.killer] = (tally[v.killer] || 0) + 1;
  const killerVotes = (killerPid && tally[killerPid]) || 0;
  const totalVotes = Object.keys(room.votes).length;
  const needVotes = Math.ceil(totalVotes / 2);
  const maxOther = Math.max(0, ...Object.keys(tally).filter((k) => k !== killerPid).map((k) => tally[k]));
  const caught = totalVotes > 0 && killerVotes * 2 >= totalVotes;
  if (!caught) {
    const killer = rows.find((r) => r.isKiller);
    if (killer) {
      killer.total += SCORE.killerEscaped;
      killer.detail.push({ label: "真凶逃脱成功", pts: SCORE.killerEscaped });
    }
  }
  rows.sort((a, b) => b.total - a.total);
  room.scores = { rows, caught, killerVotes, maxOther, tally, totalVotes, needVotes, killerId: truth.killerId, killerPid };
}
function doAction(room, player, type, body) {
  const isHost = hosted(room) && hosted(room).id === player.id;
  const P = packOf(room);
  const { charById: CHAR_BY_ID, characters: CHARACTERS, locById: LOC_BY_ID, quiz: QUIZ, voting: VOTING } = P;
  const METHOD_BY_ID = Object.fromEntries(VOTING.methods.map((m) => [m.id, m]));
  const MOTIVE_BY_ID = Object.fromEntries(VOTING.motives.map((m) => [m.id, m]));
  switch (type) {
    /* ---------- 大厅 ---------- */
    case "setChar": {
      if (room.phase !== "lobby") return bad("游戏已经开始，不能再换角色了。");
      const cid = body.charId;
      if (cid && !CHAR_BY_ID[cid]) return bad("没有这个角色。");
      const holder = cid ? room.players.find((p) => p.id !== player.id && p.charId === cid) : null;
      if (holder && !holder.isNPC) return bad("这个角色已经被别人选走了。");
      if (holder) {
        // 座位被 AI 占着？真人想演就让他演，AI 挪去坐空位（没有空位就顶替真人原来的角色）
        const old = player.charId && player.charId !== cid ? player.charId : null;
        holder.charId = null;
        player.charId = null;                       // 先把两个人的位置都空出来，免得"空位"扫到自己刚腾出的角色
        holder.charId = old || (() => {
          const free = CHARACTERS.find((c) => c.id !== cid && !room.players.some((p) => p.charId === c.id));
          return free ? free.id : null;
        })();
        pushLog(room, player.name + " 从 AI「" + holder.name + "」手里接过了" + CHAR_BY_ID[cid].name + "。", "join");
      }
      player.charId = cid || null;
      pushLog(room, player.name + " 选择了 " + (cid ? CHAR_BY_ID[cid].name + "（" + CHAR_BY_ID[cid].role + "）" : "随机待定"), "join");
      // 需求 4：选角立刻通知全房间，别人不用等下一次整页推送
      broadcastSeats(room);
      return ok({ player: playerBrief(room, player, player) });
    }
    case "addNPC": case "fillNPC": {
      if (!isHost) return bad("只有房主可以安排 AI 玩家。");
      // 用户本轮要求 6：加 AI / 一键坐满都要密码
      if (String(body.password == null ? "" : body.password) !== DELETE_PASSWORD) return bad("加 AI 要密码，密码不对。");
      if (room.phase !== "lobby") return bad("游戏已经开始，不能再加 AI 玩家了。");
      const want = type === "fillNPC" ? CHARACTERS.length - room.players.length : 1;
      if (want <= 0) return bad("座位已经满了。");
      let added = 0;
      for (let i = 0; i < want; i++) {
        const idle = CHARACTERS.filter((c) => !room.players.some((p) => p.charId === c.id));
        if (!idle.length || room.players.length >= CHARACTERS.length) break;
        const p = newPlayer(room, npc.freeNPCName(room));
        npc.attachNPC(room, p);
        p.charId = idle[Math.floor(Math.random() * idle.length)].id;
        p.ready = true;
        pushLog(room, "AI 玩家「" + p.name + "」入座，扮演" + CHAR_BY_ID[p.charId].name + "。", "join");
        added++;
      }
      if (!added) return bad("没有空位或者没有空角色了。");
      return ok({ added });
    }
    case "setName": {
      const n = String(body.name || "").trim().slice(0, 12);
      if (!n) return bad("名字不能为空。");
      player.name = n;
      return ok();
    }
    case "ready": {
      player.ready = !!body.value;
      // 用户本轮要求 9：所有人都准备了，就自动跳到下一阶段
      const jumped = maybeAutoAdvance(room);
      return ok({ autoAdvanced: jumped, phase: room.phase });
    }
    case "setIntro": {
      player.intro = String(body.text || "").slice(0, 800);
      return ok();
    }
    case "chat": {
      const text = String(body.text || "").slice(0, 500).trim();
      if (!text) return bad("说点什么吧。");
      const line = { t: now(), isNPC: !!player.isNPC, by: player.id, charId: player.charId, name: player.name, charName: player.charId ? CHAR_BY_ID[player.charId].name : player.name, color: player.charId ? CHAR_BY_ID[player.charId].color : "#6b7280", text };
      const to = String(body.to || "").trim();
      if (to) {
        // 用户本轮要求 4：点某个角色名字 = 私聊，只有你们两个人看得到
        const peer = room.players.find((x) => x.id === to);
        if (!peer) return bad("找不到这个人。");
        if (peer.id === player.id) return bad("不能跟自己私聊。");
        room.dms.push(Object.assign({ to: peer.id }, line));
        if (room.dms.length > 400) room.dms.splice(0, room.dms.length - 400);
        return ok({ dm: true, to: peer.id });
      }
      room.chat.push(line);
      if (room.chat.length > 300) room.chat.splice(0, room.chat.length - 300);
      return ok();
    }
    /* ---------- 阶段推进 ---------- */
    case "advance": {
      if (!isHost) return bad("只有房主可以推进阶段。");
      const i = PHASE_INDEX[room.phase];
      if (i === undefined || i >= PHASES.length - 1) return bad("已经是最后一个阶段了。");
      if (room.phase === "lobby") {
        // 需求 6：人数要坐满（真人 + AI 一共 P.characters.length 个座位）才能开局
        const CAP = P.characters.length;
        if (room.players.length < CAP) {
          return bad("人还没坐满：现在 " + room.players.length + " / " + CAP + " 人（含 AI）。点「一键坐满 " + CAP + " 人」让 AI 补位，满员才能开局。");
        }
        const unassigned = room.players.filter((p) => !p.charId);
        if (unassigned.length) return bad("还有 " + unassigned.length + " 位玩家没有选择角色。");
        // 用户本轮要求 5：所有人都点了「我准备好了」才能开始
        const notReady = room.players.filter((p) => !p.ready);
        if (notReady.length) return bad("还有 " + notReady.length + " 个人没有点「我准备好了」：" + notReady.map((p) => p.name).join("、") + "。");
      }
      enterPhase(room, PHASES[i + 1].id);
      return ok();
    }
    /* ---------- 离开房间（中途退场也能用） ---------- */
    case "leave": {
      const i = room.players.indexOf(player);
      if (i < 0) return bad("你已经不在这个房间里了。");
      room.players.splice(i, 1);
      for (const res of player.conns) { try { res.end(); } catch (e) {} }
      player.conns.clear();
      if (room.players.length) pushLog(room, player.name + " 离开了房间。", "join");
      if (!room.players.length) rooms.delete(room.code);
      // 需求 4：有人退出要立刻让剩下的人看到座位空出来
      if (rooms.has(room.code)) broadcastSeats(room);
      return ok({ left: true, code: room.code });
    }
    case "restart": {
      if (!isHost) return bad("只有房主可以重开。");
      room.phase = "lobby";
      room.searchCount = Object.fromEntries(P.locations.map((l) => [l.id, 0]));
      room.clueStates = new Map();
      room.chat = [];
      room.quizAnswers = {};
      room.votes = {};
      room.log = [];
      room.scores = null;
      for (const p of room.players) {
        p.ap = 0; p.ready = false; p.intro = ""; p.quizDone = false; p.quizSubmitted = false; p.voteDone = false;
      }
      pushLog(room, "新的一局开始了。", "phase");
      return ok();
    }
    /* ---------- 搜证 ---------- */
    case "search": {
      if (!SEARCH_PHASES.includes(room.phase)) return bad("现在不是搜证阶段。");
      const locId = body.location;
      const loc = LOC_BY_ID[locId];
      if (!loc) return bad("没有这个地点。");
      // 需求 6：搜证一只能搜人物房间，搜证二只能搜公共场景
      if (loc.phase !== room.phase) {
        return bad(loc.phase === "search1"
          ? "第一轮只搜人物的房间和随身物品，这里要等第二轮。"
          : "这里属于第二轮公共场景搜证，第一轮先别碰。");
      }
      // 需求 5：不能搜自己的房间 / 搜自己的身
      if (loc.owner && loc.owner === player.charId) {
        return bad("你不能搜" + (loc.owner === player.charId ? "自己的房间" : "这里") + "——藏东西的人自己搜自己，说不过去。");
      }
      // ★ 本轮修复 1：行动点双保险。
      //   以前只认 player.ap 一个数字，多开一个标签页连点、或者公网断线重发，
      //   都可能让"4 点"的人搜出第 5 条线索。现在另记一本 room.apUsed，
      //   两本账任何一本没余量都直接拒绝，谁也不可能多搜一条。
      const apCap = baseAp(room);
      const apUsed = room.apUsed[player.id] || 0;
      if (player.ap <= 0 || apUsed >= apCap) {
        player.ap = Math.max(0, Math.min(player.ap, apCap - apUsed));
        return bad("你的行动点已经用完了。");
      }
      // 显示数对齐真实额度（旧版本留下的偏差在这里被拉回来）
      if (player.ap > apCap - apUsed) player.ap = apCap - apUsed;
      // ★ 本轮要求 2：一次搜证 = 1 点行动点 = 1 条线索，绝不能出现"花了点数什么也没拿到"。
      //   以前深度门槛没到时会返回"只翻出一些杂物、不扣行动点"，玩家 4 点只拿到 3 条，
      //   账面上的点数跟线索条数对不上。现在没到门槛就自动往下挖（累加搜过次数），
      //   一次点只出一条线索；只有这个地点真的翻干净了才不花点数。
      let pool = availableIn(room, locId);
      let digs = 0;
      while (pool.length === 0 && remainingIn(room, locId).length > 0 && digs < 8) {
        room.searchCount[locId] = (room.searchCount[locId] || 0) + 1;
        digs += 1;
        pool = availableIn(room, locId);
      }
      if (pool.length === 0) {
        pushLog(room, player.name + " 在" + loc.name + "翻了很久，只翻出一些杂物。", "search");
        return ok({ locId: locId, empty: true, hint: loc.name + "已经被翻遍了，再搜也不会有什么收获（这一次不扣行动点）。" });
      }
      const def = pool[0];
      player.ap = Math.max(0, player.ap - 1);
      room.apUsed[player.id] = apUsed + 1;
      room.searchCount[locId] += 1;
      // 尸体线索是全场开局就摊在桌上的客观事实，强制公开；其余线索一律先攥在自己手里，
      // 由发现者自己决定「公开」还是「不公开」（见 publish / keepPrivate 两个动作）。
      const forced = isCorpseClue(def, room);
      const mode = forced ? "board" : "private";
      revealClue(room, def, player, mode, { location: locId });
      // 未公开的线索标题绝不能进公共日志，否则所有人都能看到
      pushLog(
        room,
        forced
          ? player.name + " 在" + loc.name + "发现了线索：「" + def.title + "」"
          : player.name + " 在" + loc.name + "摸到了什么，可惜只有他自己看得见。",
        "search"
      );
      // 需求 7：搜到线索要当场把线索内容显示给玩家，所以正文一起回给前端
      return ok({
        clueId: def.id,
        private: !forced,
        forced: forced,
        clue: { id: def.id, title: def.title || "线索", text: def.text || "", private: !forced, location: loc.name },
      });
    }
    /* ---------- 公开自己的线索（除尸体线索外，谁发现谁决定公不公开） ---------- */
    case "publish": {
      const st = room.clueStates.get(body.clueId);
      if (!st) return bad("没有这条线索。");
      const def = clueDef(room, st.id) || {};
      if (st.by !== player.id) return bad("这条线索不是你发现的。");
      if (isCorpseClue(def, room)) return bad("这是尸体上的线索，一开始就摊在所有人面前了。");
      if (st.mode === "board") return bad("这条线索已经在公开板上了。");
      st.mode = "board";
      st.publishedAt = now();
      st.keptPrivate = false;
      pushLog(room, player.name + " 把一条线索放上了公开板：「" + (def.title || "线索") + "」", "publish");
      return ok();
    }
    /* ---------- 把自己的线索继续攥在手里（选择"不公开"） ---------- */
    case "keepPrivate": {
      const st = room.clueStates.get(body.clueId);
      if (!st) return bad("没有这条线索。");
      const def = clueDef(room, st.id) || {};
      if (st.by !== player.id) return bad("这条线索不是你发现的。");
      if (isCorpseClue(def, room)) return bad("这是尸体上的线索，藏不住。");
      if (st.mode === "board") return bad("这条线索已经公开了，收不回来。");
      st.keptPrivate = true;
      st.privateChoiceAt = now();
      return ok();
    }
    /* ---------- 角色技能 ---------- */
/* ---------- 问答 ---------- */
    case "quizAnswer": {
      if (room.phase !== "quiz") return bad("现在不是问答阶段。");
      const q = P.quizById[body.qid] || QUIZ.find((x) => x.id === body.qid);
      if (!q) return bad("没有这道题。");
      const choice = String(body.choice || "").toUpperCase();
      if (!q.options.some((o) => o.key === choice)) return bad("选项不对。");
      if (player.quizSubmitted) return bad("你已经提交过了，不能改了。");
      if (!room.quizAnswers[player.id]) room.quizAnswers[player.id] = {};
      const mine = room.quizAnswers[player.id];
      // ★ 本轮修复 2：再点一次"已经选中"的选项 = 什么都不做。
      //   以前前端把它当成"取消选择"发上来，公网慢半拍时就会看到自己刚选的 A 又空掉。
      if (mine[q.id] === choice) {
        return ok({ qid: q.id, choice: choice, same: true, answeredCount: Object.keys(mine).length });
      }
      // 本轮要求 3：提交之前可以随便改答案；选了 A 再点 B 就是改选 B（直接覆盖）
      mine[q.id] = choice;
      return ok({ qid: q.id, choice: choice, answeredCount: Object.keys(mine).length });
    }
    /* ---------- 交卷（本轮要求 3） ---------- */
    case "submitQuiz": {
      if (room.phase !== "quiz") return bad("现在不是问答阶段。");
      if (player.quizSubmitted) return bad("你已经交过卷了。");
      const ans = room.quizAnswers[player.id] || {};
      const missing = QUIZ.filter((q) => !ans[q.id]);
      if (missing.length) return bad("还有 " + missing.length + " 道题没有作答。");
      player.quizSubmitted = true;
      player.quizDone = true;
      const humans = room.players.filter((p) => !p.isNPC);
      const all = humans.length > 0 && humans.every((p) => p.quizSubmitted);
      if (all) {
        // 所有人都交卷了 → 自动进投票（本轮要求 3）
        enterPhase(room, "vote");
        return ok({ submitted: true, allDone: true, autoAdvanced: true, phase: room.phase });
      }
      return ok({ submitted: true, allDone: false, phase: room.phase });
    }
    /* ---------- 投票 ---------- */
    case "vote": {
      if (room.phase !== "vote") return bad("现在不是投票阶段。");
      if (room.votes[player.id]) return bad("你已经投过票了。");
      const target = room.players.find((p) => p.id === body.killer || (p.charId && p.charId === body.killer));
      if (!target) return bad("请指认一位玩家。");
      room.votes[player.id] = { killer: target.id, at: now() };
      player.voteDone = true;
      pushLog(room, player.name + " 投出了自己的一票。", "vote");
      // 需求 8：所有人都投完之后自动跳转下一阶段（揭晓）
      const voterN = room.players.filter((p) => !p.isNPC).length;
      const allVoted = voterN > 0 && room.players.every((p) => p.isNPC || room.votes[p.id]);
      if (allVoted) {
        enterPhase(room, "reveal");
        return ok({ voted: true, allDone: true, autoAdvanced: true, phase: room.phase });
      }
      return ok({ voted: true, allDone: false, phase: room.phase });
    }
    default:
      return bad("未知的操作：" + type);
  }
}

/* ============================================================
   5. HTTP
   ============================================================ */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};
function readBody(req) {
  return new Promise((resolve) => {
    let buf = "";
    req.on("data", (c) => { buf += c; if (buf.length > 1e6) req.destroy(); });
    req.on("end", () => {
      try { resolve(JSON.parse(buf || "{}")); } catch (e) { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}
function json(res, code, obj) {
  const s = JSON.stringify(obj);
  const req = res.req || null;
  const accept = String((req && req.headers && req.headers["accept-encoding"]) || "");
  if (s.length > 256 && /(^|,)\s*gzip\s*(,|$)/.test(accept)) {
    const gz = zlib.gzipSync(Buffer.from(s));
    res.writeHead(code, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Encoding": "gzip",
      Vary: "Accept-Encoding",
      "Content-Length": gz.length,
    });
    res.end(gz);
    return;
  }
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(s);
}

/* ============================================================
   实景图就绪门禁（本轮需求）
   ★ 角色头像 / 搜证场景 / 局内背景图必须在**第一次创建房间之前**就已经缓存好。
   ★ 服务器一起来就把整批图排上队（prewarm），这里只负责"数"：
     还有几张没落盘、都在哪一类里，创建房间的接口据此决定放不放行。
   ============================================================ */
let IMG_LIST = [];          // 当前全部剧本要用的图（重启或增删剧本后刷新）
let IMG_READY = false;      // 全部落盘才算就绪
function refreshImageList() {
  IMG_LIST = images.allImages(PACKS);
  return IMG_LIST;
}
function imageStatus() {
  // ★ 云端加固：NO_IMG=1 表示不联网出图、只读 cache。直接宣告图片就绪，
  //   否则哪怕 cache 里只缺一张，前端也会一直卡在"正在准备实景图"进度条。
  if (process.env.NO_IMG === "1") {
    IMG_READY = true;
    return {
      ready: true, total: 0, pending: 0, done: 0,
      char: 0, charPending: 0, loc: 0, locPending: 0,
      cover: 0, coverPending: 0, bg: 0, bgPending: 0, missing: 0,
    };
  }
  if (!IMG_LIST.length) refreshImageList();
  const by = images.pendingByKind(IMG_LIST);
  IMG_READY = by.pending === 0;
  return {
    ready: IMG_READY,
    total: by.total, pending: by.pending, done: by.total - by.pending,
    char: by.char, charPending: by.charPending,
    loc: by.loc, locPending: by.locPending,
    cover: by.cover, coverPending: by.coverPending,
    bg: by.bg, bgPending: by.bgPending,
    missing: images.pendingOf(IMG_LIST).missing,
  };
}
/** 还没好就返回一句人话，好了就返回 null —— 创建房间前先问它 */
function imagesNotReady() {
  const st = imageStatus();
  if (st.ready) return null;
  return "实景图还没备齐（头像 " + (st.char - st.charPending) + "/" + st.char +
    "，搜证场景 " + (st.loc - st.locPending) + "/" + st.loc +
    "，其余待生成 " + (st.coverPending + st.bgPending + Math.max(0, st.pending - st.charPending - st.locPending - st.coverPending - st.bgPending)) +
    "），还有 " + st.pending + " 张在画。等全部缓存好就能建房了。";
}
/* 图片就绪状态变了（或者还在出图）就通知等在大厅的人刷新进度条 */
let imgTick = null;
function startImageWatch() {
  if (imgTick) return;
  const timer = setInterval(() => {
    try {
      const was = IMG_READY;
      const st = imageStatus();
      if (st.ready !== was || !st.ready) broadcastImageStatus();
      if (st.ready) { clearInterval(timer); imgTick = null; }
    } catch (e) {}
  }, 2000);
  if (timer.unref) timer.unref();
  imgTick = timer;
}
function broadcastImageStatus() {
  const line = "data: " + JSON.stringify({ kind: "imageStatus", images: imageStatus() }) + "\n\n";
  for (const room of rooms.values()) {
    for (const pl of room.players) {
      if (!pl.conns || !pl.conns.size) continue;
      for (const res of pl.conns) { try { res.write(line); } catch (e) {} }
    }
  }
}
function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel === "/" || rel === "") rel = "/index.html";
  const full = path.join(PUBLIC_DIR, rel);
  if (!full.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end("403"); return; }
  fs.stat(full, (serr, st) => {
    if (serr) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("404 Not Found: " + rel); return; }
    // 公网链接下第二次打开就走 304，不用再down一遍 app.js / style.css
    const etag = 'W/"' + st.size.toString(36) + "-" + Math.floor(st.mtimeMs).toString(36) + '"';
    if (req.headers["if-none-match"] === etag) { res.writeHead(304, { ETag: etag, "Cache-Control": "no-cache" }); res.end(); return; }
    fs.readFile(full, (err, data) => {
      if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("404 Not Found: " + rel); return; }
      const mime = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
      if (/^(text\/|application\/json)/.test(mime) && data.length > 256 && /(^|,)\s*gzip\s*(,|$)/.test(req.headers["accept-encoding"] || "")) {
        const gz = zlib.gzipSync(data);
        res.writeHead(200, {
          "Content-Type": mime,
          "Cache-Control": "no-cache",
          ETag: etag,
          "Content-Encoding": "gzip",
          Vary: "Accept-Encoding",
          "Content-Length": gz.length,
        });
        res.end(gz);
        return;
      }
      res.writeHead(200, {
        "Content-Type": mime,
        "Cache-Control": "no-cache",
        ETag: etag,
      });
      res.end(data);
    });
  });
}
const server = http.createServer(async (req, res) => {
  try {
    await handle(req, res);
  } catch (e) {
    console.error("[请求出错] " + req.method + " " + req.url + " -> " + (e && e.stack ? e.stack : String(e)));
    try { if (!res.headersSent) json(res, 500, { ok: false, error: "服务器内部错误。" }); else res.end(); } catch (e2) {}
  }
});
async function handle(req, res) {
  const u = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  const p = u.pathname;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  /* ---------- 健康检查：隧道看门狗 + 网页探活都打这里 ----------
     ★ 本轮修复 4：Cloudflare 给玩家看的那个 "Cloudflare Tunnel error" 页面，
       本质是"隧道域名还活着、但 cloudflared 到边缘的那条链断了"。
       这个端点必须极轻、不能被缓存，服务器自己每 20 秒从公网地址回打一次：
       连续不通就换一条新隧道，而不是让玩家一直撞错误页。 */
  if (p === "/healthz") {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    });
    if (req.method === "HEAD") { res.end(); return; }
    res.end(JSON.stringify({
      ok: true,
      t: now(),
      rooms: rooms.size,
      players: [...rooms.values()].reduce((n, r) => n + r.players.length, 0),
      tunnel: !!PUBLIC_URL,
      tunnelFails: TUNNEL_STATE.fails,
      up: Math.round(process.uptime()),
    }));
    return;
  }
  /* ---------- 本机信息 ---------- */
  if (p === "/api/lan") {
    const ip = lanIP();
    return json(res, 200, { ok: true, ip, port: PORT, url: "http://" + ip + ":" + PORT + "/", ips: lanIPs(),
                            publicUrl: PUBLIC_URL || null, rooms: rooms.size,
                            tunnel: { url: PUBLIC_URL || null, ok: TUNNEL_STATE.ok, fails: TUNNEL_STATE.fails,
                                      checkedAt: TUNNEL_STATE.at, restarts: TUNNEL_STATE.restarts } });
  }
  /* ---------- 实景图准备进度（前端"正在准备实景图"进度条） ---------- */
  if (p === "/api/images") {
    const st = imageStatus();
    if (!st.ready) { images.prewarm(PACKS); startImageWatch(); }
    return json(res, 200, { ok: true, images: st });
  }
  /* ---------- 剧本库：data/cases/ 下摆出来的那些本子 ---------- */
  if (p === "/api/cases") {
    // 落地页轮询 /api/cases 时也保证出图任务已经排上队，进度不用等用户刷新
    if (!imageStatus().ready) { images.prewarm(PACKS); startImageWatch(); }
    // 需求 6：剧本库里只摆 data/cases/ 下的本子；data/samples/ 的内置样例不摆出来
    const list = LISTED.map((C) => {
      const iid = C.id + "-cover";
      if (C.cover) images.ensure("cover", iid, C.cover);
      const v = images.versionOf("cover", iid);
      return {
        id: C.id, title: C.title, subtitle: C.subtitle, meta: C.meta, blurb: C.blurb,
        tags: C.tags || [], difficulty: C.difficulty || "",
        // 需求 13：剧本杀卡片只显示 人数 / 时长 / 题材 / 类别
        card: C.card,
        cover: C.cover ? "/api/img/coverthumb/" + encodeURIComponent(iid) + "?v=" + v : null,
        bg: packBg(C),
        characters: C.characters.length, locations: C.locations.length, clues: C.clues.length,
        rooms: [...rooms.values()].filter((r) => r.pack.id === C.id).length,
        roles: C.characters.map((c) => ({ id: c.id, name: c.name, role: c.role, avatar: c.avatar, color: c.color })),
      };
    });
    return json(res, 200, {
      ok: true,
      cases: list,
      images: imageStatus(),
      defaultId: DEFAULT_PACK ? DEFAULT_PACK.id : null,
      // 网页底图（全局一张，符合剧本杀气质；生成一次就一直用）
      bg: "/api/img/bgthumb/" + images.BG_ID + "?v=" + images.versionOf("bg", images.BG_ID),
    });
  }
  /* ---------- 删剧本（需求 3）：密码 985266808，删的是 data/cases/ 下的文件 ---------- */
  if (p === "/api/cases/delete" && req.method === "POST") {
    const body = await readBody(req);
    const r = deletePack(body.id, body.password);
    if (!r.ok) return json(res, 403, { ok: false, error: r.error });
    const removedImages = images.deletePackAssets(r.id);
    refreshImageList();
    console.log("[剧本库] 已删除《" + r.title + "》（" + r.id + "），连同 " + removedImages + " 张图片，剧本库还剩 " + LISTED.length + " 本");
    return json(res, 200, { ok: true, id: r.id, title: r.title, cases: LISTED.length });
  }
  /* ---------- 校验台：和 tools/check-pack.mjs 是同一份检查 ---------- */
  if (p === "/api/audit") {
    const packs = LISTED.map((C) => auditPack(C, images.PORTRAIT_PROMPTS));
    const problems = packs.reduce((n, x) => n + x.problems, 0);
    return json(res, 200, { ok: true, problems: problems, packs: packs, cases: LISTED.length });
  }
  /* ---------- 建房 ---------- */
  if (p === "/api/create" && req.method === "POST") {
    const body = await readBody(req);
    // 剧本库里选了哪一本（没选就第一部）
    const pack = PACK_BY_ID[String(body.caseId || "").trim()] || DEFAULT_PACK;
    if (!pack) return json(res, 500, { ok: false, error: "剧本库是空的。" });
    // ★ 本轮需求：角色头像 / 搜证场景 / 局内底图必须在第一次建房之前就缓存好。
    //   还没好就不给建房，并把进度告诉前端，前端显示"正在准备实景图"。
    //   NO_IMG=1 时 imageStatus 直接报 ready，这里自动放行（云端只读 cache）。
    if (process.env.NO_IMG !== "1") {
      const notReady = imagesNotReady();
      if (notReady) {
        const st = imageStatus();
        startImageWatch();
        return json(res, 503, { ok: false, error: notReady, images: st, preparing: true });
      }
    }
    const P = pack;
    const room = newRoom(pack);
    const player = newPlayer(room, body.name || "房主");
    pushLog(room, player.name + " 创建了房间：「" + P.title + "」。", "join");
    // 需求 1：真人 + AI 混合房间。建房时可以顺手塞几个 AI 进来。
    const wantNPC = Math.min(Math.max(Number(body.npc) || 0, 0), P.characters.length - 1);
    for (let i = 0; i < wantNPC; i++) {
      const idle = P.characters.filter((c) => !room.players.some((x) => x.charId === c.id));
      const bot = newPlayer(room, npc.freeNPCName(room));
      npc.attachNPC(room, bot);
      bot.charId = idle[Math.floor(Math.random() * idle.length)].id;
      bot.ready = true;
      pushLog(room, "AI 玩家「" + bot.name + "」入座，扮演" + P.charById[bot.charId].name + "。", "join");
    }
    broadcastSeats(room);   // 需求 4：AI 入座也立刻同步给房间里其他人
    return json(res, 200, { ok: true, code: room.code, token: player.token, playerId: player.id, caseId: P.id, caseTitle: P.title, view: viewFor(room, player) });
  }
  /* ---------- 加入 ---------- */
  if (p === "/api/join" && req.method === "POST") {
    const body = await readBody(req);
    const code = String(body.code || "").trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) return json(res, 404, { ok: false, error: "找不到房间 " + code + "，请检查房号。" });
    const name = String(body.name || "").trim().slice(0, 12) || ("玩家" + (room.players.length + 1));
    // 需求 3：重进房间 = 用同一个名字坐回同一个座位。
    //   以前只在"旧连接已经断了"的时候才允许接管：刷新页面、手机切后台、
    //   旧标签页没关干净……旧连接还在，服务器就会再建一个新玩家，
    //   大厅里于是出现两个一模一样的名字，房间满员时还会直接进不来。
    const CAP = room.pack.characters.length;
    const ROLE_BY_ID = room.pack.charById;
    const sameName = room.players.filter((x) => x.name === name && !x.isNPC);
    if (sameName.length) {
      const seat = sameName[0];
      // 老版本留下的同名幽灵顺手清掉，只保留一个座位
      for (const dup of sameName.slice(1)) {
        for (const c0 of dup.conns) { try { c0.end(); } catch (e) {} }
        dup.conns.clear();
        const di = room.players.indexOf(dup);
        if (di >= 0) room.players.splice(di, 1);
      }
      for (const c0 of seat.conns) { try { c0.end(); } catch (e) {} }   // 踢掉旧连接，让新页面接管
      seat.conns.clear();
      seat.isNPC = false;
      seat.npc = null;
      seat.token = token();
      seat.lastSeen = now();
      pushLog(room, seat.name + " 回到了房间。", "join");
      broadcastSeats(room);
      return json(res, 200, { ok: true, code: room.code, token: seat.token, playerId: seat.id, caseId: room.pack.id, caseTitle: room.pack.title, reconnected: true, view: viewFor(room, seat) });
    }
    // 座位满了：如果还有 AI 占着，就让真人把它顶下来（AI 变真人，剧本和线索原样接着玩）
    if (room.players.length >= CAP) {
      const bot = room.players.find((x) => x.isNPC);
      if (!bot) return json(res, 400, { ok: false, error: "房间已经满了（最多 " + CAP + " 人）。如果你是刚掉线的那位，请用原来的名字加入。" });
      bot.isNPC = false;
      bot.npc = null;
      bot.name = name;
      bot.token = token();
      bot.ready = true;
      bot.lastSeen = now();
      pushLog(room, name + " 接替了 AI 的位置，扮演" + (bot.charId ? ROLE_BY_ID[bot.charId].name : "待定角色") + "。", "join");
      broadcastSeats(room);
      return json(res, 200, { ok: true, code: room.code, token: bot.token, playerId: bot.id, caseId: room.pack.id, tookOver: true, view: viewFor(room, bot) });
    }

    const player = newPlayer(room, name);
    pushLog(room, player.name + " 走进了房间。", "join");
    broadcastSeats(room);
    return json(res, 200, { ok: true, code: room.code, token: player.token, playerId: player.id, caseId: room.pack.id, caseTitle: room.pack.title, reconnected: false, view: viewFor(room, player) });
  }
  /* ---------- 单次拉取状态（SSE 的兜底 / 调试用） ---------- */
  if (p === "/api/state") {
    const room = rooms.get(String(u.searchParams.get("code") || "").toUpperCase());
    if (!room) return json(res, 404, { ok: false, error: "房间不存在。" });
    const player = findPlayer(room, u.searchParams.get("token") || "");
    if (!player) return json(res, 403, { ok: false, error: "身份验证失败。" });
    return json(res, 200, { ok: true, view: viewFor(room, player) });
  }
  /* ---------- SSE 流 ---------- */
  if (p === "/api/stream") {
    const code = String(u.searchParams.get("code") || "").toUpperCase();
    const tk = u.searchParams.get("token") || "";
    const room = rooms.get(code);
    if (!room) { res.writeHead(404); res.end("no room"); return; }
    const player = findPlayer(room, tk);
    if (!player) { res.writeHead(403); res.end("bad token"); return; }
    // ★ 本轮修复 3：走 Cloudflare / 隧道时不要再给 SSE 套一层 gzip。
    //   CF 边缘对压缩流有自己的攒包策略，会把"小帧"憋一会儿再放出去，
    //   表现就是公网上每个人都比局域网慢两三秒；只有直连局域网时才用 gzip 省流量。
    const proxied = !!(req.headers["cf-ray"] || req.headers["cf-connecting-ip"] ||
                      req.headers["x-forwarded-host"] || req.headers["x-forwarded-proto"]);
    const useGzip = !proxied && /(^|,)\s*gzip\s*(,|$)/.test(req.headers["accept-encoding"] || "");
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...(useGzip ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}),
    });
    let sink = res;
    let gzStream = null;
    if (useGzip) {
      gzStream = zlib.createGzip({ flush: zlib.constants.Z_SYNC_FLUSH });
      gzStream.pipe(res);
      sink = {
        write(chunk, cb) {
          gzStream.write(chunk);
          gzStream.flush();
          if (cb) cb();
          return true;
        },
        end() { try { gzStream.end(); } catch {} },
      };
    }
    sink.write(": connected\n\n");
    player.conns.add(sink);
    player.lastSeen = now();
    sendTo(room, player);
    broadcast(room);   // 让其他人看到"上线了"
    // 公网修复：心跳从 20s 缩到 3s、发成可感知的 ping 事件，让 Cloudflare/隧道侧不会把闲置的 SSE 掐掉
    const hb = setInterval(() => { try { sink.write("data: " + JSON.stringify({ kind: "ping" }) + "\n\n"); } catch (e) {} }, 3000);
    req.on("close", () => {
      clearInterval(hb);
      player.conns.delete(sink);
      player.lastSeen = now();
      broadcast(room);
      if (gzStream) { try { gzStream.end(); } catch {} }
    });
    return;
  }
  /* ---------- 行动 ---------- */
  if (p === "/api/action" && req.method === "POST") {
    const body = await readBody(req);
    const room = rooms.get(String(body.code || "").toUpperCase());
    if (!room) return json(res, 404, { ok: false, error: "房间不存在。" });
    const player = findPlayer(room, body.token);
    if (!player) return json(res, 403, { ok: false, error: "身份验证失败，请重新加入。" });
    player.lastSeen = now();
    // ★ 本轮修复 2：同一次点击的重发只算一次。
    //   手机上双击、断线后客户端重试、公网重传，服务器原来会当成两次操作
    //   （搜证白扣一点、投票直接被"你已经投过了"挡住）。带 cid 的请求 60 秒内回放上次结果。
    const cid = String(body.cid || "");
    if (cid && player.recentActs.has(cid)) {
      const hit = player.recentActs.get(cid);
      if (now() - hit.t < 60000) {
        const cached = Object.assign({}, hit.result);
        if (cached.ok && body.type !== "leave") cached.view = viewFor(room, player);
        return json(res, 200, Object.assign(cached, { replay: true }));
      }
      player.recentActs.delete(cid);
    }
    // ★ 本轮修复 2：乱序请求只认"最后点的那一次"。
    //   问答同一道题 / 投票 / 搜证各自带序号，晚到的旧操作直接静默丢掉（stale），
    //   于是"先点了 B，慢半拍的 A 到了又把 B 覆盖掉"不可能再发生。
    const seq = Number(body.seq) || 0;
    const seqKey = seq > 0 ? actSeqKey(body.type, body) : null;
    if (seqKey) {
      const prev = player.actSeq[seqKey] || 0;
      if (seq <= prev) {
        return json(res, 200, { ok: true, stale: true, view: viewFor(room, player) });
      }
      player.actSeq[seqKey] = seq;
    }
    let result;
    try {
      result = doAction(room, player, body.type, body);
    } catch (e) {
      result = bad("服务器内部错误：" + (e && e.message ? e.message : String(e)));
    }
    if (result.ok && body.type === "leave") {
      if (rooms.has(room.code)) broadcast(room);      // 房间里还有人就通知他们
    } else if (result.ok) {
      broadcast(room);
    } else {
      sendTo(room, player);
    }
    // 公网修复：结果里直接捎一份"行动者自己"的视角。
    // 阶段变化（准备齐了自动跳阶段 / 房主推进）原来只能靠 SSE 那条被 30ms 合并过的推送，
    // 走公网隧道时这一圈要好几秒，点按钮的人就一直卡在旧页面。
    // 客户端拿到这份 view 立刻就地跳阶段，SSE 随后到达的那一帧结果相同，重绘是幂等的。
    // 修复 2：把这次结果记在 cid 上，重发时直接回放（不带 view，省内存）
    if (cid) {
      player.recentActs.set(cid, { t: now(), result: Object.assign({}, result) });
      if (player.recentActs.size > 60) {
        const first = player.recentActs.keys().next();
        if (!first.done) player.recentActs.delete(first.value);
      }
    }
    if (result.ok && body.type !== "leave") result.view = viewFor(room, player);
    return json(res, 200, result);
  }
  /* ---------- 实景图（需求 1：只给"搜证场景"和"人物肖像"出图，生成一次就永久缓存） ---------- */
  if (p.startsWith("/api/img/") && req.method === "GET") {
    const parts = p.slice("/api/img/".length).split("/");
    const kind = parts[0];
    const id = decodeURIComponent(parts[1] || "");
    if (!["loc", "char", "cover", "bg", "map", "charthumb", "coverthumb", "locthumb", "bgthumb"].includes(kind) || !id) { res.writeHead(404); res.end("404"); return; }
    // 图片 id 形如 wugang-study（剧本 id + 地点 id），所以先按前缀找到那一本剧本
    const pid = id.split("-")[0];
    const C = PACK_BY_ID[pid] || DEFAULT_PACK;
    const bare = id.slice(pid.length + 1);
    let label = "现场照片";
    if ((kind === "loc" || kind === "locthumb") && C && C.locById[bare]) label = C.locById[bare].name;
    if ((kind === "char" || kind === "charthumb") && C && C.charById[bare]) label = C.charById[bare].name;
    if ((kind === "cover" || kind === "coverthumb") && C) label = C.title;
    if (kind === "map" && C) label = C.title + " · 公知平面图";
    if (["charthumb", "coverthumb", "locthumb", "bgthumb"].includes(kind)) {
      const baseKind = kind === "charthumb" ? "char" : kind === "coverthumb" ? "cover" : kind === "locthumb" ? "loc" : "bg";
      return images.sendSmall(baseKind, id, res, label);
    }
    return images.send(kind, id, res, label);
  }
  /* ---------- maps/：外部修改好的剧本地图图片 ---------- */
  if (p.startsWith("/maps/") && req.method === "GET") {
    const rel = decodeURIComponent(p.slice("/maps/".length).split("?")[0]);
    if (!rel || !/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(rel)) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("404 Not Found: " + rel); return; }
    const full = path.join(MAPS_DIR, rel);
    if (!full.startsWith(MAPS_DIR)) { res.writeHead(403); res.end("403"); return; }
    fs.stat(full, (serr, st) => {
      if (serr) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("404 Not Found: " + rel); return; }
      const etag = 'W/"' + st.size.toString(36) + "-" + Math.floor(st.mtimeMs).toString(36) + '"';
      if (req.headers["if-none-match"] === etag) { res.writeHead(304, { ETag: etag, "Cache-Control": "no-cache" }); res.end(); return; }
      fs.readFile(full, (err, data) => {
        if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("404 Not Found: " + rel); return; }
        res.writeHead(200, { "Content-Type": MIME[path.extname(full).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache", ETag: etag });
        res.end(data);
      });
    });
    return;
  }
  /* ---------- 静态文件 ---------- */
  if (req.method === "GET") return serveStatic(req, res, p);
  res.writeHead(405); res.end("405");
}
// 一局的意外不该带走整个服务器
process.on("uncaughtException", (e) => { console.error("[未捕获异常] " + (e && e.stack ? e.stack : String(e))); });
process.on("unhandledRejection", (e) => { console.error("[未处理的 Promise 拒绝] " + (e && e.stack ? e.stack : String(e))); });
let portTries = 0;
server.on("error", (e) => {
  const busy = e && (e.code === "EADDRINUSE" || e.code === "EACCES");
  // 没手动指定端口时，端口被占 / 被系统保留就自动往后挪，别让整局游戏起不来
  if (busy && !EXPLICIT_PORT && portTries < 10) {
    const from = PORT;
    portTries++;
    PORT = DEFAULT_PORT + portTries;
    console.log("");
    console.log("  [!] 端口 " + from + " 用不了（" + e.code + "），自动换成 " + PORT + " 再试。");
    setTimeout(listenNow, 200);
    return;
  }
  if (e && e.code === "EADDRINUSE") {
    console.log("");
    console.log("  [!] 端口 " + PORT + " 已经被占用了。");
    console.log("      多半是你之前已经开着一个服务器窗口还没关，先去把它关掉。");
    console.log("      或者换个端口启动：  node server.mjs " + (DEFAULT_PORT + 1));
    console.log("");
    process.exitCode = 1;
    return;
  }
  console.error("[服务器出错] " + (e && e.stack ? e.stack : String(e)));
});
/* 需求 4：大厅里有真人加入 / 离开 / 掉线，其他人要立刻看到。
   join / leave / SSE 断开时已经各推一次状态；这里再补一个只对"还停在大厅"的房间
   生效的低频心跳，用来兜住手机锁屏那种"连接其实已经死了、服务器却还不知道"的幽灵座位。 */
const lobbyTimer = setInterval(() => {
  for (const room of rooms.values()) {
    if (room.phase !== "lobby") continue;
    try { broadcast(room); } catch (e) {}
  }
}, 8000);
lobbyTimer.unref();
/* ============================================================
   AI 玩家：每 1.5 秒让每个 AI 走一小步
   ============================================================ */
const npcTimer = setInterval(() => {
  for (const room of rooms.values()) {
    if (!npc.npcCount(room)) continue;
    let acted = 0;
    try { acted = npc.drive(room, NPC_API); } catch (e) {
      console.error("[AI 出错] " + (e && e.stack ? e.stack : String(e)));
    }
    if (acted) broadcast(room);
  }
}, 1500);
npcTimer.unref();
/* 有一张新图洗出来了，就让所有房间的网页把它显示出来 */
images.setOnDone(() => {
  for (const room of rooms.values()) { try { broadcast(room); } catch (e) {} }
});
/* ============================================================
   公网隧道：让别人不在同一个 WiFi 也能连进来
   ============================================================ */
function startPublicTunnel() {
  if (String(process.env.NO_TUNNEL || "") === "1") return;
  startTunnel(PORT, {
    onLog: (m) => console.log(m),
    onUrl: (url) => {
      if (!url) {
        // 修复 4：地址没了就是"公网暂时不可达"，这个事实要报出去（/api/lan、页面提示都靠它）
        TUNNEL_STATE.ok = false;
        if (PUBLIC_URL) {
          PUBLIC_URL = null;
          console.log("  公网地址：   隧道断开，已自动切换回局域网；正在后台重连。");
          for (const room of rooms.values()) broadcast(room);
        }
        return;
      }
      const fresh = PUBLIC_URL !== url;
      PUBLIC_URL = url;
      // 修复 4：新地址一到就当成健康的（这一条隧道刚起来，还没被玩家验证过）
      TUNNEL_STATE.ok = true;
      TUNNEL_STATE.fails = 0;
      if (fresh) {
        console.log("  ─────────────────────────────────────────");
        console.log("  公网地址：   " + url);
        console.log("  ★ 这个链接发给谁都能玩，不用连同一个 WiFi。");
      }
      for (const room of rooms.values()) broadcast(room);
    },
  })
    .then((url) => {
      if (!url) {
        console.log("  公网地址：   （暂时没打通，后台会自动重试，成功后会再次通知）");
      }
    })
    .catch((e) => console.log("  公网地址：   （隧道没起来：" + (e && e.message) + "）"));
}
/* ============================================================
   ★ 本轮修复 4：公网通道自己盯着自己（"Cloudflare Tunnel error" 的根治）
   trycloudflare 的临时域名本身没问题，坏的是 cloudflared 到 CF 边缘的那条链：
   进程还活着、域名也解析，但玩家打开一律是 Cloudflare 的错误页 —— 而服务器这边
   完全不知道，还照样把这个死掉的地址印在邀请链接上。
   所以这里每 20 秒从本机回打一次自己的公网地址 + /healthz：
   连续 3 次不通就认定这条隧道已经废了，直接换一条新的（新域名），并广播给所有房间。
   ============================================================ */
function probeUrl(url, timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    const fin = (v) => { if (!done) { done = true; resolve(v); } };
    try {
      const mod = /^https:/i.test(url) ? https : http;
      const req = mod.get(url, {
        timeout: timeoutMs,
        headers: { "user-agent": "mm-tunnel-watchdog", "cache-control": "no-cache" },
      }, (res) => {
        res.resume();
        fin(res.statusCode >= 200 && res.statusCode < 400);
      });
      req.on("timeout", () => { try { req.destroy(); } catch (e) {} fin(false); });
      req.on("error", () => fin(false));
    } catch (e) { fin(false); }
  });
}
const tunnelTimer = setInterval(async () => {
  if (String(process.env.NO_TUNNEL || "") === "1") return;
  if (!PUBLIC_URL || TUNNEL_STATE.busy) return;
  if (now() < TUNNEL_STATE.nextAt) return;   // 刚换过新的，给一分钟新生期
  TUNNEL_STATE.busy = true;
  const base = String(PUBLIC_URL).replace(/\/+$/, "");   // 去掉结尾斜杠，拼 /healthz
  const good = await probeUrl(base + "/healthz?v=" + now(), 8000);
  TUNNEL_STATE.busy = false;
  TUNNEL_STATE.at = now();
  if (good) {
    if (!TUNNEL_STATE.ok) {
      TUNNEL_STATE.ok = true;
      console.log("  公网地址：   自检恢复，通道正常。");
      for (const room of rooms.values()) broadcast(room);
    }
    TUNNEL_STATE.fails = 0;
    return;
  }
  TUNNEL_STATE.fails += 1;
  if (TUNNEL_STATE.fails < 3) return;
  TUNNEL_STATE.ok = false;
  TUNNEL_STATE.fails = 0;
  TUNNEL_STATE.restarts += 1;
  TUNNEL_STATE.nextAt = now() + 60000;
  console.log("  公网地址：   自检连续失败，这条隧道已经不通了，正在换一条新的（第 " + TUNNEL_STATE.restarts + " 次）……");
  PUBLIC_URL = null;
  for (const room of rooms.values()) broadcast(room);
  try { restartTunnels(); } catch (e) {}
}, 20000);
tunnelTimer.unref();
export { server };
// 只注册一次：listen 失败重试时如果每次都挂回调，成功那一次会把回调触发多次
server.on("listening", onListening);
function listenNow() { server.listen(PORT, "0.0.0.0"); }
function onListening() {
  startPublicTunnel();
  const ips = lanIPs();
  console.log("");
  console.log("  剧本杀服务器已启动 · 剧本库 " + LISTED.length + " 本：" + (LISTED.map((C) => C.title).join("、") || "（空）") +
    (PACKS.length > LISTED.length ? "（另有 " + (PACKS.length - LISTED.length) + " 本内置样例：" + PACKS.filter((C) => C.sample).map((C) => C.title).join("、") + "）" : ""));
  auditPacks((m) => console.log(m));
  console.log("  ─────────────────────────────────────────");
  console.log("  本机访问：   http://localhost:" + PORT + "/");
  if (!ips.length) {
    console.log("  同局域网：   （没找到局域网地址，请检查电脑是否连上了 WiFi）");
  } else {
    ips.slice(0, 3).forEach((c, i) => {
      console.log((i === 0 ? "  同局域网：   " : "  备用地址：   ") + c.url + "   [" + c.name + "]");
    });
  }
  console.log("  ─────────────────────────────────────────");
  // 从 bat 启动（没手动指定端口）时，由服务器自己打开浏览器：这时已经在监听，
  // 不会出现"浏览器先到、服务器还没起来"的拒绝连接；端口自动换过也能打开正确地址。
  // ★ 云端加固：只在 Windows 下自动开浏览器（Linux 容器没有 cmd，且云端不需要开浏览器）；
  //   NO_OPEN=1 时也跳过。
  if (!EXPLICIT_PORT && process.platform === "win32" && String(process.env.NO_OPEN || "") !== "1") {
    try {
      const child = spawn("cmd", ["/c", "start", "", "http://localhost:" + PORT + "/"], { detached: true, stdio: "ignore", windowsHide: true });
      child.on("error", () => {});
      child.unref();
    } catch (e) {}
  }
  // ★ 需求 2：所有剧本的图（封面 / 头像 / 场景 / 网页底图）在开局之前就整批生成好
  refreshImageList();
  const imgJobs = images.prewarm(PACKS);
  const st0 = imageStatus();
  if (st0.ready) console.log("  实景图：     " + st0.total + " 张全部就绪（头像 / 搜证场景 / 网页底图），建房即用。");
  else { startImageWatch(); console.log("  实景图：     准备中 " + st0.done + "/" + st0.total + "（头像 " + (st0.char - st0.charPending) + "/" + st0.char + "，搜证场景 " + (st0.loc - st0.locPending) + "/" + st0.loc + "）——备齐之前不能建房。"); }
  console.log("  实景图：     " + (process.env.NO_IMG === "1"
    ? "NO_IMG=1 —— 只读 cache/img 里已有的图，不联网生成。"
    : "开始准备 " + imgJobs + " 张图（封面 / 角色头像 / 搜证场景 / 网页底图），缓存里已有的会立刻跳过。"));
  // ★ 云端日志：区分本地和云端启动
  if (String(process.env.NO_TUNNEL || "") === "1") {
    console.log("  模式：       云端部署（不开隧道、端口由平台注入）。监听 0.0.0.0:" + PORT + "。");
  } else {
    console.log("  正在开公网通道……（几秒钟，成不成都会告诉你）");
    console.log("  同 WiFi 的朋友用上面那个局域网地址，其他人等公网地址出来。");
  }
  console.log("  按 Ctrl+C 停止服务器。");
  console.log("");
}
listenNow();
