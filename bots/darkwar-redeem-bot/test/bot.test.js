import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdtemp} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {openStore} from "../src/store.js";
import {createRedeemer} from "../src/redeemer.js";
import {createBot, chunk} from "../src/bot.js";
import {extractCodes} from "../src/extract.js";
import {keys, LANGS, t, langFor} from "../src/i18n.js";
import {COMMANDS} from "../src/commands.js";

// Fake Gift Center: GOOD works once per uid, OLD is expired, anything else does not exist.
function fakeApi() {
  const used = new Set(), calls = [];
  return {
    calls,
    async login(uid) { calls.push(["login", uid]); return uid === "1111" ? {ok: false, error: "Wrong UID"} : {ok: true, name: "P" + uid, server: 150, level: 25}; },
    async redeem(uid, code) {
      calls.push(["redeem", uid, code]);
      if (code === "OLD") return {status: "expired", final: true, codeDead: true, msg: "expired"};
      if (code === "GOOD" || code === "NEWCODE20") {
        const k = uid + code; if (used.has(k)) return {status: "already", final: true, msg: "already"};
        used.add(k); return {status: "redeemed", final: true, msg: "ok"};
      }
      return {status: "invalid", final: true, codeDead: true, msg: "nope"};
    }
  };
}

function fakeClient() {
  const sent = [];
  return {
    sent, user: {id: "bot"}, guilds: {cache: new Map()},
    channels: {fetch: async id => ({send: async m => sent.push(["ch", id, m.content])})},
    users: {fetch: async id => ({send: async m => sent.push(["dm", id, m.content])})}
  };
}

function interaction(userId, commandName, opts = {}, extra = {}) {
  const out = [];
  const i = {
    user: {id: userId}, commandName, locale: "en-US", guildId: "g1", deferred: false, replied: false, out,
    options: {getString: n => opts[n] ?? null, getBoolean: n => opts[n] ?? null, getChannel: n => opts[n] ?? null, getFocused: () => opts.focused ?? ""},
    reply: async m => { i.replied = true; out.push(m.content); },
    deferReply: async () => { i.deferred = true; },
    editReply: async m => { out.push(m.content); },
    followUp: async m => { out.push(m.content); },
    respond: async c => { out.push(c); },
    ...extra
  };
  return i;
}

async function setup() {
  const dir = await mkdtemp(path.join(tmpdir(), "dwbot-"));
  const store = await openStore(path.join(dir, "db.json"));
  const api = fakeApi();
  const redeemer = createRedeemer({store, delayMs: 0, api});
  const client = fakeClient();
  const bot = createBot({client, store, redeemer, config: {watch: true, maxAccounts: 2, log: {warn() {}, error() {}}}});
  return {store, api, client, bot};
}

test("link validates the UID with Dark War and catches up on active codes", async () => {
  const {store, bot} = await setup();
  store.data.codes.GOOD = {code: "GOOD", addedAt: 1, stats: {}};
  const bad = interaction("u1", "link", {uid: "1111"});
  await bot.handleCommand(bad);
  assert.match(bad.out[0], /Wrong UID/);
  const i = interaction("u1", "link", {uid: "123456"});
  await bot.handleCommand(i);
  assert.match(i.out[0], /P123456/);
  assert.match(i.out[1], /GOOD.*redeemed/);
  assert.equal(store.user("u1").accounts.length, 1);
  const dup = interaction("u2", "link", {uid: "123456"});
  await bot.handleCommand(dup);
  assert.match(dup.out[0], /someone else/);
});

test("a working /redeem code is shared and redeemed for everyone, with DM and log", async () => {
  const {store, client, bot} = await setup();
  store.guild("g1").logChannel = "log1";
  await bot.handleCommand(interaction("u1", "link", {uid: "222222"}));
  await bot.handleCommand(interaction("u2", "link", {uid: "333333"}));
  const i = interaction("u1", "redeem", {code: "GOOD"});
  await bot.handleCommand(i);
  assert.match(i.out[0], /redeemed/);
  await bot.waitForRun();
  assert.ok(store.data.codes.GOOD, "code added to shared list");
  assert.equal(store.user("u2").done["333333|GOOD"], "redeemed");
  assert.ok(client.sent.some(([k, id, m]) => k === "dm" && id === "u2" && /GOOD/.test(m)));
  assert.ok(client.sent.some(([k, id, m]) => k === "ch" && id === "log1" && /GOOD/.test(m)));
  const again = interaction("u1", "redeem", {code: "GOOD"});
  await bot.handleCommand(again);
  assert.match(again.out[0], /redeemed/);
});

test("expired and unknown codes are marked dead and not retried", async () => {
  const {store, api, bot} = await setup();
  await bot.handleCommand(interaction("u1", "link", {uid: "222222"}));
  await bot.handleCommand(interaction("u1", "addcode", {code: "OLD"}));
  await bot.waitForRun();
  assert.equal(store.data.codes.OLD.dead, "expired");
  const before = api.calls.length;
  await bot.runAndReport();
  assert.equal(api.calls.length, before);
  const codes = interaction("u1", "codes");
  await bot.handleCommand(codes);
  assert.match(codes.out[0], /No active/);
});

test("codes channel: trusted posts add codes, other members are ignored", async () => {
  const {store, bot} = await setup();
  store.guild("g1").codesChannel = "c1";
  await bot.handleCommand(interaction("u1", "link", {uid: "222222"}));
  await bot.handleMessage({guildId: "g1", channelId: "c1", author: {id: "x"}, member: {permissions: {has: () => false}}, content: "code NEWCODE20"});
  assert.equal(store.data.codes.NEWCODE20, undefined);
  await bot.handleMessage({guildId: "g1", channelId: "c1", author: {id: "x"}, webhookId: "w", content: "🎁 New gift code: **NEWCODE20** valid until Friday! https://x.com/DWDC99XX"});
  await bot.waitForRun();
  assert.ok(store.data.codes.NEWCODE20);
  assert.equal(store.user("u1").done["222222|NEWCODE20"], "redeemed");
});

test("extractCodes finds typical announcement codes and skips noise", () => {
  assert.deepEqual(extractCodes("Redeem code: DWDC20EN now!"), ["DWDC20EN"]);
  assert.deepEqual(extractCodes("Gift codes `abc123` and DWDCHG24 for <@123456789012> 10AM UTC"), ["abc123", "DWDCHG24"]);
  assert.deepEqual(extractCodes("Join our discord https://discord.gg/ABC123XYZ today, HQ 30"), []);
  assert.deepEqual(extractCodes("Code is coming soon"), []);
});

test("throttle keeps calls apart", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "dwbot-"));
  const store = await openStore(path.join(dir, "db.json"));
  const times = [];
  const api = {login: async () => (times.push(Date.now()), {ok: true}), redeem: async () => ({status: "redeemed"})};
  const r = createRedeemer({store, delayMs: 60, api});
  await Promise.all([r.lookup("1"), r.lookup("2"), r.lookup("3")]);
  assert.ok(times[1] - times[0] >= 55 && times[2] - times[1] >= 55, times.join(","));
});

test("every language has every message, and commands fit Discord limits", () => {
  for (const l of Object.keys(LANGS)) assert.deepEqual(keys(l).sort(), keys("en").sort(), l);
  assert.equal(langFor({}, "es-419"), "es");
  assert.equal(langFor({lang: "ar"}, "de"), "ar");
  assert.equal(t("nl", "linkMax", {n: 3}), "Je kunt maximaal 3 accounts koppelen.");
  const check = o => {
    assert.ok(o.description.length <= 100, o.description);
    for (const v of Object.values(o.description_localizations || {})) assert.ok(v.length <= 100, v);
  };
  for (const c of COMMANDS) {
    assert.match(c.name, /^[a-z_]{1,32}$/);
    check(c); (c.options || []).forEach(check);
  }
  assert.equal(chunk("a\n".repeat(3000)).every(p => p.length <= 1900), true);
});
