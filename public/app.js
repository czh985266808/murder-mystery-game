/* ============================================================
   《雾港山庄 · 不眠之夜》 —— 前端
   ============================================================ */
"use strict";

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

let S = null;              // 服务器推送的最新状态（已经过视角过滤）
let ES = null;
let connected = false;
let lastStreamAt = 0;       // 公网修复：最近一次收到 SSE 心跳/消息的时间
let reconnectFails = 0;
let reconnectTimer = null;
// ---- 本轮四个修复用到的客户端状态 ----
let lastViewSeq = 0;        // 修复 2：服务器视角帧的序号，比它旧的一律丢掉
let CLIENT_SEQ = 0;         // 修复 2：每次点击一个单调递增的序号
let netMs = 0;              // 修复 3：最近一次操作的往返耗时
let netSlow = false;
let enterSince = 0;         // 修复 3：卡在"正在回到房间"里的起始时刻
let enteringSlow = false;
let searchBusy = false;     // 修复 1：搜证一次只发一个请求，连点无效
let voteBusy = false;       // 修复 2：投票防重复提交
// ★ 本轮修复 2：每道题"我最后想选的那个答案"。
//   SSE 全量帧会把 myChoice 换成服务器那一刻的值（还是旧的），玩家的点击当场就被抹掉，
//   于是"选了 B 画面还停在 A，过一秒多才跳到 B"。这张覆盖表在网络帧铺完之后再把选择盖回去，
//   切换是零延迟的；等自己那次回包确认了、或者服务器明确拒绝，才把这一条撤掉。
const qWant = Object.create(null);
let lastPublicUrl = "";     // 修复 4：公网地址变了要提醒房主重新发邀请
const avatarWarm = new Set();   // 公网修复：角色头像提前预热，避免进房后才一张张慢慢加载
let TOKEN = localStorage.getItem("mm_token") || "";
let CODE = localStorage.getItem("mm_code") || "";
let NAME = localStorage.getItem("mm_name") || "";
let tab = "clues";            // 侧栏：线索 / 讨论区
let clueTab = "board";      // 线索页里的两个子页签：公开线索 / 我的线索
let dmWith = null;          // 私聊对象（玩家 id）；null = 公聊
let auditOpen = false;      // 校验台
let AUDIT = null;           // /api/audit 的结果
let sideOpen = false;
let scriptTab = "common";
let pending = null;        // 等待"点选目标"的技能：{kind, title}
let voteSel = { killer: null };
let scriptOpen = false;    // 「我的剧本」弹层
let clueOpen = false;      // 线索弹层
let folds = {};            // 线索分栏的折叠状态：folds["l:study"] === true 表示折起来了
let clueSearch = "";       // 线索搜索关键词
let scriptSearch = "";     // 我的剧本搜索关键词
let scriptHit = "";        // 剧本搜索结果点开后要跳到哪一处
let searchComposing = false;  // 输入法正在拼字：这期间一律不重绘，免得把输入框换掉、打断输入法
let renderPending = false;    // 拼字期间被挡下的那些重绘，等输入法上屏后补一次
let CASES = null;          // 剧本库（GET /api/cases）
let caseId = "";           // 落地页选中的剧本 id
let filterSeats = "";      // 落地页剧本库：人数筛选（"5 人" 等，空 = 全部）
let filterGenre = "";      // 落地页剧本库：题材筛选（空 = 全部）
let delId = null;          // 点了 ✕、正在等删除密码的那一本
let libOpen = false;       // 需求 3：剧本库是独立页面，大厅首页只留入口
let caseAsk = null;        // 需求 3：点了某本剧本、正在等「创建房间 / 取消」
let npcAsk = null;         // "add" / "fill"：点了加 AI 的按钮、正在等密码
let BGU = null;            // 网页底图地址（删除剧本后重写缓存时要用）
let lastPhase = null;
let toastTimer = null;
let mapOpen = false;
let mapIdx = 0;        // 多地图模式下当前查看的是第几张
let IMGST = null;          // 实景图准备进度（服务器 /api/cases 与 /api/images 给）       // 需求 9：平面图大图弹层
let playersOpen = false;   // 需求 2：玩家列表弹层（查看玩家名与所选角色）
let pickSeq = 0;            // 需求 1：选角乐观更新时只认最后那次点击
let lobbyDetail = true;
let myId = null;             // 自己的玩家 id：座位表的轻量帧里 isMe 万一不对，用它兜底修正
let joining = null;          // "join" / "create"：点了加入或创建、正在等服务器，按钮切成"正在进入…"    // 需求 1：选角卡上的"外貌性格 + 与死者关系"可以选择显示/收起
/* 需求 2：点角色头像直接打开玩家列表，看玩家名与所选角色 */
function pavAttr(p) { return p && p.id ? ' data-act="who" data-id="' + esc(p.id) + '"' : ""; }
/* 需求 1：外貌/性格与"与死者关系"合成一段，去掉标签；太长就截短 */
function charBrief(c) {
  const bits = [];
  const push = (s) => {
    s = String(s == null ? "" : s).trim();
    if (!s) return;
    const i = bits.findIndex((b) => b.indexOf(s) >= 0 || s.indexOf(b) >= 0);
    if (i >= 0) { if (s.length > bits[i].length) bits[i] = s; return; }   // 两份说法重复时留长的
    bits.push(s);
  };
  push(c.appearance); push(c.bio); push(c.relation);
  const t = bits.join("；");
  return t.length > 80 ? t.slice(0, 80).replace(/[，、；,;]$/, "") + "…" : t;
}

/* ---------------- 小工具 ---------------- */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function fmt(s) {
  return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}
/* 搜索时用：先转义、再标出命中的字，** 加粗照旧 */
function fmtHit(s, q) {
  return markHit(s, q).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}
function toast(msg, kind) {
  const old = $(".toast");
  if (old) old.remove();
  const d = document.createElement("div");
  d.className = "toast " + (kind || "");
  d.textContent = msg;
  document.body.appendChild(d);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => d.remove(), 3200);
}
/* 需求 7：每次搜出线索，都把线索内容显示出来 */
function toastClue(c) {
  const old = $(".toast");
  if (old) old.remove();
  const d = document.createElement("div");
  d.className = "toast cluetoast " + (c.private ? "priv" : "good");
  d.innerHTML =
    '<div class="tt">' + (c.private ? "摸到一条私密线索：" : "发现线索：") + esc(c.title) + "</div>" +
    '<div class="cx">' + fmt(c.text) + "</div>" +
    '<div class="cf">' + esc(c.location || "") + (c.private ? "　·　只有你看得见" : "　·　已经放上公开板") + "</div>";
  document.body.appendChild(d);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => d.remove(), 9000);
}
function pips(n, max) {
  let h = "";
  for (let i = 0; i < max; i++) h += '<span style="color:' + (i < n ? "var(--gold2)" : "rgba(255,255,255,.18)") + '">●</span>';
  return h;
}
async function api(p, body) {
  try {
    const r = await fetch(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
    return await r.json();
  } catch (e) {
    return { ok: false, error: "连接不上服务器。" };
  }
}
// 公网修复：/api/action 会把"我自己"的最新视角一起带回来。
// 走公网隧道时，阶段变化原来只能等 SSE 那一条被合并过的推送绕回来（好几秒），
// 点按钮的人就一直卡在旧页面上；这里拿到响应就地套用，跳阶段是立刻的。
function applyView(view) {
  if (!view || !view.room) return false;
  // ★ 修复 2：旧帧直接丢弃，绝不覆盖更新的那一帧
  if (view.seq && view.seq < lastViewSeq) return false;
  if (view.seq) lastViewSeq = view.seq;
  // ★ 本轮修复 2：记下"这一帧之前是什么阶段"。只有真的换了阶段才让 onState 去清理，
  //   否则别人投个票、服务器推一帧，自己刚选中的指认对象就被清成 null。
  const prevPhase = S && S.room ? S.room.phase : null;
  S = view;
  if (S.me && S.me.id) myId = S.me.id;
  if (Array.isArray(S.players)) { const mine = S.players.find((p) => p.isMe); if (mine) myId = mine.id; }
  if (S.bg) setBG(S.bg);
  lastPhase = prevPhase;
  applyQuizOverlay();
  onState();
  return true;
}

/* ★ 本轮修复 2：把"我刚点的那个选项"重新盖回当前状态上。
   服务器每一帧都会带 quiz.questions[].myChoice（那是服务器已经收到的那一次），
   公网下这些帧可能比我刚点的晚到好几秒；不盖的话，选好的 B 会被打回 A。 */
function applyQuizOverlay() {
  if (!S || !S.quiz || !Array.isArray(S.quiz.questions)) return;
  let touched = false;
  for (const qid in qWant) {
    const item = S.quiz.questions.find((x) => x.id === qid);
    if (!item) continue;
    if (item.myChoice !== qWant[qid]) { item.myChoice = qWant[qid]; touched = true; }
  }
  // 交卷了 / 进揭晓了：本地那点"想选的"没有意义了，清掉，以服务器为准
  if (S.quiz.submitted || (S.room && S.room.phase !== "quiz")) {
    for (const qid in qWant) delete qWant[qid];
    return;
  }
  if (touched) S.quiz.answeredCount = S.quiz.questions.filter((x) => x.myChoice).length;
}
let CLIENT_CID = 0;
/* 修复 2：序号必须"跨刷新也递增"。
   服务器按人记着"这道题/这次投票我见过的最大序号"，如果这里用 1、2、3 这种小整数，
   玩家一刷新页面序号就从头算，之后每一次点击都会被服务器当成"更旧的操作"静默丢掉
   —— 表现就是"点了没反应"。所以序号直接用时间戳（毫秒×1000），刷新也不会倒退。 */
function nextSeq() {
  const t = Date.now() * 1000;
  CLIENT_SEQ = t > CLIENT_SEQ ? t : CLIENT_SEQ + 1;
  return CLIENT_SEQ;
}
function newCid() { return Date.now().toString(36) + "-" + (++CLIENT_CID).toString(36) + "-" + Math.random().toString(36).slice(2, 7); }
// 修复 3：顺手量一次往返耗时，慢的时候在顶栏提示一句（而不是让人以为按钮坏了）
function noteLatency(ms) {
  netMs = ms;
  const slow = ms > 1200;
  if (slow !== netSlow) { netSlow = slow; render(); }
}
async function act(type, extra) {
  // ★ 修复 2：每次点击都带 cid（同一次点击的重发只算一次）和 seq（服务器只认最新的那次）。
  //   公网隧道下两个请求可能乱序到达，没有这两样就会出现"选了 B 又被慢半拍的 A 盖回去"。
  const payload = Object.assign({ code: CODE, token: TOKEN, type: type, cid: newCid(), seq: nextSeq() }, extra || {});
  const t0 = Date.now();
  const r = await api("/api/action", payload);
  noteLatency(Date.now() - t0);
  if (r && r.stale) return r;   // 服务器判定这是"更旧"的那次操作（晚到了），静默丢掉，别弹错
  // 先把新视角铺上，再弹提示 —— 这样"点完准备立刻进下一阶段"和 toast 是同一帧的事
  if (r.ok && r.view) applyView(r.view);
  if (!r.ok) toast(r.error || "操作失败", "bad");
  else if (r.clue) toastClue(r.clue);        // 需求 7：搜出线索先把内容摆出来
  else if (r.hint) toast(r.hint, "");
  else if (r.autoAdvanced) toast("所有人都完成了，进入下一阶段。", "good");
  else if (r.left !== undefined) toast("这里还藏着 " + r.left + " 条未被发现的线索。", "good");
  else if (r.real !== undefined) toast(r.real ? "这份材料是真的。" : "这份材料是伪造的。", r.real ? "good" : "bad");
  else if (type === "publish") toast("这条线索已放上公开板。", "good");
  else if (type === "keepPrivate") toast("这条线索只有你自己知道。", "");
  return r;
}
function publicURL() {
  return S && S.net && S.net.publicUrl ? S.net.publicUrl : "";
}
// 有公网地址就用公网地址 —— 谁点都能进，不用和你在同一个 WiFi
function inviteURL() {
  const p = publicURL();
  if (p) return p.replace(/\/+$/, "") + "/?room=" + CODE;
  const lan = S && S.net && S.net.lanUrl ? S.net.lanUrl : "";
  return (lan || location.origin).replace(/\/+$/, "") + "/?room=" + CODE;
}
// 需求 1：复制邀请的内容 = 公网地址（链接里已带房号）
function inviteText() {
  return inviteURL();
}
// 房主如果是从本机 localhost 打开的，链接发给朋友是打不开的，得提醒他换个地址
function lanNote() {
  if (publicURL()) return "";
  const h = location.hostname;
  if (h !== "localhost" && h !== "127.0.0.1" && h !== "::1" && h !== "[::1]") return "";
  return '<div class="note bad" style="margin-top:10px">你现在用的是「本机地址」，这个链接发给朋友是打不开的。' +
    "请把启动服务器那个黑窗口里「同局域网」那一行地址（形如 http://192.168.x.x:" + (location.port || "8899") + "/）发给他们。" +
    "如果窗口里出现了「公网地址」，那个 https 链接更好用，谁都能进。</div>";
}
/* ---- 实景图：AI 生成一次，之后永久走缓存 ---- */
// 服务器直接给完整地址（形如 /api/img/loc/wugang-study?v=123）；拿不到就是还没生成好
function imgURL(kind, id) {
  return (S && S.images && S.images[kind + ":" + id]) || "";
}
// 还没生成好的图先不占位置：图一好，服务器会推一次新状态，它自己就冒出来了
function shot(kind, id, cls) {
  const u = imgURL(kind, id);
  if (!u) return "";
  return '<div class="shot ' + (cls || "") + '"><img loading="lazy" alt="" src="' + esc(u) + '" /></div>';
}
function avatarOf(id, color, fallback, cls, attr) {
  const k = cls || "pav";
  const a = attr || "";
  const u = id ? imgURL("char", id) : "";
  if (!u) return '<div class="' + k + '"' + a + ' style="background:' + color + '">' + esc(fallback) + "</div>";
  // 公网修复：头像走服务器小图路由，并改成 eager，进房后不用等懒加载
  return '<div class="' + k + ' avimg"' + a + '><img loading="eager" decoding="async" alt="" src="' + esc(u) + '" /></div>';
}
function warmAvatars() {
  if (!S || typeof Image === "undefined") return;
  (S.players || []).forEach((p) => {
    if (!p.charId) return;
    const u = imgURL("char", p.charId);
    if (u && !avatarWarm.has(u)) {
      avatarWarm.add(u);
      const im = new Image();
      im.src = u;
      im.decoding = "async";
    }
  });
}
function copyText(t) {
  const done = () => toast("已复制", "good");
  if (navigator.clipboard && location.protocol !== "file:") {
    navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t, done));
  } else fallbackCopy(t, done);
}
function fallbackCopy(t, done) {
  const ta = document.createElement("textarea");
  ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); done(); } catch (e) { toast("请手动复制", "bad"); }
  ta.remove();
}

/* ---------------- 连接 ----------------
   ★ 本轮修复 3：公网掉线不再把人踢回首页。
   以前 onerror 里有一条"readyState===2 就 1.5 秒后清 token 回首页"的分支：
   隧道每抖一下，玩家就被踹回落地页、得重新输房号，屏幕上常见的就是一个卡住的"正在回到房间"。
   现在改成三层：
     ① 断线只标记状态 + 指数退避重连（600ms 起，最长 15 秒），座位一直保留；
     ② 重连前先问一句 /api/state —— 只有"房间真的没了 / 身份真的失效"才清凭证；
     ③ 11 秒收不到任何帧（服务器 3 秒一次心跳）就主动拆掉旧连接重来，
        因为浏览器那头的"半死连接"自己永远不会报错。
*/
function connect() {
  if (!TOKEN || !CODE) { render(); return; }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  if (ES) { try { ES.close(); } catch (e) {} ES = null; }
  const es = new EventSource("/api/stream?code=" + encodeURIComponent(CODE) + "&token=" + encodeURIComponent(TOKEN));
  ES = es;
  es.onopen = () => { connected = true; reconnectFails = 0; lastStreamAt = Date.now(); render(); };
  es.onmessage = (e) => {
    connected = true;
    lastStreamAt = Date.now();
    let msg = null;
    try { msg = JSON.parse(e.data); } catch (err) { return; }
    // 需求 4：大厅里的座位变动走轻量消息，先就地更新座位表再重绘，
    // 这样"别人选了什么角色 / 谁进谁出"是立刻可见的，不必等下一次完整推送。
    if (msg && msg.kind === "ping") { return; }   // 3s 心跳，只用来保活与探活
    if (msg && msg.kind === "playerUpdate") { applySeats(msg); return onState(); }
    // 本轮需求：实景图准备进度也走同一条推送，进度条自己会走
    if (msg && msg.kind === "imageStatus") { IMGST = msg.images || null; render(); return; }
    // ★ 修复 2：这一整帧如果比已经应用过的还旧，直接丢（迟到的帧会把手上的新选择抹掉）
    if (msg && msg.seq && msg.seq < lastViewSeq) return;
    if (msg && msg.seq) lastViewSeq = msg.seq;
    S = msg;
    applyQuizOverlay();   // ★ 本轮修复 2：别人作答触发的这一帧，别把我刚点的选项盖回去
    // 记住自己是谁：座位表的轻量帧是同一份包发给所有人的，isMe 不一定准，
    // 用它兜底修正，"你"的标记和房主按钮就不会闪一下才回来。
    if (S && S.me && S.me.id) myId = S.me.id;
    if (S && Array.isArray(S.players)) { const mine = S.players.find((p) => p.isMe); if (mine) myId = mine.id; }
    if (S && S.bg) setBG(S.bg);   // 需求 3：进房之后也能拿到符合本子的底图
    onState();
  };
  es.onerror = () => {
    connected = false;
    render();
    // ★ 修复 3：不再清 token 回首页，只是排一次重连
    scheduleReconnect();
  };
}

// 退避重连：600ms → 1s → 1.7s…… 最长 15 秒一档
function scheduleReconnect() {
  if (reconnectTimer || !TOKEN || !CODE) return;
  reconnectFails += 1;
  const delay = Math.min(15000, Math.round(600 * Math.pow(1.7, reconnectFails - 1)));
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (!TOKEN || !CODE) return;
    // 这期间浏览器自己又把连接拉起来了，就别再开第二条
    if (connected && Date.now() - lastStreamAt < 11000) return;
    probeRoom();
  }, delay);
}

// 重连之前先确认"房间还在不在"——这是唯一该清凭证的依据
async function probeRoom() {
  if (!TOKEN || !CODE) return;
  let r = null;
  try {
    const res = await fetch("/api/state?code=" + encodeURIComponent(CODE) + "&token=" + encodeURIComponent(TOKEN), { cache: "no-store" });
    r = await res.json();
  } catch (e) { r = null; }
  if (r && r.ok && r.view) {
    applyView(r.view);    // 房间还在：先把最新视角铺上，再重连
    connect();
    return;
  }
  if (r && !r.ok) {
    const err = String(r.error || "");
    if (err.indexOf("房间") >= 0) { dropCredits("房间已经结束了，已回到首页。"); return; }
    if (err.indexOf("身份") >= 0 || err.toLowerCase().indexOf("token") >= 0) { dropCredits("身份失效了，请重新加入。"); return; }
  }
  connect();   // 探测本身也失败（网络还没好）：继续退避重连，座位保留
}

// 真的没救了（房间散了 / 身份无效）才清凭证回首页
function dropCredits(msg) {
  if (TOKEN && msg) toast(msg, "bad");
  TOKEN = ""; CODE = "";
  localStorage.removeItem("mm_token");
  localStorage.removeItem("mm_code");
  S = null; connected = false;
  if (ES) { try { ES.close(); } catch (e) {} ES = null; }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  render();
}

// ★ 修复 3：心跳看门狗。服务器 3 秒一次 ping，11 秒什么都收不到 = 这条连接已经死了
setInterval(() => {
  if (!TOKEN || !CODE) return;
  if (!connected) {
    // 浏览器偶尔会卡在「正在连接」里：既不通也不报错（隧道刚换地址时最常见）。
    // 只要现在没在退避计时里，就自己再排一次重连。
    if (!reconnectTimer) scheduleReconnect();
    return;
  }
  if (Date.now() - lastStreamAt > 11000) {
    connected = false;
    render();
    scheduleReconnect();
  }
}, 4000);
/**
 * 需求 4：把服务器推来的"座位表"合并进当前状态。
 * 只覆盖会随大厅操作变化的那几个字段（谁坐了哪个角色、在线与否、准备与否），
 * 不去动脚本正文之类的大块内容——那要等完整视角那一帧。
 */
function applySeats(msg) {
  if (!S || !S.room) return;
  if (msg.phase !== S.room.phase) return;          // 阶段已经变了，交给完整推送处理
  const byId = {};
  (msg.players || []).forEach((p) => { byId[p.id] = p; });

  // 名单本身变了（有人加入 / 退出）→ 按服务器给的顺序整表替换，只补回缺的字段
  if ((msg.players || []).length !== (S.players || []).length ||
      (msg.players || []).some((p) => !S.players.some((q) => q.id === p.id))) {
    S.players = (msg.players || []).map((p) => Object.assign({}, (S.players || []).find((q) => q.id === p.id) || {}, p));
  } else {
    S.players.forEach((q) => { const p = byId[q.id]; if (p) Object.assign(q, p); });
  }

  // 座位表这一帧里 isMe 可能被冲成 false（服务器以前把同一份包发给所有人），
  // 用自己记住的 id 兜底修正，免得"你"的标记 / 房主按钮 / 准备状态闪一下才回来。
  if (myId) (S.players || []).forEach((p) => { p.isMe = p.id === myId; });

  const meRow = (S.players || []).find((p) => p.isMe);
  if (S.me && meRow) { S.me.charId = meRow.charId; S.me.ready = meRow.ready; }

  // 角色谁被选走了
  if (Array.isArray(msg.chars)) {
    const ct = {};
    msg.chars.forEach((c) => { ct[c.id] = c; });
    (S.chars || []).forEach((c) => { const u = ct[c.id]; if (u) Object.assign(c, u); });
  }
  // 自己刚选集的那张卡（角色头像/颜色/职业）也得补上
  if (S.me && S.me.charId) {
    const row = (S.players || []).find((p) => p.isMe);
    const c = (S.chars || []).find((x) => x.id === S.me.charId);
    if (row && c) { row.color = c.color; row.avatar = c.avatar; }
  }
}

function onState() {
  warmAvatars();
  enterSince = 0;
  enteringSlow = false;
  if (lastPhase !== S.room.phase) {
    lastPhase = S.room.phase;
    pending = null;
    if (S.room.phase === "vote") voteSel = { killer: null };
    if (S.room.phase === "lobby" || S.room.phase === "briefing") scriptOpen = false;
    if (S.room.phase === "lobby") clueOpen = false;
    if (S.room.phase === "lobby") { mapOpen = false; mapIdx = 0; }
    if (S.room.phase === "lobby") scriptTab = "background";
  }
  // ★ 修复 4：公网地址变了（隧道自检换过一条新隧道）—— 房主要重新发邀请，
  //   否则朋友手里的旧链接只会看到 Cloudflare 的错误页。
  const pu = publicURL();
  if (pu !== lastPublicUrl) {
    const had = lastPublicUrl;
    const wasHost = S.me && S.me.isHost;
    lastPublicUrl = pu;
    if (wasHost && had && !pu) {
      toast("公网通道断了，正在换新地址……十几秒后会出现新链接，旧链接已经不能用了。", "bad");
    } else if (wasHost && had && pu) {
      toast("公网地址变了，请重新点「复制邀请」发给朋友。", "bad");
    }
  }
  render();
}

/* ---------------- 渲染 ---------------- */
// 「我的剧本」/「线索」弹层打开时冻结整页重绘。
// 之前每次 SSE 推送都会把 #app 的 innerHTML 整个换掉，弹层跟着被拆掉重建，
// 视觉上就是一次白闪。现在弹层开着时只更新弹层自己（openModalRefresh），
// 底下的页面保持原样不动。
function modalFrozen() { return scriptOpen || clueOpen || mapOpen || playersOpen; }

function render() {
  // 输入法正在拼字时先别重绘：SSE 推送、心跳、点按都会走到这里，
  // 一旦重绘，正在打字的 <input> 就会被换成新的一个，输入法随即中断、刚打的字也没了。
  // 这期间的状态已经存进 S / 各个变量里，等 compositionend 之后再补一次渲染。
  if (searchComposing) { renderPending = true; return; }
  renderPending = false;
  const app = $("#app");
  const ae = document.activeElement;
  const fid = ae && ae.id ? ae.id : null;
  const sel = fid && ae.selectionStart != null ? ae.selectionStart : null;
  const scrolls = {};
  $$("[data-scroll]").forEach((el) => { scrolls[el.dataset.scroll] = el.scrollTop; });
  // 别把人家正在输入的字冲掉
  const vals = {};
  $$("input[id],textarea[id]").forEach((el) => { vals[el.id] = el.value; });

  // 弹层开着：整页不动，只把弹层的内容换掉（滚动位置照旧保留）
  if (modalFrozen()) return refreshModal();

  app.innerHTML = pageHTML();

  $$("input[id],textarea[id]").forEach((el) => {
    if (vals[el.id] !== undefined && el.value !== vals[el.id]) el.value = vals[el.id];
  });

  if (fid) {
    const el = document.getElementById(fid);
    if (el) { el.focus(); try { if (sel != null) el.setSelectionRange(sel, sel); } catch (e) {} }
  }
  $$("[data-scroll]").forEach((el) => {
    const k = el.dataset.scroll;
    if (scrolls[k] !== undefined) el.scrollTop = scrolls[k];
  });
}

/** 需求 5：随时看得到每个角色有没有准备（人人一样的规则，AI 也在这张表里）
 *  顶栏这张表跟的是"当前阶段到底要不要点准备"：
 *  - 大厅 / 搜证 / 发言 / 结束：摆出来，能点的阶段还带按钮；
 *  - 读本：读本页自己那张卡（我已读完 + 主讲台）就是这套流程，顶栏再摆一遍 "已准备 0 / 5" 会让人以为
 *    刚才在大厅点的准备被服务器吃掉了——尤其是刚点完准备、就地跳到读本的那一瞬间。
 */
function readyBar() {
  if (S.room.phase === "briefing") return "";
  const canReady = ["search1", "search2", "talk2"].indexOf(S.room.phase) >= 0;
  const done = S.players.filter((p) => p.ready).length;
  return (
    '<div class="rbar">' +
      S.players.map((p) =>
        '<span class="pchip' + (p.ready ? " ok" : "") + (p.connected ? "" : " off") + (p.isNPC ? " npc" : "") + '" title="' + esc(p.name + (p.isNPC ? "（AI）" : "") + (p.charRole ? " · " + p.charRole : "")) + '">' +
          avatarOf(p.charId, p.color, (p.charName || p.name || "?")[0], "pav mini") +
          '<span class="pcn" style="color:' + p.color + '">' + esc(p.charName || p.name) + "</span>" +
          (p.isMe ? '<span class="tag gold">你</span>' : "") +
          (p.isHost ? '<span class="tag">房主</span>' : "") +
          (p.ready ? '<span class="okmk">✓</span>' : "") +
        "</span>").join("") +
      '<div class="spacer"></div>' +
      '<span class="dim">已准备 ' + done + " / " + S.players.length + "</span>" +
      (canReady
        ? '<button class="btn sm ' + (S.me.ready ? "" : "ghost") + '" data-act="ready" data-value="' + (S.me.ready ? "0" : "1") + '">' +
          (S.me.ready ? "我准备好了 ✓" : "我准备好了") + "</button>"
        : "") +
    "</div>"
  );
}

function header() {
  // 需求 3：阶段流程只在游戏里显示；等待房间（大厅）不摆这一栏，而且阶段流程里去掉了「大厅」这一步
  const inLobby = S.room.phase === "lobby";
  let steps = "";
  if (!inLobby) {
    S.phases.forEach((p, i) => {
      if (p.id === "lobby") return;
      const cls = i === S.room.phaseIdx ? "now" : (i < S.room.phaseIdx ? "done" : "");
      steps += '<span class="step ' + cls + '">' + esc(p.short) + "</span>";
    });
  }
  return (
    '<header><div class="wrap">' +
      '<div class="hd">' +
        '<div class="brand">' + esc((S.case && S.case.title) || "剧本杀") + "</div>" +
        '<div class="spacer"></div>' +
        '<div class="row" style="gap:6px">' +
          '<span class="dim">房间</span><span class="code">' + esc(S.room.code) + "</span>" +
          (S.me && S.me.script && S.room.phase !== "briefing" && !inLobby ? '<button class="btn sm" data-act="myscript">我的剧本</button>' : "") +
          '<button class="btn sm ghost" data-act="copy">复制邀请</button>' +
          '<button class="btn sm ghost" data-act="leave">离开房间</button>' +
          '<span class="dot ' + (connected ? "on" : "off") + '" title="' + (connected ? "已连接" : "连接已断开") + '"></span>' +
          '<button class="btn sm ghost" data-act="players">玩家列表</button>' +
          (inLobby ? "" : '<button class="btn sm" data-act="clue">线索</button>') +
          (inLobby ? "" : '<button class="btn sm mobonly" data-act="side">讨论区</button>') +
        "</div>" +
      "</div>" +
      (inLobby ? "" : '<div class="steps">' + steps + "</div>") +
      readyBar() +
      netBar() +
    "</div></header>"
  );
}

/* ★ 修复 3：连接状态条。
   以前断线只有右上角一个 6px 的小圆点变红，公网上一断就是好几秒，
   玩家根本分不清是"服务器慢了"还是"自己掉线了"，只会反复戳按钮。
   现在直接把话说清楚：在重连第几次、座位还在不在、网络有多慢。 */
function netBar() {
  if (!connected && reconnectFails > 0) {
    return '<div class="netbar bad">连接已断开，正在重连（第 ' + Math.max(1, reconnectFails) + " 次）……" +
      "你的座位还留着，<b>别关页面</b>。" + (netMs ? "（上次往返 " + netMs + "ms）" : "") + "</div>";
  }
  if (netSlow) return '<div class="netbar slow">网络较慢（' + netMs + "ms）：操作会慢半拍，已经帮你做了防重复点击。</div>";
  return "";
}

function mainPanel() {
  const p = S.room.phase;
  if (p === "lobby") return screenLobby();
  if (p === "briefing") return screenBriefing();
  if (p === "intro") return screenIntro();
  if (p === "search1" || p === "search2") return screenSearch();
  if (p === "talk2") return screenTalk();
  if (p === "quiz") return screenQuiz();
  if (p === "vote") return screenVote();
  if (p === "reveal") return screenReveal();
  return "";
}

function phaseHead() {
  const ph = S.phases[S.room.phaseIdx] || {};
  return '<div class="phasehead"><h2>' + esc(ph.name || "") + "</h2><p>" + esc(ph.desc || "") + "</p></div>";
}

function hostBar() {
  const me = S.players.find((x) => x.isMe);
  if (!me || !me.isHost) return "";
  const last = S.room.phaseIdx >= S.phases.length - 1;
  return (
    '<div class="row" style="margin-top:16px">' +
      '<button class="btn pri" data-act="advance" ' + (last ? "disabled" : "") + ">" +
        (last ? "已经到最后了" : "进入「" + esc((S.phases[S.room.phaseIdx + 1] || {}).name || "") + "」") +
      "</button>" +
      '<span class="dim">你是房主，只有你能推进阶段。' + (S.room.phase === "lobby" && S.players.some((p) => !p.ready) ? "（还在等大家点「我准备好了」）" : "") + "</span>" +
    "</div>"
  );
}

/* ---------------- 未登录：落地页 + 剧本库 ---------------- */
// 剧本从服务器读，不在前端写死：以后加新本子，这里自动多一张卡。
// 需求 5：进网页之前剧本库就已经准备好了——
//   1) 上次读到的剧本库存在 localStorage 里，页面一打开立刻就画出来，不用等网络；
//   2) 双击启动时浏览器常常比服务器先起来（第一次请求必然失败），所以这里会一直重试，
//      不会卡在"正在读取剧本库……"，也不需要用户手动刷新页面。
const CASES_CACHE = "mm_cases_v1";
// 需求 3（本轮）：游戏里一直是黑背景。原因有两个——
//   ① 底图地址只有 /api/cases 会给，而"带着 token 直接进房"的路径以前会 return connect()，
//      根本没读过剧本库，setBG 从没被调用过；
//   ② 就算调用了，旧缓存里没有 bg 字段（undefined）也会被这里直接 return 掉。
// 现在改成：拿不到地址就退回默认底图地址，保证 body 一定有 hasbg 与 --bgimg。
const BG_FALLBACK = "/api/img/bgthumb/mm-bg";
function setBG(u) {
  const url = u || BGU || BG_FALLBACK;
  if (!url) return;
  BGU = url;
  document.body.style.setProperty("--bgimg", 'url("' + url + '")');
  document.body.classList.add("hasbg");
}
function applyCases(r) {
  if (!r || !r.ok || !Array.isArray(r.cases)) return false;
  CASES = r.cases;
  if (r.images) IMGST = r.images;
  // 剧本库可能是空的（本子都被删了），这也算读到了
  if (!caseId || !CASES.some((c) => c.id === caseId)) caseId = r.defaultId || (CASES[0] ? CASES[0].id : "");
  const pick = CASES.find((c) => c.id === caseId);
  setBG((pick && pick.bg) || r.bg);
  try { localStorage.setItem(CASES_CACHE, JSON.stringify({ cases: r.cases, defaultId: r.defaultId, bg: r.bg || null })); } catch (e) {}
  return true;
}
function casesFromCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CASES_CACHE) || "null");
    if (c && Array.isArray(c.cases)) {
      CASES = c.cases;
      if (!caseId) caseId = c.defaultId || (c.cases[0] ? c.cases[0].id : "");
      const pick = c.cases.find((x) => x.id === caseId);
      setBG((pick && pick.bg) || c.bg);
      return true;
    }
  } catch (e) {}
  return false;
}
let casesLoading = false;
async function loadCases() {
  if (casesLoading) return false;
  casesLoading = true;
  try {
    for (let i = 0; i < 60; i++) {
      try {
        const r = await (await fetch("/api/cases", { cache: "no-store" })).json();
        if (applyCases(r)) { render(); return true; }
      } catch (e) {}
      await new Promise((res) => setTimeout(res, i < 6 ? 300 : 1200));
    }
    if (CASES === null) CASES = [];
    render();
    return false;
  } finally {
    casesLoading = false;
  }
}
/* 需求 2（本轮）：卡片上的小图标 —— 纯 SVG，不用 emoji */
const ICO = {
  people: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="5.9" cy="5.5" r="2.4"/><path d="M1.7 13c0-2.2 1.9-3.6 4.2-3.6s4.2 1.4 4.2 3.6"/><path d="M10.8 4.2a2.1 2.1 0 010 4.2M13.9 13c0-1.6-.6-2.8-1.6-3.5"/></svg>',
  clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="8" cy="8" r="5.7"/><path d="M8 4.7V8l2.3 1.4"/></svg>',
  genre: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14.2c1.3-1.5 4.4-4.4 4.4-7.1A4.4 4.4 0 003.6 7c0 2.7 3.1 5.6 4.4 7.2z"/><circle cx="8" cy="6.9" r="1.5"/></svg>',
  kind: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M8 2.3l1.7 3.9 3.9 1.7-3.9 1.7L8 13.5 6.3 9.6 2.4 7.9l3.9-1.7z"/></svg>',
  lock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><rect x="3.3" y="7.1" width="9.4" height="6.1" rx="1.4"/><path d="M5.5 7.1V5.4a2.5 2.5 0 015 0v1.7"/></svg>',
};
// 需求 2：大一号的方块剧本卡 —— 封面铺满整张卡，底部压着标题和四格：
// 人数 / 时长 / 题材 / 类别（题材写短标签，例如 现代推理 / 古风权谋 / 民国情感）。
// 左上角的"封闭本"角章已按用户要求去掉；右上角是删除按钮（要密码）。
function caseCard(c) {
  const on = caseId === c.id;
  const g = c.card || {};
  const txt = (v) => esc(String(v == null ? "" : v));
  const join = (arr) => (arr || []).map(txt).join(" · ");
  return (
    '<div class="casecard' + (on ? " sel" : "") + '" data-act="pickcase" data-case="' + esc(c.id) + '">' +
      (c.cover ? '<div class="casecov"><img loading="lazy" alt="" src="' + esc(c.cover) + '" /></div>' : "") +
      '<div class="ccscrim"></div>' +
      '<button class="cdel" data-act="askdel" data-case="' + esc(c.id) + '" title="从剧本库删除">✕</button>' +
      '<div class="cbin">' +
        '<div class="ct">' + txt(c.title) + (on ? ' <span class="tag gold">已选中</span>' : "") + "</div>" +
        '<div class="cgrid">' +
          '<div class="cf">' + ICO.people + '<span class="cv">' + txt(g.players) + "</span></div>" +
          '<div class="cf">' + ICO.clock + '<span class="cv">' + txt(g.duration) + "</span></div>" +
          '<div class="cf wide">' + ICO.genre + '<span class="cv">' + join(g.genres) + "</span></div>" +
          '<div class="cf wide">' + ICO.kind + '<span class="cv">' + join(g.category) + "</span></div>" +
        "</div>" +
      "</div>" +
    "</div>"
  );
}

/* 剧本库筛选：只在前端过滤卡片，不改变 /api/cases 或房间逻辑 */
function caseSeatOptions() {
  const set = new Set();
  (CASES || []).forEach((c) => { const v = c && c.card && c.card.players; if (v) set.add(v); });
  return [...set].sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0));
}
function caseGenreOptions() {
  const set = new Set();
  (CASES || []).forEach((c) => { ((c && c.card && c.card.genres) || []).forEach((g) => set.add(g)); });
  return [...set].sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}
function filteredCases() {
  return (CASES || []).filter((c) => {
    if (filterSeats && (!c.card || c.card.players !== filterSeats)) return false;
    if (filterGenre && !((c.card && c.card.genres) || []).includes(filterGenre)) return false;
    return true;
  });
}
function filterBar() {
  const seats = caseSeatOptions().map((s) =>
    '<option value="' + esc(s) + '"' + (filterSeats === s ? " selected" : "") + ">" + esc(s) + "</option>").join("");
  const genres = caseGenreOptions().map((g) =>
    '<option value="' + esc(g) + '"' + (filterGenre === g ? " selected" : "") + ">" + esc(g) + "</option>").join("");
  const on = !!(filterSeats || filterGenre);
  return (
    '<div class="casefilters">' +
      '<span class="dim">人数</span>' +
      '<select class="input" data-filter="seats">' +
        '<option value="">全部人数</option>' + seats +
      "</select>" +
      '<span class="dim">题材</span>' +
      '<select class="input" data-filter="genre">' +
        '<option value="">全部题材</option>' + genres +
      "</select>" +
      (on ? '<button class="btn ghost" data-act="clearCasesFilter">清除筛选</button>' : "") +
    "</div>"
  );
}
function applyCaseFilter() {
  const list = filteredCases();
  if (!list.some((c) => c.id === caseId)) {
    caseId = list.length ? list[0].id : "";
    const pick = list[0] || null;
    if (pick) setBG(pick.bg || BGU || BG_FALLBACK);
    else if (CASES && CASES.length) setBG(BGU || BG_FALLBACK);
  }
  render();
}

// 需求 3：删除剧本要密码。选中哪一本，就在剧本库下面出现一行密码框。
function delRow() {
  const del = CASES ? CASES.find((c) => c.id === delId) : null;
  if (!del) return "";
  return (
    '<div class="delrow">' +
      '<span class="dim">删除《' + esc(del.title) + '》需要删除密码：</span>' +
      '<input class="input" id="in-delpw" type="password" placeholder="删除密码" style="max-width:180px" />' +
      '<button class="btn danger" data-act="delcase" data-case="' + esc(del.id) + '">确认删除</button>' +
      '<button class="btn ghost" data-act="canceldel">取消</button>' +
      '<span class="dim">删掉的是 data/cases/ 里的剧本文件，删了就进不来了。</span>' +
    "</div>"
  );
}

/* ---------------- 大厅首页（需求 3） ----------------
   只留两块：进剧本库、拿房号进房。挑本 / 筛选 / 删除都在剧本库那一页。 */
function screenLanding() {
  const q = new URLSearchParams(location.search).get("room") || "";
  const sel = CASES ? CASES.find((c) => c.id === caseId) : null;
  return (
    '<div class="screen">' +
      '<div class="hero">' +
        "<h1>剧本杀 · 在线开局</h1>" +
        '<div class="sub">MURDER MYSTERY ONLINE</div>' +
      "</div>" +
      '<div class="card libentry" data-act="openLib">' +
        (sel && sel.cover ? '<div class="lecov"><img alt="" src="' + esc(sel.cover) + '" /></div>' : "") +
        '<div class="lebin">' +
          "<h3>剧本库" + (CASES ? "（共 " + CASES.length + " 本）" : "") + "</h3>" +
          '<div class="dim">' +
            (CASES === null
              ? "正在读取剧本库……"
              : CASES.length
                ? "点进去挑一本，点开剧本就能创建房间、你当房主。" + (sel ? "上次挑的是《" + esc(sel.title) + "》。" : "")
                : "剧本库还是空的，先往 data/cases/ 里放一个本子。") +
          "</div>" +
          '<div class="row" style="margin-top:12px">' +
            '<button class="btn pri" data-act="openLib"' + (CASES === null ? " disabled" : "") + ">" +
              (CASES === null ? "正在读取剧本库…" : "进入剧本库 →") +
            "</button>" +
          "</div>" +
        "</div>" +
      "</div>" +
      imgBar() +
      '<div class="card">' +
        "<h3>加入已有房间</h3>" +
        '<input class="input" id="in-name" maxlength="12" placeholder="你的名字（别人会看到）" value="' + esc(NAME) + '" />' +
        '<input class="input code-in" id="in-code" maxlength="6" placeholder="房号（6 位）" value="' + esc(q.toUpperCase()) + '" />' +
        '<div class="row" style="margin-top:11px">' +
          '<button class="btn" data-act="join"' + (joining ? " disabled" : "") + ">" +
            (joining === "join" ? "正在进入房间…" : "加入房间") +
          "</button>" +
        "</div>" +
        '<div class="dim" style="margin-top:10px">没有房号？先点上面的剧本库，挑一本开一局。</div>' +
      "</div>" +
      '<div class="dim" style="text-align:center;margin-top:14px">' +
        "开好房之后，把页面上的邀请链接发给朋友：同一个 WiFi 用局域网地址，异地用公网地址。座位坐满、全员准备才能开局。" +
      "</div>" +
    "</div>"
  );
}

/* ---------------- 剧本库页面（需求 3） ----------------
   原来的落地页剧本库整块搬到这里：筛选条、卡片网格、删除入口。
   点一本卡片 = 选中这一本 + 弹「创建房间 / 取消」。 */
function screenLibrary() {
  const list = filteredCases();
  const sel = CASES ? CASES.find((c) => c.id === caseId) : null;
  return (
    '<div class="screen">' +
      '<div class="hero">' +
        "<h1>剧本库</h1>" +
        '<div class="sub">' +
          esc(CASES
            ? "共 " + CASES.length + " 本" + ((filterSeats || filterGenre) ? " · 筛选后 " + list.length + " 本" : "") + " · 点一本就能开房"
            : "MURDER MYSTERY LIBRARY") +
        "</div>" +
        '<div class="row" style="margin-top:14px;justify-content:center">' +
          '<button class="btn ghost" data-act="closeLib">← 返回大厅</button>' +
        "</div>" +
      "</div>" +
      (CASES === null
        ? '<div class="card"><div class="dim">正在读取剧本库……</div></div>'
        : (CASES.length
          ? '<div class="card">' +
              filterBar() +
              '<div class="dim" style="margin-bottom:14px">点一本弹出「创建房间」，确认后就用这一本开局（整局不换本）。卡片右上角的 ✕ 能把一本从剧本库里删掉（要删除密码）。</div>' +
              (list.length
                ? '<div class="cases">' + list.map(caseCard).join("") + "</div>"
                : '<div class="dim">没有符合当前筛选的剧本。</div>') +
              delRow() +
            "</div>"
          : '<div class="card">' +
              "<h3>剧本库是空的</h3>" +
              '<div class="dim">data/cases/ 下还没有本子。写一本新的照着 <b>docs/剧本杀生成规范.md</b>，把数据文件放进 data/cases/ 再刷新这一页就会出现在这里。</div>' +
            "</div>")) +
      imgBar() +
      (sel ? '<div class="dim" style="text-align:center;margin-top:12px">上次挑的是《' + esc(sel.title) + '》</div>' : "") +
      '<div class="row" style="justify-content:center;margin-top:16px">' +
        '<button class="btn ghost" data-act="audit">校验台 · 检查剧本有没有问题</button>' +
      "</div>" +
      (caseAsk ? createAskModal() : "") +
    "</div>"
  );
}

/* 点了某一本：问「创建房间 / 取消」。名字就在这个弹层里填，取消就什么都不做。 */
function createAskModal() {
  const c = CASES ? CASES.find((x) => x.id === caseAsk) : null;
  if (!c) return "";
  const g = c.card || {};
  const meta = [g.players, g.duration].concat(g.genres || [], g.category || []).filter(Boolean).join(" · ");
  return (
    '<div class="modal">' +
      '<div class="box askbox">' +
        (c.cover ? '<div class="askcov"><img alt="" src="' + esc(c.cover) + '" /></div>' : "") +
        "<h3>《" + esc(c.title) + "》</h3>" +
        '<div class="dim">' + esc(meta) + "</div>" +
        '<div class="dim" style="margin-top:10px">开一局这一本、你当房主？</div>' +
        '<input class="input" id="in-name2" maxlength="12" placeholder="你的名字（别人会看到）" value="' + esc(NAME) + '" style="margin-top:12px" />' +
        (imgWait() ? '<div class="note" style="margin-top:10px">实景图还在准备，备齐才能开房（进度见外面的进度条）。</div>' : "") +
        '<div class="row" style="margin-top:16px;justify-content:flex-end">' +
          '<button class="btn ghost" data-act="cancelCreate">取消</button>' +
          '<button class="btn pri" data-act="confirmCreate" data-case="' + esc(c.id) + '"' + (imgWait() || joining ? " disabled" : "") + ">" +
            (joining === "create" ? "正在开局…" : imgWait() ? "实景图准备中…" : "创建房间") +
          "</button>" +
        "</div>" +
      "</div>" +
    "</div>"
  );
}

/* 真正开房的那一段：首页和剧本库两个入口都走这里，避免两份逻辑走偏 */
async function doCreate(nameRaw, idRaw) {
  if (joining) return;
  NAME = String(nameRaw == null ? "" : nameRaw).trim();
  if (!NAME) return toast("先给自己起个名字", "bad");
  localStorage.setItem("mm_name", NAME);
  // 点了就有反应：按钮先切成"正在开局…"，别让人对着不动的画面等服务器
  joining = "create";
  render();
  let r = { ok: false, error: "连接不上服务器。" };
  try { r = await api("/api/create", { name: NAME, caseId: idRaw || caseId || undefined }); }
  finally { joining = null; }
  if (!r.ok) {
    // 实景图还没缓存好就不给建房，显示进度并自动重试
    if (r.images) IMGST = r.images;
    render();
    if (r.preparing) {
      toast(r.error || "实景图还在准备，稍等一会儿。", "bad");
      startImagePoll();
      return;
    }
    return toast(r.error || "创建失败", "bad");
  }
  caseAsk = null;
  libOpen = false;
  TOKEN = r.token; CODE = r.code;
  localStorage.setItem("mm_token", TOKEN);
  localStorage.setItem("mm_code", CODE);
  history.replaceState(null, "", "/?room=" + CODE);
  if (r.view) { S = r.view; onState(); }
  connect();
}

/* ---------------- 实景图准备（本轮需求） ----------------
   角色头像 / 搜证场景 / 局内背景图要在第一次建房之前就缓存好。
   没备齐时：落地页上摆一条进度条，建房按钮禁用；服务器也会拒绝建房。 */
/** 带着凭证刷新 / 手机切后台回来：先给一句话，别让 #app 空着等 SSE 第一帧 */
/* ★ 修复 3：卡在"正在回到房间"里干等。
   以前这一页只有一行"连接中……"，网络一不通就永远停在这儿，没有任何出口。
   现在：显示已经等了多久，8 秒还没连上就明说"网络好像不太通"，
   并给一个「重新连接」按钮和一个「回到首页」。 */
function screenEntering() {
  const waited = enterSince ? Math.round((Date.now() - enterSince) / 1000) : 0;
  return (
    '<div class="screen">' +
      '<div class="hero">' +
        "<h1>正在回到房间 " + esc(CODE) + "</h1>" +
        '<div class="sub">' + (waited >= 3 ? "已经等了 " + waited + " 秒……" : "连接中……") + "</div>" +
        (enteringSlow
          ? '<div class="note bad" style="margin-top:14px">网络好像不太通。你的座位还留着：可以多点几次「重新连接」，' +
            "或者换个网络（比如从 WiFi 切到手机流量）再试。实在进不去就点「回到首页」重新加入。</div>"
          : '<div class="dim" style="margin-top:12px">正在建立实时连接，通常一两秒就好。你的座位是一直保留的。</div>') +
        '<div class="row" style="margin-top:16px;justify-content:center">' +
          '<button class="btn pri" data-act="retryConnect">重新连接</button>' +
          '<button class="btn ghost" data-act="leave">回到首页</button>' +
        "</div>" +
      "</div>" +
    "</div>"
  );
}
// 停在这一页时每一秒多刷一次，把"已经等了 N 秒"和 8 秒后的提示放进画面
setInterval(() => {
  if (S || !TOKEN || !CODE || !enterSince) return;
  if (!enteringSlow && Date.now() - enterSince > 8000) enteringSlow = true;
  render();
}, 1500);
function imgWait() {
  return !!(IMGST && !IMGST.ready && IMGST.pending > 0);
}
function imgBar() {
  if (!IMGST) return "";
  // 全部生成完后不再显示“实景图已备齐”，避免把永久就绪状态当成一条长期提示。
  if (IMGST.ready) return "";
  const done = IMGST.done || 0, total = IMGST.total || 0;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return '<div class="imgbar">' +
      '<div class="imglab">正在准备实景图（' + done + "/" + total + "）——头像、搜证场景和背景图要先缓存好，之后开房就不用等了。" +
        "还没有的房间：头像 " + ((IMGST.char || 0) - (IMGST.charPending || 0)) + "/" + (IMGST.char || 0) +
        "，搜证场景 " + ((IMGST.loc || 0) - (IMGST.locPending || 0)) + "/" + (IMGST.loc || 0) + "。" +
      "</div>" +
      '<div class="imgtrack"><i style="width:' + pct + '%"></i></div>' +
    "</div>";
}
let imgPoll = null;
function startImagePoll() {
  if (imgPoll) return;
  imgPoll = setInterval(async () => {
    try {
      const r = await (await fetch("/api/cases", { cache: "no-store" })).json();
      // 已经在房间里就不用再轮询重绘了：实景图进度会走 SSE 推过来，
      // 2.5 秒整页重绘只会打断正在看的界面。
      if (r && r.ok) { applyCases(r); if (!S) render(); }
      if (IMGST && IMGST.ready) {
        clearInterval(imgPoll); imgPoll = null;
        if (!S) toast("实景图备齐了，可以开房了。", "good");
      }
    } catch (e) {}
  }, 2500);
}
function refreshImages() {
  api("/api/images", {}).then((r) => {
    if (r && r.ok && r.images) { IMGST = r.images; render(); }
  });
}

/* ---------------- 大厅 ---------------- */
function screenLobby() {
  const CH = S.chars || [];
  const SEATS = (S.room && S.room.seats) || CH.length || 6;
  const me = S.players.find((x) => x.isMe);
  let chars = "";
  if (CH.length) {
    chars = CH.map((c) => {
      const isTaken = c.taken && !(me && me.charId === c.id);
      const isSel = me && me.charId === c.id;
      const aiTaken = isTaken && c.takenByNPC;    // AI 占着的位置，真人随时可以要过来
      return (
        '<div class="char ' + (isSel ? "sel" : "") + (isTaken && !aiTaken ? " taken" : "") + '" data-act="pick" data-char="' + c.id + '">' +
          (isTaken
            ? '<span class="mk ' + (aiTaken ? "tag blue" : "dim") + '">' + esc(c.takenBy) + (aiTaken ? " · 可以要过来" : "") + "</span>"
            : (isSel ? '<span class="mk tag gold">我的</span>' : "")) +
          avatarOf(c.id, c.color, c.avatar, "av") +
          '<div class="nm">' + esc(c.name) + "</div>" +
          '<div class="rl">' + esc(c.role) + (c.age ? "　" + esc(c.age) + " 岁" : "") + "</div>" +
          (lobbyDetail && charBrief(c) ? '<div class="bio">' + esc(charBrief(c)) + "</div>" : "") +
        "</div>"
      );
    }).join("");
  } else {
    chars = '<div class="dim">正在载入角色……</div>';
  }

  return (
    '<div class="screen">' +
      phaseHead() +
      '<div class="card">' +
        "<h3>选择你的角色</h3>" +
        '<div class="note">房号 <b class="code">' + esc(S.room.code) + "</b></div>" +
        '<div class="row" style="margin-top:8px;justify-content:space-between">' +
          '<div class="dim">拿到角色后你才会看到属于自己的剧本。每个角色只能选一次。</div>' +
          '<button class="btn sm ghost" data-act="detail">' + (lobbyDetail ? "收起简介" : "显示简介") + "</button>" +
        "</div>" +
        '<div class="chars">' + chars + "</div>" +
      "</div>" +
      (me && me.isHost && S.players.length < CH.length ? '<div class="card">' +
        "<h3>AI 补位</h3>" +
        '<div class="dim">人不够就点这里补位——AI 只是座位：它会选角色、报准备、搜证、答题、投票（用的是和真人一样的规则，看不到任何内幕），但<b>不会说话</b>，讨论区、自我介绍和揭晓页上都不会有 AI 的发言。</div>' +
        '<div class="row" style="margin-top:11px">' +
          '<button class="btn" data-act="asknpc" data-npc="add">加一个 AI</button>' +
          '<button class="btn ghost" data-act="asknpc" data-npc="fill">一键坐满 ' + SEATS + " 人</button>" +
          '<span class="dim">现在场上 ' + S.room.npcCount + " 个 AI</span>" +
        "</div>" +
        (npcAsk
          ? '<div class="delrow" style="margin-top:11px">' +
              '<span class="dim">加 AI 要密码（和删除剧本是同一个）：</span>' +
              '<input class="input" id="in-npcpw" type="password" placeholder="密码" style="max-width:170px" />' +
              '<button class="btn danger" data-act="donpc" data-npc="' + npcAsk + '">确认' + (npcAsk === "fill" ? "坐满" : "加一个") + "</button>" +
              '<button class="btn ghost" data-act="cancelnpc">取消</button>' +
            "</div>"
          : "") +
        '<div class="dim" style="margin-top:11px">满 ' + SEATS + " 人、而且大家都点了「我准备好了」，这一局才会开始。</div>" +
      "</div>" : "") +

      '<div class="card">' +
        "<h3>准备</h3>" +
        '<div class="dim" style="margin-bottom:10px">所有人都点了「我准备好了」，才会自动进读本；房主的「进入读本」也要等大家都准备好。</div>' +
        '<div class="row">' +
          '<button class="btn ' + (S.me.ready ? "" : "pri") + '" data-act="ready" data-value="' + (S.me.ready ? "0" : "1") + '">' +
            (S.me.ready ? "我准备好了 ✓" : "我准备好了") +
          "</button>" +
          '<span class="dim">' + S.players.filter((p) => p.ready).length + " / " + S.players.length + " 人已准备</span>" +
        "</div>" +
      "</div>" +
      '<div class="card">' +
        "<h3>已经入座的人</h3>" +
        '<div class="plist">' + S.players.map(playerRow).join("") + "</div>" +
      "</div>" +
      '<div class="card">' + hostBar() +
        (me && me.isHost ? "" : '<div class="dim">等房主开始游戏。</div>') +
        (me && me.isHost && S.players.length < CH.length
          ? '<div class="note" style="margin-top:10px">还差 ' + (CH.length - S.players.length) + " 个人。人不满不能开局——点上面的「一键坐满 " + SEATS + " 人」让 AI 补位。</div>"
          : "") +
      "</div>" +
    "</div>"
  );
}

function playerRow(p) {
  return (
    '<div class="prow ' + (p.isMe ? "me" : "") + '">' +
      avatarOf(p.charId, p.color, p.avatar, null, pavAttr(p)) +
      '<div style="flex:1;min-width:0">' +
        '<div class="pnm"><span style="color:' + p.color + '" ' + (p.isMe ? "" : 'class="dmname" data-act="dm" data-id="' + esc(p.id) + '" title="点一下私聊"') + ">" + esc(p.charName || "还没选角色") + "</span>" +
          '<span class="dim">　' + esc(p.name) + "</span>" +
          (p.isNPC ? ' <span class="tag blue">AI</span>' : "") + (p.isMe ? ' <span class="tag gold">你</span>' : "") + (p.isHost ? ' <span class="tag">房主</span>' : "") + "</div>" +
        '<div class="pmeta">' + (p.charName ? esc(p.charRole || "") : "这个位置还空着") + "</div>" +
      "</div>" +
      (p.ready ? '<span class="tag green">已准备</span>' : "") +
      '<span class="dot ' + (p.connected ? "on" : "off") + '" title="' + (p.connected ? "在线" : "离线") + '"></span>' +
    "</div>"
  );
}

/* ---------------- 读本 ---------------- */
// 页签标题改成人话；「公共背景」这一页读的是剧本的公共部分，不是角色私本
// 需求 1：背景故事排在最前面（先看公共背景，再看自己的故事）
const SCRIPT_TABS = [
  ["common", "背景故事"],
  ["background", "人物故事"],
  ["tonight", "案发时间线"],
  ["mission", "你的任务"],
];
/* ---------------- 搜索框：线索 / 我的剧本 ---------------- */
function textHas(hay, q) {
  const s = String(hay == null ? "" : hay).toLowerCase();
  const f = String(q == null ? "" : q).trim().toLowerCase();
  return !!f && s.indexOf(f) >= 0;
}
function markHit(text, q) {
  const raw = esc(text == null ? "" : String(text));
  const qs = q ? esc(String(q)) : "";
  const need = qs.toLowerCase();
  if (!need) return raw;
  const lower = raw.toLowerCase();
  const out = [];
  let from = 0;
  for (;;) {
    const at = lower.indexOf(need, from);
    if (at < 0) break;
    out.push(raw.slice(from, at));
    out.push("<mark>" + raw.slice(at, at + need.length) + "</mark>");
    from = at + need.length;
  }
  out.push(raw.slice(from));
  return out.join("");
}
function searchBar(id, kind, placeholder) {
  const value = kind === "clue" ? clueSearch : scriptSearch;
  return '<input class="input searchbar" id="' + id + '" data-search="' + kind + '" placeholder="' + esc(placeholder) + '" value="' + esc(value) + '" />';
}
function scriptBlocks(sc, q) {
  const find = String(q == null ? "" : q).trim().toLowerCase();
  const out = [];
  if (!sc || !find) return out;
  SCRIPT_TABS.forEach(([t, label]) => {
    String(scriptBody(sc, t)).split(/\n+/).forEach((raw, i) => {
      const line = String(raw).trim();
      if (!line) return;
      const at = line.toLowerCase().indexOf(find);
      if (at < 0) return;
      const start = Math.max(0, at - 14);
      const end = Math.min(line.length, at + find.length + 24);
      const snip = (start > 0 ? "…" : "") + line.slice(start, end) + (end < line.length ? "…" : "");
      out.push({ tab: t, label: label, key: t + ":" + i, snip: snip });
    });
  });
  return out;
}
function scriptSearchResults() {
  const q = String(scriptSearch == null ? "" : scriptSearch).trim();
  if (!q) return "";
  const rows = scriptBlocks(S && S.me && S.me.script, q);
  if (!rows.length) return '<div class="searchnote">没有找到包含「' + esc(q) + '」的内容。</div>';
  return '<div class="searchnote">找到 ' + rows.length + " 处包含「" + esc(q) + "」的内容</div>" +
    '<div class="searchhits">' +
      rows.map((r) =>
        '<button class="shit" data-act="scripthit" data-tab="' + esc(r.tab) + '" data-hit="script-hit-' + esc(r.key) + '">' +
          '<span class="st">' + esc(r.label) + "</span>" +
          '<span class="sx">' + markHit(r.snip, q) + "</span>" +
        "</button>"
      ).join("") +
    "</div>";
}
function scriptBodyHTML(sc) {
  const q = String(scriptSearch == null ? "" : scriptSearch).trim();
  let html = fmtScript(scriptBody(sc), q || null);
  if (!scriptHit || !q) return html;
  const id = "script-hit-" + scriptHit;
  let done = false;
  html = html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/g, (m, attrs, inner) => {
    if (done || inner.indexOf("<mark>") < 0) return m;
    done = true;
    return '<p id="' + esc(id) + '"' + attrs + ">" + inner + "</p>";
  });
  return html;
}
function scrollToScriptHit() {
  const id = scriptHit ? "script-hit-" + scriptHit : "";
  if (!id) return;
  const el = document.getElementById(id);
  if (el && el.scrollIntoView) el.scrollIntoView({ block: "center" });
}
function clueBodyFor(list, emptyText, opts) {
  const q = String(clueSearch == null ? "" : clueSearch).trim();
  const all = list || [];
  const shown = q ? all.filter((c) => textHas(c && c.title, q) || textHas(c && c.text, q) || textHas(c && (c.locationName || c.location), q)) : all;
  const note = q && all.length ? '<div class="searchnote">' + shown.length + " / " + all.length + " 条线索匹配</div>" : "";
  if (!shown.length) return note + (q && all.length ? '<div class="dim">没有找到包含「' + esc(q) + "」的线索。</div>" : emptyText);
  return note + clueGroups(shown, opts);
}
// 人物故事要求按主题分段；老素材可能是一整段，展示时按句子拆开，避免读成一堵字墙。
// 人物故事要求按主题分段；老素材可能是一整段，展示时按句子拆开，避免读成一堵字墙。
function autoParagraphs(text) {
  const s = String(text || "");
  if (/\n/.test(s)) return s;
  const sentences = s.split(/(?<=[。！？；…])\s*/).filter(Boolean);
  const out = [];
  let cur = "";
  for (const part of sentences) {
    if (cur && (cur + part).length > 140) { out.push(cur.trim()); cur = part; }
    else cur += part;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.join("\n");
}
function scriptBody(sc, t) {
  const tab = t || scriptTab;
  if (tab === "common") return (S && S.case && S.case.common) || "（这一本没有公共背景。）";
  if (tab === "background") return autoParagraphs(sc.background || "");
  // 需求 6：「你要隐瞒的」「你知道的」不再各开一个页签，全部并进「你的任务」，
  // 用 ## 小标题分成几栏（fmtScript 会把 ## 开头的一行渲染成 .sec 小标题）。
  if (tab === "mission") {
    const parts = [];
    if (sc.mission) parts.push("##你的任务\n" + sc.mission);
    if (sc.hide) parts.push("##你要隐瞒的\n" + sc.hide);
    if (sc.know) parts.push("##你知道的\n" + sc.know);
    return parts.join("\n");
  }
  return sc[tab] || "";
}
// 需求 6（本轮）：剧本正文必须有分段排版。
// 以前这里有两个毛病：
//   ① 正则 /(d{1,2}:d{2})/ 少了反斜杠，时间点从来没被标重过；
//   ② 没有做任何分段——剧本里"案发时间线"和"你的任务"是一整段糊在一起的，
//      读起来就是一坨字。现在按下面三级切块：
//      · 换行本身就是段（素材里写了 \n 就直接分段）
//      · "21:10" 这种时间点：每个时间点自成一行，缩进对齐
//      · "1. / 2. / 一、/ 第一 条"这种编号项也各自成行
//      最后每一块包一个 <p>，CSS 里给间距。
function fmtScript(s, q) {
  const raw = esc(s == null ? "" : String(s));
  // ① 先把文本切成"块"：显式换行优先
  let blocks = raw.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  if (blocks.length <= 1) blocks = [raw.trim()].filter(Boolean);
  const out = [];
  for (const b of blocks) {
    // ② 先按"编号项"切："1. / 2." 或 "一、/ 二、"。编号必须出现在句子边界之后，
    //    否则会把正文里 "1. 咬定你 20:05 对完账…" 这种整条任务切碎。
    let t = b.replace(/(?<=[。；;！？]|^)\s*(?=\d{1,2}\.\s|[一二三四五六七八九十]{1,3}[、．])/g, "\u0001");
    // ③ 再按时间点切：只有"时间点出现在句首或句读之后"才算新的一行。
    //    时间和正文之间那种全角空格 "18:10　你…" 也是同一个意思。
    t = t.replace(/(?<=[。；;！？]|^|\u0001)[\s\u3000]*(\d{1,2}:\d{2})(?=[\s\u3000])/g, "\u0001$1 ");
    t = t.replace(/(?<=[。；;！？]|^|\u0001)[\s\u3000]*(\d{1,2}:\d{2})(?=\S)/g, "\u0001$1\u3000");
    const parts = t.split("\u0001").map((x) => x.trim()).filter(Boolean);
    for (const p of parts) {
      // 需求 6：## 开头的是分栏小标题（你的任务 / 你要隐瞒的 / 你知道的）
      if (p.slice(0, 2) === "##") { out.push('<p class="sec">' + markHit(p.replace(/^#+/, "").trim(), q) + "</p>"); continue; }
      // 时间点开头的那一行，把时间点标重并单独缩进
      const m = /^(\d{1,2}:\d{2})[\s\u3000]*([\s\S]*)$/.exec(p);
      if (m) out.push('<p class="tl"><b class="ts">' + markHit(m[1], q) + "</b>" + (m[2] ? '<span class="tx">' + markHit(m[2], q) + "</span>" : "") + "</p>");
      else out.push("<p>" + markHit(p, q) + "</p>");
    }
  }
  return out.join("");
}

/* 需求 9：地图改成和头像一样由 AI 画成图片，点开能看大图。
   手绘那版 SVG 方块图不清晰，已经不再画；这里只留一份"房号对照"文字图例，
   真正的图走 /api/img/map/<packid>-map。 */
/* 文字图例：只说明"哪个房间在哪一区"，位置以图上的方块为准，不再代替地图。 */
function mapLegend(floorId) {
  const L = mapLayout(floorId);
  if (!L) return "";
  let n = 0;
  return '<div class="maplegend">' + L.groups.map((g) => {
    const items = g.nodes.map((nd) => { n++; return '<span class="mln"><b class="mlnum">' + n + "</b>" + esc(nd.name) + "</span>"; }).join("");
    return '<div class="mlg"><span class="mlz">' + esc(g.zone) + "</span>" +
      (g.note ? '<span class="mlnote">' + esc(g.note) + "</span>" : "") + items + "</div>";
  }).join("") + '<div class="mlplan">图上带圈的数字与这里一一对应；方块大的是主屋，小的是偏房与院子。</div>' + "</div>";
}


/* ------------------------------------------------------------
   公知平面图（需求 1）：简笔画地图
   ------------------------------------------------------------
   AI 画的平面图和剧本里的分区坐标对不上，房间名会落错地方；
   纯文字地图又完全不像地图。这里折中：由剧本的 layout（areas + slots）
   直接算出每个房间的方格，前端用 SVG 画成简笔画（墙线、门、走廊、
   院子/大道），房间名压在格子正中。文字描述只作为辅助图例放在图下面，
   说明每个房间在哪一块区域，不再用来代替地图。 */

/** 把 layout.slots 折算成画布坐标：x=((col-1)%3)*30，y=(Math.floor((col-1)/3)*30)+(row-1)*100，w=30，h=26 */
function mapFloors() {
  const m = (S && S.case && S.case.map) || null;
  if (!m) return [];
  const raws = Array.isArray(m.floors) && m.floors.length ? m.floors : [{ id: "1", name: "一楼", groups: m.groups || [] }];
  const floors = [];
  for (const fl of raws) {
    const groups = (Array.isArray(fl.groups) ? fl.groups : []).filter((g) => g && (g.nodes || []).length);
    const gs = groups.map((g, gi) => {
      const nodes = (g.nodes || []).map((n) => {
        const y = Number(n.y) || 0, x = Number(n.x) || 0;
        const w = Number(n.w) || 21, h = Number(n.h) || 27;
        return { id: n.id, name: n.name || n.short || "", x: x, y: y, w: w, h: h };
      });
      let band = g.band && typeof g.band.y === "number" ? { y: g.band.y, h: g.band.h } : null;
      if (!band && nodes.length) {
        const t = Math.min.apply(null, nodes.map((n) => n.y)), bo = Math.max.apply(null, nodes.map((n) => n.y + n.h));
        band = { y: t - 6, h: bo - t + 12 };
      }
      return { zone: g.zone || ("区域 " + (gi + 1)), note: g.note || "", band: band, nodes: nodes };
    });
    if (!gs.length) continue;
    let maxY = 0, maxX = 0;
    for (const g of gs) for (const n of g.nodes) {
      if (n.y + n.h > maxY) maxY = n.y + n.h;
      if (n.x + n.w > maxX) maxX = n.x + n.w;
    }
    const W = Math.max(100, maxX + 6), H = Math.max(maxY + 22, 60);
    floors.push({
      id: String(fl.id != null ? fl.id : "1"), name: fl.name || "一楼", groups: gs,
      plan: m.plan || "", title: m.title || "公知平面图", multi: !!m.multi,
      stairs: Array.isArray(m.stairs) ? m.stairs : [], W: W, H: H,
    });
  }
  return floors;
}
function mapLayout(floorId) {
  const floors = mapFloors();
  if (!floors.length) return null;
  if (floorId == null) return floors[0];
  return floors.find((f) => String(f.id) === String(floorId)) || floors[0];
}


/** 一张简笔画平面图：淡黄纸底 + 手绘感的墙线 + 每间房一个方框 + 名字压在正中 */
function mapSVG(big, floorId) {
  const L = mapLayout(floorId);
  if (!L) return '<div class="dim">地图数据未生成。</div>';
  const fs1 = big ? 3.1 : 2.2;
  const fs2 = big ? 2.4 : 1.7;
  const sw = big ? 0.34 : 0.26;
  const gid = "mmgrain" + (big ? "b" : "s") + String(L.id || "").replace(/[^a-zA-Z0-9_]/g, "") || "x";
  const out = [];
  out.push('<svg class="mappaper' + (big ? " big" : "") + '" viewBox="0 0 ' + L.W + " " + L.H + '" preserveAspectRatio="xMidYMid meet" role="img">');
  out.push('<defs><pattern id="' + gid + '" width="6" height="6" patternUnits="userSpaceOnUse">' +
    '<path d="M0 3H6" stroke="rgba(120,96,58,.16)" stroke-width="0.14"/></pattern></defs>');
  out.push('<rect x="0" y="0" width="' + L.W + '" height="' + L.H + '" fill="#f6efdd"/>');
  out.push('<rect x="0" y="0" width="' + L.W + '" height="' + L.H + '" fill="url(#' + gid + ')"/>');
  out.push('<rect x="2" y="2" width="' + (L.W - 4) + '" height="' + (L.H - 4) + '" fill="none" stroke="#6b5334" stroke-width="' + (sw * 2.2) + '" rx="1.5"/>');
  out.push('<rect x="3.6" y="3.6" width="' + (L.W - 7.2) + '" height="' + (L.H - 7.2) + '" fill="none" stroke="#8d7350" stroke-width="' + (sw * 0.8) + '" rx="1"/>');

  let N = 0;
  L.groups.forEach((g, gi) => {
    const top = g.band ? g.band.y : Math.min.apply(null, g.nodes.map((n) => n.y)) - 4.5;
    const bot = g.band ? g.band.y + g.band.h : Math.max.apply(null, g.nodes.map((n) => n.y + n.h)) + 4.5;
    out.push('<rect class="mzone" x="6" y="' + top.toFixed(2) + '" width="' + (L.W - 12) + '" height="' +
      (bot - top).toFixed(2) + '" rx="1.2" fill="none" stroke="#b59a6d" stroke-width="' + (sw * 0.7) +
      '" stroke-dasharray="2 1.6"/>');
    out.push('<text class="mzonetx" x="' + (L.W - 4) + '" y="' + (top + fs2 + 0.4).toFixed(2) + '" text-anchor="end" font-size="' + fs2 +
      '" fill="#9a7b45">' + esc(g.zone) + (g.note ? " · " + esc(g.note) : "") + "</text>");
    if (gi < L.groups.length - 1) {
      const nxt = L.groups[gi + 1].band ? L.groups[gi + 1].band.y : Math.min.apply(null, L.groups[gi + 1].nodes.map((n) => n.y)) - 4.5;
      const cy = bot + (nxt - bot) / 2;
      if (cy - bot > 1.5) {
        out.push('<line x1="6" y1="' + cy.toFixed(2) + '" x2="' + (L.W - 6) + '" y2="' + cy.toFixed(2) +
          '" stroke="#c8b48c" stroke-width="1.5" stroke-dasharray="3 1.2"/>');
      }
    }
    g.nodes.forEach((n) => {
      N++;
      const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
      out.push('<rect class="mroom" x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h +
        '" fill="#fffaf0" stroke="#4a3a24" stroke-width="' + sw + '" rx="1"/>');
      out.push('<line x1="' + (n.x + 3.5) + '" y1="' + (n.y + 3.2) + '" x2="' + (n.x + n.w - 3.5) + '" y2="' + (n.y + 3.2) +
        '" stroke="#c9b795" stroke-width="' + (sw * 0.7) + '"/>');
      out.push('<line x1="' + (n.x + 3.5) + '" y1="' + (n.y + n.h - 3.2) + '" x2="' + (n.x + n.w - 3.5) + '" y2="' + (n.y + n.h - 3.2) +
        '" stroke="#c9b795" stroke-width="' + (sw * 0.7) + '"/>');
      // 门：房间底边的门洞
      out.push('<line x1="' + (cx - 3.4) + '" y1="' + (n.y + n.h - 0.8) + '" x2="' + (cx - 3.4) + '" y2="' + (n.y + n.h) +
        '" stroke="#4a3a24" stroke-width="' + (sw * 1.5) + '"/>');
      out.push('<line x1="' + (cx + 3.4) + '" y1="' + (n.y + n.h - 0.8) + '" x2="' + (cx + 3.4) + '" y2="' + (n.y + n.h) +
        '" stroke="#4a3a24" stroke-width="' + (sw * 1.5) + '"/>');
      out.push('<line x1="' + (cx - 3.4) + '" y1="' + (n.y + n.h - 0.8) + '" x2="' + (cx + 3.4) + '" y2="' + (n.y + n.h - 0.8) +
        '" stroke="#4a3a24" stroke-width="' + (sw * 0.5) + '"/>');
      // 窗：房间顶部两扇小窗
      for (const wx of [n.x + 3, n.x + n.w - 8.5]) {
        out.push('<rect class="mwindow" x="' + wx + '" y="' + (n.y + 1.2) + '" width="5.5" height="2.1" fill="#f6efdd" stroke="#4a3a24" stroke-width="' + (sw * 0.7) + '"/>');
        out.push('<line x1="' + wx + '" y1="' + (n.y + 2.2) + '" x2="' + (wx + 5.5) + '" y2="' + (n.y + 2.2) +
          '" stroke="#b59a6d" stroke-width="' + (sw * 0.45) + '"/>');
      }
      out.push('<text class="mnum" x="' + cx + '" y="' + (cy - fs1 * 0.75).toFixed(2) + '" text-anchor="middle" font-size="' + (fs1 * 0.8) +
        '" fill="#a98a52">' + N + "</text>");
      out.push('<text class="mname" x="' + cx + '" y="' + (cy + fs1 * 0.95).toFixed(2) + '" text-anchor="middle" font-size="' + fs1 +
        '" fill="#2f2417">' + esc(n.name) + "</text>");
    });
  });
  if (L.multi || L.stairs.length) {
    const stair = L.stairs.find((s) => String(s.floor == null ? 1 : s.floor) === String(L.id));
    const has = stair || L.multi;
    if (has) {
      const sx = stair && Number(stair.x) != null ? Number(stair.x) : L.W - 14;
      const sy = stair && Number(stair.y) != null ? Number(stair.y) : L.H - 16;
      out.push('<g class="mstairs">');
      out.push('<rect x="' + sx + '" y="' + sy + '" width="7" height="9" fill="#fffaf0" stroke="#4a3a24" stroke-width="' + (sw * 0.8) + '" rx="0.6"/>');
      out.push('<line x1="' + (sx + 1) + '" y1="' + (sy + 3) + '" x2="' + (sx + 6) + '" y2="' + (sy + 3) + '" stroke="#8d7350" stroke-width="' + (sw * 0.5) + '"/>');
      out.push('<line x1="' + (sx + 1) + '" y1="' + (sy + 5.2) + '" x2="' + (sx + 6) + '" y2="' + (sy + 5.2) + '" stroke="#8d7350" stroke-width="' + (sw * 0.5) + '"/>');
      out.push('<line x1="' + (sx + 1) + '" y1="' + (sy + 7.2) + '" x2="' + (sx + 6) + '" y2="' + (sy + 7.2) + '" stroke="#8d7350" stroke-width="' + (sw * 0.5) + '"/>');
      out.push('<text x="' + (sx + 9) + '" y="' + (sy + 6.5) + '" font-size="' + fs2 + '" fill="#9a7b45">楼梯</text>');
      out.push('</g>');
    }
  }
  out.push('<text class="mcaption" x="6" y="' + (L.H - 1.2) + '" font-size="' + fs2 + '" fill="#9a7b45">' +
    esc(L.plan || "同一屋檐下的平面布置，房号对应下方图例。") + "</text>");
  out.push("</svg>");
  return out.join("");
}


function currentMapItems() {
  const m = (S && S.case && S.case.map) || {};
  const arr = Array.isArray(m.images) && m.images.length ? m.images : (m.image ? [{ image: m.image, label: m.mapLabel || "公知地图", title: m.title || "公知地图" }] : []);
  return arr;
}

function selectedMap() {
  const arr = currentMapItems();
  if (!arr.length) return null;
  if (!Number.isInteger(mapIdx)) mapIdx = 0;
  mapIdx = ((mapIdx % arr.length) + arr.length) % arr.length;
  return arr[mapIdx];
}

function mapHTML() {
  const m = (S && S.case && S.case.map) || {};
  const maps = currentMapItems();
  if (!maps.length) {
    const pid = (S && S.case && S.case.id) || "sangeng";
    return '<div class="publicmapwrap">' +
      '<div class="maptitle">' + esc(m.title || "公知地图") + "</div>" +
      '<div class="maphint">把外部修好的地图放进 <code>maps/</code> 目录，按 <code>' + esc(pid + "-map.png") + '</code> 或 <code>' + esc(pid + "-map-1.png") + '</code> 命名，刷新后这里会直接显示。当前支持 png / jpg / jpeg / webp / gif / avif。</div>' +
    "</div>";
  }
  const cards = maps.map((item, i) =>
    '<button class="mapthumb" type="button" data-act="openmap" data-map="' + i + '" title="点开查看 ' + esc(item.label || "地图 " + (i + 1)) + '">' +
      '<img class="mapimg" src="' + esc(item.image) + '" alt="' + esc(item.label || "地图 " + (i + 1)) + '"/>' +
      '<span class="maplabel">' + esc(item.label || "地图 " + (i + 1)) + "</span>" +
    "</button>"
  ).join("");
  return '<div class="publicmapwrap">' +
    '<div class="maptitle">' + esc(m.title || "公知地图") + "</div>" +
    '<div class="mapthumbs">' + cards + "</div>" +
    '<div class="maphint">' + (maps.length > 1 ? "点任意一张可看大图；替换 maps/ 下同名图片后刷新即可生效。" : "点图可看大图；外部替换 maps/ 下的同名图片后刷新即可生效。") + "</div>" +
  "</div>";
}


function mapModal() {
  const m = (S && S.case && S.case.map) || {};
  const maps = currentMapItems();
  if (!maps.length) return '<div class="modal" data-stop="1"><div class="box mapmodal"><h3>还没有外部地图</h3><div class="maphint">把图片命名为 剧本ID-map.png 或 剧本ID-map-1.png 后放进 maps/ 目录即可。</div></div></div>';
  const cur = selectedMap() || maps[0];
  const idx = Math.max(0, Math.min(mapIdx, maps.length - 1));
  const nav = maps.length > 1
    ? '<div class="mapnav">' +
        '<button class="btn sm ghost" type="button" data-act="mapcycle" data-dir="-1" title="上一张">上一张</button>' +
        '<span class="mapcount">' + esc(cur.label || "地图 " + (idx + 1)) + " · " + (idx + 1) + " / " + maps.length + "</span>" +
        '<button class="btn sm ghost" type="button" data-act="mapcycle" data-dir="1" title="下一张">下一张</button>' +
      "</div>"
    : "";
  return '<div class="modal" data-stop="1"><div class="box mapmodal">' +
    '<div class="row" style="justify-content:space-between;align-items:center">' +
      '<h3 style="margin:0">' + esc(m.title || "公知地图") + "</h3>" +
      '<button class="btn sm ghost" type="button" data-act="closeMap">收起</button>' +
    "</div>" +
    '<div class="mapfull"><img class="mapimg" src="' + esc(cur.image) + '" alt="' + esc(cur.label || "地图 " + (idx + 1)) + '"/></div>' +
    nav +
  "</div></div>";
}


/* 需求 2：点开玩家列表，能看到每个玩家自己的名字和他选的剧本角色。 */
function playerListModal() {
  const ps = (S && S.players) || [];
  const rows = ps.map((p) => {
    const c = (S && S.chars || []).find((x) => x.id === p.charId);
    return (
      '<div class="plrow" data-pid="' + esc(p.id) + '">' +
        avatarOf(p.charId, c && c.color, c && c.avatar, "pav sm") +
        '<div class="plinfo">' +
          '<div class="pln">' + esc(p.name) + (p.isMe ? ' <span class="tag gold">我</span>' : "") + "</div>" +
          '<div class="dim">' + (c ? esc(c.name) + " · " + esc(c.role) : "尚未选择角色") + "</div>" +
        "</div>" +
      "</div>"
    );
  }).join("");
  return '<div class="modal" data-stop="1"><div class="box playersmodal">' +
    '<div class="row" style="justify-content:space-between;align-items:center">' +
      '<h3 style="margin:0">玩家列表</h3>' +
      '<button class="btn sm ghost" data-act="closePlayers">收起</button>' +
    "</div>" +
    '<div class="pllist">' + (rows || '<div class="dim">还没有玩家。</div>') + "</div>" +
  "</div></div>";
}

function screenBriefing() {
  const sc = S.me.script;
  if (!sc) return '<div class="screen">' + phaseHead() + '<div class="card">你还没有选择角色。</div></div>';
  const tabs = SCRIPT_TABS;
  const body = scriptBody(sc);
  return (
    '<div class="screen">' +
      phaseHead() +
      '<div class="card" style="border-color:' + sc.color + '55">' +
        '<div class="row" style="gap:14px">' +
          avatarOf(sc.id, sc.color, sc.avatar, "pav big") +
          "<div>" +
            '<div class="serif" style="font-size:23px">' + esc(sc.name) + "</div>" +
            '<div class="dim">' + esc(sc.role) + "　" + sc.gender + "　" + sc.age + " 岁　·　住" + esc(sc.room) + "</div>" +
          "</div>" +
          '<div class="spacer"></div>' +
          (sc.isKiller ? '<span class="tag red">凶手</span>' : "") +
        "</div>" +
      "</div>" +
      '<div class="card">' +
        "<h3>对所有人公开的你好</h3>" +
        '<div class="scriptbody muted">' + fmt(sc.publicInfo) + "</div>" +
      "</div>" +
      '<div class="card">' +
        "<h3>你的剧本</h3>" +
        '<div class="scripttabs">' +
          tabs.map((t) => '<button class="stab ' + (scriptTab === t[0] ? "on" : "") + '" data-act="stab" data-tab="' + t[0] + '">' + t[1] + "</button>").join("") +
        "</div>" +
        '<div class="scriptbody">' + fmtScript(body) + (scriptTab === "common" ? mapHTML() : "") + "</div>" +
      "</div>" +
      '<div class="card">' +
        '<div class="row">' +
          '<button class="btn ' + (S.me.ready ? "" : "pri") + '" data-act="ready" data-value="' + (S.me.ready ? "0" : "1") + '">' +
            (S.me.ready ? "我已经读完了 ✓" : "我读完了，准备好了") +
          "</button>" +
          '<span class="dim">' + S.players.filter((p) => p.ready).length + " / " + S.players.length + " 人已读完</span>" +
        "</div>" +
        hostBar() +
      "</div>" +
    "</div>"
  );
}

/* ---------------- 自我介绍 ---------------- */
function screenIntro() {
  // 需求 3：这一轮不再让人「写下自我介绍」，也不再列「其他人说了什么」——
  // 自我介绍就是面对面说，页面上只留准备按钮和房主推进。
  return (
    '<div class="screen">' +
      phaseHead() +
      '<div class="card">' +
        '<div class="row">' +
          '<button class="btn ' + (S.me.ready ? "" : "pri") + '" data-act="ready" data-value="' + (S.me.ready ? "0" : "1") + '">' +
            (S.me.ready ? "我说完了 ✓" : "我说完了") +
          "</button>" +
          '<span class="dim">' + S.players.filter((p) => p.ready).length + " / " + S.players.length + " 人已发言</span>" +
        "</div>" +
        hostBar() +
      "</div>" +
    "</div>"
  );
}

/* ---------------- 搜证 ---------------- */
/* ---------------- 搜证（★ 修复 1） ----------------
   一次只发一个搜索请求。公网隧道下点一下要等一两秒，人很自然地会再点两下；
   以前那样会连着发好几个请求 —— 行动点被多扣、线索被多翻，就是"只有 4 点却搜出 5 条"的来源。
   这里用一个全局开关：请求没回来之前，所有搜证按钮都是 disabled，并且显示"搜索中…"。
   服务器那边还有一本 apUsed 账兜底（见 server.mjs 的 search）。 */
async function doSearch(locId) {
  if (!locId) return;
  if (searchBusy) return;                                  // 已经在搜了，连点无效
  if (!S || !S.me) return;
  if (["search1", "search2"].indexOf(S.room.phase) < 0) return;
  if (S.me.ap <= 0) { toast("行动点已经用完了。", "bad"); return; }
  // ★ 需求 2：点下去就当场扣一点、当场把行动点画出来（公网下不用等两三秒的回包）。
  //   服务器只认自己那本账（player.ap + room.apUsed），回包会把真实数字拉回来；
  //   如果这一次是"这里已经翻干净了、不扣点"，再把乐观扣的这一点退回去。
  const prevAp = S.me.ap;
  S.me.ap = Math.max(0, prevAp - 1);
  searchBusy = true;
  render();
  try {
    const r = await act("search", { location: locId });
    if (!r || !r.ok || r.stale || r.empty) {
      if (S && S.me) S.me.ap = prevAp;                     // 没真扣点：把画出来的那一点退回去
    }
  } finally {
    searchBusy = false;
    render();
  }
}

/* ---------------- 答题（★ 修复 2） ----------------
   ① 再点一次已经选中的选项 = 什么都不发生（不发请求，也绝不会变成"取消选择"）；
   ② 先把选中态就地点亮再发请求 —— 公网下不用等两三秒才看到自己选了什么；
   ③ 每道题一条串行队列：连点 A→B 时以最后一次点击为准，慢到的旧请求盖不回去。 */
function doAnswer(qid, key) {
  if (!qid || !key || !S || !S.quiz || S.quiz.submitted) return;
  const item = (S.quiz.questions || []).find((x) => x.id === qid);
  if (item && item.myChoice === key) return;               // 再点已选项：不取消、不发请求
  if (item) {
    item.myChoice = key;
    S.quiz.answeredCount = (S.quiz.questions || []).filter((x) => x.myChoice).length;
  }
  // ★ 本轮修复 2：先登记"我想选这个"，再就地重绘（切换是零等待的），最后才发请求。
  qWant[qid] = key;
  render();
  sendAnswer(qid, key);
}

/* ★ 本轮修复 2：每次点击立刻发，不再排队等上一次回包。
   以前每道题一条串行队列（点 B 要等 A 的回包回来才发 B），公网下一次往返两三秒，
   连点 A→B→C 就变成了排队执行；现在三个请求一起飞出去，服务器按 seq 只认最后一个
   （actSeqKey("quizAnswer") = "q:<qid>"，旧的返回 stale，不会覆盖新的）。
   回包晚了也无所谓：qWant 里已经是最后那次点击，画面不会被中途到达的帧改回去。 */
async function sendAnswer(qid, key) {
  const r = await act("quizAnswer", { qid: qid, choice: key });
  if (qWant[qid] !== key) return;      // 这期间又点了别的：等那一次的结论
  if (r && r.stale) { delete qWant[qid]; return; }        // 服务器说这次太旧了，以服务器为准
  if (r && r.ok) { delete qWant[qid]; return; }           // 服务器已经照做（或本来就是它）
  if (r && !r.ok) {
    // 服务器明确拒绝（交卷了 / 阶段变了 / 不是你的题）：撤掉本地这一笔，让它显示真话
    if (!/连接不上/.test(String(r.error || ""))) delete qWant[qid];
    return;
  }
  // r 为空 = 网络断了：本地这一笔先留着，等重连后那一帧自己校正
}

function screenSearch() {
  // 需求 6：第一轮只开人物房间，第二轮只开公共场景。不在本轮的地点干脆不摆出来。
  const inPhase = S.locations.filter((l) => l.inPhase);
  const others = S.locations.filter((l) => !l.inPhase);
  const locCard = (l) => {
    // 需求 9：自己的房间 / 随身物品一律置灰，点不了，并写明原因
    // ★ 修复 1：搜索请求还在路上时，所有地点的按钮一起锁住并改成"搜索中…"，
    //   连点 / 多开标签页都发不出第二个请求——行动点就不会被多扣，也不会出现"4 点搜了 5 条"。
    const why = searchBusy ? "搜索中…" : (l.isOwn ? "不能搜自己的线索" : (l.exhausted ? "已经翻遍了" : (S.me.ap > 0 ? "搜查（1 行动点）" : "没有行动点了")));
    return (
      '<div class="loc ' + (l.exhausted ? "dead" : "") + (l.isOwn ? " own" : "") + '">' +
        shot("loc", l.id, "lochd") +
        '<div class="lt">' + esc(l.name) + "</div>" +
        '<div class="lc">' + esc(l.desc) + "</div>" +
        // 本轮要求 1：地点卡既不写"还剩几条"，也不写"已被搜过几次"
        '<div class="row" style="margin-top:11px">' +
          '<button class="btn sm' + (searchBusy ? " busy" : "") + '" data-act="search" data-loc="' + l.id + '" ' + (searchBusy || !l.canSearch ? "disabled" : "") + ">" + why + "</button>" +
        "</div>" +
        (l.isOwn ? '<div class="ownhint">这是你自己的房间（包括你的随身物品）——不能搜自己的线索。</div>' : "") +
      "</div>"
    );
  };
  const locs = inPhase.map(locCard).join("");

  return (
    '<div class="screen" style="max-width:920px">' +
      phaseHead() +
      '<div class="card">' +
        '<div class="row">' +
          '<div><span class="dim">你的行动点</span> <span style="font-size:19px;letter-spacing:3px">' + pips(S.me.ap, S.me.maxAp) + '</span> <span class="dim">' + S.me.ap + " / " + S.me.maxAp + "</span></div>" +
          '<div class="spacer"></div>' +
          (searchBusy ? '<span class="dim">正在搜查……</span>' : "") +
        "</div>" +
        // ★ 本轮修复 1：把"用掉几点 / 摸出几条"并排摆出来（两个数都由服务器同一份记账算），
        //   一眼就能看出行动点有没有被多扣——多扣了，这里立刻对不上。
        '<div class="dim" style="margin-top:8px">这一轮已经用掉 <b style="color:var(--gold2)">' + (S.me.apUsed || 0) +
        '</b> 点行动点 · 摸出 <b style="color:var(--gold2)">' + (S.me.roundFound || 0) + "</b> 条线索</div>" +
      "</div>" +
      '<div class="card">' +
        "<h3>去哪里搜</h3>" +
        '<div class="dim" style="margin-bottom:12px">' +
          (S.room.phase === "search1"
            ? "第一轮搜的是<b>人</b>：剧本里每个人的房间（4 人本 4 间、6 人本 6 间），谁都能翻，唯独你自己的不行。"
            : "第二轮搜的是<b>地方</b>：案发现场、大厅、厨房、阁楼……这一轮没人拦得住你。") +
          "同一个地点被搜的次数越多，越深的东西才会露出来，别人搜的次数也算数。</div>" +
        '<div class="locs">' + locs + "</div>" +
        (others.length
          ? '<div class="dim" style="margin-top:12px">' + (S.room.phase === "search1" ? "第二轮才会开放的公共场景：" : "第一轮的人物房间（已经过去了）：") +
            others.map((l) => esc(l.name)).join("、") + "</div>"
          : "") +
      "</div>" +
      "" +
      '<div class="card">' + hostBar() + "</div>" +
    "</div>"
  );
}

/* ---- 线索按地点分栏，可以折起来 ---- */
function groupBy(list, keyOf, nameOf) {
  const out = [];
  const idx = {};
  list.forEach((c) => {
    const k = keyOf(c);
    if (!idx[k]) { idx[k] = { key: k, name: nameOf(c), items: [] }; out.push(idx[k]); }
    idx[k].items.push(c);
  });
  return out;
}
function foldGroup(key, name, count, inner) {
  const closed = !!folds[key];
  return (
    '<div class="cgroup">' +
      '<button class="ghead" data-act="fold" data-key="' + esc(key) + '">' +
        '<span class="gname">' + esc(name) + "</span>" +
        '<span class="dim">' + count + " 条</span>" +
        '<span class="gcaret">' + (closed ? "▸" : "▾") + "</span>" +
      "</button>" +
      (closed ? "" : '<div class="gbody">' + inner + "</div>") +
    "</div>"
  );
}
// 需求 10：揭晓页的"票型 / 我的答题"用这种可折叠的盒子
function foldBox(key, title, countText, inner) {
  const closed = !!folds[key];
  return (
    '<div class="cgroup">' +
      '<button class="ghead" data-act="fold" data-key="' + esc(key) + '">' +
        '<span class="gname">' + esc(title) + "</span>" +
        '<span class="dim">' + esc(countText) + "</span>" +
        '<span class="gcaret">' + (closed ? "▸" : "▾") + "</span>" +
      "</button>" +
      (closed ? "" : '<div class="gbody">' + inner + "</div>") +
    "</div>"
  );
}
function clueGroups(list, opts) {
  return groupBy(list, (c) => "l:" + (c.location || c.locationName || "_"), (c) => c.locationName || c.location || "其它")
    .map((g) => foldGroup(g.key, g.name, g.items.length, g.items.map((c) => clueCard(c, opts)).join("")))
    .join("");
}
function myCluesBlock() {
  if (!S.myClues.length) return "";
  return (
    '<div class="card">' +
      "<h3>我的线索（" + S.myClues.length + "）</h3>" +
      '<div class="dim" style="margin-bottom:12px">你亲手翻出来的线索都在这里，按地点分好了。' +
      "除了尸体上的那一条（一开始就摊在所有人面前），其余每一条你都攥在自己手里，" +
      '点<b>公开</b>才会进「公开线索」，所有人都能引用。' +
      (S.myClues.filter((c) => c.canPublish).length
        ? "　现在还有 " + S.myClues.filter((c) => c.canPublish).length + " 条还没公开。"
        : "") + "</div>" +
      clueGroups(S.myClues) +
    "</div>"
  );
}

function clueCard(c, opts) {
  const o = opts || {};
  const isPriv = c.visibility ? c.visibility === "private" : !o.board;
  const cq = String(clueSearch == null ? "" : clueSearch).trim();
  return (
    '<div class="clue ' + (isPriv ? "priv" : "") + (c.isFake ? " fake" : "") + '">' +
      '<div class="ct">' + markHit(c.title, cq) +
        '<span class="dim" style="font-weight:400;font-size:12px">　' + (isPriv ? "私密" : "公开") +
        (c.locationName ? "　·　" + esc(c.locationName) : "") + "</span>" +
      "</div>" +
      '<div class="cx">' + fmtHit(c.text, cq) + "</div>" +
      "" +
      '<div class="cf">' +
        (o.board ? "由 " + esc(c.byName) + " 发现" : (c.mine === false || c.isCorpse ? (c.isCorpse ? "尸体上的线索 · 全场公开" : "已知") : "你发现的")) +
        (c.canPublish
          ? '　<button class="btn sm" data-act="publish" data-clue="' + c.id + '">公开</button>'
          : "") +
        (isPriv && c.published ? '　<span class="tag gold">已公开</span>' : "") +
        (!c.canPublish && !c.published && isPriv && c.keptPrivate ? '　<span class="tag">不公开</span>' : "") +
        (c.isCorpse ? '　<span class="tag gold">尸体线索 · 强制公开</span>' : "") +
      "</div>" +
    "</div>"
  );
}

/* ---------------- 圆桌讨论 ---------------- */
function roundTablePreview() {
  const q = S.quiz;
  const quizBlocks = (q && q.questions || []).map((item, i) =>
    '<div class="q preview">' +
      '<div class="qt">' + (item.q ? esc(item.q) : "第 " + (i + 1) + " 题") + "</div>" +
      item.options.map((o) => '<div class="opt preview"><div class="k">' + esc(o.key) + '</div><div class="v">' + esc(o.text) + "</div></div>").join("") +
    "</div>"
  ).join("");
  const killers = (S.players || []).map((p) =>
    '<div class="vopt preview">' +
      avatarOf(p.charId, p.color, (p.charName || p.name || "?")[0], "pav mini", pavAttr(p)) +
      '<span style="color:' + p.color + ';font-weight:700">' + esc(p.charName || p.name) + "</span>" +
    "</div>"
  ).join("");
  return (
    '<div class="card">' +
      "<h3>圆桌问题</h3>" +
      '<div class="note">下面把问答题的选项和投票对象提前摊开——凭讨论时对质的线索与证词来判断。问答和投票阶段再直接作答。</div>' +
      (quizBlocks ? '<div class="dim" style="margin:14px 0 8px">推理问答（题目与选项，问答阶段再作答）</div>' + quizBlocks : "") +
      '<div class="dim" style="margin:16px 0 8px">投票（提前看对象）</div>' +
      '<div class="vgroup"><div class="vt">谁是凶手？</div><div class="vopts">' + (killers || '<span class="dim">暂无玩家</span>') + "</div></div>" +
    "</div>"
  );
}
function screenTalk() {
  return (
    '<div class="screen" style="max-width:920px">' +
      phaseHead() +
      roundTablePreview() +
      '<div class="card">' +
        '<div class="note">把「公开线索」里的东西拿出来对质，逼别人解释他们的时间线。你也可以撒谎、隐瞒、甩锅。</div>' +
        '<div class="row" style="margin-top:11px">' +
          '<button class="btn mobonly" data-act="side">打开讨论区</button>' +
        "</div>" +
      "</div>" +
      '<div class="card">' + hostBar() + "</div>" +
    "</div>"
  );
}

/* ---------------- 推理问答 ---------------- */
function screenQuiz() {
  const q = S.quiz;
  return (
    '<div class="screen" style="max-width:920px">' +
      phaseHead() +
      '<div class="card">' +
        '<div class="row">' +
          '<span class="dim">已作答</span> <b>' + q.answeredCount + " / " + q.total + "</b>" +
          '<div class="spacer"></div>' +
          '<span class="dim">全场 ' + q.submittedCount + " / " + S.players.length + " 人已交卷</span>" +
        "</div>" +
        '<div class="dim" style="margin-top:8px">交卷之前答案随便改，点选项就换。所有人都交卷之后会自动进入投票。</div>' +
      "</div>" +
      q.questions.map((item) => {
        let opts = "";
        item.options.forEach((o) => {
          let cls = "opt";
          if (item.myChoice === o.key) cls += " sel";
          if (item.answer) {
            if (o.key === item.answer) cls += " right";
            else if (item.myChoice === o.key) cls += " wrong";
          }
          opts +=
            '<div class="' + cls + '" data-act="answer" data-q="' + item.id + '" data-k="' + o.key + '"' + (q.submitted ? ' style="cursor:default"' : "") + ">" +
              '<div class="k">' + o.key + "</div>" +
              '<div class="v">' + esc(o.text) + "</div>" +
              (item.answer && o.key === item.answer ? '<div class="mk tag green">正确答案</div>' : "") +
              (item.answer && item.myChoice === o.key && o.key !== item.answer ? '<div class="mk tag red">你选的</div>' : "") +
            "</div>";
        });
        return (
          '<div class="q">' +
            (item.q ? '<div class="qt">' + esc(item.q) + "</div>" : '<div class="qt dim">第 ' + (q.questions.indexOf(item) + 1) + " 题</div>") +
            opts +
            (item.explain ? '<div class="note good" style="margin-top:9px">' + fmt(item.explain) + "</div>" : "") +
          "</div>"
        );
      }).join("") +
      '<div class="card">' +
        (q.submitted
          ? '<div class="note good">你已经交卷了，答案不能再改。等其他人交卷——全部交完会自动进入投票。</div>'
          : '<div class="row"><button class="btn pri" data-act="submitQuiz" ' + (q.answeredCount >= q.total ? "" : "disabled") + ">提交答卷</button>" +
            '<span class="dim">' + (q.answeredCount >= q.total ? "全部答完了，交卷之后就不能再改。" : "还有 " + (q.total - q.answeredCount) + " 道题没答。") + "</span></div>") +
        hostBar() +
      "</div>" +
    "</div>"
  );
}

/* ---------------- 投票 ---------------- */
function screenVote() {
  const v = S.vote;
  const done = !!v.myVote;
  const sel = done ? v.myVote : voteSel;

  const killers = S.players.map((p) =>
    '<button class="vopt ' + (sel.killer === p.id ? "sel" : "") + '" data-act="vk" data-id="' + p.id + '" ' + (done ? "disabled" : "") + ">" +
      avatarOf(p.charId, p.color, (p.charName || p.name || "?")[0], "pav mini") +
      '<span style="color:' + p.color + ';font-weight:700">' + esc(p.charName || p.name) + "</span>" +
    "</button>"
  ).join("");

  return (
    '<div class="screen" style="max-width:920px">' +
      phaseHead() +
      '<div class="card">' +
        '<div class="row"><span class="dim">已投票</span> <b>' + v.doneCount + " / " + S.players.length + "</b>" +
        '<div class="spacer"></div><span class="dim">投票内容是匿名的</span></div>' +
        '<div class="note" style="margin-top:10px">计分：每答对一题 +1 分；非真凶玩家投中真凶 +3 分；真凶得票不到整体票数的一半就算逃脱成功，+6 分。</div>' +
      "</div>" +
      '<div class="card">' +
        '<div class="vgroup"><div class="vt">谁是凶手？</div><div class="vopts">' + killers + "</div></div>" +
        (done
          ? '<div class="note good">你已经投过票了。等其他人投完，房主会揭晓真相。</div>'
          : '<button class="btn pri wide" data-act="submitVote" ' + (sel.killer && !voteBusy ? "" : "disabled") + ">" +
            (voteBusy ? "正在提交……" : "提交我的指认") + "</button>") +
      "</div>" +
      '<div class="card">' + hostBar() + "</div>" +
    "</div>"
  );
}

/* ---------------- 揭晓 ---------------- */
function screenReveal() {
  const r = S.reveal;
  if (!r) return '<div class="screen">' + phaseHead() + '<div class="card">正在整理真相……</div></div>';
  const t = r.truth;
  const sc = r.scores;
  const killer = r.killerCharName || "";                     // 需求 9：真凶由服务器给，前端不再写死
  const myVote = (r.votes || []).find((v) => v.isMe) || null;
  const quiz = r.quiz || { questions: [], mine: [], correctCount: 0, total: 0 };
  const mineByQ = {};
  (quiz.mine || []).forEach((m) => { mineByQ[m.id] = m; });

  // 需求 10：整张票型——谁投给了谁（可折叠）
  const voteRows = (r.votes || []).map((v) =>
    '<div class="vrow' + (v.correct ? " ok" : "") + '">' +
      avatarOf(v.charId, v.color, (v.charName || "?")[0], "pav sm") +
      '<div class="vwho"><b style="color:' + v.color + '">' + esc(v.charName) + "</b>" +
        '<span class="dim">　' + esc(v.name) + (v.isNPC ? "（AI）" : "") + (v.isMe ? "（你）" : "") + "</span>" +
        (v.isKiller ? ' <span class="tag red">真凶</span>' : "") + "</div>" +
      '<div class="varrow">' + (v.voted
        ? "指认了 <b>" + esc(v.votedCharName || v.votedName || "?") + "</b>" + (v.correct ? ' <span class="tag green">投中</span>' : "")
        : '<span class="dim">没有投票</span>') + "</div>" +
    "</div>").join("");

  // 需求 10：自己答对了哪些、答错了哪些（可折叠）
  const quizRows = (quiz.questions || []).map((q, i) => {
    const m = mineByQ[q.id] || { choice: null, correct: false };
    return (
      '<div class="qrow">' +
        '<div class="qq">' + (i + 1) + ". " + esc(q.q) + "</div>" +
        '<div class="qa">' + (m.choice ? "你选了 " + esc(m.choice) : '<span class="dim">没有作答</span>') +
          "　·　正确答案 <b>" + esc(q.answer) + "</b>　" +
          (m.correct ? '<span class="tag green">答对</span>' : '<span class="tag red">答错</span>') + "</div>" +
        (q.explain ? '<div class="qe dim">' + fmt(q.explain) + "</div>" : "") +
      "</div>"
    );
  }).join("");

  return (
    '<div class="screen" style="max-width:920px">' +
      '<div class="reveal-h">' +
        '<div class="k1">真 凶</div>' +
        '<div class="k2" style="color:' + esc(r.killerColor || "#c8a05a") + '">' + esc(killer) + "</div>" +
        '<div class="muted">' + esc(r.killerRole || "") + (r.killerName ? "　·　本局由 " + esc(r.killerName) + " 扮演" : "") + "</div>" +
        '<div class="row" style="justify-content:center;margin-top:14px">' +
          '<span class="tag ' + (sc.caught ? "green" : "red") + '">' + (sc.caught ? "真凶被抓住了" : "真凶逃脱成功") + "</span>" +
          '<span class="tag">真凶得票 ' + sc.killerVotes + " / " + (sc.totalVotes || 0) + "　满 " + (sc.needVotes || 0) + " 票即被抓</span>" +
        "</div>" +
      "</div>" +

      '<div class="card">' +
        "<h3>案件还原</h3>" +
        '<div class="scriptbody">' + fmt(t.summary) + "</div>" +
      "</div>" +

      '<div class="card">' +
        "<h3>完整时间线</h3>" +
        '<div class="tl">' +
          t.timeline.map((x) => {
            const hot = !!killer && (x.who === killer || x.who === t.killerId);
            return (
              '<div class="tli ' + (hot ? "hot" : "") + '">' +
                '<span class="tt">' + esc(x.t) + '</span>' +
                '<span class="tw">' + esc(x.who) + "</span>" +
                '<div class="td">' + fmt(x.what) + "</div>" +
              "</div>"
            );
          }).join("") +
        "</div>" +
      "</div>" +

      '<div class="card">' +
        "<h3>凶手是谁</h3>" +
        '<div class="scriptbody">' + fmt(t.killerLine || t.summary) + "</div>" +
        '<div class="dim" style="margin-top:10px">手法：' + esc(r.methodName || "—") + "<br />动机：" + esc(r.motiveName || "—") + "</div>" +
      "</div>" +

      // 需求 10：票型 + 自己的答题，默认折着，想看再点开
      '<div class="card">' +
        "<h3>投票详情</h3>" +
        '<div class="dim" style="margin-bottom:10px">全场 ' + (sc.totalVotes || 0) + " 张票，一目了然谁把票投给了谁。" +
          (myVote ? (myVote.voted ? "你投给了 " + esc(myVote.votedCharName || myVote.votedName || "?") + "，" + (myVote.correct ? "投中了真凶。" : "可惜没投中。") : "你这一局没有投票。") : "") +
        "</div>" +
        foldBox("r:votes", "展开这张票型", (r.votes || []).length + " 人", voteRows) +
      "</div>" +

      '<div class="card">' +
        "<h3>我的答题</h3>" +
        '<div class="dim" style="margin-bottom:10px">你答对了 ' + (quiz.correctCount || 0) + " / " + (quiz.total || 0) + " 题。别人的选择不公开，只公布正确答案。</div>" +
        foldBox("r:quiz", "展开逐题回顾", (quiz.total || 0) + " 题", quizRows) +
      "</div>" +

      '<div class="card">' +
        "<h3>谁被抓到了？</h3>" +
        '<div class="dim" style="margin-bottom:10px">每题 1 分　·　非真凶玩家投中真凶 +3 分　·　真凶逃脱成功 +6 分</div>' +
        '<div class="rank">' +
          sc.rows.map((row, i) =>
            '<div class="rk ' + (i === 0 ? "win" : "") + '">' +
              '<div class="no">' + (i + 1) + "</div>" +
              avatarOf(row.charId, row.color, (row.charName || "?")[0]) +
              '<div style="flex:1;min-width:0">' +
                '<div class="pnm">' + esc(row.charName) + ' <span class="dim">' + esc(row.name) + "</span>" +
                  (row.isKiller ? ' <span class="tag red">凶手</span>' : "") + "</div>" +
                '<div class="dt">' + row.detail.map((d) => esc(d.label) + " +" + d.pts).join("　·　") + "</div>" +
              "</div>" +
              '<div class="sc">' + row.total + "</div>" +
            "</div>"
          ).join("") +
        "</div>" +
      "</div>" +

      '<div class="card">' +
        "<h3>散场之后</h3>" +
        '<div class="scriptbody muted">' + fmt(t.epilogue) + "</div>" +
      "</div>" +

      '<div class="card">' +
        "<h3>全部线索</h3>" +
        '<div class="dim" style="margin-bottom:12px">这一局一共 ' + r.allClues.length + " 条线索，按地点分好了，看看你们漏掉了什么。</div>" +
        groupBy(r.allClues, (c) => "r:" + (c.location || "_"), (c) => c.location || "其它")
          .map((g) => foldGroup(g.key, g.name, g.items.length, g.items.map((c) =>
            '<div class="clue ' + (c.private ? "priv" : "") + '" style="' + (c.found ? "" : "opacity:.42") + '">' +
              '<div class="ct">' + esc(c.title) + '　<span class="dim" style="font-weight:400">' + "深度 " + c.depth + (c.private ? "　私密" : "") + "</span></div>" +
              '<div class="cx">' + fmt(c.text) + "</div>" +
              "" +
              '<div class="cf">' + (c.found ? "由 " + esc(c.byName) + " 发现" : "本局没有被发现") +
                (r.falsified.indexOf(c.id) >= 0 ? '　<span class="tag red">伪造的</span>' : "") +
              "</div>" +
            "</div>"
          ).join(""))
          ).join("") +
        (r.falsified.length ? '<div class="note bad" style="margin-top:12px">这一局里，' + esc(r.killerCharName || "真凶") + "（" + esc(r.forgedBy || "?") + "）往「公开线索」里投了 " + r.falsified.length + " 条伪造线索，把所有人都带偏了。</div>" : "") +
      "</div>" +

      '<div class="card">' + hostBar() + "</div>" +
    "</div>"
  );
}

/* ---------------- 侧栏 ---------------- */
function boardBlock() {
  if (!S.board.length) return '<div class="dim">公开线索里还什么都没有。</div>';
  return clueGroups(S.board, { board: true });
}

// 用户本轮要求 3、4：线索收进「线索」弹层；右侧讨论区常驻，可以公聊/私聊并可拉长。
function sidePanel() {
  const peers = S.players.filter((x) => !x.isMe);
  const thread = (S.dm || []).find((x) => x.with === dmWith) || null;
  const msgs = dmWith
    ? (thread && thread.msgs.length
        ? thread.msgs.map((m) =>
            '<div class="msgrow' + (m.mine ? " mine" : "") + '">' +
              '<div class="msg"><div class="who dim">' + (m.mine ? "你" : esc((thread && thread.charName) || "对方")) + "</div>" +
              '<div class="tx">' + fmt(m.text) + "</div></div>" +
            "</div>"
          ).join("")
        : '<div class="dim">你们还没说过话。这里说的话只有你们两个人看得到。</div>')
    : (S.chat.length
        ? S.chat.map((m) =>
            '<div class="msgrow">' +
              avatarOf(m.charId, m.color, (m.charName || m.name || "?")[0], "pav mini", ' data-act="who" data-id="' + esc(m.by) + '"') +
              '<div class="msg"><div class="who" style="color:' + m.color + '">' +
                '<span class="dmname" data-act="dm" data-id="' + esc(m.by) + '">' + esc(m.charName || m.name) + "</span>" +
                (m.isNPC ? ' <span class="tag blue">AI</span>' : "") + "</div>" +
              '<div class="tx">' + fmt(m.text) + "</div></div>" +
            "</div>"
          ).join("")
        : '<div class="dim">还没人说话。第一句由你开始。</div>');
  return (
    '<div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:9px">' +
      '<button class="btn sm ' + (dmWith ? "" : "pri") + '" data-act="dm" data-id="">公聊（所有人）</button>' +
      peers.map((x) => '<button class="btn sm ' + (dmWith === x.id ? "pri" : "") + '" data-act="dm" data-id="' + esc(x.id) + '">私聊 · ' + esc(x.charName || x.name) + "</button>").join("") +
    "</div>" +
    '<div class="chathead">' +
      '<b>讨论区</b><span class="dim">' + (dmWith ? "私聊中" : "所有人") + '</span>' +
      '<span class="bdg">' + S.chat.length + "</span>" +
    "</div>" +
    '<div class="scroll chat" data-scroll="chat">' + msgs + "</div>" +
    '<div class="chatbar">' +
      '<input class="input" id="in-chat" maxlength="300" placeholder="' + (dmWith ? "只对 TA 说……" : "说点什么……") + '" />' +
      '<button class="btn" data-act="chat">' + (dmWith ? "私聊发送" : "发送") + "</button>" +
    "</div>"
  );
}

/* ---------------- 校验台（和 tools/check-pack.mjs 同一份检查） ---------------- */
async function loadAudit() {
  AUDIT = { loading: true };
  render();
  try {
    const r = await (await fetch("/api/audit", { cache: "no-store" })).json();
    AUDIT = r && r.ok ? r : { error: (r && r.error) || "校验接口没返回结果。" };
  } catch (e) {
    AUDIT = { error: "连不上服务器。" };
  }
  render();
}

function screenAudit() {
  const a = AUDIT;
  const head =
    '<div class="screen" style="max-width:980px">' +
      '<div class="hero"><h1>校验台</h1><div class="sub">和命令行 node tools/check-pack.mjs 用的是同一份检查</div></div>';
  const tail =
    '<div class="row" style="justify-content:center;margin-top:16px">' +
      '<button class="btn" data-act="reAudit">重新校验</button>' +
      '<button class="btn ghost" data-act="closeAudit">返回剧本库</button>' +
    "</div></div>";
  if (!a || a.loading) return head + '<div class="card"><div class="dim">正在跑校验……</div></div>' + tail;
  if (a.error) return head + '<div class="card"><div class="note bad">' + esc(a.error) + "</div></div>" + tail;
  if (!a.cases) {
    return head + '<div class="card"><h3>剧本库是空的</h3><div class="dim">data/cases/ 里还没有本子，把剧本包放进去再刷新这一页。</div></div>' + tail;
  }
  const packs = (a.packs || []).map((pk) =>
    '<div class="card">' +
      "<h3>" + esc(pk.title) + "（" + esc(pk.id) + "）" +
        (pk.ok ? ' <span class="tag green">15 项全过</span>' : ' <span class="tag red">' + pk.problems + " 项有问题</span>") +
      "</h3>" +
      '<div class="audit">' +
        pk.items.map((it) =>
          '<div class="arow ' + (it.ok ? "ok" : "bad") + '">' +
            '<span class="ano">' + it.no + "</span>" +
            '<span class="anm">' + esc(it.name) + "</span>" +
            '<span class="tag ' + (it.ok ? "green" : "red") + '">' + (it.ok ? "✓" : "✗") + "</span>" +
          "</div>" +
          (it.ok ? "" : '<div class="adet">' + esc(JSON.stringify(it.detail)) + "</div>")
        ).join("") +
      "</div>" +
      '<div class="dim" style="margin-top:10px">因果是否讲得通、语气是否自然、错别字——这几样机器查不了，要人工过一遍。</div>' +
    "</div>"
  ).join("");
  return head +
    '<div class="card"><div class="row"><span class="dim">剧本库里的本子：' + a.cases + " 本</span>" +
      '<div class="spacer"></div>' +
      (a.problems ? '<span class="tag red">共 ' + a.problems + " 项没通过</span>" : '<span class="tag green">全部通过</span>') + "</div></div>" +
    packs + tail;
}

/* ---------------- 弹层（伪造材料选择） ---------------- */
function scriptModal() {
  const sc = S.me.script;
  const tabs = SCRIPT_TABS;
  return (
    '<div class="modal">' +
      '<div class="box scriptmodal" data-stop="1">' +
        '<div class="row" style="gap:12px;align-items:center">' +
          avatarOf(sc.id, sc.color, sc.avatar, "pav big") +
          "<div>" +
            '<div class="serif" style="font-size:21px">' + esc(sc.name) + "</div>" +
            '<div class="dim">' + esc(sc.role) + "　" + sc.gender + "　" + sc.age + " 岁　·　住" + esc(sc.room) + "</div>" +
          "</div>" +
          '<div class="spacer"></div>' +
          (sc.isKiller ? '<span class="tag red">凶手</span>' : "") +
          '<button class="btn sm ghost" data-act="closeScript">收起</button>' +
        "</div>" +
        '<div class="scriptsearch" style="margin-top:14px">' + searchBar("in-script-search", "script", "搜索我的剧本，如：三年前") + (scriptSearch.trim() ? scriptSearchResults() : "") + "</div>" +
        '<div class="scripttabs">' +
          tabs.map((t) => '<button class="stab ' + (scriptTab === t[0] ? "on" : "") + '" data-act="stab" data-tab="' + t[0] + '">' + t[1] + "</button>").join("") +
        "</div>" +
        '<div class="scriptbody scroll" data-scroll="script" style="max-height:50vh">' + scriptBodyHTML(sc) + (scriptTab === "common" && !scriptSearch.trim() ? mapHTML() : "") + "</div>" +
      "</div>" +
    "</div>"
  );
}

function clueModal() {
  const sub = clueTab === "mine" ? "mine" : "board";
  const body = sub === "mine"
    ? clueBodyFor(S.myClues, '<div class="dim">你还没有发现任何线索。等搜证阶段去翻别人的房间。</div>', null)
    : clueBodyFor(S.board, '<div class="dim">公开线索里还什么都没有。等有人把线索摆上桌面再看。</div>', { board: true });
  return (
    '<div class="modal">' +
      '<div class="box cluemodal" data-stop="1">' +
        '<div class="row" style="gap:12px;align-items:center">' +
          '<b>线索</b>' +
          '<span class="dim">公开 ' + S.board.length + "　我的 " + S.myClues.length + "</span>" +
          '<div class="spacer"></div>' +
          '<button class="btn sm ghost" data-act="closeClue">收起</button>' +
        "</div>" +
        '<div style="margin-top:14px">' + searchBar("in-clue-search", "clue", "搜索线索，如：茶水") + "</div>" +
        '<div class="tabs sub">' +
          '<div class="tab ' + (sub === "board" ? "on" : "") + '" data-act="tab" data-tab="board">公开线索 ' + S.board.length + "</div>" +
          '<div class="tab ' + (sub === "mine" ? "on" : "") + '" data-act="tab" data-tab="mine">我的线索 ' + S.myClues.length + "</div>" +
        "</div>" +
        '<div class="cluebody scroll" data-scroll="cluebody">' + body + "</div>" +
      "</div>" +
    "</div>"
  );
}

function modalHTML() {
  if (playersOpen && S) return playerListModal();
  if (mapOpen && S) return mapModal();
  if (scriptOpen && S && S.me && S.me.script) return scriptModal();
  if (clueOpen && S) return clueModal();
  return "";
}

// 弹层开着的时候，SSE 推送只走这条路径：找到 .box，把里面的内容换新。
// 外层 .modal 和 .box 元素本身不重建 —— 没有拆卸就没有闪烁。
// 不依赖任何 HTML 解析：scriptModal() / clueModal() 的结构是我们自己写的，
// 里面那个 .box 就是最外层，剥掉外面的 <div class="modal"> 即可。
/**
 * 从 want 里切出最外层弹层（<div class="box …" data-stop="1"> … </div>）。
 * 需求 3：旧写法靠"掐掉最后两层 </div>"猜结构，玩家列表弹层的包裹层数和
 * 剧本/线索弹层不一样，一猜错就返回 null → refreshModal 走整页重绘 → 白屏闪一下。
 * 现在改成从 data-stop 那个标签开始做 div 括号配平，任何层数都不会再算错。
 */
/**
 * 从 want 里切出最外层弹层（<div class="box …" data-stop="1"> … </div>）。
 * 需求 3：旧写法靠"掐掉最后两层 </div>"猜结构，玩家列表弹层的包裹层数和
 * 剧本/线索弹层不一样，一猜错就返回 null → refreshModal 走整页重绘 → 白屏闪一下。
 * 现在改成按标签配平来切：只数 <div 与 </div>，属性里的引号先整体抹掉，
 * 这样无论外面套几层、有没有自闭合标签，都不会再算错。
 */
/**
 * 从 want 里切出最外层弹层（<div class="box …" data-stop="1"> … </div>）。
 * 需求 3：旧写法靠"掐掉最后两层 </div>"猜结构，玩家列表弹层的包裹层数和
 * 剧本/线索弹层不一样，一猜错就返回 null → refreshModal 走整页重绘 → 白屏闪一下。
 * 现在改成数 <div / </div> 配对：属性值先换成下划线（属性里的 ">" 不算标签边界），
 * 再用 indexOf 从前到后走一遍，外套几层都不会算错。
 */
function modalInner(want) {
  const i = want.indexOf('data-stop="1"');
  if (i < 0) return null;
  const open = want.lastIndexOf("<", i);
  const gt = want.indexOf(">", i);
  if (open < 0 || gt < 0) return null;
  const flat = want.replace(/"[^"]*"|'[^']*'/g, (s) => "_".repeat(s.length));
  const headOf = (start) => {
    const g = want.indexOf(">", start);
    return g < 0 ? "" : want.slice(start, g + 1);
  };
  const clsOf = (head) => ((/class="([^"]*)"/.exec(head) || [])[1] || "");
  // data-stop 可能挂在 .box 自己身上（我的剧本 / 线索弹层），也可能挂在外层 .modal 上
  // （玩家列表 / 地图弹层）。先看这个标签自己是不是 .box，不是才往后找第一个 <div>。
  let boxStart = open;
  if (clsOf(headOf(open)).split(/\s+/).indexOf("box") < 0) {
    boxStart = flat.indexOf("<div", gt);
    if (boxStart < 0) return null;
  }
  const boxGt = want.indexOf(">", boxStart);
  if (boxGt < 0) return null;
  const boxHead = want.slice(boxStart, boxGt + 1);
  // 从 .box 自己的开标签开始配平：inner 就是它自己那一对括号之间的内容
  let p = boxStart, depth = 0, end = -1;
  while (p < flat.length) {
    const nd = flat.indexOf("<div", p);
    const nc = flat.indexOf("</div>", p);
    if (nc >= 0 && (nd < 0 || nc < nd)) {
      depth -= 1;
      if (depth < 1) { end = nc; break; }
      p = nc + 6;
    } else if (nd >= 0) {
      depth += 1;
      p = nd + 4;
    } else break;
  }
  if (end < 0) return null;
  return { cls: clsOf(boxHead) || "box", inner: want.slice(boxGt + 1, end) };
}

function refreshModal() {
  const box = $(".modal > .box");
  if (!box) return renderHard();          // 弹层没了（比如阶段切走），老老实实整页重绘
  const want = modalHTML();
  if (!want) return renderHard();
  const part = modalInner(want);
  if (!part) return renderHard();
  if (part.cls.indexOf("box") >= 0) box.className = part.cls;   // scriptmodal / cluemodal 可能互换；class 里必须还留着 .box
  // 搜索框正在输入时，弹层内部重绘也要把焦点和光标留住
  const ae = document.activeElement;
  const fid = ae && ae.id ? ae.id : null;
  const sel = fid && ae.selectionStart != null ? ae.selectionStart : null;
  const vals = {};
  $$("input[id],textarea[id]").forEach((el) => { vals[el.id] = el.value; });
  // 需求 3：名单类弹层（玩家列表 / 地图）逐行原位更新，不整块换 innerHTML，
  // 头像 <img> 不会被拆掉重建，也就不会闪一下白。行数变了才退回重建。
  if (box.classList.contains("playersmodal") && box.querySelector(".pllist")) {
    const list = box.querySelector(".pllist");
    const rows = [];
    (S.players || []).forEach((p) => {
      const c = (S.chars || []).find((x) => x.id === p.charId);
      rows.push({ id: p.id, html:
        '<div class="plrow" data-pid="' + esc(p.id) + '">' +
          avatarOf(p.charId, c && c.color, c && c.avatar, "pav sm") +
          '<div class="plinfo">' +
            '<div class="pln">' + esc(p.name) + (p.isMe ? ' <span class="tag gold">我</span>' : "") + "</div>" +
            '<div class="dim">' + (c ? esc(c.name) + " · " + esc(c.role) : "尚未选择角色") + "</div>" +
          "</div>" +
        "</div>" });
    });
    const have = Array.from(list.querySelectorAll(".plrow"));
    const same = have.length === rows.length && have.every((el, i) => el.dataset.pid === rows[i].id);
    if (same) {
      have.forEach((el, i) => { if (el.outerHTML !== rows[i].html) el.outerHTML = rows[i].html; });
    } else {
      list.innerHTML = rows.map((r) => r.html).join("") || '<div class="dim">还没有玩家。</div>';
    }
    return;
  }
  const keepBody = box.querySelector(".scriptbody, .cluebody, .mapfull");
  const keepBodyTop = keepBody ? keepBody.scrollTop : null;
  box.innerHTML = part.inner;
  $$("input[id],textarea[id]").forEach((el) => {
    if (vals[el.id] !== undefined && el.value !== vals[el.id]) el.value = vals[el.id];
  });
  if (fid) {
    const el = document.getElementById(fid);
    if (el) { el.focus(); try { if (sel != null) el.setSelectionRange(sel, sel); } catch (e) {} }
  }
  const now = box.querySelector(".scriptbody, .cluebody, .mapfull");
  if (now && keepBodyTop != null) now.scrollTop = keepBodyTop;
}

/** 整页的 HTML（渲染的唯一入口，render 和 refreshModal 兜底都走这里） */
function pageHTML() {
  if (auditOpen) return screenAudit();
  if (!S) {
    // 需求 5：只要落地页上还没有剧本库就自动去读（读不到会一直重试）。
    // 从房间里退出来、或者刚打开网页时，都不会停在"正在读取剧本库……"。
    if (CASES === null && !casesLoading) loadCases();
    // 带着凭证（刷新页面 / 从后台切回来）：先摆"正在回到房间"，别闪一下落地页再跳回房间
    if (TOKEN && CODE) { if (!enterSince) enterSince = Date.now(); return screenEntering(); }
    // 需求 3：大厅首页只留「剧本库入口 + 加入房间」，挑本在剧本库那一页做
    if (libOpen) return screenLibrary();
    return screenLanding();
  }
  return (
    header() +
    '<div class="wrap">' +
      // 需求 8：还没开局（大厅）时不摆"公开线索 / 我的线索 / 讨论区"这一栏
      '<div class="grid' + (S.room.phase === "lobby" ? " solo" : "") + '">' +
        '<div class="maincol">' + mainPanel() + '</div>' +
        (S.room.phase === "lobby" ? "" : '<div class="side' + (sideOpen ? " open" : "") + '" data-side>' + sidePanel() + '</div>') +
      '</div>' +
    '</div>' +
    (modalHTML() || "")
  );
}

/** 弹层被外部关掉 / 结构对不上时的兜底：老老实实整页重绘 */
function renderHard() { $("#app").innerHTML = pageHTML(); }

/* ---------------- 事件 ---------------- */
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const a = el.dataset.act;

  if (a === "cancelPending" || a === "closeScript" || a === "closeClue") {
    // 用户本轮要求 2：剧本/线索弹层只能点「收起」关闭，点空白处不会关
    if (el.tagName !== "BUTTON" || (el.dataset.act !== "closeScript" && el.dataset.act !== "closeClue")) return;
    pending = null; scriptOpen = false; clueOpen = false;
    clueSearch = ""; scriptSearch = ""; scriptHit = "";
    return render();
  }

  switch (a) {
    case "copy": copyText(inviteText()); return;
    case "players": playersOpen = true; return render();
    case "closePlayers": playersOpen = false; return render();
    case "detail": lobbyDetail = !lobbyDetail; return render();
    case "who": playersOpen = true; return render();
    case "openmap": mapIdx = Number(el.dataset.map) || 0; mapOpen = true; return render();
    case "mapcycle": mapIdx = (mapIdx || 0) + (Number(el.dataset.dir) || 0); return render();
    case "closeMap": mapOpen = false; return render();
    case "filterSeats":
    case "filterGenre":
    case "clearCasesFilter": {
      if (a === "filterSeats") filterSeats = el.value;
      else if (a === "filterGenre") filterGenre = el.value;
      else { filterSeats = ""; filterGenre = ""; }
      return applyCaseFilter();
    }
    case "pickcase": {
      // 需求 3：点一本剧本 = 选中它 + 弹「创建房间 / 取消」
      if (joining) return;
      caseId = el.dataset.case;
      caseAsk = caseId;
      delId = null;
      const chosen = CASES ? CASES.find((c) => c.id === caseId) : null;
      if (chosen && chosen.bg) setBG(chosen.bg);
      return render();
    }
    case "openLib":
      // 需求 3：从大厅首页进剧本库（顺手保证剧本库已经读过）
      libOpen = true;
      caseAsk = null;
      delId = null;
      if (CASES === null && !casesLoading) loadCases();
      return render();
    case "closeLib":
      libOpen = false;
      caseAsk = null;
      delId = null;
      return render();
    case "cancelCreate":
      caseAsk = null;
      return render();
    case "confirmCreate": {
      const v = ($("#in-name2") || {}).value || "";
      return doCreate(v, el.dataset.case || caseId);
    }
    case "leave": {
      // 离开了就把本地凭证清干净，回剧本库；房间空掉服务器自己会删。
      // 以前这里要等"离开"请求 + 重新读剧本库两趟网络才肯换页，慢网下就是白等几秒；
      // 现在先本地退干净、立刻换页，服务器那边放到后台去通知（失败会重试）。
      if (typeof confirm === "function" && !confirm("确定离开这个房间？你的座位会让出来。")) return;
      const tk = TOKEN, cd = CODE;
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
      reconnectFails = 0;
      if (ES) { ES.close(); ES = null; }
      connected = false;
      TOKEN = ""; CODE = ""; S = null; myId = null;
      folds = {}; pending = null; pickSeq = 0; lastPhase = null;
      enterSince = 0; enteringSlow = false; searchBusy = false; voteBusy = false;
      voteSel = { killer: null };
      // 弹层全部收起：留着 scriptOpen / clueOpen / mapOpen / playersOpen，
      // 整页重绘会被 modalFrozen() 挡住，看上去就像"点了没反应"。
      scriptOpen = false; clueOpen = false; mapOpen = false; playersOpen = false; sideOpen = false;
      dmWith = null; npcAsk = null; delId = null; lobbyDetail = true;
      libOpen = false; caseAsk = null;      // 需求 3：离开房间回到大厅首页
      localStorage.removeItem("mm_token");
      localStorage.removeItem("mm_code");
      history.replaceState(null, "", "/");
      render();               // 落地页立刻可见（有缓存就有剧本库）
      loadCases();            // 后台再刷一份最新的，不挡着换页
      (async () => {
        for (let i = 0; i < 3; i++) {
          const r = await api("/api/action", { code: cd, token: tk, type: "leave" });
          if (r && r.ok) return;
          if (r && r.error && r.error !== "连接不上服务器。") return;   // 服务器明确回绝就不用再试
          await new Promise((res) => setTimeout(res, 700));
        }
        toast("本地已经离开了，但服务器没收到，座位可能还占着。", "bad");
      })();
      return;
    }
    case "clue": clueOpen = true; return render();
    case "myscript": scriptOpen = true; return render();
    case "asknpc": npcAsk = el.dataset.npc === "fill" ? "fill" : "add"; return render();
    case "cancelnpc": npcAsk = null; return render();
    case "donpc": {
      const pw = ($("#in-npcpw") || {}).value || "";
      const kind = el.dataset.npc === "fill" ? "fillNPC" : "addNPC";
      const r = await act(kind, { password: pw });
      if (r.ok) { npcAsk = null; render(); }
      return;
    }

    case "tab": {
      const t = el.dataset.tab;
      if (t === "board" || t === "mine") { clueTab = t; tab = "clues"; }
      else tab = t;
      return render();
    }
    case "dm": dmWith = el.dataset.id || null; tab = "chat"; return render();
    case "audit": auditOpen = true; render(); loadAudit(); return;
    case "closeAudit": auditOpen = false; return render();
    case "reAudit": AUDIT = null; loadAudit(); return;
    case "side": sideOpen = !sideOpen; return render();

    case "create": {
      // 需求 3：首页不再直接开房，统一走剧本库里的「创建房间」；这里只留一条兼容路径
      return doCreate(($("#in-name") || {}).value, caseId);
    }
    case "join": {
      if (joining) return;
      NAME = ($("#in-name") || {}).value || "";
      const code = (($("#in-code") || {}).value || "").trim().toUpperCase();
      if (!NAME.trim()) return toast("先给自己起个名字", "bad");
      if (!code) return toast("请输入房号", "bad");
      localStorage.setItem("mm_name", NAME);
      // 点了就有反应：按钮先切成"正在进入房间…"，慢网/隧道下也不会觉得没点上
      joining = "join"; render();
      let r = { ok: false, error: "连接不上服务器。" };
      try { r = await api("/api/join", { code: code, name: NAME }); }
      finally { joining = null; }
      if (!r.ok) { render(); return toast(r.error || "加入失败", "bad"); }
      myId = null;
      TOKEN = r.token; CODE = r.code;
      localStorage.setItem("mm_token", TOKEN);
      localStorage.setItem("mm_code", CODE);
      history.replaceState(null, "", "/?room=" + CODE);
      toast(r.reconnected ? "欢迎回来" : "坐下就是这一局的人了", "good");
      if (r.view) { S = r.view; onState(); }
      connect();
      return;
    }

    case "pick": {
      const charId = el.dataset.char;
      if (!charId || !S.me || !S.players) return;
      const prev = S.me.charId;
      if (prev === charId) return;
      const seq = ++pickSeq;
      S.me.charId = charId;
      const me = S.players.find((x) => x.isMe);
      if (me) me.charId = charId;
      render();
      const r = await act("setChar", { charId });
      if (!r.ok && seq === pickSeq && S.me) {
        S.me.charId = prev;
        const me2 = S.players.find((x) => x.isMe);
        if (me2) me2.charId = prev;
        render();
      }
      return;
    }
    case "stab": scriptTab = el.dataset.tab; return render();
    case "scripthit": {
      scriptTab = el.dataset.tab || scriptTab;
      scriptHit = String(el.dataset.hit || "").replace(/^script-hit-/, "");
      render();
      scrollToScriptHit();
      return;
    }
    case "fold": folds[el.dataset.key] = !folds[el.dataset.key]; return render();
    case "ready": {
      const value = el.dataset.value === "1";
      if (S && S.me) {
        S.me.ready = value;
        const me = S.players && S.players.find((x) => x.isMe);
        if (me) me.ready = value;
        render();
      }
      await act("ready", { value });
      // 这一下很可能就是"最后一块拼图"：服务器已经把整桌人带进下一个阶段，
      // 而且 act() 里就用响应里那份视角当场跳过去了——所以这里不能再自己重绘一次，
      // 否则会把刚跳好的新阶段画面又盖回旧画面（公网下就表现为"卡一下才跳"）。
      return;
    }
    case "saveIntro": {
      const t = ($("#in-intro") || {}).value || "";
      const r = await act("setIntro", { text: t });
      if (r.ok) toast("已保存", "good");
      return;
    }
    case "askdel": delId = el.dataset.case; caseAsk = null; return render();
    case "canceldel": delId = null; return render();
    case "delcase": {
      const pw = ($("#in-delpw") || {}).value || "";
      const id = el.dataset.case;
      const r = await api("/api/cases/delete", { id: id, password: pw });
      if (!r.ok) { toast(r.error || "删除失败。", "bad"); return; }
      toast("《" + r.title + "》已从剧本库删除。", "good");
      delId = null;
      CASES = (CASES || []).filter((c) => c.id !== id);
      if (caseId === id) caseId = CASES.length ? CASES[0].id : "";
      try { localStorage.setItem(CASES_CACHE, JSON.stringify({ cases: CASES, defaultId: caseId, bg: BGU })); } catch (e) {}
      return render();
    }
    case "retryConnect":
      // 修复 3：手动重连。先重置退避计数，别让它还卡在很长的那一档上。
      reconnectFails = 0;
      enteringSlow = false;
      enterSince = Date.now();
      connect();
      return render();
    case "search": return doSearch(el.dataset.loc);
    case "publish": return act("publish", { clueId: el.dataset.clue });
    case "answer": return doAnswer(el.dataset.q, el.dataset.k);
    case "submitQuiz": {
      // ★ 修复 2：交卷也只发一次（连点会收到一串"已经交过"）
      if (voteBusy || (S && S.quiz && S.quiz.submitted)) return;
      voteBusy = true;
      render();
      try {
        const r = await act("submitQuiz", {});
        if (r.ok && r.autoAdvanced) toast("所有人都交卷了，进入投票。", "good");
      } finally {
        voteBusy = false;
        render();
      }
      return;
    }
    case "vk":
      // 已经投过了就不能再选（按钮本身也是 disabled 的，这里再兜一层）
      if (S && S.vote && S.vote.myVote) return;
      voteSel.killer = el.dataset.id;
      return render();
    case "submitVote": {
      if (voteBusy || !voteSel.killer) return;
      // ★ 修复 2：投票只发一次。公网慢的时候人容易连点，连点会收到一串
      //   "你已经投过了"的错误提示，看起来就像投丢了。
      voteBusy = true;
      render();
      try {
        const r = await act("vote", { killer: voteSel.killer });
        if (r.ok && r.autoAdvanced) toast("所有人都投完了，揭晓真相。", "good");
      } finally {
        voteBusy = false;
        render();
      }
      return;
    }
    case "advance": return act("advance");
    case "restart": return act("restart");

    case "chat": {
      const t = ($("#in-chat") || {}).value || "";
      if (!t.trim()) return;
      $("#in-chat").value = "";
      return act("chat", dmWith ? { text: t, to: dmWith } : { text: t });
    }
  }
});

/* ---------------- 搜索（线索 / 我的剧本） ---------------- */
/* 输入法（拼音、五笔…）拼字过程中浏览器会连续触发 input 事件。
   如果这时重绘弹层，正在打字的 <input> 会被换成新的一个，
   输入法随即中断，已经打进去的内容也就被取消了。
   所以拼字期间只记住关键词、不重绘；上屏（compositionend）之后再重绘。 */
function applySearch(el) {
  if (!el || !el.dataset) return;
  if (el.dataset.search === "clue") { clueSearch = el.value; }
  else if (el.dataset.search === "script") { scriptSearch = el.value; scriptHit = ""; }
  else return;
  return render();
}

document.addEventListener("compositionstart", (e) => {
  const el = e.target;
  if (el && el.dataset && el.dataset.search) searchComposing = true;
});

document.addEventListener("compositionend", (e) => {
  const el = e.target;
  if (!el || !el.dataset || !el.dataset.search) return;
  searchComposing = false;
  return applySearch(el);
});

document.addEventListener("input", (e) => {
  const el = e.target;
  if (!el || !el.dataset || !el.dataset.search) return;
  if (searchComposing || e.isComposing) return;   // 拼字中：先不重绘，等输入法上屏
  return applySearch(el);
});

/* 兜底：万一输入法没有正常上屏（焦点被移走等），也别让界面一直冻着不更新 */
document.addEventListener("focusout", (e) => {
  const el = e.target;
  if (!el || !el.dataset || !el.dataset.search || !searchComposing) return;
  searchComposing = false;
  return render();
});

document.addEventListener("change", (e) => {
  const el = e.target;
  if (!el || !el.dataset || !el.dataset.filter) return;
  if (el.dataset.filter === "seats") { filterSeats = el.value; applyCaseFilter(); }
  else if (el.dataset.filter === "genre") { filterGenre = el.value; applyCaseFilter(); }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (e.target.id === "in-chat") { e.preventDefault(); const b = document.querySelector('[data-act="chat"]'); if (b) b.click(); }
  if (e.target.id === "in-code") { e.preventDefault(); const b = document.querySelector('[data-act="join"]'); if (b) b.click(); }
  if (e.target.id === "in-name") { e.preventDefault(); const b = document.querySelector('[data-act="join"]'); if (b) b.click(); }
  if (e.target.id === "in-name2") { e.preventDefault(); const b = document.querySelector('[data-act="confirmCreate"]'); if (b) b.click(); }
});

/* ---------------- 启动 ---------------- */
(async function boot() {
  const q = new URLSearchParams(location.search).get("room");
  if (q && !CODE) CODE = q.toUpperCase();
  const n = $("#in-name");
  if (n && NAME) n.value = NAME;
  casesFromCache();      // 需求 5：先把上次缓存的剧本库摆出来，页面不再空着等网络
  setBG(BGU);            // 需求 3：兜住"缓存里没有 bg"的老数据，body 先挂上底图
  // 需求 3（本轮）：以前这里带着 token 就直接 return connect()，于是从没读过剧本库、
  // 也就从没设置过底图，进房间后一直是纯黑。现在进房和读剧本库并行做，互不阻塞。
  const inRoom = !!(TOKEN && CODE);
  // 带着凭证时先渲染（会显示"正在回到房间"），别让 #app 空着等 SSE 第一帧
  if (inRoom) { render(); connect(); }
  else render();         // 落地页立刻可见（有缓存就有剧本库）
  await loadCases();     // 再去服务器读一份最新的（失败会自动重试）
  // 剧本库图片还在生成时，落地页自动轮询，不需要手动刷新才能看到进度
  if (imgWait()) startImagePoll();
})();
