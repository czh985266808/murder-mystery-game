// ============================================================
//  流程与计分规则（所有剧本共用一份）
//
//  各个剧本（data/cases/*.mjs）只带自己的案件、人物、场景、线索、
//  题目与投票选项，阶段表 / 行动点 / 深度门槛 / 计分这些"规则"放这里。
// ============================================================

/** 游戏阶段 */
export const PHASES = [
  { id: "lobby", name: "集结", short: "大厅", desc: "等待所有人入座并认领角色。" },
  { id: "briefing", name: "读本", short: "读本", desc: "阅读你的角色剧本。没有人能看到别人的剧本。" },
  { id: "intro", name: "自我介绍", short: "介绍", desc: "依次介绍你的公开身份。你可以隐瞒，也可以撒谎。" },
  { id: "search1", name: "第一轮搜证 · 人物线索", short: "搜证一", desc: "搜查六个人的房间与随身。你搜不了自己的房间。" },
  { id: "search2", name: "第二轮搜证 · 公共场景", short: "搜证二", desc: "案发现场与全部公共场景——今晚出事的每一个角落。" },
  { id: "talk2", name: "圆桌讨论", short: "圆桌讨论", desc: "把线索、证词与圆桌问题一起摊开对质。之后就是推理问答和盲投。" },
  { id: "quiz", name: "推理问答", short: "问答", desc: "几道题，每题 1 分；交卷之前答案随便改，所有人都交卷就自动进投票。" },
  { id: "vote", name: "投票指认", short: "投票", desc: "只指认凶手是谁。非真凶投中真凶 +3 分；真凶得票过半就被抓住。" },
  { id: "reveal", name: "真相揭晓", short: "揭晓", desc: "案件还原、计分与颁奖。" },
];

export const PHASE_INDEX = Object.fromEntries(PHASES.map((p, i) => [p.id, i]));

/** 搜证阶段（这两段里才有行动点与地点可搜） */
export const SEARCH_PHASES = ["search1", "search2"];

/**
 * 每个搜证轮每人多少行动点 —— **所有人一样**（本轮用户需求 7 定的新公式）。
 *   行动点 =（总线索数 ÷ 角色数 ÷ 2，取整除出来的那个数）+ 1
 *   两轮搜证各发一次，所以每人每轮只拿一半。
 *   例：49 条线索 / 6 个角色 = 8（整除）；8 / 2 = 4；4 + 1 = 5 → 每人每轮 5 点。
 *        32 条线索 / 4 个角色 = 8；8 / 2 = 4；4 + 1 = 5 → 每人每轮 5 点。
 * 这样分是为了限制"一个人抢到特别多的线索"。
 */
export const apPerRound = (clueCount, charCount) => {
  const clues = Number(clueCount) || 0;
  const chars = Math.max(1, Number(charCount) || 1);
  return Math.max(1, Math.floor(clues / chars / 2) + 1);
};

/** @deprecated 老的固定值，只为兼容旧引用；现在一律用 apPerRound() */
export const AP_PER_SEARCH_PHASE = 3;

/** depth 门槛：某个地点累计被搜过多少次，才够得着 depth 1 / 2 的线索 */
export const DEPTH_GATE = { 0: 0, 1: 2, 2: 4 };

/** 每题推理问答的分值 */
export const QUIZ_ANSWER_POINTS = 1;

// ★ 搜到线索本身不计分。分数只来自：答对题、指认对凶手。
export const SCORE = {
  quizCorrect: 1,      // 推理问答：每答对一题 1 分
  killerCorrect: 3,    // 非真凶玩家投中真凶：3 分
  killerEscaped: 6,    // 真凶逃脱成功（得票不到整体票数的一半）：6 分
};

export const phaseName = (id) => {
  const p = PHASES[PHASE_INDEX[id]];
  return p ? p.name : id;
};
