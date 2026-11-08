#!/usr/bin/env node
// Dark War: Survival auto-redeem.
// Redeems every code in codes.json for every UID in DWS_UIDS through the official
// Gift Center API (the same two calls https://www.darkwar-survival.com/giftCenter/ makes):
//   GET https://giftcenter.darkwar-survival.com/getcodeuser.php?uid=UID           -> {code:0, result:{name, sid, level, ...}}
//   GET https://giftcenter.darkwar-survival.com/code.php?uid=UID&code=CODE        -> {errorCode:"ok" | "E004" ...}
//       header Usertoken: UID
// Results are kept in state.json so finished (uid, code) pairs are not sent again.
// Node 18+ (built-in fetch). No dependencies.

import {readFile, writeFile, appendFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://giftcenter.darkwar-survival.com/";
const DELAY_MS = Number(process.env.DWS_DELAY_MS ?? 2500);   // pause between calls, be polite
const RETRY_MS = [4000, 8000, 15000];                          // backoff when the server says "too frequent"
const DRY_RUN = process.argv.includes("--dry-run");

// Error codes taken from the official Gift Center bundle.
const CODE_RESULT = {
  ok:   {status: "redeemed", final: true,  msg: "Redeemed, check in-game mail"},
  E004: {status: "invalid",  final: true,  msg: "Gift code does not exist", codeDead: true},
  E005: {status: "expired",  final: true,  msg: "Gift code has expired", codeDead: true},
  E006: {status: "already",  final: true,  msg: "Already redeemed on this account"},
  E007: {status: "limit",    final: true,  msg: "Code reached its redemption limit", codeDead: true},
  E009: {status: "retry",    final: false, msg: "Too many requests, try again later"},
};
const LOGIN_ERRORS = {
  10006: "Login expired", 10007: "Server maintenance", 10018: "Wrong UID",
  10020: "Too many attempts", 10022: "Account alert", 10023: "Region not supported", 10024: "Account deleted",
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function readJson(file, fallback) {
  try { return JSON.parse(await readFile(path.join(DIR, file), "utf8")); }
  catch (e) { if (e.code === "ENOENT") return fallback; throw e; }
}

export async function api(endpoint, params, headers = {}) {
  const url = new URL(endpoint, BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {headers: {Accept: "application/json, text/plain, */*", ...headers}});
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`HTTP ${res.status} from ${endpoint}: ${text.slice(0, 160)}`); }
}

export async function login(uid) {
  const r = await api("getcodeuser.php", {uid});
  if (r && r.code === 0) return {ok: true, name: r.result?.name ?? "", server: r.result?.sid ?? "", level: r.result?.level ?? ""};
  return {ok: false, error: LOGIN_ERRORS[r?.code] ?? `Login failed (code ${r?.code})`};
}

export async function redeem(uid, code) {
  for (let attempt = 0; ; attempt++) {
    const r = await api("code.php", {uid, code}, {Usertoken: uid});
    const res = CODE_RESULT[r?.errorCode] ?? {status: "error", final: false, msg: `Unexpected answer ${JSON.stringify(r).slice(0, 120)}`};
    if (res.status !== "retry" || attempt >= RETRY_MS.length) return res;
    await sleep(RETRY_MS[attempt]);
  }
}

function parseUids(raw) {
  return [...new Set(String(raw || "").split(/[\s,;]+/).map(s => s.trim()).filter(s => /^\d{4,20}$/.test(s)))];
}

async function main() {
  const uids = parseUids(process.env.DWS_UIDS);
  const codesFile = await readJson("codes.json", []);
  const extra = String(process.env.DWS_EXTRA_CODES || "").split(/[\s,;]+/).filter(Boolean);
  const codes = [...new Set([...codesFile.map(c => typeof c === "string" ? c : c.code), ...extra])]
    .map(c => String(c).trim()).filter(c => /^[A-Za-z0-9]{3,32}$/.test(c));
  const state = await readJson("state.json", {dead: {}, done: {}});
  state.dead ||= {}; state.done ||= {};

  if (!uids.length) { console.error("No UIDs. Set DWS_UIDS to a comma-separated list of UIDs."); process.exit(1); }
  const live = codes.filter(c => !state.dead[c]);
  console.log(`${uids.length} UID(s), ${live.length} live code(s) (${codes.length - live.length} known dead).`);

  const rows = [];
  let calls = 0;
  const pause = async () => { if (calls++ > 0) await sleep(DELAY_MS); };

  for (const uid of uids) {
    const todo = live.filter(c => !state.done[`${uid}|${c}`]);
    if (!todo.length) { rows.push([uid, "", "-", "nothing new"]); continue; }
    if (DRY_RUN) { todo.forEach(c => rows.push([uid, "", c, "would redeem"])); continue; }
    await pause();
    let who;
    try { who = await login(uid); } catch (e) { who = {ok: false, error: e.message}; }
    if (!who.ok) { rows.push([uid, "", "-", `login failed: ${who.error}`]); continue; }
    const label = who.name ? `${who.name} (S${who.server})` : "";
    for (const code of todo) {
      if (state.dead[code]) continue;
      await pause();
      let r;
      try { r = await redeem(uid, code); } catch (e) { r = {status: "error", final: false, msg: e.message}; }
      rows.push([uid, label, code, r.msg]);
      console.log(`${uid} ${label} ${code}: ${r.msg}`);
      if (r.final) state.done[`${uid}|${code}`] = {status: r.status, at: new Date().toISOString()};
      if (r.codeDead) state.dead[code] = {status: r.status, at: new Date().toISOString()};
    }
  }

  if (!DRY_RUN) await writeFile(path.join(DIR, "state.json"), JSON.stringify(state, null, 2) + "\n");

  // State keys contain UIDs, so the public summary masks them.
  const mask = uid => uid.length > 4 ? "…" + uid.slice(-4) : uid;
  const md = ["| UID | Account | Code | Result |", "|---|---|---|---|",
    ...rows.map(([u, n, c, m]) => `| ${mask(u)} | ${n} | ${c} | ${m} |`)].join("\n");
  console.log("\n" + md);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, "## Dark War auto-redeem\n\n" + md + "\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e); process.exit(1); });
}
