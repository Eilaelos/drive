// Dark War gift code bot: links players' UIDs and redeems every new gift code for them.
import {Client, Events, GatewayIntentBits, REST, Routes, Partials} from "discord.js";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {openStore} from "./store.js";
import {createRedeemer} from "./redeemer.js";
import {createBot} from "./bot.js";
import {COMMANDS} from "./commands.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = process.env;
const TOKEN = env.DISCORD_TOKEN;
if (!TOKEN) { console.error("Set DISCORD_TOKEN (see .env.example)."); process.exit(1); }

const config = {
  watch: env.ENABLE_CODE_WATCH === "1",
  intervalMin: Math.max(10, Number(env.AUTO_INTERVAL_MIN || 60)),
  maxAccounts: Number(env.MAX_ACCOUNTS || 10),
  delayMs: Number(env.DWS_DELAY_MS || 2500)
};

const store = await openStore(path.resolve(ROOT, env.DATA_FILE || "data/db.json"));
const redeemer = createRedeemer({store, delayMs: config.delayMs});

const intents = [GatewayIntentBits.Guilds];
if (config.watch) intents.push(GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent);
const client = new Client({intents, partials: [Partials.Channel]});
const bot = createBot({client, store, redeemer, config});

client.once(Events.ClientReady, async c => {
  console.log(`Logged in as ${c.user.tag} · ${c.guilds.cache.size} server(s) · code watch ${config.watch ? "on" : "off"}`);
  if (env.REGISTER_COMMANDS !== "0") {
    const rest = new REST().setToken(TOKEN);
    const route = env.GUILD_ID ? Routes.applicationGuildCommands(c.user.id, env.GUILD_ID) : Routes.applicationCommands(c.user.id);
    await rest.put(route, {body: COMMANDS});
    console.log(`Registered ${COMMANDS.length} slash commands ${env.GUILD_ID ? "in guild " + env.GUILD_ID : "globally"}.`);
  }
  bot.runAndReport();
  setInterval(() => bot.runAndReport(), config.intervalMin * 60_000);
});

client.on(Events.InteractionCreate, async i => {
  try {
    if (i.isAutocomplete()) return await bot.handleAutocomplete(i);
    if (i.isChatInputCommand()) return await bot.handleCommand(i);
  } catch (e) {
    console.error(`/${i.commandName} failed`, e);
    const content = "Something went wrong. Try again later.";
    if (i.isRepliable?.()) await (i.deferred || i.replied ? i.followUp({content, flags: 64}) : i.reply({content, flags: 64})).catch(() => {});
  }
});

if (config.watch) client.on(Events.MessageCreate, msg => bot.handleMessage(msg).catch(e => console.error("message handler", e)));

for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, async () => { await store.save(); client.destroy(); process.exit(0); });

await client.login(TOKEN);
