// Slash command definitions (Discord API JSON). Names stay English; descriptions are localised
// for the Discord client languages we support (Discord has no Arabic locale).
import {LANGS} from "./i18n.js";

const MANAGE_GUILD = String(1n << 5n);
const STRING = 3, BOOLEAN = 5, CHANNEL = 7;
const TEXT_CHANNELS = [0, 5]; // text + announcement

const d = (en, nl, fr, es, de) => ({
  description: en,
  description_localizations: {nl, fr, "es-ES": es, "es-419": es, de}
});

const uid = d("Your Dark War UID (avatar → Settings → Copy ID)", "Je Dark War-UID (avatar → Settings → Copy ID)",
  "Votre UID Dark War (avatar → Settings → Copy ID)", "Tu UID de Dark War (avatar → Settings → Copy ID)", "Deine Dark-War-UID (Avatar → Settings → Copy ID)");
const code = d("Gift code", "Giftcode", "Code cadeau", "Código de regalo", "Geschenkcode");

export const COMMANDS = [
  {name: "link", ...d("Link a Dark War account: new gift codes are redeemed for it automatically",
      "Koppel een Dark War-account: nieuwe giftcodes worden automatisch ingewisseld",
      "Lier un compte Dark War : les nouveaux codes sont échangés automatiquement",
      "Vincula una cuenta de Dark War: los códigos nuevos se canjean solos",
      "Dark-War-Konto verknüpfen: neue Codes werden automatisch eingelöst"),
    options: [{type: STRING, name: "uid", required: true, max_length: 20, ...uid}]},
  {name: "unlink", ...d("Remove a linked account", "Verwijder een gekoppeld account", "Retirer un compte lié", "Quitar una cuenta vinculada", "Verknüpftes Konto entfernen"),
    options: [{type: STRING, name: "uid", required: true, max_length: 20, autocomplete: true, ...uid}]},
  {name: "accounts", ...d("Show your linked accounts", "Toon je gekoppelde accounts", "Afficher vos comptes liés", "Ver tus cuentas vinculadas", "Deine verknüpften Konten anzeigen")},
  {name: "redeem", ...d("Redeem a code now for all your accounts", "Wissel een code nu in voor al je accounts",
      "Échanger un code maintenant pour tous vos comptes", "Canjear un código ahora para todas tus cuentas", "Code jetzt für alle deine Konten einlösen"),
    options: [{type: STRING, name: "code", required: true, max_length: 32, ...code}]},
  {name: "codes", ...d("List active gift codes", "Toon actieve giftcodes", "Lister les codes cadeaux actifs", "Ver códigos de regalo activos", "Aktive Geschenkcodes anzeigen")},
  {name: "notify", ...d("Turn DMs about redeemed codes on or off", "Zet DM's over ingewisselde codes aan of uit",
      "Activer ou désactiver les MP sur les codes échangés", "Activar o desactivar MD sobre códigos canjeados", "DMs zu eingelösten Codes ein- oder ausschalten"),
    options: [{type: BOOLEAN, name: "on", required: true, ...d("On", "Aan", "Activé", "Activado", "An")}]},
  {name: "language", ...d("Language for the bot's replies", "Taal van de bot", "Langue du bot", "Idioma del bot", "Sprache des Bots"),
    options: [{type: STRING, name: "lang", required: true, ...d("Language", "Taal", "Langue", "Idioma", "Sprache"),
      choices: Object.entries(LANGS).map(([value, name]) => ({name, value}))}]},
  {name: "dwhelp", ...d("How the gift code bot works", "Hoe de giftcode-bot werkt", "Fonctionnement du bot", "Cómo funciona el bot", "So funktioniert der Bot")},
  // Admin (Manage Server)
  {name: "addcode", default_member_permissions: MANAGE_GUILD, ...d("Add a code and redeem it for everyone", "Voeg een code toe en wissel hem in voor iedereen",
      "Ajouter un code et l'échanger pour tous", "Añadir un código y canjearlo para todos", "Code hinzufügen und für alle einlösen"),
    options: [{type: STRING, name: "code", required: true, max_length: 32, ...code},
      {type: STRING, name: "note", required: false, max_length: 80, ...d("Reward or source", "Beloning of bron", "Récompense ou source", "Recompensa o fuente", "Belohnung oder Quelle")}]},
  {name: "removecode", default_member_permissions: MANAGE_GUILD, ...d("Remove a code from the list", "Haal een code van de lijst", "Retirer un code de la liste", "Quitar un código de la lista", "Code von der Liste entfernen"),
    options: [{type: STRING, name: "code", required: true, max_length: 32, autocomplete: true, ...code}]},
  {name: "setup", default_member_permissions: MANAGE_GUILD, dm_permission: false, ...d("Choose the codes channel and log channel", "Kies het codekanaal en logkanaal",
      "Choisir le salon des codes et le salon de journal", "Elegir el canal de códigos y el de registro", "Code-Kanal und Log-Kanal wählen"),
    options: [
      {type: CHANNEL, name: "codes_channel", required: false, channel_types: TEXT_CHANNELS, ...d("Channel where codes are posted (e.g. followed official announcements)", "Kanaal waar codes gepost worden (bv. gevolgde officiële aankondigingen)", "Salon où les codes sont publiés (ex. annonces officielles suivies)", "Canal donde se publican códigos (p. ej. anuncios oficiales seguidos)", "Kanal, in dem Codes gepostet werden (z. B. gefolgte offizielle Ankündigungen)")},
      {type: CHANNEL, name: "log_channel", required: false, channel_types: TEXT_CHANNELS, ...d("Channel for redeem results", "Kanaal voor de resultaten", "Salon pour les résultats", "Canal para los resultados", "Kanal für die Ergebnisse")}]},
  {name: "runnow", default_member_permissions: MANAGE_GUILD, ...d("Run auto-redeem for everyone now", "Start nu een auto-redeem-ronde", "Lancer l'auto-échange maintenant", "Ejecutar el auto-canje ahora", "Auto-Redeem jetzt starten")},
  {name: "botstatus", default_member_permissions: MANAGE_GUILD, ...d("Bot statistics", "Statistieken van de bot", "Statistiques du bot", "Estadísticas del bot", "Bot-Statistiken")}
];
