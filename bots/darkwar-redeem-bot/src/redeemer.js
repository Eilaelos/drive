// Redeems codes for linked accounts through the official Gift Center API.
// All calls to Dark War go through one throttled queue, so the bot never sends
// more than one request per `delayMs`, however many users trigger it at once.
import * as gift from "../../../tools/darkwar-autoredeem/redeem.mjs";

const sleep = ms => new Promise(r => setTimeout(r, ms));
export const DEAD = new Set(["expired", "invalid", "limit"]);
export const FINAL = new Set(["redeemed", "already", "expired", "invalid", "limit"]);

export function createRedeemer({store, delayMs = 2500, api = gift}) {
  let queue = Promise.resolve(), last = 0;
  const throttle = fn => {
    const run = queue.catch(() => {}).then(async () => {
      const wait = last + delayMs - Date.now();
      if (wait > 0) await sleep(wait);
      try { return await fn(); } finally { last = Date.now(); }
    });
    queue = run;
    return run;
  };

  const lookup = uid => throttle(() => api.login(uid)).catch(e => ({ok: false, error: e.message}));
  const redeemOne = (uid, code) => throttle(() => api.redeem(uid, code)).catch(e => ({status: "error", final: false, msg: e.message}));

  // Redeem `codes` for `targets` ([{userId, account}]); skips pairs that are already done
  // and codes that turn out dead. Returns [{userId, uid, name, code, status, msg}].
  async function redeemFor(targets, codes) {
    const results = [];
    for (const {userId, account} of targets) {
      const u = store.user(userId);
      const todo = codes.filter(c => !store.data.codes[c]?.dead && !u.done[`${account.uid}|${c}`]);
      if (!todo.length) continue;
      const who = await lookup(account.uid);
      if (!who.ok) {
        results.push({userId, uid: account.uid, name: account.name, code: "-", status: "login", msg: who.error});
        continue;
      }
      if (who.name) account.name = who.name;
      for (const code of todo) {
        if (store.data.codes[code]?.dead) continue;
        const r = await redeemOne(account.uid, code);
        results.push({userId, uid: account.uid, name: account.name, code, status: r.status, msg: r.msg});
        if (FINAL.has(r.status)) u.done[`${account.uid}|${code}`] = r.status;
        const c = store.data.codes[code];
        if (c) {
          c.stats ||= {redeemed: 0, already: 0, failed: 0};
          if (r.status === "redeemed") c.stats.redeemed++;
          else if (r.status === "already") c.stats.already++;
          else c.stats.failed++;
          if (DEAD.has(r.status)) c.dead = r.status;
        }
      }
    }
    await store.save();
    return results;
  }

  const allTargets = () => Object.entries(store.data.users)
    .flatMap(([userId, u]) => (u.accounts || []).map(account => ({userId, account})));

  // One automatic pass over every linked account and every active code.
  // Calls made while a pass is running are folded into one follow-up pass.
  let running = null, again = false;
  async function runAll() {
    if (running) { again = true; return running; }
    running = (async () => {
      let all = [];
      do {
        again = false;
        all = all.concat(await redeemFor(allTargets(), store.activeCodes().map(c => c.code)));
      } while (again);
      store.data.meta.lastRun = Date.now();
      await store.save();
      return all;
    })();
    try { return await running; } finally { running = null; }
  }

  return {lookup, redeemFor, runAll, allTargets};
}
