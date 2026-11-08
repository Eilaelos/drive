// Command, message and reporting logic. Kept free of discord.js imports so it can be tested
// with plain objects; index.js wires it to a real client.
import {t, langFor, LANGS} from "./i18n.js";
import {extractCodes, isCode} from "./extract.js";

const EPHEMERAL = 1 << 6;
const MANAGE_GUILD = 1n << 5n;

export function chunk(text, max = 1900) {
  const out = []; let cur = "";
  for (const line of String(text).split("\n")) {
    if (cur && (cur + "\n" + line).length > max) { out.push(cur); cur = ""; }
    cur = cur ? cur + "\n" + line : line.slice(0, max);
  }
  if (cur) out.push(cur);
  return out;
}

export function createBot({client, store, redeemer, config = {}}) {
  const MAX_ACCOUNTS = config.maxAccounts ?? 10;
  const log = config.log ?? console;
  const accountLabel = a => `**${a.name || "?"}** \`${a.uid}\``;
  const targetsOf = userId => (store.user(userId).accounts || []).map(account => ({userId, account}));

  async function send(channelId, text) {
    try {
      const ch = await client.channels.fetch(channelId);
      for (const part of chunk(text)) await ch.send({content: part, allowedMentions: {parse: []}});
    } catch (e) { log.warn?.(`send to ${channelId} failed: ${e.message}`); }
  }
  async function dm(userId, text) {
    try {
      const u = await client.users.fetch(userId);
      for (const part of chunk(text)) await u.send({content: part});
    } catch (e) { log.warn?.(`DM to ${userId} failed: ${e.message}`); }
  }

  // DMs to users who got something, a per-code summary to every log channel.
  async function report(results) {
    if (!results.length) return;
    const byUser = {};
    for (const r of results) if (r.status === "redeemed") (byUser[r.userId] ||= []).push(r);
    for (const [userId, rows] of Object.entries(byUser)) {
      const u = store.user(userId);
      if (u.notify === false) continue;
      const L = langFor(u);
      await dm(userId, [t(L, "dmTitle"), ...rows.map(r => `• **${r.name || "?"}** \`${r.uid}\`: \`${r.code}\` ${t(L, "st_" + r.status)}`)].join("\n"));
    }
    const per = {};
    for (const r of results) {
      if (r.code === "-") continue;
      const p = (per[r.code] ||= {redeemed: 0, already: 0, failed: 0});
      if (r.status === "redeemed") p.redeemed++; else if (r.status === "already") p.already++; else p.failed++;
    }
    if (!Object.keys(per).length) return;
    for (const [guildId, g] of Object.entries(store.data.guilds)) {
      if (!g.logChannel) continue;
      const L = langFor(null, client.guilds?.cache?.get(guildId)?.preferredLocale);
      const lines = Object.entries(per).map(([code, p]) => {
        const dead = store.data.codes[code]?.dead;
        return t(L, "logLine", {code, ...p, dead: dead ? t(L, "deadNote", {status: t(L, "st_" + dead)}) : ""});
      });
      await send(g.logChannel, [t(L, "logTitle"), ...lines].join("\n"));
    }
  }

  let lastRun = Promise.resolve();
  function runAndReport() {
    lastRun = redeemer.runAll().then(async res => { await report(res); return res; })
      .catch(e => { log.error?.("run failed", e); return []; });
    return lastRun;
  }

  function addCode(code, fields) {
    const existing = store.data.codes[code];
    if (existing && !existing.dead) return false;
    store.data.codes[code] = {code, note: "", addedAt: Date.now(), stats: {redeemed: 0, already: 0, failed: 0}, ...fields};
    return true;
  }

  async function handleCommand(i) {
    const u = store.user(i.user.id);
    if (i.locale) u.locale = i.locale;
    const L = langFor(u, i.locale);
    const tt = (k, v) => t(L, k, v);
    const reply = content => (i.deferred || i.replied ? i.editReply({content}) : i.reply({content, flags: EPHEMERAL}));
    const str = n => (i.options.getString(n) ?? "").trim();

    switch (i.commandName) {
      case "link": {
        const uid = str("uid");
        if (!/^\d{4,20}$/.test(uid)) return reply(tt("uidFormat"));
        if (u.accounts.some(a => a.uid === uid)) return reply(tt("linkDup", {uid}));
        if (Object.entries(store.data.users).some(([id, x]) => id !== i.user.id && x.accounts?.some(a => a.uid === uid))) return reply(tt("linkTaken", {uid}));
        if (u.accounts.length >= MAX_ACCOUNTS) return reply(tt("linkMax", {n: MAX_ACCOUNTS}));
        await i.deferReply({flags: EPHEMERAL});
        const who = await redeemer.lookup(uid);
        if (!who.ok) return reply(tt("linkBad", {uid, reason: who.error}));
        const account = {uid, name: who.name, server: who.server, level: who.level, addedAt: Date.now()};
        u.accounts.push(account);
        await store.save();
        await reply(tt("linkOk", {uid, name: who.name || "?", server: who.server || "?", level: who.level || "?"}));
        // Catch up on every active code for the new account.
        const res = await redeemer.redeemFor([{userId: i.user.id, account}], store.activeCodes().map(c => c.code));
        const rows = res.filter(r => r.code !== "-");
        if (rows.length) await i.followUp({content: chunk(rows.map(r => `• \`${r.code}\`: ${tt("st_" + r.status)}`).join("\n"))[0], flags: EPHEMERAL});
        return;
      }
      case "unlink": {
        const uid = str("uid");
        const idx = u.accounts.findIndex(a => a.uid === uid);
        if (idx < 0) return reply(tt("unlinkMissing", {uid}));
        u.accounts.splice(idx, 1);
        for (const k of Object.keys(u.done)) if (k.startsWith(uid + "|")) delete u.done[k];
        await store.save();
        return reply(tt("unlinkOk", {uid}));
      }
      case "accounts": {
        if (!u.accounts.length) return reply(tt("accountsNone"));
        return reply([`**${tt("accountsTitle")}**`, ...u.accounts.map(a => `• ${accountLabel(a)} · S${a.server ?? "?"} · HQ ${a.level ?? "?"}`)].join("\n"));
      }
      case "redeem": {
        const code = str("code");
        if (!isCode(code)) return reply(tt("codeFormat"));
        if (!u.accounts.length) return reply(tt("noAccounts"));
        await i.deferReply({flags: EPHEMERAL});
        const known = store.data.codes[code];
        const res = known?.dead ? [] : await redeemer.redeemFor(targetsOf(i.user.id), [code]);
        const lines = u.accounts.map(a => {
          const r = res.find(x => x.uid === a.uid);
          const status = r?.status ?? u.done[`${a.uid}|${code}`] ?? known?.dead ?? "error";
          return `• ${accountLabel(a)}: ${tt("st_" + status)}`;
        });
        await reply([tt("redeemTitle", {code}), ...lines].join("\n"));
        // A code that works gets shared: everyone else's accounts get it too.
        if (!known && res.some(r => r.status === "redeemed" || r.status === "already")) {
          addCode(code, {source: "user", addedBy: i.user.id});
          await store.save();
          runAndReport();
        }
        return;
      }
      case "codes": {
        const list = store.activeCodes();
        if (!list.length) return reply(tt("codesNone"));
        return reply([`**${tt("codesTitle")}**`, ...list.map(c => `• \`${c.code}\`${c.note ? ` — ${c.note}` : ""} (${c.stats?.redeemed ?? 0}× ✅)`)].join("\n"));
      }
      case "notify": {
        u.notify = i.options.getBoolean("on");
        await store.save();
        return reply(tt(u.notify ? "notifyOn" : "notifyOff"));
      }
      case "language": {
        const lang = str("lang");
        if (LANGS[lang]) u.lang = lang;
        await store.save();
        return reply(t(langFor(u), "langSet", {lang: LANGS[lang] ?? lang}));
      }
      case "dwhelp":
        return reply(tt("help"));
      case "addcode": {
        const code = str("code");
        if (!isCode(code)) return reply(tt("codeFormat"));
        if (!addCode(code, {note: str("note"), source: "admin", addedBy: i.user.id})) return reply(tt("addDup", {code}));
        await store.save();
        await reply(tt("addOk", {code}));
        runAndReport();
        return;
      }
      case "removecode": {
        const code = str("code");
        if (!store.data.codes[code]) return reply(tt("removeMissing", {code}));
        delete store.data.codes[code];
        await store.save();
        return reply(tt("removeOk", {code}));
      }
      case "setup": {
        if (!i.guildId) return reply(tt("error"));
        const g = store.guild(i.guildId);
        const cc = i.options.getChannel("codes_channel"), lc = i.options.getChannel("log_channel");
        if (cc) g.codesChannel = cc.id;
        if (lc) g.logChannel = lc.id;
        await store.save();
        const ch = id => id ? `<#${id}>` : tt("none");
        return reply(tt("setupOk", {codes: ch(g.codesChannel), log: ch(g.logChannel)}) + (g.codesChannel && !config.watch ? "\n" + tt("watchOff") : ""));
      }
      case "runnow": {
        await reply(tt("runStarted"));
        const res = await runAndReport();
        return i.followUp({content: tt("runDone", {n: res.filter(r => r.status === "redeemed").length}), flags: EPHEMERAL});
      }
      case "botstatus": {
        const users = Object.values(store.data.users).filter(x => x.accounts?.length);
        const last = store.data.meta.lastRun ? `<t:${Math.floor(store.data.meta.lastRun / 1000)}:R>` : tt("never");
        return reply(tt("statusText", {users: users.length, accounts: users.reduce((n, x) => n + x.accounts.length, 0), codes: store.activeCodes().length, last}));
      }
    }
  }

  async function handleAutocomplete(i) {
    const focused = String(i.options.getFocused() ?? "").toLowerCase();
    let choices = [];
    if (i.commandName === "unlink") choices = store.user(i.user.id).accounts.map(a => ({name: `${a.name || "?"} (${a.uid})`, value: a.uid}));
    if (i.commandName === "removecode") choices = Object.values(store.data.codes).map(c => ({name: c.code + (c.dead ? ` (${c.dead})` : ""), value: c.code}));
    return i.respond(choices.filter(c => c.name.toLowerCase().includes(focused)).slice(0, 25));
  }

  // Codes posted in a guild's codes channel, by an admin or by a followed announcement channel.
  async function handleMessage(msg) {
    if (!config.watch || !msg.guildId || msg.author?.id === client.user?.id) return;
    const g = store.data.guilds[msg.guildId];
    if (!g?.codesChannel || msg.channelId !== g.codesChannel) return;
    const trusted = Boolean(msg.webhookId) || Boolean(msg.member?.permissions?.has?.(MANAGE_GUILD));
    if (!trusted) return;
    const text = [msg.content, ...(msg.embeds || []).flatMap(e => [e.title, e.description, ...(e.fields || []).map(f => `${f.name} ${f.value}`)])].filter(Boolean).join("\n");
    const fresh = extractCodes(text).filter(c => addCode(c, {source: "channel", note: "", addedBy: msg.author?.id}));
    if (!fresh.length) return;
    await store.save();
    const L = langFor(null, client.guilds?.cache?.get(msg.guildId)?.preferredLocale);
    await send(g.logChannel || g.codesChannel, t(L, "found", {codes: fresh.map(c => `\`${c}\``).join(", ")}));
    runAndReport();
  }

  return {handleCommand, handleAutocomplete, handleMessage, runAndReport, report, waitForRun: () => lastRun};
}
