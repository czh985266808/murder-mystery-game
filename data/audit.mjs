// ============================================================
//  剧本包体检（校验台和命令行工具共用这一份）
//
//  按用户给的校验清单逐项查：
//    1 时间线一致性   2 物品流转闭环    3 线索出处      4 跨角色时间线闭环
//    5 尸体客观描述   6 头像七要素      7 姓氏与性别    8 痕迹 / 物品状态有出处
//    9 线索隐晦化    10 诡计丰富度     11 延时手法支撑 12 语句通顺
//   13 线索必须在人物故事或案发时间线里被提及（用户本轮补充）
//   14 人物故事（background）不许写当晚的事（用户本轮补充）
//   15 凶手的作案过程不许写得含糊（用户本轮补充）
//   16 线索不许写"刚站过不久 / 刚擦过"这类模糊的时效描述（用户本轮补充）
//   17 深入线索不许重复浅层线索的内容（用户本轮补充）
//   18 公共背景故事 100～500 字（用户本轮补充）
//   19 线索去向双向提及：谁动了东西、谁发现东西不在，两边都要有（用户本轮补充）
//   20 延时手法至少 2 条独立线索体现效果与发作时间（用户本轮补充）
//   21 三类角色模型：凶手唯一、无边缘角色、伪凶配比、侦探/帮凶门槛（用户本轮补充）
//   22 人物故事 900～1500 字且不写案发当天（仅 newRules）
//   23 案发时间线每角色 8～16 个时间点（仅 newRules）
//   24 线索不解读不揣测，禁像是/疑似/仿佛/看起来/可能（仅 newRules）
//   25 选角卡字段 appearance / relation（仅 newRules）
//   26 线索公开权：尸体线索标 corpse 且强制公开，其余线索可由发现者选择公开 / 不公开（仅 newRules）
//   27 线索对凶手友好：凶手房间与随身不摆凶器 / 血衣，只留「东西不见了」这类隐晦痕迹（仅 newRules/roleModel）
//
//  用法：import { auditPack, auditAll } from "../data/audit.mjs";
// ============================================================

const MALE = ["何", "撒", "大", "张", "刘"];
const FEMALE = ["欧", "蓉", "吴", "鬼", "戚"];
const NEUTRAL = ["魏", "甄"];
const TIME = /\b\d{1,2}:\d{2}\b/g;
const timesOf = (s) => String(s || "").match(TIME) || [];
const scriptTextOf = (c) => [c.script.background, c.script.tonight, c.script.hide, c.script.know, c.script.mission, c.publicInfo].join("\n");
const BAD_DEATH = ["致命", "非致命", "死因", "死于", "致死", "毒发", "失血", "窒息", "一刀毙命", "致命伤"];
const BAD_HINT = [/鞋码/, /尺码/, /\d+\s*码/, /身高/, /性别/, /刻着.{0,6}(名|字)/, /写着.{0,4}名字/];
const VAGUE = [/不必细说/, /不用细说/, /你自己清楚/, /你做了什么/, /不必多写/, /就看你自己的了/];
const ACT_WORDS = ["击", "打", "砸", "推", "勒", "捂", "按", "刺", "扎", "灌", "下药", "投", "掐", "拉", "撞", "丢", "藏", "擦", "取", "拿"];
// 需求 16（本轮）：线索里必须去掉"看着像刚刚发生了什么"这种没有实据的时效判断。
// 玩家要做的是从实物状态去推，而不是被线索直接告诉"这是刚留下的"。
const SOFT_TIME = [
  /刚(?:刚)?(?:站|走|离开|擦|抹|拖|扫|动|碰|放|摆|踩|坐)(?:过)?(?:不久|没多久|一会儿)/,
  /刚(?:刚)?擦过/, /刚(?:刚)?擦的/, /刚(?:刚)?拖过/, /刚(?:刚)?扫过/,
  /像是刚/, /好像刚/, /似乎刚/, /仿佛刚/,
  /不(?:久|多时)之前/, /才(?:刚)?留下不久/, /痕迹很新/, /看上去很新/, /看着很新/,
  /新鲜(?:的)?(?:足迹|脚印|痕迹|血迹)/, /残留时间不长/, /留下没多久/,
];

/** 查一本剧本，返回 { id, title, items: [{ no, name, ok, detail }], ok, problems } */
export function auditPack(p, portraits) {
  const PORTRAITS = portraits || {};
  const items = [];
  const add = (no, name, ok, detail) => items.push({ no: no, name: name, ok: !!ok, detail: ok ? null : (detail === undefined ? null : detail) });
  const tl = p.truth.timeline || [];
  const tlTimes = new Set(tl.flatMap((x) => timesOf(x.t)));
  const tlAll = new Set(tl.flatMap((x) => timesOf(x.t).concat(timesOf(x.what))));
  const tlWhat = tl.map((x) => String(x.what)).join("\n");
  const allText = p.characters.map(scriptTextOf).join("\n");

  // 1
  {
    const bad = [];
    for (const c of p.characters) for (const t of new Set(timesOf(scriptTextOf(c)))) if (!tlAll.has(t)) bad.push(c.id + ":" + t);
    add(1, "时间线一致性：角色剧本里的每个时刻都能在台账里找到", bad.length === 0, bad.slice(0, 8));
  }
  // 2
  {
    const props = p.props || [];
    const bad = [];
    if (!props.length) bad.push("剧本包没写 props");
    for (const it of props) {
      if (!p.locById[it.from]) bad.push(it.id + " 来源地点不存在");
      if (!p.locById[it.ends]) bad.push(it.id + " 终点地点不存在");
      if (!it.by || !p.charById[it.by]) bad.push(it.id + " 没写谁取用");
      if (!it.used || !tlAll.has(it.used)) bad.push(it.id + " 的使用时刻不在台账里");
      if (!p.clues.some((c) => c.location === it.ends)) bad.push(it.id + " 的终点地点没有线索");
    }
    add(2, "物品流转闭环：来源 → 取用 → 使用 → 终点可搜地点不断裂（" + props.length + " 件）", bad.length === 0, bad);
  }
  // 3
  {
    const noSource = p.clues.filter((c) => !c.source).map((c) => c.id);
    add(3, "线索出处：每条线索都写了 source", noSource.length === 0, noSource.slice(0, 10));
  }
  // 4
  {
    const killer = p.charById[p.truth.killerId];
    const victimName = (p.victim && p.victim.name) || "";
    const killerNamed = tl.some((x) => killer && String(x.who).includes(killer.name));
    const victimNamed = tl.some((x) => victimName && (String(x.who).includes(victimName) || String(x.what).includes(victimName)));
    const others = p.characters.filter((c) => c.id !== p.truth.killerId).filter((c) => tl.some((x) => timesOf(x.t).some((t) => scriptTextOf(c).includes(t)))).length;
    add(4, "跨角色时间线闭环：施害方与受害方都在台账里，另有 ≥2 个角色的剧本与台账咬合", killerNamed && victimNamed && others >= 2, { killerNamed: killerNamed, victimNamed: victimNamed, others: others });
  }
  // 5
  {
    const hits = [];
    for (const c of p.clues) for (const b of BAD_DEATH) if (String(c.text).includes(b)) hits.push(c.id + ":" + b);
    for (const c of p.characters) for (const b of BAD_DEATH) if (scriptTextOf(c).includes(b)) hits.push(c.id + ":" + b);
    add(5, "尸体客观描述：线索与角色剧本里没有死因 / 致命性定性", hits.length === 0, hits.slice(0, 8));
  }
  // 6
  {
    const keys = ["era", "ethnicity", "age", "gender", "job", "dress", "style"];
    const bad = [];
    for (const c of p.characters) {
      const spec = c.avatarSpec || {};
      const miss = keys.filter((k) => !spec[k]);
      if (miss.length) { bad.push(c.id + " 缺：" + miss.join(",")); continue; }
      const prompt = String(c.portrait || c.img || PORTRAITS[c.id] || "");
      if (!prompt) { bad.push(c.id + " 没有头像提示词"); continue; }
      if (!prompt.includes(String(spec.age))) bad.push(c.id + " 的提示词里没有年龄段" + spec.age);
      if (!/Chinese|Han/.test(prompt) && !/Chinese|Han/.test(spec.ethnicity)) bad.push(c.id + " 的提示词里没写人种");
      const STYLE_RE = /photograph|portrait|cinematic|film|anime|manga|comic|comic book|ink|watercolor|watercolour|painting|wash|cartoon|illustration|2d|3d|二次元|漫画|水墨|写意|插画|画风|写实/i;
      if (!STYLE_RE.test(prompt)) bad.push(c.id + " 的提示词里没写画风");
      if (!/hair|gown|robe|jacket|coat|qipao|uniform|hat|scarf|braid|dress/i.test(prompt)) bad.push(c.id + " 的提示词里没写服饰或发型");
    }
    add(6, "头像七要素：时代 / 人种 / 年龄段 / 性别 / 职业 / 服饰发型 / 画风齐全", bad.length === 0, bad);
  }
  // 7
  {
    const bad = [];
    for (const c of p.characters) {
      const sur = String(c.name)[0];
      const g = c.gender === "女" ? "女" : "男";
      const okMale = MALE.indexOf(sur) >= 0, okFemale = FEMALE.indexOf(sur) >= 0, okNeutral = NEUTRAL.indexOf(sur) >= 0;
      if (!okMale && !okFemale && !okNeutral) bad.push(c.id + " 的姓不在池子里：" + sur);
      else if (okMale && !okNeutral && g === "女") bad.push(c.id + " 用了男姓却写成女：" + sur);
      else if (okFemale && !okNeutral && g === "男") bad.push(c.id + " 用了女姓却写成男：" + sur);
    }
    const vname = (p.victim && p.victim.name) || "";
    add(7, "姓氏与性别：死者姓甄（" + vname + "），角色的姓与性别对得上", String(vname)[0] === "甄" && bad.length === 0, bad);
  }
  // 8
  {
    const bad = [];
    for (const c of p.clues) {
      if (!c.source) continue;
      const parts = String(c.source).split("|");
      const t = parts[0], who = parts[1];
      if (!timesOf(t).length || !who) { bad.push(c.id + " 的 source 格式不对：" + c.source); continue; }
      const hit = tl.find((x) => timesOf(x.t).includes(t) && (String(x.who).includes(who) || String(x.what).includes(who)));
      if (!hit) bad.push(c.id + " 在台账里找不到「" + t + " 时 " + who + "」这一笔");
    }
    add(8, "痕迹 / 物品状态有出处：source 指向的那一笔在台账里查得到", bad.length === 0, bad.slice(0, 10));
  }
  // 9
  {
    const hits = [];
    for (const c of p.clues) for (const re of BAD_HINT) if (re.test(String(c.text)) || re.test(String(c.title))) hits.push(c.id);
    add(9, "线索隐晦化：没有鞋码 / 尺码 / 身高 / 性别 / 刻名这类一眼锁凶的强指向", hits.length === 0, hits.slice(0, 8));
  }
  // 10
  {
    const tricks = p.tricks || [];
    const diffOK = ["★★★★☆", "★★★★★"].includes(String(p.difficulty || ""));
    const bad = [];
    for (const t of tricks) {
      if (!t.name) bad.push("有诡计没写名字");
      for (const id of t.clues || []) if (!p.clueById[id]) bad.push(t.name + " 指向了不存在的线索 " + id);
      for (const t2 of t.times || []) if (!tlAll.has(t2)) bad.push(t.name + " 的时刻不在台账里：" + t2);
    }
    add(10, "诡计丰富度：至少 2 个诡计、各自挂着线索与时刻，难度 ★★★★☆ 以上（" + tricks.length + " 个 / " + p.difficulty + "）", tricks.length >= 2 && diffOK && bad.length === 0, bad.slice(0, 6));
  }
  // 11
  {
    const delay = (p.tricks || []).filter((t) => /延时|机关|香|线|铃/.test(t.name + JSON.stringify(t.clues || [])));
    const bad = delay.filter((t) => !(t.clues || []).length || !(t.times || []).length).map((t) => t.name);
    add(11, "延时 / 机关类手法有线索与时间线支撑（" + delay.length + " 个）", bad.length === 0, bad);
  }
  // 12
  {
    const bad = [];
    const scan = [];
    for (const c of p.characters) for (const k of ["background", "tonight", "hide", "know", "mission"]) scan.push([c.id + "." + k, c.script[k]]);
    for (const c of p.clues) scan.push([c.id, c.text]);
    scan.push(["intro", p.case.intro]); scan.push(["common", p.case.common]);
    for (const pair of scan) {
      const t = String(pair[1] || "");
      if (/[\u4e00-\u9fa5]\s+[\u4e00-\u9fa5]/.test(t)) bad.push(pair[0] + " 的中文之间有多余空格");
      if (/[，。；：]{2,}/.test(t)) bad.push(pair[0] + " 有连续的标点");
      if (/\*\*|====|★★★/.test(t)) bad.push(pair[0] + " 有元信息记号");
      const open = (t.match(/「/g) || []).length, close = (t.match(/」/g) || []).length;
      if (open !== close) bad.push(pair[0] + " 的「」不配对");
    }
    for (const c of p.characters) {
      for (const k of ["background", "tonight", "know"]) if (/我/.test(String(c.script[k]))) bad.push(c.id + "." + k + " 里出现了「我」");
      for (const x of String(c.script.background).split("\n").filter((y) => y.trim())) if (!/[。！？…」]$/.test(x.trim())) bad.push(c.id + " 的人物故事有段落没收好尾：" + x.slice(0, 12));
    }
    add(12, "语句通顺：标点、人称、空格、元信息记号这些机器能查的都过了", bad.length === 0, bad.slice(0, 10));
  }
  // 13（用户本轮补充）：每条线索都要在人物故事或案发时间线里被提到
  {
    const bad = [];
    for (const c of p.clues) {
      const m = String(c.mention || "").trim();
      if (!m) { bad.push(c.id + " 没写 mention（要在人物故事或案发时间线里被提到的原话）"); continue; }
      if (tlWhat.includes(m)) continue;
      if (p.characters.some((ch) => scriptTextOf(ch).includes(m))) continue;
      bad.push(c.id + " 的「" + m + "」在人物故事和案发时间线里都找不到");
    }
    add(13, "线索都有出处：每条线索都能在某个人物故事或案发时间线里被原话提到", bad.length === 0, bad.slice(0, 8));
  }
  // 14（用户本轮补充）：人物故事只写案发之前，不许写当晚的事
  {
    const bad = [];
    for (const c of p.characters) {
      const bgTimes = new Set(timesOf(c.script.background));
      for (const t of bgTimes) if (tlTimes.has(t)) bad.push(c.id + " 的人物故事里写了当晚的 " + t);
      const nightTimes = new Set(timesOf(c.script.tonight));
      for (const t of bgTimes) if (nightTimes.has(t)) bad.push(c.id + " 的人物故事和案发时间线都写了 " + t);
    }
    add(14, "人物故事不许写当晚：background 里不出现案发时间线的时刻", bad.length === 0, bad.slice(0, 8));
  }
  // 15（用户本轮补充）：凶手的作案过程要写实，不许含糊
  {
    const killer = p.charById[p.truth.killerId];
    const bad = [];
    if (!killer) bad.push("truth.killerId 指不到角色");
    else {
      const tn = String(killer.script.tonight);
      const hits = ACT_WORDS.filter((x) => tn.includes(x));
      if (hits.length < 3) bad.push("凶手的案发时间线里具体动作太少（只有 " + hits.join("、") + "）");
      for (const re of VAGUE) if (re.test(tn)) bad.push("凶手的案发时间线里有含糊说法：" + re);
      const killRow = tl.some((x) => String(x.who).includes(killer.name) && ACT_WORDS.some((v) => String(x.what).includes(v)));
      if (!killRow) bad.push("台账里没有凶手动手的那一笔");
    }
    add(15, "作案过程不模糊：凶手的案发时间线写清了他做了什么，台账里有对应的一笔", bad.length === 0, bad);
  }
  // 16（用户本轮补充）：线索不许有"刚站过不久 / 刚擦过的痕迹"这类没实据的时效描述
  {
    const bad = [];
    for (const c of p.clues) {
      const scan = String(c.title || "") + "\n" + String(c.text || "");
      for (const re of SOFT_TIME) if (re.test(scan)) { bad.push(c.id + " 有模糊时效说法：" + re); break; }
    }
    for (const ch of p.characters) {
      const bg = String(ch.script.background || "");
      for (const re of SOFT_TIME) if (re.test(bg)) { bad.push(ch.id + ".background 有模糊时效说法：" + re); break; }
    }
    add(16, "线索不说「刚留下的」：去掉「刚站过不久 / 刚擦过 / 痕迹很新」这类没有实据的时效判断（" + p.clues.length + " 条线索）", bad.length === 0, bad.slice(0, 8));
  }
  // 17（用户本轮补充）：深入线索（depth ≥ 1）的内容不许跟浅层线索重复
  {
    const bad = [];
    const norm = (s) => String(s || "").replace(/[\s，。、；：“”‘’（）()「」【】·—…!！？?]/g, "");
    for (const c of p.clues) {
      const d = Number(c.depth || 0);
      if (d < 1) continue;
      const mine = norm(c.text);
      if (mine.length < 8) continue;
      for (const o of p.clues) {
        if (o === c || Number(o.depth || 0) >= d) continue;
        const other = norm(o.text);
        if (other.length < 8) continue;
        // 任一条是另一条的子串，或者重合度极高（去重后相同字数 / 较短长度 > 0.8）= 重复描述
        if (mine.includes(other) || other.includes(mine)) { bad.push(c.id + "（depth " + d + "）重复了 " + o.id + "（depth " + (o.depth || 0) + "）的内容"); break; }
        const shorter = mine.length <= other.length ? mine : other;
        const longer = mine.length <= other.length ? other : mine;
        let same = 0;
        const set = new Set(longer.split(""));
        for (const ch of shorter) if (set.has(ch)) same++;
        if (same / shorter.length > 0.9 && Math.abs(mine.length - other.length) < 6) { bad.push(c.id + "（depth " + d + "）和 " + o.id + " 几乎逐字重复"); break; }
      }
    }
    add(17, "深入线索不重复：depth ≥ 1 的线索没有把浅层线索的话再说一遍", bad.length === 0, bad.slice(0, 8));
  }
  // 26（本轮补充，用户要求）：线索公开权 —— 尸体线索必须标 corpse:true（强制公开、不可隐藏），
  // 其余线索一律允许发现者自己选择公开 / 不公开；每个地点至少要有一条可藏线索（private 或非 corpse）。
  {
    const bad = [];
    const corpsePat = /尸|遗体|咽气|毙命|僵|血泊|仰面|俯身|死在/;
    const corpses = p.clues.filter((c) => c.corpse === true || c.isCorpse === true);
    const caseCorpse = p.case && (p.case.corpseClue || p.case.corpseClueId);
    if (caseCorpse && !p.clues.some((c) => c.id === caseCorpse)) bad.push("case.corpseClue 指向不存在的线索 " + caseCorpse);
    if (p.newRules && corpses.length === 0 && !caseCorpse) {
      // 没有显式标注时，尝试按文案兜底识别，识别不到就提示。
      // 用户本轮要求 1：个人房间与随身线索不算（和引擎的 isCorpseClue 保持一致）。
      const personal = (p.personalLocs instanceof Set) ? p.personalLocs : new Set();
      const guessed = p.clues.filter((c) => Number(c.depth || 0) === 0 && !personal.has(String(c.location)) && corpsePat.test(String(c.text || "")));
      if (guessed.length === 0) bad.push("没有任何线索标了 corpse: true，也认不出哪条是尸体线索");
    }
    for (const c of p.clues) {
      if (((c.corpse === true || c.isCorpse === true) || c.id === caseCorpse) && c.private === true) {
        bad.push(c.id + " 既是尸体线索又标了 private: true —— 尸体线索强制公开，不能藏");
      }
    }
    for (const l of p.locations) {
      const mine = p.clues.filter((c) => c.location === l.id);
      if (!mine.length) continue;
      const hideable = mine.filter((c) => !((c.corpse === true || c.isCorpse === true) || c.id === caseCorpse));
      if (mine.length >= 2 && hideable.length === 0) bad.push(l.name + " 的线索全是尸体线索，没有可公开/不公开的余地");
    }
    add(26, "线索公开权：尸体线索标了 corpse 且强制公开，其余线索可由发现者选择公开 / 不公开", bad.length === 0, bad.slice(0, 8));
  }

  // 18（用户本轮补充）：公共背景故事 100～500 字
  {
    const common = String((p.case && p.case.common) || "");
    const n = common.replace(/\s/g, "").length;
    add(18, "公共背景故事 100～500 字（实际 " + n + " 字）", n >= 100 && n <= 500, n ? "公共背景 story 是 " + n + " 字，要求 100～500 字" : "剧本包没有 case.common");
  }
  // 19（用户本轮补充）：线索去向双向提及。
  //   B 偷/拿了 A 的东西 → B 的时间线或人物故事里必须写他动了手；
  //   A 那边也必须交代（发现了东西不见，或者根本不知道这回事）。
  {
    const bad = [];
    const props = p.props || [];
    const allScript = (ch) => [ch.script.background, ch.script.tonight, ch.script.hide, ch.script.know, ch.script.mission, ch.publicInfo].join("\n");
    if (!props.length) bad.push("剧本包没写 props，无法核对线索去向");
    for (const it of props) {
      const taker = p.charById[it.by];
      const owner = p.charById[it.fromOwner] || null;
      if (!taker) { bad.push(it.id + " 的 by 指不到角色"); continue; }
      // 动手的一方：时间线或人物故事里要能读到"他动了这东西"
      const takerText = allScript(taker);
      // 物品名可能带修饰（"空茶杯" 在剧本里常写成 "茶杯"），所以名里任取 2 字连续的片段都算命中
      const fullName = String(it.name || it.what || "");
      const segs = [];
      for (let L = Math.min(4, fullName.length); L >= 2; L--) {
        for (let k = 0; k + L <= fullName.length; k++) segs.push(fullName.slice(k, k + L));
      }
      if (segs.length && !segs.some((w) => takerText.includes(w))) bad.push(it.id + "：取用方 " + taker.id + " 的剧本里找不到「" + fullName + "」");
      if (!String(it.used || "").trim()) bad.push(it.id + " 没写取用时刻（used）");
      // 被拿走的一方：要么写了发现不见，要么写了不知道
      if (owner) {
        const ownerText = allScript(owner);
        const aware = ["不见", "没了", "少了", "丢了", "失窃", "被偷", "被拿", "空", "找不到"].some((w) => ownerText.includes(w));
        const unaware = ["不知道", "没留意", "没注意", "未曾留意", "不曾留意", "没发现"].some((w) => ownerText.includes(w));
        if (!aware && !unaware) bad.push(it.id + "：失主 " + owner.id + " 的剧本里既没写发现东西不见，也没写不知道");
      }
    }
    add(19, "线索去向双向提及：取用方写了动手，失主写了发现不见或不知道（" + props.length + " 件物品）", bad.length === 0, bad.slice(0, 8));
  }
  // 20（用户本轮补充）：延时手法（毒 / 迷药 / 安眠 / 失血 / 机关）至少 2 条独立线索
  //     同时体现"效果"与"发作时间"（药瓶说明书、尸检、摄入时间、症状目击）。
  {
    const bad = [];
    const delay = (p.tricks || []).filter((t) => /延时|机关|香|线|铃|毒|药|安眠|迷|失血|麻醉/.test(t.name + JSON.stringify(t.clues || [])));
    for (const t of delay) {
      const ids = (t.clues || []).filter((x) => p.clueById[x]);
      if (ids.length < 2) { bad.push(t.name + " 只有 " + ids.length + " 条线索，至少要 2 条独立线索"); continue; }
      const texts = ids.map((x) => String((p.clueById[x] || {}).text || "") );
      const hasEffect = texts.some((x) => /效果|昏|睡|麻|麻木|不醒|无力|头晕|呕吐|流涎|瞳孔|气促|心悸|四肢|浑身/.test(x));
      const hasOnset = texts.some((x) => /\d{1,2}:\d{2}|说明书|剂量|毫克|克|片|发作|起效|半(?:个)?小时|分钟|时辰/.test(x));
      if (!hasEffect) bad.push(t.name + " 的线索里没写药效 / 症状这类后果");
      if (!hasOnset) bad.push(t.name + " 的线索里没写剂量或发作时间（说明书 / 尸检 / 摄入时刻 / 症状目击）");
    }
    add(20, "延时手法有实证：每个延时/麻醉类诡计至少 2 条独立线索，且同时体现效果与发作时间（" + delay.length + " 个）", bad.length === 0, bad.slice(0, 8));
  }


  // 21（用户本轮补充）：三类角色模型。老本子不声明 roleModel，只对新角色模型本机查。
  {
    const bad = [];
    if (p.roleModel || p.newRules) {
      const chars = p.characters || [];
      const kinds = chars.map((c) => c.roleKind);
      const validKinds = ["killer", "fake", "suspect", "detective", "accomplice"];
      const count = (k) => kinds.filter((x) => x === k).length;
      if (kinds.some((k) => validKinds.indexOf(k) < 0)) bad.push("存在未知 roleKind：" + kinds.filter((k) => validKinds.indexOf(k) < 0).join("、"));
      if (count("killer") !== 1) bad.push("真凶必须唯一，实际 " + count("killer") + " 名");
      const n = chars.length;
      const fakeMin = n === 5 ? 2 : n === 6 ? 3 : n === 7 ? 4 : n === 8 ? 5 : 1;
      const fakeMax = n === 5 ? 4 : n === 6 ? 5 : n === 7 ? 6 : n === 8 ? 7 : (n - 1);
      if (n >= 2 && (count("fake") < fakeMin || count("fake") > fakeMax)) bad.push("伪凶数量应 " + fakeMin + "～" + fakeMax + "，实际 " + count("fake"));
      if (n >= 7 && count("detective") > 1) bad.push("侦探最多 1 名，实际 " + count("detective"));
      if (n < 7 && count("detective") > 0) bad.push("侦探只在 ≥7 人局存在，当前 " + n + " 人局却有侦探");
      if (n < 5 && count("accomplice") > 0) bad.push("帮凶只在 ≥5 人局存在，当前 " + n + " 人局却有帮凶");
      if (n >= 5 && count("accomplice") > 1) bad.push("帮凶最多 1 名，实际 " + count("accomplice") + "（机制阵营本例外需在说明里解释）");
      const tags = new Set(["motive", "secret", "action", "tension", "unique"]);
      for (const c of chars) {
        const cov = Array.isArray(c.coverage) ? c.coverage : [];
        const hit = cov.filter((x) => tags.has(x)).length;
        if (hit < 2) bad.push(c.id + " 的 coverage 只有 " + hit + " 项有效标签，至少要 2 项（动机/秘密/可疑行动/关系张力/独有线索或视角）");
      }
      const tl = Array.isArray(p.truth && p.truth.timeline) ? p.truth.timeline : [];
      const sourceN = new Map();
      for (const cl of p.clues || []) {
        const who = String(cl.source || "");
        for (const c of chars) if (who.indexOf(c.name) >= 0) sourceN.set(c.id, (sourceN.get(c.id) || 0) + 1);
      }
      for (const c of chars) {
        const tlN = tl.filter((t) => String(t.who || "").indexOf(c.name) >= 0).length;
        if (tlN < 5) bad.push(c.id + " 在真相台账里只有 " + tlN + " 次露面，无边缘角色至少 5 次");
        if ((sourceN.get(c.id) || 0) < 1) bad.push(c.id + " 没有一条以他为出处的线索，会成为边缘角色");
        const bgN = chars.filter((o) => o.id !== c.id && String((o.script && o.script.background) || "").indexOf(c.name) >= 0).length;
        if (bgN < 1) bad.push(c.id + " 没出现在其他任何角色的人物故事里，会成为边缘角色");
        if (p.layout && p.layout.slots && !p.layout.slots[c.room]) bad.push(c.id + " 的个人房间 r_" + c.id + " 没写进 layout.slots");
      }
    }
    add(21, "三类角色模型：凶手唯一、无边缘角色、伪凶配比、侦探/帮凶门槛（roleModel 或 newRules 本机查）", bad.length === 0, bad.slice(0, 8));
  }

  // 27（用户本轮要求 2）：线索对凶手要「友好」——凶手自己的房间与随身不能直接摆着
  //   凶器、血衣、沾血物这类一眼锁凶的东西；只能留下"东西被他处理掉了"的隐晦痕迹。
  {
    const bad = [];
    const k = p.charById[p.truth.killerId];
    if (!k) bad.push("truth.killerId 指不到角色");
    else {
      const killerLoc = "r_" + k.id;
      const home = (p.clues || []).filter((c) => c.location === killerLoc);
      const LETHAL = [
        /凶器/, /沾(?:了)?血/, /带血/, /血迹/, /血衣/, /血手印/,
        /刀鞘/, /药瓶/, /麻绳/, /烛台/, /匕首/, /尖刀/, /毒药/, /砒霜/, /迷药/,
      ];
      for (const c of home) {
        const text = String(c.title || "") + " " + String(c.text || "");
        for (const re of LETHAL) {
          if (re.test(text)) { bad.push(c.id + " 摆在凶手房间（" + killerLoc + "）里，还直接写了 " + re + "：" + text.slice(0, 30)); break; }
        }
      }
      const GONE = [/不见了/, /少了一件/, /空着/, /腾空/, /没有找到/, /找不着/, /处理掉/, /烧掉/, /埋掉/, /擦干净/, /换过/, /晾着/, /不在原位/];
      const subtle = home.filter((c) => GONE.some((re) => re.test(String(c.title || "") + " " + String(c.text || ""))));
      if (home.length && !subtle.length) bad.push("凶手房间 " + killerLoc + " 没有一条「东西被他处理掉」的隐晦痕迹");
    }
    const soft = p.newRules || p.roleModel;
    add(27, "线索对凶手友好：凶手房间与随身不摆凶器 / 血衣，只留「东西不见了」这类隐晦痕迹（仅 newRules/roleModel 本机查）", !soft || bad.length === 0, bad.slice(0, 8));
  }

  // 22（用户本轮补充）：人物故事 900～1500 字，故事与案发当天严格分离（仅 newRules 新本机查）
  {
    const bad = [];
    if (p.newRules) {
      for (const c of p.characters || []) {
        const n = String(c.script.background || "").replace(/\s/g, "").length;
        if (n < 900 || n > 1500) bad.push(c.id + " 的人物故事是 " + n + " 字，要求 900～1500 字");
        if (/\b\d{1,2}:\d{2}\b/.test(c.script.background || "")) bad.push(c.id + " 的人物故事里写了案发当天的时间点");
      }
    }
    add(22, "人物故事 900～1500 字，且不写案发当天内容（仅 newRules 本机查）", bad.length === 0, bad.slice(0, 8));
  }

  // 23（用户本轮补充）：案发时间线每人 8～16 个时间点，只写自己做的事/遇到的事（仅 newRules 本机查）
  {
    const bad = [];
    if (p.newRules) {
      const TIME = /\b\d{1,2}:\d{2}\b/g;
      for (const c of p.characters || []) {
        const n = (String(c.script.tonight || "").match(TIME) || []).length;
        if (n < 8 || n > 16) bad.push(c.id + " 的案发时间线只有 " + n + " 个时间点，要求 8～16 个");
      }
    }
    add(23, "案发时间线每人 8～16 个时间点（仅 newRules 本机查）", bad.length === 0, bad.slice(0, 8));
  }

  // 24（用户本轮补充）：线索只写观察到的事实，不做解读、猜测、结论（仅 newRules 本机查）
  {
    const bad = [];
    if (p.newRules) {
      const words = ["像是", "看起来", "疑似", "仿佛", "可能", "应该是", "说明", "意味着"];
      for (const c of p.clues || []) {
        const txt = String((c.title || "") + (c.text || "") + (c.extra || ""));
        for (const w of words) if (txt.includes(w)) { bad.push(c.id + " 含解读词「" + w + "」"); break; }
      }
    }
    add(24, "线索不解读不揣测：去掉像是/疑似/仿佛/看起来/可能等结论词（仅 newRules 本机查）", bad.length === 0, bad.slice(0, 8));
  }

  // 25（用户本轮补充）：选角卡必须有头像、姓名、年龄、职业、外貌、与死者关系（仅 newRules 本机查）
  {
    const bad = [];
    if (p.newRules) {
      for (const c of p.characters || []) {
        if (!c.appearance) bad.push(c.id + " 缺少 appearance（选角卡外貌）");
        if (!c.relation) bad.push(c.id + " 缺少 relation（选角卡与死者关系）");
      }
    }
    add(25, "选角卡字段齐全：头像/姓名/年龄/职业/外貌/与死者关系（仅 newRules 本机查）", bad.length === 0, bad.slice(0, 8));
  }

  const problems = items.filter((x) => !x.ok).length;
  return { id: p.id, title: p.title, items: items, ok: problems === 0, problems: problems };
}

/** 查一批剧本 */
export function auditAll(packs, portraits) {
  return (packs || []).map((p) => auditPack(p, portraits));
}
