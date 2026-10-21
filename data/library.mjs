// ============================================================
//  剧本库
//
//  两个目录，分工不一样：
//    data/samples/  内置样例本（老的两本）——不摆在剧本库里，但服务器照样认得它们，
//                   自动化测试也拿它们当底座；「删除」按钮删不动它们。
//    data/cases/    剧本库——网页上摆出来的就是这里的本子，可以加、可以删（删除要密码）。
//
//  每个剧本包（.mjs，导出 PACK）只写"原始数据"；这里统一做三件事：
//    1) 归一化 —— 补齐服务器要用的索引（charById / locById / clueById …）
//    2) 自检   —— 缺字段、id 对不上、答案不在选项里，启动时就报出来
//    3) 登记   —— 删除（带密码）之后重新登记，不用重启服务器
//  某个剧本包写坏了也不会拖垮整个服务器：载入失败就跳过它，其余的照常开。
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DEPTH_GATE, SCORE, QUIZ_ANSWER_POINTS } from "./flow.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR_SAMPLE = path.join(HERE, "samples");
const DIR_CASE = path.join(HERE, "cases");

/** 删除剧本的密码（可用环境变量 MM_DELETE_PASSWORD 覆盖，方便自己改） */
export const DELETE_PASSWORD = process.env.MM_DELETE_PASSWORD || "985266808";

// 剧本杀卡片上只显示四样东西：人数 / 时长 / 题材 / 类别。
// 人数按角色数自动算；题材写短标签（现代推理 / 古风权谋 / 民国情感……），别写一长串。
const CARD_INFO = {
  // 时长 / 题材（短标签）/ 类别登记在这里；人数按角色数自动算。
  // 老的两本（雾港山庄 / 锦华戏院）和《孤岛电波》的数据文件已经按用户要求删掉了。
  zhaohua: { duration: "3 小时", genres: ["古风朝堂"], category: ["本格", "推理"] },
  yunhe: { duration: "3 小时", genres: ["星际星港"], category: ["本格", "推理"] },
};

const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const asArray = (v) => (Array.isArray(v) ? v : (v && typeof v === "object" ? Object.values(v) : []));

/** 把一个原始剧本包补全成服务器能直接用的形状 */
export function normalizePack(raw) {
  const p = { ...raw };
  p.depthGate = raw.depthGate || DEPTH_GATE;
  p.score = { ...SCORE, ...(raw.score || {}) };
  p.quizAnswerPoints = raw.quizAnswerPoints || QUIZ_ANSWER_POINTS;

  p.characters = asArray(raw.characters);
  p.seats = p.characters.length;
  p.card = Object.assign(
    { players: p.seats + " 人", duration: "3 小时", genres: [], category: [] },
    CARD_INFO[p.id] || {},
    raw.card || {}
  );

  p.charById = Object.fromEntries(p.characters.map((c) => [c.id, c]));
  p.locations = asArray(raw.locations);
  p.locById = Object.fromEntries(p.locations.map((l) => [l.id, l]));
  p.clues = asArray(raw.clues);
  p.clueById = Object.fromEntries(p.clues.map((c) => [c.id, c]));
  p.quiz = asArray(raw.quiz);
  p.quizById = Object.fromEntries(p.quiz.map((q) => [q.id, q]));
  p.voting = raw.voting || { methods: [], motives: [] };
  p.auditFiles = asArray(raw.auditFiles);
  p.scheduleClues = asArray(raw.scheduleClues);
  p.fakeClues = asArray(raw.fakeClues);

  // 能力材料（查账 / 日程 / 伪造）统一成一张表：id → 线索定义
  p.extrasById = {};
  for (const a of p.auditFiles) p.extrasById[a.id] = { id: a.id, title: a.title, text: a.text, private: true, kind: "audit" };
  for (const s of p.scheduleClues) p.extrasById[s.id] = { id: s.id, title: s.title, text: s.text, private: true, kind: "schedule" };
  for (const f of p.fakeClues) p.extrasById[f.id] = { id: f.id, title: f.title, text: f.text, private: false, kind: "fake", isFake: true };

  const s1 = raw.search1 && raw.search1.length ? raw.search1 : p.locations.filter((l) => l.phase === "search1").map((l) => l.id);
  const s2 = raw.search2 && raw.search2.length ? raw.search2 : p.locations.filter((l) => l.phase === "search2").map((l) => l.id);
  p.search1 = s1;
  p.search2 = s2;
  p.search1Locations = s1.map((id) => p.locById[id]).filter(Boolean);
  p.search2Locations = s2.map((id) => p.locById[id]).filter(Boolean);

  // 个人房间 / 随身线索的集合：第一轮搜证搜的是人物房间，房间 id 是 r_<角色id>。
  // 用户本轮要求 1：这类线索不参与尸体线索判定（免得谁屋里写着"血泊"就被强制公开）。
  const personalLocs = new Set();
  for (const c of p.characters) personalLocs.add("r_" + c.id);
  for (const id of s1) personalLocs.add(String(id));
  p.personalLocs = personalLocs;

  // 尸体线索：剧本里标了 corpse / isCorpse 的那一条。它是全场共见的客观事实，
  // 引擎强制公开、不给"不公开"的开关（见 server.mjs 的 isCorpseClue 与 maps/README.md 无关）。
  // 没显式标注时按"公共场景 + depth 0 + 文案描述尸体本身"兜底认一条，个人房间不认。
  const corpsePat = /尸|遗体|咽气|毙命|僵|血泊|仰面|俯身|死在/;
  p.corpseClueId =
    (p.clues.find((c) => c.corpse === true || c.isCorpse === true) || {}).id ||
    (raw.case && (raw.case.corpseClue || raw.case.corpseClueId)) ||
    ((p.clues.find((c) => Number(c.depth || 0) === 0 && !personalLocs.has(String(c.location)) && corpsePat.test(String(c.text || ""))) || {}).id) ||
    null;

  // 线索按地点建一次索引：viewFor / 搜证每次都要按地点取线索，不建索引就是 O(地点×线索)
  p.cluesByLoc = {};
  for (const c of p.clues) (p.cluesByLoc[c.location] = p.cluesByLoc[c.location] || []).push(c);
  p.cluesOf = (locId) => p.cluesByLoc[locId] || [];
  p.truth = (raw.case && raw.case.truth) || {};
  p.victim = (raw.case && raw.case.victim) || {};
  p.killerId = p.truth.killerId || null;
  p.common = (raw.case && raw.case.common) || "";

  const n = raw.npc || {};
  p.npc = {
    names: asArray(n.names),
    personas: n.personas || {},
    clueSuspect: n.clueSuspect || {},
  };
  return p;
}

/** 体检：返回问题清单（空数组 = 完全健康） */
export function validatePack(p) {
  const bad = [];
  const say = (m) => bad.push("[" + p.id + "] " + m);
  const seats = p.characters.length;
  if (!isStr(p.id)) say("缺少 id");
  if (!isStr(p.title)) say("缺少 title");
  if (!isStr(p.blurb)) say("缺少 blurb（剧本库卡片上的卖点）");
  if (!p.case || !isStr(p.case.intro)) say("缺少 case.intro");
  if (!p.case || !isStr(p.case.common)) say("缺少 case.common（公共背景故事）");
  if (seats < 4 || seats > 8) say("角色数应为 4～8，实际 " + seats);
  const ids = new Set(p.characters.map((c) => c.id));
  if (ids.size !== seats) say("角色 id 有重复");
  const killers = p.characters.filter((c) => c.isKiller);
  if (killers.length !== 1) say("凶手应恰好 1 个，实际 " + killers.length);
  if (p.killerId !== (killers[0] && killers[0].id)) say("case.truth.killerId 与 isKiller 角色不一致");

  // 角色技能已经整体拿掉（用户本轮要求 2）：引擎不再认识 ability，剧本里写了也不生效。
  for (const c of p.characters) if (c.ability) say("角色 " + c.id + " 还带着 ability（技能已废弃，删掉它）");

  for (const c of p.characters) {
    for (const k of ["background", "tonight", "hide", "know", "mission"]) {
      if (!c.script || !isStr(c.script[k])) say(c.id + " 缺少 script." + k);
    }
    if (!p.locById["r_" + c.id]) say("角色 " + c.id + " 没有对应的房间 r_" + c.id);
  }
  const l1 = p.search1Locations.length, l2 = p.search2Locations.length;
  if (l1 !== seats) say("第一轮（人物房间）地点数应等于角色数 " + seats + "，实际 " + l1);
  if (l2 < 4 || l2 > 6) say("第二轮（公共场景）地点数应为 4～6，实际 " + l2);
  for (const id of p.search1) if (p.locById[id] && p.locById[id].phase !== "search1") say("地点 " + id + " 标在 search1 里但 phase 不是 search1");
  for (const id of p.search2) if (p.locById[id] && p.locById[id].phase !== "search2") say("地点 " + id + " 标在 search2 里但 phase 不是 search2");
  for (const loc of p.locations) {
    if (p.search1.indexOf(loc.id) < 0 && p.search2.indexOf(loc.id) < 0) say("地点 " + loc.id + " 既不在搜证一也不在搜证二（永远不会开放）");
    const cs = p.cluesOf(loc.id);
    if (cs.length < 4) say("地点 " + loc.id + " 只有 " + cs.length + " 条线索（至少 4 条）");
    const depths = cs.map((c) => c.depth).join(",");
    if (depths !== "0,0,1,2" && depths !== "0,0,1,1,2") say("地点 " + loc.id + " 的 depth 序列是 " + depths + "（应为 0,0,1,2）");
    if (!cs.some((c) => c.private)) say("地点 " + loc.id + " 一条私密线索都没有");
    if (cs[0] && cs[0].private) say("地点 " + loc.id + " 的第一条线索不该是私密的");
    // 尸体线索是强制公开的客观事实，不能标成私密（用户本轮要求：除尸体线索外都能选公开/不公开）
    const caseCorpse = p.case && (p.case.corpseClue || p.case.corpseClueId);
    for (const c of cs) {
      if (((c.corpse === true || c.isCorpse === true) || c.id === caseCorpse) && c.private) {
        say("线索 " + c.id + " 是尸体线索，不能标 private: true（尸体线索强制公开）");
      }
    }
    if (!isStr(loc.img)) say("地点 " + loc.id + " 缺少 img（出图提示词）");
    if (loc.icon) say("地点 " + loc.id + " 还带着 emoji 图标（icon）");
    if (!isStr(loc.name)) say("地点 " + loc.id + " 缺少 name");
  }
  for (const c of p.clues) {
    if (!p.locById[c.location]) say("线索 " + c.id + " 指向不存在的地点 " + c.location);
    if (!isStr(c.title) || !isStr(c.text)) say("线索 " + c.id + " 缺少 title/text");
  }

  if (!p.card.players || !p.card.duration) say("剧本杀卡片缺人数 / 时长（card.players、card.duration）");
  if (!p.card.genres.length) say("剧本杀卡片缺题材（card.genres）");
  if (!p.card.category.length) say("剧本杀卡片缺类别（card.category）");
  if (p.quiz.length < 3 || p.quiz.length > 8) say("题目应为 3～8 道，实际 " + p.quiz.length);
  for (const q of p.quiz) {
    const keys = (q.options || []).map((o) => o.key);
    if (keys.length !== 4) say("题目 " + q.id + " 选项应为 4 个");
    if (!keys.includes(q.answer)) say("题目 " + q.id + " 的 answer(" + q.answer + ") 不在选项里");
    if (q.clue && !p.clueById[q.clue] && !p.extrasById[q.clue]) say("题目 " + q.id + " 的 clue 指向不存在的线索 " + q.clue);
  }
  const vm = p.voting.methods.map((m) => m.id), vo = p.voting.motives.map((m) => m.id);
  if (vm.length !== 4) say("手法选项应为 4 个，实际 " + vm.length);
  if (vo.length !== 4) say("动机选项应为 4 个，实际 " + vo.length);
  if (!vm.includes(p.truth.methodId)) say("truth.methodId(" + p.truth.methodId + ") 不在手法选项里");
  if (!vo.includes(p.truth.motiveId)) say("truth.motiveId(" + p.truth.motiveId + ") 不在动机选项里");
  if (!Array.isArray(p.truth.timeline) || !p.truth.timeline.length) say("truth.timeline 至少要有 1 条）；");
  if (!isStr(p.truth.summary)) say("缺少 truth.summary");
  if (!isStr(p.truth.epilogue)) say("缺少 truth.epilogue");
  if (p.npc.names.length < seats) say("AI 昵称太少（" + p.npc.names.length + "，至少 " + seats + "）");
  for (const c of p.characters) {
    const per = p.npc.personas[c.id];
    if (!per) { say("角色 " + c.id + " 没有 AI 人设（npc.personas）"); continue; }
    if (!per.quiz || Object.keys(per.quiz).length !== p.quiz.length) say("角色 " + c.id + " 的 AI 答题表不是 " + p.quiz.length + " 题");
    if (!per.suspects || !Object.keys(per.suspects).length) say("角色 " + c.id + " 的 AI 缺初始怀疑度（suspects）");
  }
  for (const id of Object.keys(p.npc.clueSuspect)) {
    if (!p.clueById[id] && !p.extrasById[id]) say("clueSuspect 里的 " + id + " 不是一条真实线索");
    for (const cid of Object.keys(p.npc.clueSuspect[id])) if (!p.charById[cid]) say("clueSuspect." + id + " 指向不存在的角色 " + cid);
  }
  return bad;
}

/* ---------- 载入 ---------- */
async function loadDir(dir, sample) {
  const out = [];
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".mjs")).sort();
  } catch (e) {
    return out;
  }
  for (const f of files) {
    const full = path.join(dir, f);
    try {
      // 带 mtime 的查询串：删掉再放回来的同一个文件名也能重新载入，不会被 ESM 缓存卡住
      const href = pathToFileURL(full).href + "?v=" + Math.floor(fs.statSync(full).mtimeMs);
      const m = await import(href);
      if (!m.PACK) { console.warn("[剧本库] " + f + " 没有导出 PACK，已跳过。"); continue; }
      out.push({ file: full, sample: !!sample, raw: m.PACK });
    } catch (e) {
      console.warn("[剧本库] " + f + " 载入失败，已跳过：" + (e && e.message ? e.message : e));
    }
  }
  return out;
}

const loaded = [...(await loadDir(DIR_SAMPLE, true)), ...(await loadDir(DIR_CASE, false))];

/** 全部剧本（含样例）：按 id 开房、自动化测试都靠它 */
export const PACKS = loaded.map((x) => {
  const p = normalizePack(x.raw);
  p.sample = x.sample;
  p.file = x.file;
  return p;
});
export const PACK_BY_ID = Object.fromEntries(PACKS.map((p) => [p.id, p]));
/** 剧本库（网页上摆出来的那些）：样例不算 */
export const LISTED = PACKS.filter((p) => !p.sample);
export let DEFAULT_PACK = LISTED[0] || PACKS[0] || null;

/** 题材硬约束：剧本库里上架的每本剧本，题材（card.genres）不能重复 */
export function themeConflicts(packs = LISTED) {
  const seen = new Map();
  const out = [];
  for (const p of packs || []) {
    for (const g of (p.card && p.card.genres) || []) {
      const key = String(g).trim();
      if (!key) continue;
      if (seen.has(key)) out.push("题材「" + key + "」重复：" + seen.get(key).title + " 与 " + p.title);
      else seen.set(key, p);
    }
  }
  return out;
}

/** 删除一本剧本：密码不对、是样例、文件删不掉都不动 */
export function deletePack(id, password) {
  if (String(password == null ? "" : password) !== DELETE_PASSWORD) return { ok: false, error: "删除密码不对。" };
  const p = PACK_BY_ID[String(id || "").trim()];
  if (!p) return { ok: false, error: "剧本库里没有这一本。" };
  if (p.sample) return { ok: false, error: "内置样例本不能删（它本来就不在剧本库里显示）。" };
  try {
    fs.unlinkSync(p.file);
  } catch (e) {
    return { ok: false, error: "删文件失败：" + (e && e.message ? e.message : e) };
  }
  delete PACK_BY_ID[p.id];
  const i = PACKS.indexOf(p); if (i >= 0) PACKS.splice(i, 1);
  const j = LISTED.indexOf(p); if (j >= 0) LISTED.splice(j, 1);
  if (DEFAULT_PACK === p) DEFAULT_PACK = LISTED[0] || PACKS[0] || null;
  return { ok: true, id: p.id, title: p.title };
}

/** 开场自检：把每个剧本包的问题打到控制台，返回问题条数 */
export function auditPacks(log = console.log) {
  let problems = 0;
  for (const p of PACKS) {
    let bad = [];
    try { bad = validatePack(p); } catch (e) { bad = ["[" + p.id + "] 自检时出错：" + (e && e.message ? e.message : e)]; }
    problems += bad.length;
    const where = p.sample ? "（样例，不在剧本库里显示）" : "";
    if (bad.length) {
      log("[剧本自检] " + p.title + where + " 有 " + bad.length + " 个问题：");
      for (const b of bad) log("   - " + b);
    } else {
      log("[剧本自检] " + p.title + where + " 通过（" + p.characters.length + " 角色 / " + p.locations.length + " 地点 / " + p.clues.length + " 线索）");
    }
  }
  const dup = themeConflicts(LISTED);
  if (dup.length) {
    log("[剧本自检] 题材与上架剧本冲突：");
    for (const d of dup) log("   - " + d);
    problems += dup.length;
  }
  return problems;
}
