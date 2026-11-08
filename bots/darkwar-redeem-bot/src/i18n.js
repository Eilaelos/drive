// Bot messages in the six hub languages. Discord has no Arabic client locale,
// so Arabic (and any other choice) is picked with /language.
export const LANGS = {nl: "Nederlands", en: "English", fr: "Français", es: "Español", de: "Deutsch", ar: "العربية"};

const M = {
en: {
  linkOk: "✅ Linked **{name}** (UID `{uid}`, state {server}, HQ {level}). New gift codes will be redeemed for this account automatically.",
  linkBad: "❌ Dark War does not accept UID `{uid}`: {reason}",
  linkDup: "UID `{uid}` is already linked.", linkTaken: "UID `{uid}` is already linked by someone else.",
  linkMax: "You can link at most {n} accounts.", uidFormat: "A UID is 4 to 20 digits. Find it in game: avatar → Settings → Copy ID.",
  unlinkOk: "Removed UID `{uid}`.", unlinkMissing: "UID `{uid}` is not linked to you.",
  accountsNone: "No accounts linked yet. Use `/link`.", accountsTitle: "Your Dark War accounts",
  noAccounts: "Link an account first with `/link`.", codeFormat: "Codes are 3 to 32 letters or digits.",
  redeemTitle: "Results for `{code}`", codesNone: "No active gift codes right now.", codesTitle: "Active gift codes",
  addOk: "Added `{code}`. Redeeming it for every linked account now.", addDup: "`{code}` is already on the list.",
  removeOk: "Removed `{code}` from the list.", removeMissing: "`{code}` is not on the list.",
  langSet: "Language set to {lang}.", notifyOn: "You will get a DM when codes are redeemed for you.", notifyOff: "No more DMs about redeemed codes.",
  setupOk: "Codes channel: {codes} · Log channel: {log}", none: "none",
  watchOff: "Note: reading the codes channel needs ENABLE_CODE_WATCH=1 and the Message Content intent.",
  found: "🎁 New code(s) found: {codes}. Redeeming for all linked accounts.",
  dmTitle: "🎁 New gift codes were redeemed for your Dark War accounts:", logTitle: "🎁 Gift code run",
  logLine: "`{code}`: {redeemed} redeemed · {already} already claimed · {failed} failed{dead}",
  deadNote: " · marked {status}", runStarted: "Auto-redeem run started.", runDone: "Run finished: {n} redemption(s).",
  statusText: "{users} users · {accounts} accounts · {codes} active codes · last run: {last}", never: "never",
  error: "Something went wrong. Try again later.",
  st_redeemed: "redeemed ✅", st_already: "already claimed", st_expired: "expired", st_invalid: "does not exist",
  st_limit: "redemption limit reached", st_retry: "server busy, will retry", st_error: "error", st_login: "login failed",
  help: "**Dark War gift code bot**\n`/link` your UID once; every new code is then redeemed for you automatically.\n`/redeem` redeems one code right now for all your accounts and shares a working code with everyone.\n`/codes` · `/accounts` · `/unlink` · `/notify` · `/language`\nAdmins: `/addcode` · `/removecode` · `/setup` · `/runnow` · `/botstatus`"
},
nl: {
  linkOk: "✅ **{name}** gekoppeld (UID `{uid}`, state {server}, HQ {level}). Nieuwe giftcodes worden voortaan automatisch voor dit account ingewisseld.",
  linkBad: "❌ Dark War aanvaardt UID `{uid}` niet: {reason}",
  linkDup: "UID `{uid}` is al gekoppeld.", linkTaken: "UID `{uid}` is al door iemand anders gekoppeld.",
  linkMax: "Je kunt maximaal {n} accounts koppelen.", uidFormat: "Een UID bestaat uit 4 tot 20 cijfers. In het spel: avatar → Settings → Copy ID.",
  unlinkOk: "UID `{uid}` verwijderd.", unlinkMissing: "UID `{uid}` is niet aan jou gekoppeld.",
  accountsNone: "Nog geen accounts gekoppeld. Gebruik `/link`.", accountsTitle: "Jouw Dark War-accounts",
  noAccounts: "Koppel eerst een account met `/link`.", codeFormat: "Codes zijn 3 tot 32 letters of cijfers.",
  redeemTitle: "Resultaat voor `{code}`", codesNone: "Op dit moment geen actieve giftcodes.", codesTitle: "Actieve giftcodes",
  addOk: "`{code}` toegevoegd. Ik wissel hem nu in voor alle gekoppelde accounts.", addDup: "`{code}` staat al op de lijst.",
  removeOk: "`{code}` van de lijst gehaald.", removeMissing: "`{code}` staat niet op de lijst.",
  langSet: "Taal ingesteld op {lang}.", notifyOn: "Je krijgt een DM als er codes voor je zijn ingewisseld.", notifyOff: "Geen DM's meer over ingewisselde codes.",
  setupOk: "Codekanaal: {codes} · Logkanaal: {log}", none: "geen",
  watchOff: "Let op: het codekanaal lezen vraagt ENABLE_CODE_WATCH=1 en de Message Content-intent.",
  found: "🎁 Nieuwe code(s) gevonden: {codes}. Ik wissel ze in voor alle gekoppelde accounts.",
  dmTitle: "🎁 Er zijn nieuwe giftcodes ingewisseld voor je Dark War-accounts:", logTitle: "🎁 Giftcode-ronde",
  logLine: "`{code}`: {redeemed} ingewisseld · {already} al gebruikt · {failed} mislukt{dead}",
  deadNote: " · gemarkeerd als {status}", runStarted: "Auto-redeem-ronde gestart.", runDone: "Ronde klaar: {n} inwisseling(en).",
  statusText: "{users} gebruikers · {accounts} accounts · {codes} actieve codes · laatste ronde: {last}", never: "nooit",
  error: "Er ging iets mis. Probeer het later opnieuw.",
  st_redeemed: "ingewisseld ✅", st_already: "al gebruikt", st_expired: "verlopen", st_invalid: "bestaat niet",
  st_limit: "limiet bereikt", st_retry: "server bezet, volgende ronde opnieuw", st_error: "fout", st_login: "inloggen mislukt",
  help: "**Dark War giftcode-bot**\nKoppel één keer je UID met `/link`; daarna wordt elke nieuwe code automatisch voor je ingewisseld.\n`/redeem` wisselt één code meteen in voor al je accounts en deelt een werkende code met iedereen.\n`/codes` · `/accounts` · `/unlink` · `/notify` · `/language`\nBeheerders: `/addcode` · `/removecode` · `/setup` · `/runnow` · `/botstatus`"
},
fr: {
  linkOk: "✅ **{name}** lié (UID `{uid}`, état {server}, QG {level}). Les nouveaux codes seront échangés automatiquement pour ce compte.",
  linkBad: "❌ Dark War refuse l'UID `{uid}` : {reason}",
  linkDup: "L'UID `{uid}` est déjà lié.", linkTaken: "L'UID `{uid}` est déjà lié par quelqu'un d'autre.",
  linkMax: "Vous pouvez lier {n} comptes au maximum.", uidFormat: "Un UID compte 4 à 20 chiffres. En jeu : avatar → Settings → Copy ID.",
  unlinkOk: "UID `{uid}` retiré.", unlinkMissing: "L'UID `{uid}` n'est pas lié à vous.",
  accountsNone: "Aucun compte lié. Utilisez `/link`.", accountsTitle: "Vos comptes Dark War",
  noAccounts: "Liez d'abord un compte avec `/link`.", codeFormat: "Un code compte 3 à 32 lettres ou chiffres.",
  redeemTitle: "Résultats pour `{code}`", codesNone: "Aucun code cadeau actif pour le moment.", codesTitle: "Codes cadeaux actifs",
  addOk: "`{code}` ajouté. Échange en cours pour tous les comptes liés.", addDup: "`{code}` est déjà dans la liste.",
  removeOk: "`{code}` retiré de la liste.", removeMissing: "`{code}` n'est pas dans la liste.",
  langSet: "Langue réglée sur {lang}.", notifyOn: "Vous recevrez un MP quand des codes sont échangés pour vous.", notifyOff: "Plus de MP sur les codes échangés.",
  setupOk: "Salon des codes : {codes} · Salon de journal : {log}", none: "aucun",
  watchOff: "Remarque : lire le salon des codes exige ENABLE_CODE_WATCH=1 et l'intent Message Content.",
  found: "🎁 Nouveau(x) code(s) trouvé(s) : {codes}. Échange pour tous les comptes liés.",
  dmTitle: "🎁 De nouveaux codes cadeaux ont été échangés pour vos comptes Dark War :", logTitle: "🎁 Tournée de codes cadeaux",
  logLine: "`{code}` : {redeemed} échangé(s) · {already} déjà utilisé(s) · {failed} échec(s){dead}",
  deadNote: " · marqué {status}", runStarted: "Tournée d'auto-échange lancée.", runDone: "Tournée terminée : {n} échange(s).",
  statusText: "{users} utilisateurs · {accounts} comptes · {codes} codes actifs · dernière tournée : {last}", never: "jamais",
  error: "Une erreur s'est produite. Réessayez plus tard.",
  st_redeemed: "échangé ✅", st_already: "déjà utilisé", st_expired: "expiré", st_invalid: "n'existe pas",
  st_limit: "limite atteinte", st_retry: "serveur occupé, nouvel essai plus tard", st_error: "erreur", st_login: "connexion échouée",
  help: "**Bot de codes cadeaux Dark War**\nLiez une fois votre UID avec `/link` ; chaque nouveau code sera ensuite échangé automatiquement.\n`/redeem` échange un code tout de suite pour tous vos comptes et partage un code valide avec tout le monde.\n`/codes` · `/accounts` · `/unlink` · `/notify` · `/language`\nAdmins : `/addcode` · `/removecode` · `/setup` · `/runnow` · `/botstatus`"
},
es: {
  linkOk: "✅ **{name}** vinculado (UID `{uid}`, estado {server}, CG {level}). Los códigos nuevos se canjearán automáticamente para esta cuenta.",
  linkBad: "❌ Dark War no acepta el UID `{uid}`: {reason}",
  linkDup: "El UID `{uid}` ya está vinculado.", linkTaken: "El UID `{uid}` ya lo vinculó otra persona.",
  linkMax: "Puedes vincular como máximo {n} cuentas.", uidFormat: "Un UID tiene de 4 a 20 cifras. En el juego: avatar → Settings → Copy ID.",
  unlinkOk: "UID `{uid}` eliminado.", unlinkMissing: "El UID `{uid}` no está vinculado a ti.",
  accountsNone: "Aún no hay cuentas vinculadas. Usa `/link`.", accountsTitle: "Tus cuentas de Dark War",
  noAccounts: "Vincula primero una cuenta con `/link`.", codeFormat: "Los códigos tienen de 3 a 32 letras o cifras.",
  redeemTitle: "Resultados de `{code}`", codesNone: "No hay códigos de regalo activos ahora.", codesTitle: "Códigos de regalo activos",
  addOk: "`{code}` añadido. Canjeándolo ahora para todas las cuentas vinculadas.", addDup: "`{code}` ya está en la lista.",
  removeOk: "`{code}` eliminado de la lista.", removeMissing: "`{code}` no está en la lista.",
  langSet: "Idioma: {lang}.", notifyOn: "Recibirás un MD cuando se canjeen códigos para ti.", notifyOff: "Ya no recibirás MD sobre códigos canjeados.",
  setupOk: "Canal de códigos: {codes} · Canal de registro: {log}", none: "ninguno",
  watchOff: "Nota: leer el canal de códigos requiere ENABLE_CODE_WATCH=1 y el intent Message Content.",
  found: "🎁 Código(s) nuevo(s): {codes}. Canjeando para todas las cuentas vinculadas.",
  dmTitle: "🎁 Se canjearon códigos de regalo nuevos para tus cuentas de Dark War:", logTitle: "🎁 Ronda de códigos de regalo",
  logLine: "`{code}`: {redeemed} canjeado(s) · {already} ya usado(s) · {failed} fallido(s){dead}",
  deadNote: " · marcado como {status}", runStarted: "Ronda de auto-canje iniciada.", runDone: "Ronda terminada: {n} canje(s).",
  statusText: "{users} usuarios · {accounts} cuentas · {codes} códigos activos · última ronda: {last}", never: "nunca",
  error: "Algo salió mal. Inténtalo más tarde.",
  st_redeemed: "canjeado ✅", st_already: "ya usado", st_expired: "caducado", st_invalid: "no existe",
  st_limit: "límite alcanzado", st_retry: "servidor ocupado, se reintentará", st_error: "error", st_login: "inicio de sesión fallido",
  help: "**Bot de códigos de regalo de Dark War**\nVincula una vez tu UID con `/link`; después cada código nuevo se canjea solo.\n`/redeem` canjea un código al instante para todas tus cuentas y comparte un código válido con todos.\n`/codes` · `/accounts` · `/unlink` · `/notify` · `/language`\nAdmins: `/addcode` · `/removecode` · `/setup` · `/runnow` · `/botstatus`"
},
de: {
  linkOk: "✅ **{name}** verknüpft (UID `{uid}`, State {server}, HQ {level}). Neue Geschenkcodes werden für dieses Konto automatisch eingelöst.",
  linkBad: "❌ Dark War akzeptiert die UID `{uid}` nicht: {reason}",
  linkDup: "UID `{uid}` ist bereits verknüpft.", linkTaken: "UID `{uid}` wurde bereits von jemand anderem verknüpft.",
  linkMax: "Du kannst höchstens {n} Konten verknüpfen.", uidFormat: "Eine UID hat 4 bis 20 Ziffern. Im Spiel: Avatar → Settings → Copy ID.",
  unlinkOk: "UID `{uid}` entfernt.", unlinkMissing: "UID `{uid}` ist nicht mit dir verknüpft.",
  accountsNone: "Noch keine Konten verknüpft. Nutze `/link`.", accountsTitle: "Deine Dark-War-Konten",
  noAccounts: "Verknüpfe zuerst ein Konto mit `/link`.", codeFormat: "Codes haben 3 bis 32 Buchstaben oder Ziffern.",
  redeemTitle: "Ergebnis für `{code}`", codesNone: "Derzeit keine aktiven Geschenkcodes.", codesTitle: "Aktive Geschenkcodes",
  addOk: "`{code}` hinzugefügt. Wird jetzt für alle verknüpften Konten eingelöst.", addDup: "`{code}` steht schon auf der Liste.",
  removeOk: "`{code}` von der Liste entfernt.", removeMissing: "`{code}` steht nicht auf der Liste.",
  langSet: "Sprache: {lang}.", notifyOn: "Du bekommst eine DM, wenn Codes für dich eingelöst wurden.", notifyOff: "Keine DMs mehr zu eingelösten Codes.",
  setupOk: "Code-Kanal: {codes} · Log-Kanal: {log}", none: "keiner",
  watchOff: "Hinweis: Den Code-Kanal zu lesen braucht ENABLE_CODE_WATCH=1 und den Message-Content-Intent.",
  found: "🎁 Neue(r) Code(s) gefunden: {codes}. Wird für alle verknüpften Konten eingelöst.",
  dmTitle: "🎁 Für deine Dark-War-Konten wurden neue Geschenkcodes eingelöst:", logTitle: "🎁 Geschenkcode-Runde",
  logLine: "`{code}`: {redeemed} eingelöst · {already} schon benutzt · {failed} fehlgeschlagen{dead}",
  deadNote: " · markiert als {status}", runStarted: "Auto-Redeem-Runde gestartet.", runDone: "Runde fertig: {n} Einlösung(en).",
  statusText: "{users} Nutzer · {accounts} Konten · {codes} aktive Codes · letzte Runde: {last}", never: "nie",
  error: "Etwas ist schiefgegangen. Versuch es später erneut.",
  st_redeemed: "eingelöst ✅", st_already: "schon benutzt", st_expired: "abgelaufen", st_invalid: "existiert nicht",
  st_limit: "Limit erreicht", st_retry: "Server beschäftigt, neuer Versuch später", st_error: "Fehler", st_login: "Login fehlgeschlagen",
  help: "**Dark-War-Geschenkcode-Bot**\nVerknüpfe deine UID einmal mit `/link`; danach wird jeder neue Code automatisch für dich eingelöst.\n`/redeem` löst einen Code sofort für alle deine Konten ein und teilt einen funktionierenden Code mit allen.\n`/codes` · `/accounts` · `/unlink` · `/notify` · `/language`\nAdmins: `/addcode` · `/removecode` · `/setup` · `/runnow` · `/botstatus`"
},
ar: {
  linkOk: "✅ تم ربط **{name}** (UID `{uid}`، الولاية {server}، المقر {level}). ستُستبدل أكواد الهدايا الجديدة لهذا الحساب تلقائيًا.",
  linkBad: "❌ لا تقبل Dark War المعرّف `{uid}`: {reason}",
  linkDup: "المعرّف `{uid}` مربوط بالفعل.", linkTaken: "المعرّف `{uid}` ربطه شخص آخر.",
  linkMax: "يمكنك ربط {n} حسابات كحد أقصى.", uidFormat: "يتكون UID من 4 إلى 20 رقمًا. في اللعبة: الصورة الرمزية ← Settings ← Copy ID.",
  unlinkOk: "تمت إزالة `{uid}`.", unlinkMissing: "المعرّف `{uid}` غير مربوط بك.",
  accountsNone: "لا حسابات مربوطة بعد. استخدم `/link`.", accountsTitle: "حساباتك في Dark War",
  noAccounts: "اربط حسابًا أولًا باستخدام `/link`.", codeFormat: "الأكواد من 3 إلى 32 حرفًا أو رقمًا.",
  redeemTitle: "نتائج `{code}`", codesNone: "لا أكواد هدايا نشطة حاليًا.", codesTitle: "أكواد الهدايا النشطة",
  addOk: "تمت إضافة `{code}`. جارٍ استبداله لكل الحسابات المربوطة.", addDup: "`{code}` موجود في القائمة.",
  removeOk: "تمت إزالة `{code}` من القائمة.", removeMissing: "`{code}` ليس في القائمة.",
  langSet: "اللغة: {lang}.", notifyOn: "ستصلك رسالة خاصة عند استبدال أكواد لك.", notifyOff: "لن تصلك رسائل خاصة عن الأكواد بعد الآن.",
  setupOk: "قناة الأكواد: {codes} · قناة السجل: {log}", none: "لا شيء",
  watchOff: "ملاحظة: قراءة قناة الأكواد تتطلب ENABLE_CODE_WATCH=1 وصلاحية Message Content.",
  found: "🎁 أكواد جديدة: {codes}. جارٍ استبدالها لكل الحسابات المربوطة.",
  dmTitle: "🎁 تم استبدال أكواد هدايا جديدة لحساباتك في Dark War:", logTitle: "🎁 جولة أكواد الهدايا",
  logLine: "`{code}`: {redeemed} مستبدل · {already} مستخدم سابقًا · {failed} فشل{dead}",
  deadNote: " · عُلّم {status}", runStarted: "بدأت جولة الاستبدال التلقائي.", runDone: "انتهت الجولة: {n} عملية استبدال.",
  statusText: "{users} مستخدم · {accounts} حساب · {codes} كود نشط · آخر جولة: {last}", never: "أبدًا",
  error: "حدث خطأ. حاول لاحقًا.",
  st_redeemed: "تم الاستبدال ✅", st_already: "مستخدم سابقًا", st_expired: "منتهٍ", st_invalid: "غير موجود",
  st_limit: "بلغ الحد", st_retry: "الخادم مشغول، ستُعاد المحاولة", st_error: "خطأ", st_login: "فشل تسجيل الدخول",
  help: "**بوت أكواد هدايا Dark War**\nاربط UID مرة واحدة عبر `/link`، وبعدها يُستبدل كل كود جديد تلقائيًا.\n`/redeem` يستبدل كودًا فورًا لكل حساباتك ويشارك الكود الصالح مع الجميع.\n`/codes` · `/accounts` · `/unlink` · `/notify` · `/language`\nالمشرفون: `/addcode` · `/removecode` · `/setup` · `/runnow` · `/botstatus`"
}
};

export function langFor(user, locale) {
  if (user?.lang && M[user.lang]) return user.lang;
  const l = String(locale || user?.locale || "").toLowerCase();
  if (l.startsWith("es")) return "es";
  const short = l.slice(0, 2);
  return M[short] ? short : "en";
}

export function t(lang, key, vars) {
  let s = M[lang]?.[key] ?? M.en[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  return s;
}

export const keys = lang => Object.keys(M[lang] || {});
