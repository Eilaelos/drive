// Small JSON file store. Writes are serialised and atomic (write temp file, then rename).
import {readFile, writeFile, rename, mkdir} from "node:fs/promises";
import path from "node:path";

export async function openStore(file) {
  let data = {};
  try { data = JSON.parse(await readFile(file, "utf8")); }
  catch (e) { if (e.code !== "ENOENT") throw e; }
  data.users ||= {};   // discordId -> {lang, locale, notify, accounts:[{uid,name,server,level}], done:{"uid|code": status}}
  data.codes ||= {};   // code -> {code, note, source, addedBy, addedAt, dead, stats:{redeemed, already, failed}}
  data.guilds ||= {};  // guildId -> {codesChannel, logChannel}
  data.meta ||= {};    // {lastRun}

  let chain = Promise.resolve();
  const save = () => (chain = chain.catch(() => {}).then(async () => {
    await mkdir(path.dirname(file), {recursive: true});
    const tmp = file + ".tmp";
    await writeFile(tmp, JSON.stringify(data, null, 2));
    await rename(tmp, file);
  }));

  const user = id => (data.users[id] ||= {notify: true, accounts: [], done: {}});
  const guild = id => (data.guilds[id] ||= {});
  const activeCodes = () => Object.values(data.codes).filter(c => !c.dead).sort((a, b) => b.addedAt - a.addedAt);
  return {data, save, user, guild, activeCodes};
}
