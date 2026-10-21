// ============================================================
//  AI 补位玩家（NPC）
//
//  ★ 用途只有一个：人凑不齐的时候占住座位，让房主能把一本剧本从头到尾跑通（测本）。
//  ★ 它**不参与互动**：不发言、不自我介绍、不公开私密线索、不接话——
//    讨论区、自我介绍页、揭晓页上不会出现 AI 说的话。
//  ★ 它仍然做"坐在这张椅子上必须做的事"：选角色、报准备、搜证、用技能、答题、投票。
//    这几步不做房间就推不动，也就没法测本了。
//  ★ 它和真人走**完全同一套 doAction() / viewFor()**：看不见别人的剧本、看不见真相，
//    不会开天眼。
//  ★ server.mjs 只需要：① 建 AI 时调 attachNPC() ② 定时调 drive()
// ============================================================

import { DEFAULT_PACK } from "./data/library.mjs";

/* AI 不写死"哪一本剧本"：房间开局选了哪一本（room.pack），AI 就用那一本的
   角色 id、地点 id 和行为参数。换一本剧本不需要改这个文件一个字。 */
const packOf = (room) => (room && room.pack) || DEFAULT_PACK;
/** 这一本剧本的 AI 素材：昵称 / 搜索偏好 / 答题倾向 / 怀疑权重 */
const NPCX = (room) => packOf(room).npc || {};
/** 某个 AI 扮演的角色在这一本里对应的行为参数 */
function personaOf(room, p) {
  const per = NPCX(room).personas || {};
  return per[p.charId] || per[Object.keys(per)[0]] || { bias: {}, quiz: {}, suspects: {} };
}

const pick = (arr, rnd) => arr[Math.floor((rnd || Math.random)() * arr.length)];
const rnd = (n) => Math.floor(Math.random() * n);

/* ------------------------------------------------------------
   把某个玩家变成 AI
   ------------------------------------------------------------ */

export function attachNPC(room, player) {
  player.npc = {
    born: Date.now(),
    nextAt: Date.now() + 800 + rnd(1200),
    persona: null,
    ability: {},       // phase -> 这个阶段已经用过的技能
    hostSince: 0,
  };
  player.isNPC = true;
  return player;
}

export const isNPC = (p) => !!(p && p.npc);

export function freeNPCName(room) {
  const used = new Set(room.players.map((p) => p.name));
  const free = (NPCX(room).names || []).filter((n) => !used.has(n));
  return free.length ? free[rnd(free.length)] : "AI" + (room.players.length + 1);
}

/** 房间里有多少 AI */
export const npcCount = (room) => room.players.filter(isNPC).length;

/* ------------------------------------------------------------
   主循环：服务器每 1.5 秒调一次，每个 AI 走一小步
   ------------------------------------------------------------ */

export function drive(room, api, opts) {
  const force = !!(opts && opts.force);
  const t = Date.now();
  let acted = 0;
  for (const p of room.players) {
    if (!p.npc) continue;
    if (!force && t < p.npc.nextAt) continue;
    try {
      step(room, p, api, force);
      acted++;
    } catch (e) {
      console.log("[AI] " + p.name + " 出错：" + (e && e.message));
      p.npc.nextAt = t + 4000;
    }
  }
  return acted;
}

function later(p, ms) { p.npc.nextAt = Date.now() + ms; }

/** 这些阶段 AI 什么都不说，只把"准备"点上（不然房主看不到它准备好） */
const QUIET = ["briefing", "intro", "talk2", "reveal"];

function step(room, p, api, force) {
  const N = p.npc;
  const view = api.view(room, p);
  const phase = room.phase;

  /* ---------- 大厅：挑一个没人要的角色、报准备 ---------- */
  if (phase === "lobby") {
    if (!p.charId) {
      const free = view.chars.filter((c) => !c.taken);
      if (!free.length) return later(p, 4000);
      api.act(room, p, "setChar", { charId: pick(free).id });
      return later(p, 700 + rnd(1200));
    }
    if (!N.persona) N.persona = personaOf(room, p);
    if (!p.ready) api.act(room, p, "ready", { value: true });
    return later(p, 1500 + rnd(2500));
  }

  if (!N.persona) N.persona = personaOf(room, p);

  /* ---------- 读本 / 自我介绍 / 讨论 / 揭晓：AI 不发言 ---------- */
  if (QUIET.indexOf(phase) >= 0) {
    if ((phase === "briefing" || phase === "intro") && !p.ready) api.act(room, p, "ready", { value: true });
    return later(p, force ? 1 : 6000);
  }

  /* ---------- 搜证 ---------- */
  if (phase === "search1" || phase === "search2") {
    if (p.ap <= 0) return later(p, force ? 1 : 4000);
    const loc = pickLocation(view, N.persona, p);
    if (!loc) { p.ap = 0; return later(p, 4000); }
    const r = api.act(room, p, "search", { location: loc });
    if (!r || !r.ok) p.npc.fails = (p.npc.fails || 0) + 1;
    return later(p, 1200 + rnd(2200));
  }

  /* ---------- 推理问答 ---------- */
  if (phase === "quiz") {
    if (view.quiz && view.quiz.submitted) return later(p, force ? 1 : 8000);
    const mine = (view.quiz && view.quiz.questions || []).filter((q) => !q.myChoice);
    if (!mine.length) { api.act(room, p, "submitQuiz", {}); return later(p, 600 + rnd(900)); }
    const q = mine[0];
    let choice = (N.persona.quiz || {})[q.id] || pick(q.options).key;
    if (Math.random() < 0.12) choice = pick(q.options.filter((o) => o.key !== choice)).key;
    api.act(room, p, "quizAnswer", { qid: q.id, choice });
    return later(p, 1500 + rnd(2500));
  }

  /* ---------- 投票 ---------- */
  if (phase === "vote") {
    if (view.vote && view.vote.myVote) return later(p, force ? 1 : 8000);
    const v = decideVote(room, p, view);
    if (v) api.act(room, p, "vote", v);
    return later(p, 2000 + rnd(2500));
  }

  /* ---------- 万一 AI 成了房主（真人都不在时才会走到这里） ---------- */
  if (view.me.isHost) {
    const others = view.players.filter((x) => !x.isMe);
    const allReady = others.every((x) => x.ready);
    if (allReady) {
      if (!N.hostSince) N.hostSince = Date.now();
      else if (Date.now() - N.hostSince > 15000 && phase !== "lobby") {
        N.hostSince = 0;
        api.act(room, p, "advance", {});
      }
    } else N.hostSince = 0;
  }
  return later(p, 3000);
}

/* ------------------------------------------------------------
   选地点：按人设偏好加权，绝不搜自己的房间，搜空了的跳过
   ------------------------------------------------------------ */

function pickLocation(view, persona, p) {
  const phase = view.room.phase;
  const cands = view.locations.filter((l) => {
    if (l.phase !== phase) return false;
    if (l.owner && l.owner === p.charId) return false;        // 不能搜自己的房间
    if (l.exhausted) return false;
    return true;
  });
  if (!cands.length) return null;
  const weights = cands.map((l) => {
    let w = (persona.bias && persona.bias[l.id]) || 1;
    if (l.searchCount === 0) w += 1;          // 没人搜过的地方优先
    if (l.found === 0) w += 0.5;              // 还没出东西的地方，值得再挖
    return Math.max(0.2, w);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < cands.length; i++) { r -= weights[i]; if (r <= 0) return cands[i].id; }
  return cands[cands.length - 1].id;
}

/* ------------------------------------------------------------
   怀疑度：人设初始权重 + 公开板上每一把指向某人的刀
   ------------------------------------------------------------ */

function suspicion(room, view, p) {
  const s = {};
  const persona = p.npc.persona || {};
  const cx = NPCX(room).clueSuspect || {};
  for (const [cid, w] of Object.entries(persona.suspects || {})) s[cid] = w;
  for (const e of view.board || []) {
    for (const [cid, w] of Object.entries(cx[e.id] || {})) s[cid] = (s[cid] || 0) + w;
    if (e.locationOwner) s[e.locationOwner] = (s[e.locationOwner] || 0) + 1;
  }
  if (view.me.script && view.me.script.isKiller) s[p.charId] = -99;   // 凶手不会投自己
  for (const cid of Object.keys(s)) s[cid] += Math.random() * 2;
  return s;
}

function topSuspect(room, view, p) {
  const s = suspicion(room, view, p);
  const ranked = Object.entries(s).sort((a, b) => b[1] - a[1]).filter(([cid, w]) => w > -50);
  return ranked.length ? ranked[0][0] : null;
}

/* ------------------------------------------------------------
   投票
   ------------------------------------------------------------ */

function decideVote(room, p, view) {
  const cid = topSuspect(room, view, p);
  if (!cid) return null;
  const target = view.players.find((x) => x.charId === cid && !x.isMe);
  if (!target) return null;
  return { killer: target.id };
}
