// ============================================================
//  公网隧道：把本机的游戏端口挂到公网上，别人不用连同一个 WiFi 也能玩
//
//  ★ 零依赖：只用 node:child_process / node:fs / node:path
//  ★ 两级方案，前一个不行就自动换下一个：
//      1) cloudflared 快速隧道（首选）→ https://xxxx.trycloudflare.com
//         下载：tools/cloudflared.exe，或把 cloudflared 装进 PATH，或设 CLOUDFLARED=路径
//      2) ssh 反向隧道（Windows 10/11 自带 ssh 就能用）→ https://xxxx.lhr.life
//  ★ 两个都不行也不影响游戏：局域网照样能玩，网页上会提示"暂无公网地址"
//  ★ 想用自己的域名/内网穿透：启动前设 PUBLIC_URL=https://你的地址 即可直接采用
//  ★ 自愈：隧道进程被系统杀掉、断线重连、或换了一个新域名时，会自动重新拉起，
//      并通过 startTunnel 的 onUrl 回调通知服务器更新展示的地址。
// ============================================================

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const TOOLS = path.join(ROOT, "tools");
const EXE_NAME = process.platform === "win32" ? "cloudflared.exe" : "cloudflared";
const LOCAL_EXE = path.join(TOOLS, EXE_NAME);

const URL_RE = /https:\/\/[a-z0-9][a-z0-9.-]*\.(?:trycloudflare\.com|lhr\.life|localhost\.run)/i;

const active = new Set();   // 所有还活着的隧道子进程，Set 防止进程被 GC 掉
let stopped = false;        // stopTunnels() 之后不再自动重试
// ★ 本轮修复 4：公网隧道自愈用的几个计数
//   failStreak：连续几次"刚连上就断/根本没连上"。攒够两次就换 http2，
//   攒够四次再限制到 IPv4 边缘 —— 这是 cloudflared 官方排障顺序，QUIC 被掐时换协议常常立刻就好。
let failStreak = 0;
let expectRestart = false;  // 是我们自己主动杀掉换新的，这次断线不算失败

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function waitExit(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) { resolve(); return; }
    let settled = false;
    const done = () => { if (!settled) { settled = true; resolve(); } };
    child.once("exit", done);
    child.once("error", done);
  });
}

/**
 * 启动一条隧道命令，抓到第一个网址就返回成功；抓不到就在超时后返回失败。
 * 成功的进程会继续活着，并把之后可能出现的同一进程新网址通过 onUrl 上报。
 */
function startCandidate(cmd, args, timeoutMs, onUrl) {
  return new Promise((resolve) => {
    let child = null;
    let buf = "";
    let timer = null;
    const state = { url: null, done: false };

    const finish = (url) => {
      if (state.done) return;
      state.done = true;
      if (timer) clearTimeout(timer);
      if (!url && child) { try { child.kill(); } catch (e) {} }
      resolve({
        url,
        child: url ? child : null,
        done: url ? waitExit(child) : Promise.resolve()
      });
    };

    try {
      child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    } catch (e) {
      finish(null);
      return;
    }
    active.add(child);
    child.once("exit", () => active.delete(child));

    timer = setTimeout(() => finish(null), timeoutMs);
    if (timer.unref) timer.unref();

    child.on("error", () => finish(null));
    child.on("exit", () => finish(null));

    const onData = (d) => {
      const t = String(d);
      buf = (buf + t).slice(-8000);
      const m = buf.match(URL_RE);
      if (!m) return;
      const u = m[0];
      if (!state.url) {
        state.url = u;
        finish(u);
      } else if (u !== state.url) {
        state.url = u;
        onUrl(u);
      }
    };
    if (child.stdout) child.stdout.on("data", onData);
    if (child.stderr) child.stderr.on("data", onData);
  });
}

function findCloudflared() {
  const env = process.env.CLOUDFLARED;
  if (env && fs.existsSync(env)) return env;
  if (fs.existsSync(LOCAL_EXE)) return LOCAL_EXE;
  return null;   // 交给 PATH 里的 cloudflared 碰运气
}

function sshArgs(port) {
  return [
    "-o", "StrictHostKeyChecking=no",
    "-o", process.platform === "win32" ? "UserKnownHostsFile=NUL" : "UserKnownHostsFile=/dev/null",
    "-o", "ServerAliveInterval=30",
    "-o", "ExitOnForwardFailure=yes",
    "-R", "80:localhost:" + port,
    "nokey@localhost.run",
  ];
}

/**
 * 开一条隧道并持续守护。
 * @returns {Promise<string|null>} 第一次拿到的公网地址（失败给 null；之后地址变化/自动重连通过 opts.onUrl 通知）
 */
export async function startTunnel(port, opts) {
  const log = (opts && opts.onLog) || (() => {});
  const onUrl = (opts && opts.onUrl) || (() => {});
  const local = "http://localhost:" + port;

  // 0) 你自己有地址（ngrok / frp / 云服务器），直接用
  if (process.env.PUBLIC_URL) {
    const fixed = process.env.PUBLIC_URL.replace(/\/+$/, "");
    log("  公网地址：   使用你指定的 " + fixed);
    onUrl(fixed);
    return fixed;
  }

  let first = null;
  let resolved = false;
  let reported = null;
  let settle = null;
  const resolveOnce = (url) => {
    if (!resolved) {
      resolved = true;
      first = url;
      if (settle) settle(url);
    }
  };
  const report = (url) => {
    if (stopped) return;
    if (url === reported) return;
    reported = url;
    onUrl(url);
  };

  return new Promise((resolve) => {
    settle = resolve;
    (async () => {
      while (!stopped) {
        const cf = findCloudflared();
        // ★ 修复 4：连续打不通就换协议 / 换边缘 IP。
        //   QUIC（默认）被运营商或防火墙掐的时候，换 http2 往往立刻就能连上；
        //   再不行就只走 IPv4 边缘 —— 也是 cloudflared 官方排障顺序。
        const args = ["tunnel", "--url", local, "--no-autoupdate"];
        if (failStreak >= 2) args.push("--protocol", "http2");
        if (failStreak >= 4) args.push("--edge-ip-version", "4");
        const t0 = Date.now();
        const r1 = await startCandidate(cf || "cloudflared", args, 25000, report);
        if (r1.url) {
          if (!first) resolveOnce(r1.url);
          if (!cf) log("  （用的是 PATH 里的 cloudflared）");
          report(r1.url);
          await r1.done;
          if (stopped) break;
          report(null);
          // ★ 修复 4：撑过两分钟算健康，把失败计数清零；刚连上就断就是失败
          // 换隧道（自检判定这条已经废了）不算"刚连上就断"：failStreak 保留着往上加，
          // 这样 2 次之后就会自动换 http2、4 次之后改走 IPv4 边缘 —— 和手动排障的顺序一致。
          if (expectRestart) { expectRestart = false; }
          else if (Date.now() - t0 > 120000) failStreak = 0;
          else failStreak += 1;
          const wait = Math.min(15000, 800 * Math.pow(1.8, Math.max(0, failStreak - 1)));
          log("  cloudflared 隧道断了，正在自动重连……" + (wait >= 1500 ? "（" + Math.round(wait / 1000) + " 秒后，第 " + failStreak + " 次）" : ""));
          if (wait > 0) await sleep(wait);
          continue;
        }

        const r2 = await startCandidate("ssh", sshArgs(port), 30000, report);
        if (r2.url) {
          if (!first) resolveOnce(r2.url);
          report(r2.url);
          await r2.done;
          if (stopped) break;
          report(null);
          if (expectRestart) { expectRestart = false; }
          else if (Date.now() - t0 > 120000) failStreak = 0;
          else failStreak += 1;
          log("  ssh 隧道断了，正在自动重连……");
          await sleep(Math.min(15000, 1000 * Math.max(1, failStreak)));
          continue;
        }

        if (!first) resolveOnce(null);
        failStreak += 1;
        const backoff = Math.min(30000, 8000 * Math.max(1, failStreak));
        log("  公网隧道没打通，后台 " + Math.round(backoff / 1000) + " 秒后自动重试（游戏本身不受影响）。");
        await sleep(backoff);
      }
      resolve(first);
    })();
  });
}

/**
 * ★ 本轮修复 4：主动换一条新隧道。
 * 服务器那边的自检发现"域名还在、但访问全是 Cloudflare 错误页"时调用它：
 * 把当前隧道进程杀掉，startTunnel 里的守护循环会自动用更保守的参数重新拉一条，
 * 新的一条会带一个全新的随机域名，并通过 onUrl 推给所有房间。
 */
export function restartTunnels() {
  // 注意：这里不清零 failStreak —— 连续被自检判废说明"这条链本身有问题"，
  // 留着计数才能让下一轮自动升级成 http2 / IPv4 边缘。
  failStreak = Math.max(1, failStreak + 1);
  if (!active.size) return 0;   // 循环可能正卡在退避 sleep 里，它自己会重试
  expectRestart = true;
  for (const c of active) { try { c.kill(); } catch (e) {} }
  return active.size;
}

/** 关掉所有隧道进程（正常退出时用） */
export function stopTunnels() {
  stopped = true;
  for (const c of active) { try { c.kill(); } catch (e) {} }
  active.clear();
}
